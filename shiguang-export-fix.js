/* 拾光所｜正式紀錄輸出修正 */
(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function getParts(){
    const items=[...document.querySelectorAll('#previewBody .sg-preview-item')];
    if(items.length)return items.map(x=>({label:x.querySelector('.sg-preview-label')?.textContent?.replace(/^✦\s*/,'')||'',text:x.querySelector('.sg-preview-text')?.textContent||'—'}));
    const text=$('previewBody')?.textContent||'';
    return text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(block=>{const lines=block.split('\n');return{label:(lines.shift()||'').trim(),text:lines.join('\n').trim()||'—'}});
  }
  function buildExportCard(){
    const title=$('previewTitle')?.textContent||'《旅程紀錄》';
    const sub=$('previewSub')?.textContent||'';
    const parts=getParts();
    const today=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;left:-10000px;top:0;width:1080px;background:#f7efe4;padding:54px;font-family:"Songti TC","Noto Serif TC",serif;color:#493d34;z-index:-1';
    wrap.innerHTML=`<div style="min-height:1420px;border:2px solid #dfcdb3;border-radius:38px;padding:54px;background:radial-gradient(circle at 8% 4%,rgba(255,255,255,.96),transparent 34%),linear-gradient(145deg,#fffaf4,#f1e2cf);position:relative;overflow:hidden">
      <div style="display:flex;align-items:center;gap:28px;padding-bottom:28px;border-bottom:2px solid #dfcdb3">
        <img src="32CCD19A-16B9-451E-8559-4A40F8CA3D92.png" style="width:132px;height:132px;object-fit:contain;mix-blend-mode:multiply">
        <div><div style="font-size:54px;letter-spacing:6px">拾光所</div><div style="font-size:22px;color:#8b7766;margin-top:8px">陪伴每一位旅人，拾起內在的光。</div></div>
      </div>
      <div style="padding:44px 18px 24px">
        <div style="font-size:18px;letter-spacing:4px;color:#a1845d">一頁珍藏</div>
        <div style="font-size:52px;font-weight:700;margin:14px 0 12px;color:#5a4128">${esc(title)}</div>
        <div style="font-size:25px;color:#8b7563;margin-bottom:34px">${esc(sub)}</div>
        <div style="border:1px solid #e4d3bc;border-radius:28px;background:rgba(255,253,249,.78);padding:18px 32px">
          ${parts.map(p=>`<div style="padding:24px 4px;border-bottom:1px solid #eadfce"><div style="font-size:22px;color:#9b7b50;margin-bottom:10px">✦ ${esc(p.label)}</div><div style="font-size:28px;line-height:1.8;white-space:pre-wrap">${esc(p.text)}</div></div>`).join('')}
        </div>
      </div>
      <div style="position:absolute;left:56px;right:56px;bottom:42px;display:flex;justify-content:space-between;align-items:flex-end;border-top:2px solid #decdb6;padding-top:22px;color:#806e5e">
        <div style="font-size:22px;line-height:1.65">每一次相遇，<br>都留下一點重新看見自己的光。</div>
        <div style="font-size:19px;text-align:right">${esc(today)}<br>𓇼 拾光所</div>
      </div>
    </div>`;
    document.body.appendChild(wrap);return wrap;
  }
  window.saveRecordImage=async()=>{
    if(!window.html2canvas)return alert('圖片工具尚未載入，請稍後再試。');
    if(!$('recordPreviewCard')||$('recordPreviewCard').style.display==='none')return alert('請先完成文案確認，再儲存正式圖片。');
    const node=buildExportCard();
    try{
      const canvas=await window.html2canvas(node,{scale:1,backgroundColor:'#f7efe4',useCORS:true});
      const name=($('previewTitle')?.textContent||'拾光所紀錄').replace(/[\\/:*?"<>|]/g,'-')+'.png';
      const blob=await new Promise(r=>canvas.toBlob(r,'image/png',1));
      const file=new File([blob],name,{type:'image/png'});
      if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({files:[file],title:'拾光所旅程紀錄'});return;}
      const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),60000);
    }catch(e){console.error(e);alert('圖片儲存沒有成功，請再試一次。');}finally{node.remove();}
  };
  document.documentElement.dataset.shiguangExport='v2';
})();
/* 拾光所｜上線前最後體驗修整 */
(()=>{
  const $=id=>document.getElementById(id);
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

  document.addEventListener('submit',e=>{
    const btn=e.target?.querySelector('button[type="submit"]');
    if(!btn||btn.dataset.busy==='1') return;
    btn.dataset.busy='1';
    const old=btn.textContent;
    btn.textContent='儲存中…';
    setTimeout(()=>{btn.dataset.busy='0';btn.textContent=old},1400);
  },true);

  if(typeof window.saveRecordImage==='function'){
    window.saveRecordImage=async()=>{
      const card=$('recordPreviewCard');
      if(!card||card.style.display==='none') return alert('請先完成文案確認，再儲存正式圖片。');
      if(!window.html2canvas) return alert('圖片工具尚未載入，請稍後再試。');
      try{
        const canvas=await window.html2canvas(card,{scale:2,backgroundColor:'#fffaf4',useCORS:true});
        const name=($('previewTitle')?.textContent||'拾光所紀錄').replace(/[\\/:*?"<>|]/g,'-')+'.png';
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png',1));
        if(blob&&navigator.share){const file=new File([blob],name,{type:'image/png'});if(!navigator.canShare||navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'拾光所旅程紀錄'});return;}}
        if(isIOS){const url=URL.createObjectURL(blob);const w=window.open(url,'_blank');if(!w)location.href=url;setTimeout(()=>URL.revokeObjectURL(url),60000);return;}
        const a=document.createElement('a');a.download=name;a.href=canvas.toDataURL('image/png');a.click();
      }catch(err){console.error(err);alert('圖片儲存沒有成功，請再試一次。');}
    };
  }

  const safeCreate=()=>{if(!window.data?.travelers?.length){alert('先建立第一位旅人，再開始製作旅程紀錄。');return false}return true};
  document.querySelectorAll('[onclick*="go(\'create\')"],[onclick*="go(\"create\")"]').forEach(el=>el.addEventListener('click',e=>{if(!safeCreate()){e.preventDefault();e.stopImmediatePropagation()}},true));
  document.addEventListener('focusin',e=>{if(!/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||''))return;setTimeout(()=>e.target.scrollIntoView({behavior:'smooth',block:'center'}),220)});

  const normalize=t=>(t||'').replace(/\s+/g,'');
  function serviceOfJourneyView(){const view=$('journey');if(!view)return'';const txt=normalize(view.innerText);if(txt.includes('同行')||txt.includes('三個月'))return'同行';if(txt.includes('拾光')||txt.includes('四週'))return'拾光';if(txt.includes('初遇'))return'初遇';return'';}
  function fixJourneyStages(){const view=$('journey');if(!view||!view.classList.contains('active'))return;const service=serviceOfJourneyView();view.querySelectorAll('.stage-track').forEach(track=>{if(service==='初遇'){track.style.gridTemplateColumns='1fr';[...track.querySelectorAll('.stage')].forEach((stage,i)=>{stage.style.display=i===0?'block':'none'});}else if(service==='拾光'){track.style.display='grid';track.style.gridTemplateColumns='repeat(4,1fr)';[...track.querySelectorAll('.stage')].forEach(stage=>stage.style.display='block');}else if(service==='同行'){track.style.display='none';}})}
  const observer=new MutationObserver(()=>requestAnimationFrame(fixJourneyStages));
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',()=>setTimeout(fixJourneyStages,40),true);
  setTimeout(fixJourneyStages,80);

  /* 正式電子紀錄：不要再用純文字列印頁，改成拾光所的一頁珍藏版。 */
  const printStyle=document.createElement('style');
  printStyle.dataset.shiguangPrint='1';
  printStyle.textContent=`@media print{
    @page{size:A4;margin:0}
    html,body{background:#f4ecdf!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
    body>*{display:none!important}
    #printSheet{display:block!important;width:210mm;min-height:297mm;margin:0;padding:0!important;background:#f8f2e8!important;color:#493c31!important;font-family:"Songti TC","Noto Serif TC",serif!important}
    .sg-print-page{width:210mm;min-height:297mm;padding:16mm 16mm 15mm;position:relative;overflow:hidden;background:radial-gradient(circle at 12% 8%,rgba(255,255,255,.94),transparent 32%),linear-gradient(180deg,#fbf7f0,#f4eadc)!important}
    .sg-print-page:after{content:"";position:absolute;right:-18mm;top:20mm;width:62mm;height:110mm;opacity:.12;background:radial-gradient(ellipse at 20% 15%,#7c8b5b 0 6%,transparent 7%),radial-gradient(ellipse at 45% 30%,#7c8b5b 0 7%,transparent 8%),radial-gradient(ellipse at 30% 48%,#7c8b5b 0 8%,transparent 9%),linear-gradient(72deg,transparent 48%,#718054 49% 50%,transparent 51%);transform:rotate(-12deg)}
    .sg-print-brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:8mm;border-bottom:.35mm solid #d9c6aa}
    .sg-print-brand-left{display:flex;align-items:center;gap:5mm}.sg-print-logo{width:24mm;height:24mm;object-fit:contain;mix-blend-mode:multiply}.sg-print-name{font-size:8mm;letter-spacing:1.5mm}.sg-print-tag{font-size:3.7mm;color:#8a7868;margin-top:1.5mm}
    .sg-print-record{margin-top:13mm;padding:11mm 12mm 10mm;border:.35mm solid #e2d2bd;border-radius:7mm;background:rgba(255,252,247,.82);box-shadow:0 3mm 10mm rgba(92,66,39,.05)}
    .sg-print-kicker{font-size:3.6mm;letter-spacing:.8mm;color:#9b825f}.sg-print-title{font-size:11mm;line-height:1.25;margin:3mm 0 2mm;color:#5a4128}.sg-print-sub{font-size:4.4mm;color:#8b7563;margin-bottom:8mm}
    .sg-print-sections{display:grid;gap:4.5mm}.sg-print-item{padding:4mm 0 4.5mm;border-bottom:.25mm solid #eadfce}.sg-print-item:last-child{border-bottom:0}.sg-print-label{font-size:4mm;color:#9c7e55;margin-bottom:1.6mm;display:flex;gap:2mm;align-items:center}.sg-print-label:before{content:"✦";font-size:3.2mm;color:#b79258}.sg-print-text{font-size:4.8mm;line-height:1.85;white-space:pre-wrap;color:#4b4037}
    .sg-print-footer{position:absolute;left:16mm;right:16mm;bottom:12mm;display:flex;align-items:flex-end;justify-content:space-between;border-top:.3mm solid #decdb6;padding-top:4mm}.sg-print-quote{font-size:4mm;line-height:1.7;color:#7d6959}.sg-print-date{font-size:3.3mm;color:#9a897b;text-align:right}
  }`;
  document.head.appendChild(printStyle);

  function escHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function parsePreview(){
    const text=$('previewBody')?.textContent||'';
    const blocks=text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
    return blocks.map(block=>{const lines=block.split('\n');return{label:(lines.shift()||'').trim(),text:lines.join('\n').trim()||'—'};});
  }
  window.printRecord=()=>{
    const title=$('previewTitle')?.textContent||'《旅程紀錄》';
    const sub=$('previewSub')?.textContent||'';
    const parts=parsePreview();
    const sheet=$('printSheet');
    const today=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    sheet.innerHTML=`<div class="sg-print-page"><div class="sg-print-brand"><div class="sg-print-brand-left"><img class="sg-print-logo" src="32CCD19A-16B9-451E-8559-4A40F8CA3D92.png"><div><div class="sg-print-name">拾光所</div><div class="sg-print-tag">陪伴每一位旅人，拾起內在的光。</div></div></div><div class="sg-print-kicker">一頁珍藏</div></div><section class="sg-print-record"><div class="sg-print-kicker">SHIGUANG JOURNEY RECORD</div><h1 class="sg-print-title">${escHtml(title)}</h1><div class="sg-print-sub">${escHtml(sub)}</div><div class="sg-print-sections">${parts.map(p=>`<div class="sg-print-item"><div class="sg-print-label">${escHtml(p.label)}</div><div class="sg-print-text">${escHtml(p.text)}</div></div>`).join('')}</div></section><footer class="sg-print-footer"><div class="sg-print-quote">每一次相遇，<br>都留下一點重新看見自己的光。</div><div class="sg-print-date">${escHtml(today)}<br>𓇼 拾光所</div></footer></div>`;
    setTimeout(()=>window.print(),60);
  };

  document.documentElement.dataset.shiguangBuild='launch-3';
})();
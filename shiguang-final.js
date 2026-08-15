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
  function getTravelerBySelect(id){const tid=$(id)?.value;return window.data?.travelers?.find(x=>x.id===tid)||null;}
  function serviceOfTraveler(t){const j=normalize(t?.journey||'');if(j.includes('同行')||j.includes('三個月'))return'同行';if(j.includes('拾光')||j.includes('四週'))return'拾光';if(j.includes('初遇'))return'初遇';return'';}
  function serviceOfJourneyView(){return serviceOfTraveler(getTravelerBySelect('journeyTraveler'));}

  function fixJourneyStages(){
    const view=$('journey');
    if(!view||!view.classList.contains('active'))return;
    const service=serviceOfJourneyView();
    view.querySelectorAll('.stage-track').forEach(track=>{
      if(service==='初遇'){
        track.style.display='grid';track.style.gridTemplateColumns='1fr';
        [...track.querySelectorAll('.stage')].forEach((stage,i)=>{stage.style.display=i===0?'block':'none'});
      }else if(service==='拾光'){
        track.style.display='grid';track.style.gridTemplateColumns='repeat(4,1fr)';
        [...track.querySelectorAll('.stage')].forEach(stage=>stage.style.display='block');
      }else if(service==='同行') track.style.display='none';
    });
  }

  function fixSessionByService(){
    const view=$('session');if(!view||!view.classList.contains('active'))return;
    const t=getTravelerBySelect('sessionTraveler');const service=serviceOfTraveler(t);const sel=$('sessionStage');
    if(!sel)return;
    const keep=sel.value;
    if(service==='初遇'){
      sel.innerHTML='<option value="看見">看見</option>';sel.value='看見';sel.disabled=true;
      view.querySelectorAll('.stage-track').forEach(track=>{track.style.display='grid';track.style.gridTemplateColumns='1fr';[...track.querySelectorAll('.stage')].forEach((s,i)=>s.style.display=i===0?'block':'none')});
    }else if(service==='拾光'){
      sel.disabled=false;sel.innerHTML='<option>看見</option><option>分辨</option><option>找回</option><option>選擇</option>';if([...sel.options].some(o=>o.value===keep))sel.value=keep;
      view.querySelectorAll('.stage-track').forEach(track=>{track.style.display='grid';track.style.gridTemplateColumns='repeat(4,1fr)';[...track.querySelectorAll('.stage')].forEach(s=>s.style.display='block')});
    }else if(service==='同行'){
      sel.disabled=false;sel.innerHTML='<option>同行</option><option>生活練習</option>';if([...sel.options].some(o=>o.value===keep))sel.value=keep;
      view.querySelectorAll('.stage-track').forEach(track=>track.style.display='none');
    }
  }

  const originalOpenSession=window.openSessionForm;
  if(typeof originalOpenSession==='function')window.openSessionForm=()=>{originalOpenSession();setTimeout(fixSessionByService,30)};
  $('sessionTraveler')?.addEventListener('change',fixSessionByService);

  function recordTypeForTraveler(t){const s=serviceOfTraveler(t);return s==='初遇'?'初遇紀錄':s==='拾光'?'拾光紀錄':s==='同行'?'旅程紀錄':'';}
  function alignRecordType(){
    const t=getTravelerBySelect('createTraveler');if(!t)return;
    const type=recordTypeForTraveler(t);if(!type)return;
    const hidden=$('recordType');if(hidden&&hidden.value!==type){hidden.value=type;document.querySelectorAll('.record-type').forEach(x=>x.classList.toggle('active',x.dataset.type===type));}
    document.querySelectorAll('.record-type').forEach(x=>{const active=x.dataset.type===type;x.style.opacity=active?'1':'.42';x.style.pointerEvents=active?'auto':'none'});
  }
  $('createTraveler')?.addEventListener('change',()=>setTimeout(()=>{alignRecordType();window.buildDraft?.()},20));
  const originalBuildDraft=window.buildDraft;
  if(typeof originalBuildDraft==='function')window.buildDraft=()=>{alignRecordType();originalBuildDraft();};

  const observer=new MutationObserver(()=>requestAnimationFrame(()=>{fixJourneyStages();fixSessionByService();alignRecordType();}));
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',()=>setTimeout(()=>{fixJourneyStages();fixSessionByService();alignRecordType();},40),true);
  setTimeout(()=>{fixJourneyStages();fixSessionByService();alignRecordType();},80);

  /* 正式電子紀錄：畫面預覽與 PDF 都使用同一套拾光所版型。 */
  const previewStyle=document.createElement('style');
  previewStyle.dataset.sgRecordPreview='1';
  previewStyle.textContent=`
  #recordPreviewCard{background:radial-gradient(circle at 10% 5%,rgba(255,255,255,.92),transparent 35%),linear-gradient(145deg,#fffaf4,#f2e4d1)!important;border-color:#dfcdb3!important;padding:28px!important}
  #recordPreviewCard .preview-head{align-items:center!important}
  #recordPreviewCard .preview-body{background:rgba(255,253,249,.72)!important;border:1px solid #e7d8c4!important;padding:22px!important}
  .sg-preview-grid{display:grid;gap:12px}.sg-preview-item{padding:15px 16px;border-bottom:1px solid #eadfce}.sg-preview-item:last-child{border-bottom:0}.sg-preview-label{font-family:"Songti TC","Noto Serif TC",serif;color:#9b7b50;font-size:15px;letter-spacing:.04em;margin-bottom:7px}.sg-preview-label:before{content:"✦ ";color:#b79560}.sg-preview-text{font-family:"Songti TC","Noto Serif TC",serif;white-space:pre-wrap;line-height:1.9;font-size:17px;color:#493d34}.sg-preview-foot{margin-top:18px;text-align:right;font-family:"Songti TC","Noto Serif TC",serif;color:#8b7766;font-size:14px}
  @media(max-width:760px){#recordPreviewCard{padding:18px!important}.sg-preview-item{padding:13px 8px}.sg-preview-text{font-size:16px}}
  `;
  document.head.appendChild(previewStyle);

  function escHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function recParts(rec){
    if(Array.isArray(rec?.parts)&&rec.parts.length)return rec.parts.map(p=>({label:p.label||'',text:p.text||'—'}));
    const text=rec?.text||$('previewBody')?.textContent||'';const blocks=text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
    return blocks.map(block=>{const lines=block.split('\n');return{label:(lines.shift()||'').trim(),text:lines.join('\n').trim()||'—'};});
  }
  window.showRecordPreview=rec=>{
    const t=window.data?.travelers?.find(x=>x.id===rec.travelerId);
    const title=`${t?.name||'旅人'}｜《${rec.type}》`;
    const sub=rec.type==='初遇紀錄'?'一場相遇，留下第一次看見。':rec.type==='拾光紀錄'?'四週整理，把一路看見的自己留下來。':'三個月，把真正發生在生活裡的改變留下來。';
    $('previewTitle').textContent=title;$('previewSub').textContent=sub;
    const parts=recParts(rec);
    $('previewBody').innerHTML=`<div class="sg-preview-grid">${parts.map(p=>`<div class="sg-preview-item"><div class="sg-preview-label">${escHtml(p.label)}</div><div class="sg-preview-text">${escHtml(p.text)}</div></div>`).join('')}</div><div class="sg-preview-foot">𓇼 拾光所｜陪伴每一位旅人，拾起內在的光。</div>`;
    $('recordPreviewCard').style.display='block';$('recordPreviewCard').dataset.recordId=rec.id||'';$('recordPreviewCard').scrollIntoView({behavior:'smooth',block:'start'});
  };

  const printStyle=document.createElement('style');
  printStyle.dataset.shiguangPrint='1';
  printStyle.textContent=`@media print{
    @page{size:A4;margin:0}
    html,body{background:#f4ecdf!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
    body>*{display:none!important}
    #printSheet{display:block!important;width:210mm;min-height:297mm;margin:0;padding:0!important;background:#f8f2e8!important;color:#493c31!important;font-family:"Songti TC","Noto Serif TC",serif!important}
    .sg-print-page{width:210mm;min-height:297mm;padding:16mm 16mm 15mm;position:relative;overflow:hidden;background:radial-gradient(circle at 12% 8%,rgba(255,255,255,.94),transparent 32%),linear-gradient(180deg,#fbf7f0,#f4eadc)!important}
    .sg-print-page:after{content:"";position:absolute;right:-18mm;top:20mm;width:62mm;height:110mm;opacity:.12;background:radial-gradient(ellipse at 20% 15%,#7c8b5b 0 6%,transparent 7%),radial-gradient(ellipse at 45% 30%,#7c8b5b 0 7%,transparent 8%),radial-gradient(ellipse at 30% 48%,#7c8b5b 0 8%,transparent 9%),linear-gradient(72deg,transparent 48%,#718054 49% 50%,transparent 51%);transform:rotate(-12deg)}
    .sg-print-brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:8mm;border-bottom:.35mm solid #d9c6aa}.sg-print-brand-left{display:flex;align-items:center;gap:5mm}.sg-print-logo{width:24mm;height:24mm;object-fit:contain;mix-blend-mode:multiply}.sg-print-name{font-size:8mm;letter-spacing:1.5mm}.sg-print-tag{font-size:3.7mm;color:#8a7868;margin-top:1.5mm}
    .sg-print-record{margin-top:13mm;padding:11mm 12mm 10mm;border:.35mm solid #e2d2bd;border-radius:7mm;background:rgba(255,252,247,.82);box-shadow:0 3mm 10mm rgba(92,66,39,.05)}.sg-print-kicker{font-size:3.6mm;letter-spacing:.8mm;color:#9b825f}.sg-print-title{font-size:11mm;line-height:1.25;margin:3mm 0 2mm;color:#5a4128}.sg-print-sub{font-size:4.4mm;color:#8b7563;margin-bottom:8mm}
    .sg-print-sections{display:grid;gap:4.5mm}.sg-print-item{padding:4mm 0 4.5mm;border-bottom:.25mm solid #eadfce}.sg-print-item:last-child{border-bottom:0}.sg-print-label{font-size:4mm;color:#9c7e55;margin-bottom:1.6mm;display:flex;gap:2mm;align-items:center}.sg-print-label:before{content:"✦";font-size:3.2mm;color:#b79258}.sg-print-text{font-size:4.8mm;line-height:1.85;white-space:pre-wrap;color:#4b4037}
    .sg-print-footer{position:absolute;left:16mm;right:16mm;bottom:12mm;display:flex;align-items:flex-end;justify-content:space-between;border-top:.3mm solid #decdb6;padding-top:4mm}.sg-print-quote{font-size:4mm;line-height:1.7;color:#7d6959}.sg-print-date{font-size:3.3mm;color:#9a897b;text-align:right}
  }`;
  document.head.appendChild(printStyle);

  function currentPreviewParts(){
    const items=[...document.querySelectorAll('#previewBody .sg-preview-item')];
    if(items.length)return items.map(x=>({label:x.querySelector('.sg-preview-label')?.textContent?.replace(/^✦\s*/,'')||'',text:x.querySelector('.sg-preview-text')?.textContent||'—'}));
    const text=$('previewBody')?.textContent||'';return text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(block=>{const lines=block.split('\n');return{label:(lines.shift()||'').trim(),text:lines.join('\n').trim()||'—'};});
  }
  window.printRecord=()=>{
    const title=$('previewTitle')?.textContent||'《旅程紀錄》';const sub=$('previewSub')?.textContent||'';const parts=currentPreviewParts();const sheet=$('printSheet');
    const today=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    sheet.innerHTML=`<div class="sg-print-page"><div class="sg-print-brand"><div class="sg-print-brand-left"><img class="sg-print-logo" src="32CCD19A-16B9-451E-8559-4A40F8CA3D92.png"><div><div class="sg-print-name">拾光所</div><div class="sg-print-tag">陪伴每一位旅人，拾起內在的光。</div></div></div><div class="sg-print-kicker">一頁珍藏</div></div><section class="sg-print-record"><div class="sg-print-kicker">SHIGUANG JOURNEY RECORD</div><h1 class="sg-print-title">${escHtml(title)}</h1><div class="sg-print-sub">${escHtml(sub)}</div><div class="sg-print-sections">${parts.map(p=>`<div class="sg-print-item"><div class="sg-print-label">${escHtml(p.label)}</div><div class="sg-print-text">${escHtml(p.text)}</div></div>`).join('')}</div></section><footer class="sg-print-footer"><div class="sg-print-quote">每一次相遇，<br>都留下一點重新看見自己的光。</div><div class="sg-print-date">${escHtml(today)}<br>𓇼 拾光所</div></footer></div>`;
    setTimeout(()=>window.print(),80);
  };

  document.documentElement.dataset.shiguangBuild='launch-4';
})();
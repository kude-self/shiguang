/* 拾光所｜可靠上線修正版 2026-08-15 */
(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').replace(/\s+/g,'');
  const service=t=>{const j=norm(t?.journey);return j.includes('同行')||j.includes('三個月')?'同行':j.includes('拾光')||j.includes('四週')?'拾光':j.includes('初遇')?'初遇':''};
  const traveler=id=>window.data?.travelers?.find(t=>t.id===$(id)?.value)||null;

  function install(){
    if(!window.data||typeof window.saveCloud!=='function'||typeof window.renderLibrary!=='function'||typeof window.confirmDraft!=='function'||typeof window.renderJourney!=='function') return false;
    if(window.__SG_HOTFIX_INSTALLED__) return true;
    window.__SG_HOTFIX_INSTALLED__=true;

    const css=document.createElement('style');
    css.textContent=`
      .sg-record-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.sg-delete{border:1px solid #dfc8bd;background:#fff7f3;color:#9a5d55;border-radius:999px;padding:9px 14px;cursor:pointer}.sg-clean{border:1px solid #d9c8b3;background:#fffaf4;border-radius:999px;padding:9px 14px;cursor:pointer;margin-left:auto}.sg-preview-grid{display:grid;gap:10px}.sg-preview-item{padding:14px 10px;border-bottom:1px solid #eadfce}.sg-preview-label{font-family:"Songti TC","Noto Serif TC",serif;color:#9b7b50;font-size:15px;margin-bottom:7px}.sg-preview-label:before{content:"✦ ";color:#b79560}.sg-preview-text{font-family:"Songti TC","Noto Serif TC",serif;white-space:pre-wrap;line-height:1.9;font-size:17px;color:#493d34}.sg-preview-foot{text-align:right;color:#8b7766;margin-top:16px;font-family:"Songti TC","Noto Serif TC",serif}
      @media(max-width:760px){.record-row{grid-template-columns:1fr!important}.sg-record-actions{margin-top:10px}.sg-record-actions button{flex:1}.nav{padding-bottom:max(7px,env(safe-area-inset-bottom))!important}}
      @media print{@page{size:A4;margin:0}html,body{background:#f5eee4!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body>*{display:none!important}#printSheet{display:block!important;width:210mm;min-height:297mm;margin:0!important;padding:0!important;background:#f7efe4!important}.sg-pdf{width:210mm;min-height:297mm;padding:16mm;position:relative;background:radial-gradient(circle at 10% 5%,#fff 0,transparent 34%),linear-gradient(180deg,#fbf7f0,#f3e7d7);color:#493d34;font-family:"Songti TC","Noto Serif TC",serif}.sg-pdf-head{display:flex;align-items:center;gap:6mm;padding-bottom:7mm;border-bottom:.35mm solid #d9c6aa}.sg-pdf-logo{width:24mm;height:24mm;object-fit:contain;mix-blend-mode:multiply}.sg-pdf-brand{font-size:8mm;letter-spacing:1.4mm}.sg-pdf-tag{font-size:3.6mm;color:#8a7868;margin-top:1.2mm}.sg-pdf-card{margin-top:12mm;padding:10mm 11mm;border:.35mm solid #e0ceb6;border-radius:7mm;background:rgba(255,253,249,.82)}.sg-pdf-title{font-size:10mm;margin:0 0 2mm;color:#5a4128}.sg-pdf-sub{font-size:4.4mm;color:#8b7563;margin-bottom:7mm}.sg-pdf-item{padding:3.7mm 0;border-bottom:.25mm solid #eadfce}.sg-pdf-item:last-child{border-bottom:0}.sg-pdf-label{font-size:4mm;color:#9b7b50;margin-bottom:1.5mm}.sg-pdf-text{font-size:4.7mm;line-height:1.8;white-space:pre-wrap}.sg-pdf-foot{position:absolute;left:16mm;right:16mm;bottom:12mm;padding-top:4mm;border-top:.3mm solid #decdb6;display:flex;justify-content:space-between;color:#806e5e;font-size:3.6mm}}
    `;
    document.head.appendChild(css);

    function recordParts(rec){
      if(Array.isArray(rec?.parts)&&rec.parts.length) return rec.parts.map(p=>({label:p.label||'',text:p.text||'—'}));
      return String(rec?.text||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(b=>{const a=b.split('\n');return{label:a.shift()||'',text:a.join('\n')||'—'}});
    }

    window.showRecordPreview=rec=>{
      const t=window.data.travelers.find(x=>x.id===rec.travelerId);
      const sub=rec.type==='初遇紀錄'?'一場相遇，留下第一次看見。':rec.type==='拾光紀錄'?'四週整理，把一路看見的自己留下來。':'三個月，把真正發生在生活裡的改變留下來。';
      $('previewTitle').textContent=`${t?.name||'旅人'}｜《${rec.type}》`;$('previewSub').textContent=sub;
      $('previewBody').innerHTML=`<div class="sg-preview-grid">${recordParts(rec).map(p=>`<div class="sg-preview-item"><div class="sg-preview-label">${esc(p.label)}</div><div class="sg-preview-text">${esc(p.text)}</div></div>`).join('')}</div><div class="sg-preview-foot">𓇼 拾光所｜陪伴每一位旅人，拾起內在的光。</div>`;
      $('recordPreviewCard').style.display='block';$('recordPreviewCard').dataset.recordId=rec.id||'';$('recordPreviewCard').scrollIntoView({behavior:'smooth',block:'start'});
    };

    window.deleteSavedRecord=async id=>{
      const rec=window.data.confirmed.find(r=>r.id===id);if(!rec)return;
      if(!confirm('確定刪除這份正式紀錄？刪除後無法復原。'))return;
      window.data.confirmed=window.data.confirmed.filter(r=>r.id!==id);
      await window.saveCloud();window.renderLibrary();
    };

    window.cleanupDuplicateRecords=async()=>{
      const seen=new Set(),keep=[];let removed=0;
      [...window.data.confirmed].sort((a,b)=>(b.updated||b.created||0)-(a.updated||a.created||0)).forEach(r=>{const k=`${r.travelerId}|${r.type}`;if(seen.has(k))removed++;else{seen.add(k);keep.push(r)}});
      if(!removed)return alert('目前沒有重複的正式紀錄。');
      if(!confirm(`找到 ${removed} 份重複紀錄。要保留每位旅人每種紀錄最新的一份，刪除其餘重複項目嗎？`))return;
      window.data.confirmed=keep;await window.saveCloud();window.renderLibrary();alert(`已清理 ${removed} 份重複紀錄。`);
    };

    window.renderLibrary=()=>{
      const el=$('libraryRecords');if(!el)return;const records=window.data.confirmed||[];
      const clean=records.length>1?'<div style="display:flex;margin-bottom:8px"><button class="sg-clean" onclick="cleanupDuplicateRecords()">清理重複紀錄</button></div>':'';
      el.innerHTML=clean+(records.length?records.map(r=>{const t=window.data.travelers.find(x=>x.id===r.travelerId);return`<div class="record-row"><div><strong>${esc(t?.name||'旅人')}｜${esc(r.type)}</strong><div class="row-meta">${esc((r.date||'').slice(0,10))}</div></div><div class="sg-record-actions"><button class="mini" onclick="viewSavedRecord('${r.id}')">查看正式版</button><button class="sg-delete" onclick="deleteSavedRecord('${r.id}')">刪除</button></div></div>`}).join(''):'<div class="empty">還沒有正式紀錄。完成文案確認後，會自動收藏在這裡。</div>');
    };

    const baseConfirm=window.confirmDraft;
    window.confirmDraft=async()=>{
      const id=$('createTraveler')?.value,type=$('recordType')?.value;if(!id)return alert('請先選擇旅人');
      const parts=[...document.querySelectorAll('.draft-section')].map(x=>({label:x.querySelector('label')?.textContent.replace(/^\d+\s*/,'').trim()||'',text:x.querySelector('textarea')?.value.trim()||''}));
      const existing=window.data.confirmed.find(r=>r.travelerId===id&&r.type===type);
      if(!existing)return baseConfirm();
      existing.parts=parts;existing.text=parts.map(p=>`${p.label}\n${p.text||'—'}`).join('\n\n');existing.date=new Date().toISOString();existing.updated=Date.now();await window.saveCloud();window.showRecordPreview(existing);$('draftStatus').textContent='✓ 已更新原本的正式紀錄，不會再新增重複卡片。';window.renderLibrary();
    };

    function applyJourneyRules(){
      const t=traveler('journeyTraveler'),svc=service(t),view=$('journey');if(!view)return;
      view.querySelectorAll('.stage-track').forEach(track=>{const stages=[...track.querySelectorAll('.stage')];if(svc==='初遇'){track.style.display='grid';track.style.gridTemplateColumns='1fr';stages.forEach((s,i)=>s.style.display=i===0?'block':'none')}else if(svc==='拾光'){track.style.display='grid';track.style.gridTemplateColumns='repeat(4,1fr)';stages.forEach(s=>s.style.display='block')}else if(svc==='同行')track.style.display='none'});
    }
    const baseJourney=window.renderJourney;window.renderJourney=()=>{baseJourney();setTimeout(applyJourneyRules,0)};

    function applySessionRules(){const t=traveler('sessionTraveler'),svc=service(t),sel=$('sessionStage');if(!sel)return;if(svc==='初遇'){sel.innerHTML='<option>看見</option>';sel.value='看見';sel.disabled=true}else if(svc==='拾光'){sel.disabled=false;sel.innerHTML='<option>看見</option><option>分辨</option><option>找回</option><option>選擇</option>'}else if(svc==='同行'){sel.disabled=false;sel.innerHTML='<option>同行</option><option>生活練習</option>'}}
    const baseOpen=window.openSessionForm;window.openSessionForm=()=>{baseOpen();setTimeout(applySessionRules,0)};$('sessionTraveler')?.addEventListener('change',applySessionRules);

    function alignRecord(){const t=traveler('createTraveler'),svc=service(t),type=svc==='初遇'?'初遇紀錄':svc==='拾光'?'拾光紀錄':svc==='同行'?'旅程紀錄':'';if(!type)return;$('recordType').value=type;document.querySelectorAll('.record-type').forEach(x=>{const on=x.dataset.type===type;x.classList.toggle('active',on);x.style.display=on?'block':'none'})}
    const baseDraft=window.buildDraft;window.buildDraft=()=>{alignRecord();baseDraft()};$('createTraveler')?.addEventListener('change',()=>setTimeout(()=>window.buildDraft(),0));

    function previewParts(){const nodes=[...document.querySelectorAll('#previewBody .sg-preview-item')];return nodes.map(n=>({label:n.querySelector('.sg-preview-label')?.textContent||'',text:n.querySelector('.sg-preview-text')?.textContent||'—'}))}
    window.printRecord=()=>{const parts=previewParts(),title=$('previewTitle')?.textContent||'《旅程紀錄》',sub=$('previewSub')?.textContent||'',today=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());$('printSheet').innerHTML=`<div class="sg-pdf"><div class="sg-pdf-head"><img class="sg-pdf-logo" src="32CCD19A-16B9-451E-8559-4A40F8CA3D92.png"><div><div class="sg-pdf-brand">拾光所</div><div class="sg-pdf-tag">陪伴每一位旅人，拾起內在的光。</div></div></div><section class="sg-pdf-card"><h1 class="sg-pdf-title">${esc(title)}</h1><div class="sg-pdf-sub">${esc(sub)}</div>${parts.map(p=>`<div class="sg-pdf-item"><div class="sg-pdf-label">✦ ${esc(p.label)}</div><div class="sg-pdf-text">${esc(p.text)}</div></div>`).join('')}</section><div class="sg-pdf-foot"><div>每一次相遇，都留下一點重新看見自己的光。</div><div>${esc(today)}<br>𓇼 拾光所</div></div></div>`;setTimeout(()=>window.print(),100)};

    window.renderLibrary();applyJourneyRules();alignRecord();
    document.documentElement.dataset.sgHotfix='20260815-1';
    return true;
  }

  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer)},100);
})();
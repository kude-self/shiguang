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
        if(blob&&navigator.share){
          const file=new File([blob],name,{type:'image/png'});
          if(!navigator.canShare||navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'拾光所旅程紀錄'});return;}
        }
        if(isIOS){const url=URL.createObjectURL(blob);const w=window.open(url,'_blank');if(!w)location.href=url;setTimeout(()=>URL.revokeObjectURL(url),60000);return;}
        const a=document.createElement('a');a.download=name;a.href=canvas.toDataURL('image/png');a.click();
      }catch(err){console.error(err);alert('圖片儲存沒有成功，請再試一次。');}
    };
  }

  const safeCreate=()=>{if(!window.data?.travelers?.length){alert('先建立第一位旅人，再開始製作旅程紀錄。');return false}return true};
  document.querySelectorAll('[onclick*="go(\'create\')"],[onclick*="go(\"create\")"]').forEach(el=>el.addEventListener('click',e=>{if(!safeCreate()){e.preventDefault();e.stopImmediatePropagation()}},true));

  document.addEventListener('focusin',e=>{if(!/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||''))return;setTimeout(()=>e.target.scrollIntoView({behavior:'smooth',block:'center'}),220)});

  /* 服務層級規則：初遇＝單次看見；拾光＝四週看見→分辨→找回→選擇；同行不套用拾光四階段。 */
  const normalize=t=>(t||'').replace(/\s+/g,'');
  function serviceOfJourneyView(){
    const view=$('view-journey');
    if(!view)return'';
    const txt=normalize(view.innerText);
    if(txt.includes('同行')||txt.includes('三個月'))return'同行';
    if(txt.includes('拾光')||txt.includes('四週'))return'拾光';
    if(txt.includes('初遇'))return'初遇';
    return'';
  }
  function fixJourneyStages(){
    const view=$('view-journey');
    if(!view||!view.classList.contains('active'))return;
    const service=serviceOfJourneyView();
    view.querySelectorAll('.stage-track').forEach(track=>{
      if(service==='初遇'){
        track.style.gridTemplateColumns='1fr';
        [...track.querySelectorAll('.stage')].forEach((stage,i)=>{stage.style.display=i===0?'block':'none'});
        const first=track.querySelector('.stage');
        if(first){const label=[...first.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(label)label.textContent='看見';}
      }else if(service==='拾光'){
        track.style.gridTemplateColumns='repeat(4,1fr)';
        [...track.querySelectorAll('.stage')].forEach(stage=>stage.style.display='block');
      }else if(service==='同行'){
        track.style.display='none';
      }
    });
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(fixJourneyStages));
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',()=>setTimeout(fixJourneyStages,40),true);
  setTimeout(fixJourneyStages,80);

  document.documentElement.dataset.shiguangBuild='launch-2';
})();
/* 拾光所｜上線前最後體驗修整 */
(()=>{
  const $=id=>document.getElementById(id);
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

  // 防止重複送出，讓手機操作更安心。
  document.addEventListener('submit',e=>{
    const btn=e.target?.querySelector('button[type="submit"]');
    if(!btn||btn.dataset.busy==='1') return;
    btn.dataset.busy='1';
    const old=btn.textContent;
    btn.textContent='儲存中…';
    setTimeout(()=>{btn.dataset.busy='0';btn.textContent=old},1400);
  },true);

  // iPhone 友善圖片輸出：優先使用分享面板，否則開啟圖片供長按儲存。
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
          if(!navigator.canShare||navigator.canShare({files:[file]})){
            await navigator.share({files:[file],title:'拾光所旅程紀錄'});
            return;
          }
        }
        if(isIOS){
          const url=URL.createObjectURL(blob);
          const w=window.open(url,'_blank');
          if(!w) location.href=url;
          setTimeout(()=>URL.revokeObjectURL(url),60000);
          return;
        }
        const a=document.createElement('a');a.download=name;a.href=canvas.toDataURL('image/png');a.click();
      }catch(err){console.error(err);alert('圖片儲存沒有成功，請再試一次。');}
    };
  }

  // PDF 按鈕在 iPhone 上提示使用列印頁的「分享 → 儲存到檔案」。
  if(typeof window.printRecord==='function'){
    const original=window.printRecord;
    window.printRecord=()=>{
      original();
    };
  }

  // 沒有旅人時，避免進入空白製作流程。
  const safeCreate=()=>{
    if(!window.data?.travelers?.length){alert('先建立第一位旅人，再開始製作旅程紀錄。');return false}
    return true;
  };
  document.querySelectorAll('[onclick*="go(\'create\')"],[onclick*="go(\"create\")"]').forEach(el=>{
    el.addEventListener('click',e=>{if(!safeCreate()){e.preventDefault();e.stopImmediatePropagation()}},true);
  });

  // iPhone 鍵盤彈出時，避免底部導覽遮住輸入欄位。
  document.addEventListener('focusin',e=>{
    if(!/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName||'')) return;
    setTimeout(()=>e.target.scrollIntoView({behavior:'smooth',block:'center'}),220);
  });

  // 標記版本，方便確認 Safari 是否載入最新版。
  document.documentElement.dataset.shiguangBuild='launch-1';
})();
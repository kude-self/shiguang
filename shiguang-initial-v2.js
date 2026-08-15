/* 拾光所｜第一階・初遇 PDF 輸出修正版 */
(()=>{
 const old=window.printRecord;
 async function loadJsPDF(){if(window.jspdf?.jsPDF)return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
 window.sgExportInitialCanvas=async function(canvas,rec){
   if(!canvas)return false;
   await loadJsPDF();
   const {jsPDF}=window.jspdf;
   const pdf=new jsPDF({orientation:'portrait',unit:'px',format:[canvas.width,canvas.height],hotfixes:['px_scaling'],compress:true});
   pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,canvas.width,canvas.height,undefined,'FAST');
   const t=window.data?.travelers?.find(x=>x.id===rec?.travelerId);
   const name=`拾光所-${t?.name||'旅人'}-初遇紀錄.pdf`;
   const blob=pdf.output('blob');
   if((/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)&&navigator.share){try{await navigator.share({files:[new File([blob],name,{type:'application/pdf'})],title:'拾光所｜初遇紀錄'});return true}catch(e){if(e?.name==='AbortError')return true}}
   const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);return true;
 };
 // 等正式母版建立後覆寫輸出：不再把 4:5 母版塞進 A4，避免下方大白邊與縮放位移。
 const timer=setInterval(()=>{if(window.__sgInitialPdfPatched)return clearInterval(timer);const current=window.printRecord;if(typeof current!=='function')return;window.__sgInitialPdfPatched=true;window.printRecord=async function(){
   const rec=window.__sgActiveRecord;const card=document.getElementById('recordPreviewCard');
   if(rec?.type==='初遇紀錄'&&card){const img=card.querySelector('#previewBody img');if(img?.src){const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d');const im=new Image();im.onload=async()=>{ctx.drawImage(im,0,0,c.width,c.height);await window.sgExportInitialCanvas(c,rec)};im.src=img.src;return}}
   return current.apply(this,arguments);
 };clearInterval(timer)},500);
})();
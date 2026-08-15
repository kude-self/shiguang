/* 拾光所｜PDF / 圖片輸出修正 v2 */
(()=>{
  const $=id=>document.getElementById(id);
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function loadScript(src,test){return new Promise((resolve,reject)=>{if(test())return resolve();const s=document.createElement('script');s.src=src;s.onload=()=>resolve();s.onerror=reject;document.head.appendChild(s)})}
  async function ensureTools(){
    await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',()=>!!window.html2canvas);
    await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);
  }
  function currentPages(){
    if(Array.isArray(window.__sgPages)&&window.__sgPages.length)return window.__sgPages.slice();
    const page=document.querySelector('#recordPreviewCard .sg-page');
    if(page)return [page.outerHTML];
    const host=$('sgPageHost');return host?.innerHTML&&host.querySelector?.('.sg-page')?[host.querySelector('.sg-page').outerHTML]:[];
  }
  function resolveCurrentRecord(){
    const records=window.data?.confirmed||[];
    if(!records.length)return null;
    const card=$('recordPreviewCard');
    const id=card?.dataset?.recordId;
    if(id){const r=records.find(x=>x.id===id);if(r)return r;}
    const travelerId=$('createTraveler')?.value;
    const type=$('recordType')?.value;
    if(travelerId&&type){
      const matches=records.filter(x=>x.travelerId===travelerId&&x.type===type);
      if(matches.length)return matches.sort((a,b)=>new Date(b.updated||b.date||0)-new Date(a.updated||a.date||0))[0];
    }
    if(travelerId){
      const matches=records.filter(x=>x.travelerId===travelerId);
      if(matches.length)return matches.sort((a,b)=>new Date(b.updated||b.date||0)-new Date(a.updated||a.date||0))[0];
    }
    return records.slice().sort((a,b)=>new Date(b.updated||b.date||0)-new Date(a.updated||a.date||0))[0]||null;
  }
  async function ensureFormalPages(){
    let pg=currentPages();
    if(pg.length)return pg;
    const rec=resolveCurrentRecord();
    if(!rec)return [];
    if(typeof window.showRecordPreview==='function'){
      window.showRecordPreview(rec);
      await sleep(120);
      pg=currentPages();
    }
    return pg;
  }
  async function renderPage(html){
    const wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;left:-10000px;top:0;width:760px;background:#f5eee4;z-index:-1;';
    wrap.innerHTML=html;document.body.appendChild(wrap);
    const page=wrap.querySelector('.sg-page')||wrap.firstElementChild;
    if(!page){wrap.remove();throw new Error('找不到正式版頁面');}
    page.style.width='760px';page.style.maxWidth='760px';page.style.minHeight='1075px';page.style.height='1075px';page.style.borderRadius='0';page.style.boxShadow='none';
    await sleep(180);
    await Promise.all([...page.querySelectorAll('img')].map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=img.onerror=r})));
    const canvas=await window.html2canvas(page,{scale:2,backgroundColor:'#f7efe4',useCORS:true,logging:false});
    wrap.remove();return canvas;
  }
  window.printRecord=async()=>{
    const pages=await ensureFormalPages();
    if(!pages.length)return alert('目前找不到可輸出的正式紀錄。請先在「製作」確認文案，或到「拾光庫」開啟正式版。');
    try{
      await ensureTools();
      const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
      for(let i=0;i<pages.length;i++){
        if(i)pdf.addPage('a4','portrait');
        const canvas=await renderPage(pages[i]);
        const img=canvas.toDataURL('image/jpeg',0.94);
        pdf.addImage(img,'JPEG',0,0,210,297,undefined,'FAST');
      }
      const rec=resolveCurrentRecord();
      const traveler=window.data?.travelers?.find(t=>t.id===rec?.travelerId);
      const base=`${traveler?.name||'旅人'}-${rec?.type||'旅程紀錄'}`.replace(/[\\/:*?"<>|]/g,'-');
      const name=`拾光所-${base}.pdf`;
      if(isIOS){
        const blob=pdf.output('blob');
        const file=new File([blob],name,{type:'application/pdf'});
        if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'拾光所正式紀錄'});return}catch(e){if(e?.name==='AbortError')return}}
        const url=URL.createObjectURL(blob);const w=window.open(url,'_blank');if(!w)location.href=url;setTimeout(()=>URL.revokeObjectURL(url),120000);
      }else pdf.save(name);
    }catch(e){console.error(e);alert('PDF 製作沒有成功，請稍後再試一次。')}
  };
  window.saveRecordImage=async()=>{
    const pages=await ensureFormalPages();
    if(!pages.length)return alert('目前找不到可輸出的正式紀錄。請先在「製作」確認文案，或到「拾光庫」開啟正式版。');
    try{
      await ensureTools();
      const rec=resolveCurrentRecord();
      const traveler=window.data?.travelers?.find(t=>t.id===rec?.travelerId);
      for(let i=0;i<pages.length;i++){
        const canvas=await renderPage(pages[i]);
        const blob=await new Promise(r=>canvas.toBlob(r,'image/png',1));
        const name=`拾光所-${traveler?.name||'旅人'}-${rec?.type||'旅程紀錄'}-${i+1}.png`;
        if(isIOS&&blob&&navigator.share){const file=new File([blob],name,{type:'image/png'});if(!navigator.canShare||navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'拾光所正式紀錄'});continue}catch(e){if(e?.name==='AbortError')return}}}
        const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),60000);
      }
    }catch(e){console.error(e);alert('圖片製作沒有成功，請稍後再試一次。')}
  };
  document.documentElement.dataset.sgPdfFix='20260815-v2';
})();
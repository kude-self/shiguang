/* 拾光所｜目前正式紀錄辨識修正 v1 */
(()=>{
  const $=id=>document.getElementById(id);
  let activeRecord=null;

  function install(){
    if(!window.data||!Array.isArray(window.data.confirmed)) return false;
    if(window.__SG_ACTIVE_RECORD_FIX__) return true;
    window.__SG_ACTIVE_RECORD_FIX__=1;

    const originalShow=window.showRecordPreview;
    if(typeof originalShow==='function'){
      window.showRecordPreview=function(rec){
        if(rec){
          activeRecord=rec;
          window.__sgActiveRecord=rec;
          const card=$('recordPreviewCard');
          if(card){
            card.dataset.recordId=rec.id||'';
            card.dataset.travelerId=rec.travelerId||'';
            card.dataset.recordType=rec.type||'';
          }
        }
        return originalShow.apply(this,arguments);
      };
    }

    const originalView=window.viewSavedRecord;
    if(typeof originalView==='function'){
      window.viewSavedRecord=function(id){
        const rec=window.data.confirmed.find(x=>x.id===id);
        if(rec){activeRecord=rec;window.__sgActiveRecord=rec;}
        return originalView.apply(this,arguments);
      };
    }

    function resolveRecord(){
      if(activeRecord) return activeRecord;
      if(window.__sgActiveRecord) return window.__sgActiveRecord;
      const card=$('recordPreviewCard');
      const id=card?.dataset.recordId;
      if(id){
        const rec=window.data.confirmed.find(x=>x.id===id);
        if(rec) return rec;
      }
      const travelerId=card?.dataset.travelerId||$('createTraveler')?.value;
      const type=card?.dataset.recordType||$('recordType')?.value;
      if(travelerId&&type){
        const list=window.data.confirmed.filter(x=>x.travelerId===travelerId&&x.type===type);
        if(list.length) return list.sort((a,b)=>(b.updated||b.created||Date.parse(b.date||0))-(a.updated||a.created||Date.parse(a.date||0)))[0];
      }
      return null;
    }

    const oldPrint=window.printRecord;
    window.printRecord=async function(){
      const rec=resolveRecord();
      if(rec){
        activeRecord=rec;window.__sgActiveRecord=rec;
        const card=$('recordPreviewCard');
        if(card){card.dataset.recordId=rec.id||'';card.dataset.travelerId=rec.travelerId||'';card.dataset.recordType=rec.type||'';}
        if(!Array.isArray(window.__sgPages)||!window.__sgPages.length){
          try{window.showRecordPreview(rec);await new Promise(r=>setTimeout(r,120));}catch(e){}
        }
      }
      if(typeof oldPrint==='function') return oldPrint.apply(this,arguments);
    };

    const oldImage=window.saveRecordImage;
    window.saveRecordImage=async function(){
      const rec=resolveRecord();
      if(rec){
        activeRecord=rec;window.__sgActiveRecord=rec;
        const card=$('recordPreviewCard');
        if(card){card.dataset.recordId=rec.id||'';card.dataset.travelerId=rec.travelerId||'';card.dataset.recordType=rec.type||'';}
        if(!Array.isArray(window.__sgPages)||!window.__sgPages.length){
          try{window.showRecordPreview(rec);await new Promise(r=>setTimeout(r,120));}catch(e){}
        }
      }
      if(typeof oldImage==='function') return oldImage.apply(this,arguments);
    };

    const preview=$('recordPreviewCard');
    if(preview&&preview.style.display!=='none'){
      const travelerId=$('createTraveler')?.value,type=$('recordType')?.value;
      if(travelerId&&type){
        const list=window.data.confirmed.filter(x=>x.travelerId===travelerId&&x.type===type);
        if(list.length){
          const rec=list.sort((a,b)=>(b.updated||b.created||Date.parse(b.date||0))-(a.updated||a.created||Date.parse(a.date||0)))[0];
          activeRecord=rec;window.__sgActiveRecord=rec;
          preview.dataset.recordId=rec.id||'';preview.dataset.travelerId=rec.travelerId||'';preview.dataset.recordType=rec.type||'';
        }
      }
    }
    document.documentElement.dataset.sgActiveRecordFix='20260815-v1';
    return true;
  }
  let n=0,t=setInterval(()=>{if(install()||++n>120)clearInterval(t)},100);
})();
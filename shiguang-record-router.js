/* 拾光所｜正式紀錄輸出路由 v1
   所有母版載入完成後，依紀錄類型固定分流，避免後載入腳本互相覆蓋。
*/
(()=>{
 const initialShow=window.showRecordPreview;
 const initialSave=window.saveRecordImage;
 const initialPrint=window.printRecord;
 const pickupShow=window.__sgPickupShowRecordPreview;
 const pickupSave=window.__sgPickupSaveRecordImage;
 const pickupPrint=window.__sgPickupPrintRecord;
 // 現行第一階母版最後載入，因此先保存為明確入口。
 window.__sgInitialShowRecordPreview=initialShow;
 window.__sgInitialSaveRecordImage=initialSave;
 window.__sgInitialPrintRecord=initialPrint;
 function typeOf(rec){return String(rec?.type||window.__sgActiveRecord?.type||'')}
 window.showRecordPreview=function(rec){
   const t=typeOf(rec);
   if(t==='拾光紀錄' && typeof pickupShow==='function') return pickupShow(rec);
   return window.__sgInitialShowRecordPreview?.(rec);
 };
 window.saveRecordImage=function(){
   const t=typeOf(window.__sgActiveRecord);
   if(t==='拾光紀錄' && typeof pickupSave==='function') return pickupSave();
   return window.__sgInitialSaveRecordImage?.();
 };
 window.printRecord=function(){
   const t=typeOf(window.__sgActiveRecord);
   if(t==='拾光紀錄' && typeof pickupPrint==='function') return pickupPrint();
   return window.__sgInitialPrintRecord?.();
 };
 document.documentElement.dataset.sgRecordRouter='v1';
})();
/* 拾光所｜正式紀錄輸出路由 v2 */
(()=>{
 const initialShow=window.showRecordPreview, initialSave=window.saveRecordImage, initialPrint=window.printRecord;
 const pickupShow=window.__sgPickupShowRecordPreview, pickupSave=window.__sgPickupSaveRecordImage, pickupPrint=window.__sgPickupPrintRecord;
 const companionShow=window.__sgCompanionShowRecordPreview, companionSave=window.__sgCompanionSaveRecordImage, companionPrint=window.__sgCompanionPrintRecord;
 window.__sgInitialShowRecordPreview=initialShow;window.__sgInitialSaveRecordImage=initialSave;window.__sgInitialPrintRecord=initialPrint;
 const typeOf=rec=>String(rec?.type||window.__sgActiveRecord?.type||'');
 window.showRecordPreview=function(rec){const t=typeOf(rec);if(t==='旅程紀錄'&&typeof companionShow==='function')return companionShow(rec);if(t==='拾光紀錄'&&typeof pickupShow==='function')return pickupShow(rec);return window.__sgInitialShowRecordPreview?.(rec)};
 window.saveRecordImage=function(){const t=typeOf(window.__sgActiveRecord);if(t==='旅程紀錄'&&typeof companionSave==='function')return companionSave();if(t==='拾光紀錄'&&typeof pickupSave==='function')return pickupSave();return window.__sgInitialSaveRecordImage?.()};
 window.printRecord=function(){const t=typeOf(window.__sgActiveRecord);if(t==='旅程紀錄'&&typeof companionPrint==='function')return companionPrint();if(t==='拾光紀錄'&&typeof pickupPrint==='function')return pickupPrint();return window.__sgInitialPrintRecord?.()};
 document.documentElement.dataset.sgRecordRouter='v2';
})();
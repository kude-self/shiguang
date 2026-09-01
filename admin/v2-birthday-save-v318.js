/* v318 birthday save: await cloud result before leaving page; surface exact failure */
(function(){
  function statusToDb(s){return ({'待確認':'new','已確認':'confirmed','待製作':'paid','製作中':'producing','待寄出':'producing','已寄出':'shipped','已取消':'cancelled'})[s]||s||'new'}
  function dbToStatus(s){return ({new:'待確認',confirmed:'已確認',paid:'待製作',producing:'製作中',shipped:'已寄出',cancelled:'已取消'})[s]||'待確認'}
  function clean(v){return v==null?'':String(v).trim()}
  function patchRow(b){return {
    status:statusToDb(b.status),display_name:b.name||b.cardName||'',birthday:b.birthday||null,
    service_date:b.serviceDate||b.service_date||null,current_state:b.recentState||'',self_message:b.recentPhrase||'',
    recipient_name:b.recipient||'',phone:b.phone||'',postal_code:b.postalCode||null,shipping_address:b.address||'',
    instagram:b.instagram||null,payment_last5:b.paymentLast5||'',photo_path:b.photoPath||null,
    sensed_color:b.lightColor||null,sensed_message:b.lightMessage||b.lightDetail||null,card_keyword:b.cardKeyword||null,
    card_message:b.cardMessage||b.cardFeeling||null,production_note:b.productionNote||null,shipped_at:b.shippedAt||null,
    notes:JSON.stringify(b)
  }}
  async function saveExisting(b){
    var r=await sbReq('/rest/v1/birthday_light_orders?id=eq.'+encodeURIComponent(b.id),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patchRow(b))});
    if(!r.ok)throw new Error(await r.text());
    var rows=await r.json(); if(!rows||!rows.length)throw new Error('資料庫沒有回傳更新結果');
    var db=rows[0];
    return Object.assign({},b,{status:dbToStatus(db.status),timeCode:db.time_code||null,confirmedAt:db.confirmed_at||null,serviceDate:db.service_date||b.serviceDate||null});
  }
  function install(){
    var form=document.getElementById('birthday-form'); if(!form||form.dataset.v318)return; form.dataset.v318='1';
    form.addEventListener('submit',async function(e){
      e.preventDefault();e.stopImmediatePropagation();
      var parts=parseHash(),id=parts[0]==='birthday-edit'?parts[1]:null,old=id?getB().find(function(x){return x.id===id}):null;
      if(!old)return;
      var fd=new FormData(form),fields=['status','orderDate','confirmedDate','name','cardName','birthday','phone','lineName','paymentLast5','paymentStatus','recipient','address','photoData','recentState','recentPhrase','lightColor','lightDetail','lightFirst','lightRaw','lightEnergy','lightMessage','lightCore','deckName','cardDrawn','cardKeyword','cardFeeling','cardWithLight','cardMessage','card1Copy','card2Copy','card1Front','card1Back','card2Front','card2Back','copyStatus','cardStatus','completedDate','shipDate','shippingInfo','feedback','feedbackConsent','privateFeeling','privateUncertain','privateAfter'];
      var data={};fields.forEach(function(k){data[k]=clean(fd.get(k))});
      if(!data.name&&!data.cardName){toast('請至少填寫旅人姓名或卡片稱呼');return;}
      var next=Object.assign({},old,data,{timeCode:old.timeCode||null,serviceDate:old.serviceDate||old.service_date||null,updatedAt:Date.now()});
      var btn=form.querySelector('[type=submit]');if(btn){btn.disabled=true;btn.textContent='儲存中…'}
      try{
        var saved=await saveExisting(next);
        CLOUD.birthday=CLOUD.birthday.map(function(x){return x.id===id?saved:x});
        toast('已同步儲存生日拾光');location.hash='#/birthday';
      }catch(err){console.error('birthday v318 save',err);alert('生日拾光同步失敗：'+(err&&err.message?err.message:'未知錯誤'));if(btn){btn.disabled=false;btn.textContent='儲存生日拾光'}}
    },true);
  }
  var oldBind=window.bindPageEvents;
  window.bindPageEvents=function(page){oldBind(page);if(page==='birthday-edit')install()};
})();

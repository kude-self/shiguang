/* v317 birthday edit sync: PATCH existing rows, preserve DB-owned fields */
(function(){
  function statusToDb(s){return ({'待確認':'new','已確認':'confirmed','待製作':'paid','製作中':'producing','待寄出':'producing','已寄出':'shipped','已取消':'cancelled'})[s]||s||'new'}
  function patchRow(b){
    return {
      status:statusToDb(b.status),
      display_name:b.name||b.cardName||'',
      birthday:b.birthday||null,
      service_date:b.serviceDate||b.service_date||null,
      current_state:b.recentState||'',
      self_message:b.recentPhrase||'',
      recipient_name:b.recipient||'',
      phone:b.phone||'',
      postal_code:b.postalCode||null,
      shipping_address:b.address||'',
      instagram:b.instagram||null,
      payment_last5:b.paymentLast5||'',
      photo_path:b.photoPath||null,
      sensed_color:b.lightColor||null,
      sensed_message:b.lightMessage||b.lightDetail||null,
      card_keyword:b.cardKeyword||null,
      card_message:b.cardMessage||b.cardFeeling||null,
      production_note:b.productionNote||null,
      shipped_at:b.shippedAt||null,
      notes:JSON.stringify(b)
    };
  }
  window.setB=function(v){
    const oldIds=(CLOUD.birthday||[]).map(x=>x.id);
    const newIds=new Set(v.map(x=>x.id));
    CLOUD.birthday=v;
    (async function(){
      try{
        for(const id of oldIds){
          if(!newIds.has(id)){
            const d=await sbReq('/rest/v1/birthday_light_orders?id=eq.'+encodeURIComponent(id),{method:'DELETE'});
            if(!d.ok)throw new Error(await d.text());
          }
        }
        for(const b of v){
          if(!b.id)continue;
          const exists=oldIds.includes(b.id);
          if(!exists)continue;
          const r=await sbReq('/rest/v1/birthday_light_orders?id=eq.'+encodeURIComponent(b.id),{
            method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patchRow(b))
          });
          if(!r.ok)throw new Error(await r.text());
          const rows=await r.json();
          const db=rows&&rows[0];
          if(db){
            const target=CLOUD.birthday.find(x=>x.id===b.id);
            if(target){target.timeCode=db.time_code||target.timeCode||null;target.confirmedAt=db.confirmed_at||target.confirmedAt||null;target.serviceDate=db.service_date||target.serviceDate||null;}
          }
        }
      }catch(e){console.error('birthday patch sync',e);toast('生日拾光雲端同步失敗，請勿關閉頁面');}
    })();
  };
})();

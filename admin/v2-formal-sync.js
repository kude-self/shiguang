/* v310 formal Supabase data adapter: journey_records + along_the_way_entries + birthday service_date */
function formalJourneyContainerId(j){
  return j.__journeyId || j.shiguangJourneyId || j.companionJourneyId || j.id;
}
function formalJourneyStatus(rows){
  if(rows.some(x=>x.status==='cancelled')) return 'cancelled';
  if(rows.some(x=>x.status==='completed')) return 'completed';
  return 'active';
}
function formalJourneyRows(rows){
  const groups=new Map();
  rows.forEach(j=>{
    const cid=formalJourneyContainerId(j);
    if(!cid||!j.travelerId)return;
    if(!groups.has(cid))groups.set(cid,[]);
    groups.get(cid).push(j);
  });
  return [...groups.entries()].map(([id,items])=>{
    const first=[...items].sort((a,b)=>(a.date||'').localeCompare(b.date||''))[0];
    return {
      id,owner_id:jwtSub(),traveler_id:first.travelerId,journey_type:first.journeyType||'初遇',
      start_date:first.cpStartDate||first.date||todayStr(),status:formalJourneyStatus(items),
      note:JSON.stringify({container:true,shiguangJourneyId:first.shiguangJourneyId||null,companionJourneyId:first.companionJourneyId||null})
    };
  });
}
function formalRecordRows(rows){
  return rows.filter(j=>j&&j.id&&j.travelerId).map(j=>({
    id:j.id,owner_id:jwtSub(),journey_id:formalJourneyContainerId(j),traveler_id:j.travelerId,
    journey_type:j.journeyType||'初遇',record_kind:'session',session_no:Number(j.visitCount)||null,
    occurred_on:j.date||todayStr(),data:{...j,__journeyId:formalJourneyContainerId(j)}
  }));
}
async function syncFormalJourneys(oldRows,newRows){
  try{
    const oldContainers=[...new Set(oldRows.map(formalJourneyContainerId).filter(Boolean))];
    const containers=formalJourneyRows(newRows);
    const records=formalRecordRows(newRows);
    if(containers.length){
      const r=await sbReq('/rest/v1/journeys',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(containers)});
      if(!r.ok)throw new Error(await r.text());
    }
    await syncCollection('journey_records',oldRows.map(x=>x.id).filter(Boolean),records);
    const keep=new Set(containers.map(x=>x.id));
    for(const id of oldContainers)if(!keep.has(id)){
      const r=await sbReq('/rest/v1/journeys?id=eq.'+encodeURIComponent(id),{method:'DELETE'});
      if(!r.ok)throw new Error(await r.text());
    }
  }catch(e){console.error('formal journey sync',e);toast('旅程雲端同步失敗，請勿關閉頁面')}
}
function setJ(a){
  const old=CLOUD.journeys.slice();
  CLOUD.journeys=a;
  syncFormalJourneys(old,a);
}
function formalAlongRow(a){
  const rel=getJ().find(j=>j.shiguangJourneyId===a.shiguangJourneyId||formalJourneyContainerId(j)===a.shiguangJourneyId);
  return {
    id:a.id,owner_id:jwtSub(),journey_id:a.shiguangJourneyId,traveler_id:a.travelerId||rel?.travelerId,
    entry_date:a.date||todayStr(),content:a.content||'',companion_note:a.note||'',
    bring_to_next:/帶回|下次/.test(a.bringBack||''),include_in_life_track:!!a.includeInLifeTrack
  };
}
function setA(v){
  const old=CLOUD.along.map(x=>x.id);
  CLOUD.along=v;
  const rows=v.map(formalAlongRow).filter(x=>x.journey_id&&x.traveler_id);
  syncCollection('along_the_way_entries',old,rows);
}
function birthdayRow(b){
  const map={'待確認':'new','已確認':'confirmed','待製作':'paid','製作中':'producing','待寄出':'producing','已寄出':'shipped','已取消':'cancelled'};
  return {
    id:b.id,status:map[b.status]||(b.status||'new'),display_name:b.name||b.cardName||'',birthday:b.birthday||null,
    service_date:b.serviceDate||b.service_date||null,
    current_state:b.recentState||'',self_message:b.recentPhrase||'',recipient_name:b.recipient||'',phone:b.phone||'',
    postal_code:b.postalCode||null,shipping_address:b.address||'',instagram:b.instagram||null,payment_last5:b.paymentLast5||'',
    photo_path:b.photoPath||null,time_code:b.timeCode||null,sensed_color:b.lightColor||null,
    sensed_message:b.lightMessage||b.lightDetail||null,card_keyword:b.cardKeyword||null,
    card_message:b.cardMessage||b.cardFeeling||null,production_note:b.productionNote||null,
    shipped_at:b.shippedAt||null,notes:JSON.stringify(b)
  };
}
function setB(v){
  const old=CLOUD.birthday.map(x=>x.id);
  CLOUD.birthday=v;
  syncCollection('birthday_light_orders',old,v.map(birthdayRow));
}
async function loadCloud(){
  const [tr,jr,rc,al,bd,bk,inc]=await Promise.all([
    sbReq('/rest/v1/travelers?select=*&order=created_at.asc'),
    sbReq('/rest/v1/journeys?select=*&order=created_at.asc'),
    sbReq('/rest/v1/journey_records?select=*&order=occurred_on.asc,created_at.asc'),
    sbReq('/rest/v1/along_the_way_entries?select=*&order=entry_date.desc,created_at.desc'),
    sbReq('/rest/v1/birthday_light_orders?select=*&order=created_at.asc'),
    sbReq('/rest/v1/traveler_bookings?select=*&order=booking_date.desc,booking_time.desc'),
    sbReq('/rest/v1/side_income?select=*&order=created_at.desc')
  ]);
  if(!tr.ok||!jr.ok||!rc.ok||!al.ok||!bd.ok||!bk.ok||!inc.ok)throw new Error('雲端資料讀取失敗');
  const ts=await tr.json(),js=await jr.json(),rs=await rc.json(),als=await al.json(),bs=await bd.json(),bks=await bk.json(),incs=await inc.json();
  CLOUD.travelers=ts.map(r=>{let x={};try{x=JSON.parse(r.private_note||'{}')}catch(e){};return {...x,id:r.id,name:r.name,firstMeetingDate:r.first_meeting_date,journeyType:r.journey_type,status:r.status,createdAt:x.createdAt||new Date(r.created_at).getTime()}});
  const parent=new Map(js.map(r=>[r.id,r]));
  if(rs.length){
    CLOUD.journeys=rs.map(r=>{
      const p=parent.get(r.journey_id)||{};const x=(r.data&&typeof r.data==='object')?r.data:{};
      return {...x,id:r.id,__journeyId:r.journey_id,travelerId:r.traveler_id,journeyType:r.journey_type,date:x.date||r.occurred_on||p.start_date,status:x.status||p.status,visitCount:x.visitCount||r.session_no||1,createdAt:x.createdAt||new Date(r.created_at).getTime()};
    });
  }else{
    CLOUD.journeys=js.map(r=>{let x={};try{x=JSON.parse(r.note||'{}')}catch(e){};return {...x,id:r.id,__journeyId:r.id,travelerId:r.traveler_id,journeyType:r.journey_type,date:x.date||r.start_date,status:r.status,createdAt:x.createdAt||new Date(r.created_at).getTime()}});
  }
  CLOUD.along=als.map(r=>({id:r.id,shiguangJourneyId:r.journey_id,travelerId:r.traveler_id,date:r.entry_date,content:r.content||'',note:r.companion_note||'',bringBack:r.bring_to_next?'帶回下次':'再觀察',includeInLifeTrack:!!r.include_in_life_track,createdAt:new Date(r.created_at).getTime()}));
  CLOUD.birthday=bs.map(r=>{let x={};try{x=JSON.parse(r.notes||'{}')}catch(e){};const st={'new':'待確認','confirmed':'已確認','paid':'待製作','producing':'製作中','shipped':'已寄出','cancelled':'已取消'}[r.status]||'待確認';return {...x,id:r.id,name:x.name||r.display_name,birthday:r.birthday,serviceDate:r.service_date||x.serviceDate||x.service_date||null,recentState:x.recentState||r.current_state,recentPhrase:x.recentPhrase||r.self_message,recipient:x.recipient||r.recipient_name,phone:r.phone,postalCode:x.postalCode||r.postal_code,address:x.address||r.shipping_address,instagram:x.instagram||r.instagram,paymentLast5:x.paymentLast5||r.payment_last5,photoPath:x.photoPath||r.photo_path,timeCode:x.timeCode||r.time_code,lightColor:x.lightColor||r.sensed_color,lightMessage:x.lightMessage||r.sensed_message,cardKeyword:x.cardKeyword||r.card_keyword,cardMessage:x.cardMessage||r.card_message,productionNote:x.productionNote||r.production_note,shippedAt:x.shippedAt||r.shipped_at,status:st,createdAt:x.createdAt||new Date(r.created_at).getTime()}});
  CLOUD.bookings=bks;CLOUD.income=incs;
}

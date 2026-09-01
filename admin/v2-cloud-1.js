
window.addEventListener('error',function(e){
  var app=document.getElementById('app');
  if(app && !app.dataset.booted){
    console.error(e.error||e.message);
  }
});
/* ============ 資料層 ============ */
const KEY_T='sgz_travelers_v1', KEY_J='sgz_journeys_v1', KEY_A='sgz_along_v1', KEY_B='sgz_birthday_v1';
const SB_URL='https://tgfxrbghzzttqbpfwypw.supabase.co', SB_KEY='sb_publishable_ZtAF_kDvx1WGNM3RPIhxzA_nMjHQwyN', SB_SESSION_KEY='sgadm';
let SB_SESSION=JSON.parse(localStorage.getItem(SB_SESSION_KEY)||'null'), CLOUD={travelers:[],journeys:[],along:[],birthday:[],bookings:[],income:[]};
const uid=()=>crypto.randomUUID();
const getT=()=>CLOUD.travelers;
const getJ=()=>CLOUD.journeys;
function getA(){return CLOUD.along}
function getB(){return CLOUD.birthday}
const jwtSub=()=>{try{return JSON.parse(atob(SB_SESSION.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub}catch(e){return null}};
function saveSbSession(d){SB_SESSION=d;localStorage.setItem(SB_SESSION_KEY,JSON.stringify(d))}
async function refreshSb(){if(!SB_SESSION?.refresh_token)return false;try{const r=await fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:SB_SESSION.refresh_token})});const d=await r.json();if(!r.ok||!d.access_token)return false;saveSbSession(d);return true}catch(e){return false}}
async function ensureSb(){if(!SB_SESSION?.access_token)return false;const exp=SB_SESSION.expires_at?SB_SESSION.expires_at*1000:0;if(!exp||Date.now()<exp-60000)return true;return refreshSb()}
const sbHeaders=()=>({apikey:SB_KEY,Authorization:'Bearer '+SB_SESSION.access_token,'Content-Type':'application/json'});
async function sbReq(path,opt={},retry=true){if(!await ensureSb())throw new Error('SESSION_EXPIRED');let r=await fetch(SB_URL+path,{...opt,headers:{...sbHeaders(),...(opt.headers||{})}});if(r.status===401&&retry&&await refreshSb())return sbReq(path,opt,false);if(r.status===401)throw new Error('SESSION_EXPIRED');return r}
function travelerRow(t){return {id:t.id,owner_id:jwtSub(),name:t.name||'',first_meeting_date:t.firstMeetingDate||t.date||null,journey_type:t.journeyType||'初遇',concern:t.concern||'',hope:t.hope||'',private_note:JSON.stringify(t),status:t.status||'active'}}
function journeyRow(j){return {id:j.id,owner_id:jwtSub(),traveler_id:j.travelerId,journey_type:j.journeyType||'初遇',start_date:j.date||todayStr(),status:j.status||'active',note:JSON.stringify({...j,_alongAll:CLOUD.along})}}
function birthdayRow(b){
  const map={'待確認':'new','已確認':'confirmed','待製作':'paid','製作中':'producing','待寄出':'producing','已寄出':'shipped','已取消':'cancelled'};
  return {id:b.id,status:map[b.status]||(b.status||'new'),display_name:b.name||b.cardName||'',birthday:b.birthday||null,current_state:b.recentState||'',self_message:b.recentPhrase||'',recipient_name:b.recipient||'',phone:b.phone||'',shipping_address:b.address||'',payment_last5:b.paymentLast5||'',time_code:b.timeCode||null,notes:JSON.stringify(b)}
}
async function syncCollection(table,oldIds,rows){try{const newIds=new Set(rows.map(x=>x.id));for(const id of oldIds)if(!newIds.has(id))await sbReq('/rest/v1/'+table+'?id=eq.'+encodeURIComponent(id),{method:'DELETE'});if(rows.length){const r=await sbReq('/rest/v1/'+table,{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});if(!r.ok)throw new Error(await r.text())}}catch(e){console.error('cloud sync',table,e);toast('雲端同步失敗，請勿關閉頁面')}}
function setT(a){const old=CLOUD.travelers.map(x=>x.id);CLOUD.travelers=a;syncCollection('travelers',old,a.map(travelerRow))}
function setJ(a){const old=CLOUD.journeys.map(x=>x.id);CLOUD.journeys=a;syncCollection('journeys',old,a.map(journeyRow))}
function setA(v){CLOUD.along=v;syncCollection('journeys',[],CLOUD.journeys.map(journeyRow))}
function setB(v){const old=CLOUD.birthday.map(x=>x.id);CLOUD.birthday=v;syncCollection('birthday_light_orders',old,v.map(birthdayRow))}
async function loadCloud(){const [tr,jr,bd,bk,inc]=await Promise.all([sbReq('/rest/v1/travelers?select=*&order=created_at.asc'),sbReq('/rest/v1/journeys?select=*&order=created_at.asc'),sbReq('/rest/v1/birthday_light_orders?select=*&order=created_at.asc'),sbReq('/rest/v1/traveler_bookings?select=*&order=booking_date.desc,booking_time.desc'),sbReq('/rest/v1/side_income?select=*&order=created_at.desc')]);if(!tr.ok||!jr.ok||!bd.ok||!bk.ok||!inc.ok)throw new Error('雲端資料讀取失敗');const ts=await tr.json(),js=await jr.json(),bs=await bd.json(),bks=await bk.json(),incs=await inc.json();CLOUD.travelers=ts.map(r=>{let x={};try{x=JSON.parse(r.private_note||'{}')}catch(e){};return {...x,id:r.id,name:r.name,firstMeetingDate:r.first_meeting_date,journeyType:r.journey_type,status:r.status,createdAt:x.createdAt||new Date(r.created_at).getTime()}});CLOUD.journeys=js.map(r=>{let x={};try{x=JSON.parse(r.note||'{}')}catch(e){};return {...x,id:r.id,travelerId:r.traveler_id,journeyType:r.journey_type,date:x.date||r.start_date,status:r.status,createdAt:x.createdAt||new Date(r.created_at).getTime()}});const withAlong=js.map(r=>{try{return JSON.parse(r.note||'{}')._alongAll}catch(e){return null}}).find(Array.isArray);CLOUD.along=withAlong||[];CLOUD.birthday=bs.map(r=>{let x={};try{x=JSON.parse(r.notes||'{}')}catch(e){};const st={'new':'待確認','confirmed':'已確認','paid':'待製作','producing':'製作中','shipped':'已寄出','cancelled':'已取消'}[r.status]||'待確認';return {...x,id:r.id,name:x.name||r.display_name,birthday:r.birthday,recentState:x.recentState||r.current_state,recentPhrase:x.recentPhrase||r.self_message,recipient:x.recipient||r.recipient_name,phone:r.phone,address:x.address||r.shipping_address,paymentLast5:x.paymentLast5||r.payment_last5,timeCode:x.timeCode||r.time_code,status:x.status||st,createdAt:x.createdAt||new Date(r.created_at).getTime()}});CLOUD.bookings=bks;CLOUD.income=incs}
const todayStr=()=>new Date().toISOString().slice(0,10);
const esc=s=>(s==null?'':String(s)).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nl2=s=>esc(s); // textarea already handled via white-space:pre-wrap
function fmtDate(d){
  if(!d) return '—';
  const parts=d.split('-'); if(parts.length!==3) return d;
  return parts[0]+'年'+parts[1]+'月'+parts[2]+'日';
}
function fmtShort(d){ if(!d) return '—'; return d.replaceAll('-','/'); }
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}
function journeysOf(travelerId){
  return getJ().filter(j=>j.travelerId===travelerId).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.createdAt-a.createdAt));
}
function nextVisitCount(travelerId){ return journeysOf(travelerId).length+1; }
function nextBirthdayCode(date=todayStr()){
  const ymd=(date||todayStr()).replaceAll('-','').slice(2);
  const prefix='BL'+ymd+'-';
  const nums=getB().map(x=>x.timeCode||'').filter(x=>x.startsWith(prefix)).map(x=>parseInt(x.slice(prefix.length),10)||0);
  return prefix+String((nums.length?Math.max(...nums):0)+1).padStart(2,'0');
}
function birthdayStatusCounts(){ const out={'待確認':0,'待製作':0,'製作中':0,'待寄出':0,'已寄出':0}; getB().forEach(x=>{ if(out[x.status]!=null)out[x.status]++; }); return out; }
function shiguangRecordsOf(travelerId,journeyId){
  return getJ().filter(j=>j.travelerId===travelerId&&typeOf(j)==='拾光'&&(!journeyId||j.shiguangJourneyId===journeyId))
    .sort((a,b)=>(a.date||'').localeCompare(b.date||'')||(a.createdAt-b.createdAt));
}
function isShiguangComplete(j){ return !!(j&&(j.sgFinalSelf||j.sgFinalTurningPoint||j.sgFinalPickedUp||j.sgCarryForward||j.sgFinalQuote)); }
function activeShiguangJourneyId(travelerId){
  const sg=shiguangRecordsOf(travelerId);
  if(!sg.length) return null;
  const groups={}; sg.forEach(j=>{ const id=j.shiguangJourneyId||('legacy-'+j.id); (groups[id]||(groups[id]=[])).push(j); });
  const candidates=Object.entries(groups).map(([id,rows])=>({id,rows,last:rows[rows.length-1]})).sort((a,b)=>(b.last.date||'').localeCompare(a.last.date||''));
  const active=candidates.find(g=>!g.rows.some(isShiguangComplete));
  return active?active.id:null;
}
function nextShiguangVisitCount(travelerId,journeyId){ return shiguangRecordsOf(travelerId,journeyId).length+1; }
function alongOfJourney(journeyId){ return getA().filter(a=>a.shiguangJourneyId===journeyId).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.createdAt-a.createdAt)); }
const JOURNEY_TYPES={
  '初遇':{cls:'type-first',desc:'一次相遇'},
  '拾光':{cls:'type-light',desc:'一段專屬旅程'},
  '同行':{cls:'type-long',desc:'長期陪伴'}
};
function typeOf(obj){ return (obj&&obj.journeyType&&JOURNEY_TYPES[obj.journeyType])?obj.journeyType:'初遇'; }
function typeBadge(type){ const t=JOURNEY_TYPES[type]||JOURNEY_TYPES['初遇']; return `<span class="type-badge ${t.cls}">${type}</span>`; }
function typeCounts(js){ const out={'初遇':0,'拾光':0,'同行':0}; js.forEach(j=>out[typeOf(j)]++); return out; }

/* ============ 季節裝飾 ============ */
function getSeason(){
  const m=new Date().getMonth()+1;
  if([3,4,5].includes(m)) return {key:'spring',name:'春',desc:'白色小花、嫩綠植物、柔和晨光',color:'#9AAE9B',soft:'#E8F0E8',light:'#EFF5EF'};
  if([6,7,8].includes(m)) return {key:'summer',name:'夏',desc:'窗邊陽光、木桌、書本',color:'#7A9BAD',soft:'#B8CFDA',light:'#E3EDF3'};
  if([9,10,11].includes(m)) return {key:'autumn',name:'秋',desc:'暖木色、乾燥花、咖啡',color:'#C9938A',soft:'#E8C4BC',light:'#F5E6E3'};
  return {key:'winter',name:'冬',desc:'燭光、毛毯、熱茶',color:'#A88866',soft:'#DCC9AE',light:'#F1E9DC'};
}
function applySeasonVars(){
  const s=getSeason();
  const pendingBookings=(CLOUD.bookings||[]).filter(x=>x.status==='pending').length;
  const effectiveIncome=(CLOUD.income||[]).filter(x=>!['pending','cancelled'].includes(x.status)).reduce((n,x)=>n+(Number(x.amount)||0)+(Number(x.shipping)||0),0);
  document.documentElement.style.setProperty('--season',s.color);
  document.documentElement.style.setProperty('--season-soft',s.soft);
  document.documentElement.style.setProperty('--season-light',s.light);
  return s;
}

/* ============ 圖示 (輕量線條 SVG) ============ */
const ICON={
  dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/></svg>',
  add:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/><line x1="19" y1="4" x2="19" y2="9"/><line x1="16.5" y1="6.5" x2="21.5" y2="6.5"/></svg>',
  compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6z"/></svg>',
  backup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
  people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"/><circle cx="17.5" cy="8.5" r="2.4"/><path d="M16 14.3c2.7.4 4.5 2.3 4.5 5.2"/></svg>',
  path:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M5 8c0 5 14 3 14 8"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>',
  quote:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5C4.2 6.4 3 8.7 3 11.3 3 13.5 4.5 15 6.5 15S10 13.5 10 11.5c0-1.8-1.3-3-3-3.1C7.9 7 9 5.9 10.5 5.2L7 5zm10 0c-2.8 1.4-4 3.7-4 6.3 0 2.2 1.5 3.7 3.5 3.7s3.5-1.5 3.5-3.5c0-1.8-1.3-3-3-3.1.5-1.4 1.6-2.5 3.1-3.2L17 5z"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="21" x2="5" y2="4"/><path d="M5 5c3-1.5 5.5 1 8.5-.5S20 5 20 5v9s-3-2-6.5-.5S8 15 5 14"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
};

/* ============ Router ============ */
function parseHash(){
  const h=(location.hash||'#/dashboard').replace(/^#/,'');
  const path=h.split('?')[0];
  const parts=path.split('/').filter(Boolean);
  return parts;
}
function hashQuery(){
  const h=(location.hash||'').split('?')[1]||'';
  return new URLSearchParams(h);
}
let bookingRefreshInFlight=false;
async function refreshBookingView(){
  if(bookingRefreshInFlight||!SB_SESSION?.access_token)return;
  bookingRefreshInFlight=true;
  try{
    await loadCloud();
    if(parseHash()[0]==='bookings')render();
  }catch(e){
    if(parseHash()[0]==='bookings'){
      const main=document.getElementById('main');
      if(main) main.insertAdjacentHTML('afterbegin','<div class="helper-box" role="alert">預約資料更新失敗，請重新整理頁面後再試。</div>');
    }
  }finally{bookingRefreshInFlight=false}
}
window.addEventListener('hashchange',()=>{
  render();
  if(parseHash()[0]==='bookings')refreshBookingView();
});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&parseHash()[0]==='bookings')refreshBookingView();
});
window.addEventListener('DOMContentLoaded',()=>bootCloud());
async function bootCloud(){
  if(!SB_SESSION?.access_token||!await ensureSb()){showLogin();return}
  try{await loadCloud();if(!location.hash)location.hash='#/dashboard';render()}catch(e){if(e.message==='SESSION_EXPIRED')showLogin('登入已過期，請重新登入');else showLogin('雲端讀取失敗，請重新登入')}
}
function showLogin(msg=''){
 document.getElementById('app').innerHTML=`<div style="min-height:100vh;display:grid;place-items:center;background:#FAFAF8;padding:20px"><div style="width:min(430px,100%);background:#FFFDF8;border:1px solid #e5ddd1;border-radius:24px;padding:28px;box-shadow:0 10px 32px rgba(100,80,60,.08)"><div style="font-size:27px;font-weight:700">拾光者 <span style="font-size:11px;background:#899786;color:white;padding:3px 7px;border-radius:20px">V2</span></div><div style="font-size:12px;color:#9B9A97;letter-spacing:.12em;margin:5px 0 22px">旅 程 紀 錄 本</div><input id="sbEmail" type="email" placeholder="管理 Email" style="width:100%;padding:13px;margin:6px 0;border:1px solid #ddd1c3;border-radius:12px"><input id="sbPw" type="password" placeholder="密碼" style="width:100%;padding:13px;margin:6px 0 14px;border:1px solid #ddd1c3;border-radius:12px"><button id="sbLogin" class="btn btn-primary btn-block">進入旅程紀錄本</button><div id="sbMsg" style="font-size:12px;color:#9b6b65;margin-top:10px">${esc(msg)}</div></div></div>`;
 document.getElementById('sbLogin').onclick=async()=>{const email=document.getElementById('sbEmail').value.trim(),password=document.getElementById('sbPw').value;const r=await fetch(SB_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok){document.getElementById('sbMsg').textContent='登入失敗，請確認帳號密碼';return}saveSbSession(d);await bootCloud()}
}

function navHtml(active){
 const items=[['dashboard','總覽','dash'],['settings','服務設定','compass'],['travelers','旅人紀錄','people'],['bookings','預約管理','book'],['more','更多','list']];
 return items.map(([key,label,icon])=>'<a href="'+('#/'+key)+'" class="'+(active===key?'active':'')+'">'+(ICON[icon]||ICON.list)+'<span>'+label+'</span></a>').join('');
}
function pageSettings(){return '<div class="page-head"><div class="eyebrow">SERVICE SETTINGS</div><h1 class="page-title">服務設定</h1><p class="page-desc">選擇開放的服務，調整介紹、時間與費用。</p></div><iframe title="服務設定內容" src="./light-healing.html?embed=1" style="width:100%;min-height:980px;border:0;background:transparent;border-radius:18px;display:block" loading="eager"></iframe>';}
function pageLightHealing(){
 const rows=[...(CLOUD.bookings||[])].filter(b=>b.journey==='光之療癒').sort((a,b)=>(b.booking_date||'').localeCompare(a.booking_date||'')||String(b.booking_time||'').localeCompare(String(a.booking_time||'')));
 const pending=rows.filter(b=>b.status==='pending').length;
 const confirmed=rows.filter(b=>b.status==='confirmed').length;
 const knownIds=new Set((typeof getT==='function'?getT():[]).map(t=>t.id));
 return `<div class="page-head"><div class="eyebrow">LIGHT HEALING</div><h1 class="page-title">✦ 光之療癒</h1><p class="page-desc">從這裡查看光之療癒預約；七脈輪、三支精油與歷次療癒紀錄，繼續保存在原本的旅人檔案裡。</p></div>
 <div class="stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="stat-card"><div class="num">${rows.length}</div><div class="lbl">預約總數</div></div><div class="stat-card"><div class="num">${pending}</div><div class="lbl">待確認</div></div><div class="stat-card"><div class="num">${confirmed}</div><div class="lbl">已成立</div></div></div>
 <div class="form-actions" style="margin:18px 0;display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="#/bookings">查看預約管理</a><a class="btn btn-ghost" href="#/travelers">旅人紀錄／新增療癒</a></div>
 <div class="section-title"><h3>光之療癒預約</h3></div>
 ${rows.length?`<div class="journey-list">${rows.map(b=>`<div class="paper-card" style="margin-bottom:12px"><div class="jc-head"><div><div class="jc-name">${esc(b.traveler_name||'旅人')}</div><div class="jc-meta">${esc(b.booking_date||'')} ・ ${esc(String(b.booking_time||'').slice(0,5))}</div></div><span class="type-badge">${esc(typeof bookingStatusLabel==='function'?bookingStatusLabel(b.status):b.status)}</span></div><div class="jc-block"><div class="k">聯絡</div><div class="v">${esc(b.contact_method||'LINE')}｜${esc(b.instagram||'—')}</div></div><div class="form-actions">${b.traveler_id&&knownIds.has(b.traveler_id)?`<a class="btn btn-ghost btn-sm" href="#/traveler/${encodeURIComponent(b.traveler_id)}">查看旅人／療癒紀錄</a>`:`<a class="btn btn-ghost btn-sm" href="#/travelers">前往旅人紀錄</a>`}</div></div>`).join('')}</div>`:'<div class="empty"><p>目前沒有光之療癒預約，可從旅人紀錄建立服務紀錄。</p></div>'}`;
}
function pageMore(){
 const items=[['light-healing','光之療癒','查看光之療癒預約，並進入旅人療癒紀錄'],['programs','三段旅程','查看初遇、拾光、同行的原有紀錄'],['birthday','生日拾光','生日拾光訂單與製作'],['traveler-new','新增旅人','建立新的旅人資料'],['start','開啟旅程','新增初遇、拾光、同行紀錄'],['income','副業收入','查看收入與明細'],['backup','資料備份','匯出或匯入備份']];
 return '<div class="page-head"><div class="eyebrow">More</div><h1 class="page-title">更多功能</h1><p class="page-desc">常用功能留在底部，其他功能集中在這裡。</p></div><div class="journey-list">'+items.map(([key,title,desc])=>'<a href="#/'+key+'" class="paper-card" style="display:block;text-decoration:none;color:inherit;margin-bottom:12px"><div style="font-weight:700;font-size:17px">'+title+'</div><div class="page-desc">'+desc+'</div></a>').join('')+'</div>';
}

function render(){
  const appRoot=document.getElementById('app');
  if(appRoot) appRoot.dataset.booted='1';
  const parts=parseHash();
  const page=parts[0]||'dashboard';
  const s=applySeasonVars();
  const seasonBadge=`<div class="season-tag"><div class="ttl">${ICON.moon}<span>此刻・${s.name}日</span></div>${s.desc}</div>`;

  let activeKey='dashboard';
  if(page==='dashboard') activeKey='dashboard';
  else if(page==='programs'||page==='program') activeKey='more';
  else if(page==='birthday'||page==='birthday-new'||page==='birthday-edit') activeKey='more';
  else if(page==='bookings') activeKey='bookings';
  else if(page==='light-healing') activeKey='more';
  else if(page==='settings') activeKey='settings';
  else if(page==='travelers'||page==='traveler') activeKey='travelers';
  else if(page==='traveler-new') activeKey='travelers';
  else if(page==='start'||page==='journey') activeKey='more';
  else if(page==='income') activeKey='more';
  else if(page==='backup') activeKey='more';
  else if(page==='more') activeKey='more';
  else if(['programs','program','birthday','birthday-new','birthday-edit','start','journey','journey-new','journey-edit','income','traveler-new','traveler-edit'].includes(page)) activeKey='more';

  const shell=`
    <div class="mnav-top">
      <div class="brand"><div class="mark">拾光者 <span class="v2-badge">V2</span></div><div class="sub">旅程紀錄本・初遇／拾光／同行</div></div>
      <a href="#/backup" class="btn btn-ghost btn-sm">${ICON.backup}</a>
    </div>
    <aside class="sidebar">
      <div class="brand"><div class="mark">拾光者 <span class="v2-badge">V2</span></div><div class="sub">旅 程 紀 錄 本</div></div>
      <nav class="nav">${navHtml(activeKey)}</nav>
      ${seasonBadge}
    </aside>
    <main class="main" id="main"></main>
    <nav class="mnav-bottom">${navHtml(activeKey)}</nav>
  `;
  document.getElementById('app').innerHTML=shell;
  const main=document.getElementById('main');

  if(page==='dashboard') main.innerHTML=pageDashboard();
  else if(page==='programs') main.innerHTML=pagePrograms();
  else if(page==='program') main.innerHTML=pageProgramDetail(decodeURIComponent(parts[1]||'初遇'));
  else if(page==='birthday') main.innerHTML=pageBirthday();
  else if(page==='birthday-new') main.innerHTML=pageBirthdayForm(null);
  else if(page==='birthday-edit') main.innerHTML=pageBirthdayForm(parts[1]);
  else if(page==='bookings') main.innerHTML=pageBookings();
  else if(page==='light-healing') main.innerHTML=pageLightHealing();
  else if(page==='settings') main.innerHTML=pageSettings();
  else if(page==='travelers') main.innerHTML=pageTravelerList();
  else if(page==='traveler-new') main.innerHTML=pageTravelerForm(null);
  else if(page==='traveler-edit') main.innerHTML=pageTravelerForm(parts[1]);
  else if(page==='traveler') main.innerHTML=pageTravelerDetail(parts[1]);
  else if(page==='start') main.innerHTML=pageStartJourney();
  else if(page==='journey-new') main.innerHTML=pageJourneyForm(parts[1],null);
  else if(page==='journey-edit') main.innerHTML=pageJourneyForm(null,parts[1]);
  else if(page==='income') main.innerHTML=pageIncome();
  else if(page==='backup') main.innerHTML=pageBackup();
  else if(page==='more') main.innerHTML=pageMore();
  else main.innerHTML=pageDashboard();

  bindPageEvents(page);
  window.scrollTo(0,0);
}


function programCardsHtml(compact=false){
  const counts=typeCounts(getJ());
  const cfg={
    '初遇':{klass:'',label:'ENTRY',title:'初遇',sub:'一場相遇，留下第一次看見。',desc:'單次入門陪伴。整理此刻最在意的事、現在的感受與第一次看見。',meta:['單次','40–60 分鐘','《初遇紀錄》'],btn:'查看初遇'},
    '拾光':{klass:'light',label:'CORE',title:'拾光',sub:'一段整理，把一路看見的自己留下來。',desc:'約 4–6 週的核心旅程。從看見、分辨、找回到選擇，逐步整理一個重要主題。',meta:['約 4–6 週','4 次','《拾光紀錄》'],btn:'查看拾光'},
    '同行':{klass:'together',label:'TOGETHER',title:'同行',sub:'把新的選擇，慢慢活進生活。',desc:'約三個月、5次正式相遇。陪旅人把看見帶回真實生活，在發生、看見、分辨、嘗試與調整之間慢慢形成自己的生活軌跡。',meta:['約三個月','共 5 次','《同行｜生活軌跡》4頁'],btn:'查看同行'}
  };
  return `<div class="program-grid">${Object.entries(cfg).map(([key,c])=>`
    <article class="program-card ${c.klass}">
      <div class="program-kicker">${c.label}</div>
      <div class="program-name">${c.title}</div>
      <div class="program-sub">${c.sub}</div>
      <div class="program-line"></div>
      ${compact?'':`<div class="program-desc">${c.desc}</div>`}
      <div class="program-meta">${c.meta.map(x=>`<span class="program-chip">${x}</span>`).join('')}<span class="program-chip">已記錄 ${counts[key]} 次</span></div>
      <div class="program-actions"><a class="btn btn-ghost btn-sm" href="#/program/${encodeURIComponent(key)}">${c.btn}</a><a class="btn btn-primary btn-sm" href="#/start?type=${encodeURIComponent(key)}">開啟旅程</a></div>
    </article>`).join('')}</div>`;
}
function pagePrograms(){
  return `
    <div class="page-head">
      <div class="eyebrow">Three Journeys</div>
      <h1 class="page-title">初遇・拾光・同行</h1>
      <p class="page-desc">三個不同深度的陪伴入口，現在會各自留下自己的旅程紀錄，而不是只用一個標籤帶過。</p>
    </div>
    <div class="program-banner"><h2>從第一次看見，到把改變帶回生活。</h2><p>初遇是入口，拾光是約 4–6 週的核心整理，同行是三個月陪伴。你可以從這裡直接查看各自紀錄，或開啟新的旅程。</p></div>
    ${programCardsHtml(false)}
  `;
}
function pageProgramDetail(type){
  if(!JOURNEY_TYPES[type]) type='初遇';
  const js=getJ().filter(j=>typeOf(j)===type).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const tids=new Set(js.map(j=>j.travelerId));
  const cfg={
    '初遇':{title:'初遇｜《初遇紀錄》',sub:'一場相遇，留下第一次看見。'},
    '拾光':{title:'拾光｜《拾光紀錄》',sub:'一段整理，把一路看見的自己留下來。'},
    '同行':{title:'同行｜《同行｜生活軌跡》',sub:'把新的選擇，慢慢活進生活。'}
  }[type];
  return `
    <div class="type-page-head">
      <div><div class="eyebrow">${type}</div><h1 class="page-title">${cfg.title}</h1><p class="page-desc">${cfg.sub}</p></div>
      <a href="#/start?type=${encodeURIComponent(type)}" class="btn btn-primary">${ICON.compass} 開啟${type}旅程</a>
    </div>
    <div class="type-summary"><div class="mini">旅程紀錄：<b>${js.length}</b></div><div class="mini">旅人數：<b>${tids.size}</b></div></div>
    <div class="section-title"><h3>${type}的旅程紀錄</h3></div>
    ${js.length?`<div class="journey-list">${js.map(j=>journeyCard(j)).join('')}</div>`:`<div class="empty">${ICON.book}<p>目前還沒有${type}紀錄。</p><a href="#/start?type=${encodeURIComponent(type)}" class="btn btn-primary">開啟第一段${type}旅程</a></div>`}
  `;
}

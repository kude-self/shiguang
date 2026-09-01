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
window.addEventListener('hashchange',render);
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
  const items=[
    ['dashboard','總覽','dash'],
    ['programs','三段旅程','path'],
    ['birthday','生日拾光','moon'],
    ['bookings','預約管理','book'],
    ['travelers','旅人清單','list'],
    ['traveler-new','新增旅人','add'],
    ['start','開啟旅程','compass'],
    ['income','副業收入','dash'],
    ['backup','備份','backup'],
  ];
  return items.map(([key,label,icon])=>
    `<a href="#/${key}" class="${active===key?'active':''}">${ICON[icon]}<span>${label}</span></a>`
  ).join('');
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
  else if(page==='programs'||page==='program') activeKey='programs';
  else if(page==='birthday'||page==='birthday-new'||page==='birthday-edit') activeKey='birthday';
  else if(page==='bookings') activeKey='bookings';
  else if(page==='travelers'||page==='traveler') activeKey='travelers';
  else if(page==='traveler-new') activeKey='traveler-new';
  else if(page==='start'||page==='journey') activeKey='start';
  else if(page==='income') activeKey='income';
  else if(page==='backup') activeKey='backup';

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
  else if(page==='travelers') main.innerHTML=pageTravelerList();
  else if(page==='traveler-new') main.innerHTML=pageTravelerForm(null);
  else if(page==='traveler-edit') main.innerHTML=pageTravelerForm(parts[1]);
  else if(page==='traveler') main.innerHTML=pageTravelerDetail(parts[1]);
  else if(page==='start') main.innerHTML=pageStartJourney();
  else if(page==='journey-new') main.innerHTML=pageJourneyForm(parts[1],null);
  else if(page==='journey-edit') main.innerHTML=pageJourneyForm(null,parts[1]);
  else if(page==='income') main.innerHTML=pageIncome();
  else if(page==='backup') main.innerHTML=pageBackup();
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

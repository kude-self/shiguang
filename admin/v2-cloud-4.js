/* ============ 旅人清單 ============ */
function pageTravelerList(){
  return `
    <div class="page-head">
      <div class="eyebrow">Travelers</div>
      <h1 class="page-title">旅人清單</h1>
      <p class="page-desc">搜尋、篩選每一位曾經相遇的旅人。</p>
    </div>
    <div class="toolbar">
      <div class="search-wrap">${ICON.search}<input id="t-search" type="text" placeholder="搜尋旅人稱呼或旅程主題…"></div>
      <select id="t-type" class="sel type-filter">
        <option value="all">全部旅程</option>
        <option value="初遇">初遇</option>
        <option value="拾光">拾光</option>
        <option value="同行">同行</option>
      </select>
      <select id="t-sort" class="sel">
        <option value="recent">依最近相遇排序</option>
        <option value="name">依姓名排序</option>
        <option value="count">依旅程次數排序</option>
      </select>
      <a href="#/traveler-new" class="btn btn-primary">${ICON.add} 新增旅人</a>
    </div>
    <div id="t-list"></div>
  `;
}
function renderTravelerList(){
  const q=(document.getElementById('t-search')?.value||'').trim().toLowerCase();
  const sort=document.getElementById('t-sort')?.value||'recent';
  const type=document.getElementById('t-type')?.value||'all';
  let list=getT();
  if(q) list=list.filter(t=>(t.name||'').toLowerCase().includes(q)||(t.theme||'').toLowerCase().includes(q));
  if(type!=='all') list=list.filter(t=>journeysOf(t.id).some(j=>typeOf(j)===type)||typeOf(t)===type);
  const withMeta=list.map(t=>{
    const js=journeysOf(t.id);
    return {t,count:js.length,last:js[0]?js[0].date:t.firstMet};
  });
  if(sort==='name') withMeta.sort((a,b)=>(a.t.name||'').localeCompare(b.t.name||'','zh-Hant'));
  else if(sort==='count') withMeta.sort((a,b)=>b.count-a.count);
  else withMeta.sort((a,b)=>(b.last||'').localeCompare(a.last||''));

  const el=document.getElementById('t-list');
  if(!withMeta.length){
    el.innerHTML=`<div class="empty">${ICON.people}<p>${q?'找不到符合的旅人。':'還沒有旅人紀錄，新增第一位旅人吧。'}</p>${q?'':'<a href="#/traveler-new" class="btn btn-primary">'+ICON.add+' 新增旅人</a>'}</div>`;
    return;
  }
  el.innerHTML=`<div class="t-grid">${withMeta.map(({t,count,last})=>`
    <div class="t-card" data-goto="${t.id}">
      <div class="row1">
        <div class="avatar">${esc((t.name||'?')[0])}</div>
        <div>
          <div class="name">${esc(t.name||'未命名')}</div>
          <div class="theme">${t.theme?esc(t.theme):'尚未設定旅程主題'} · ${typeBadge(typeOf(t))}</div>
        </div>
      </div>
      <div class="meta"><span>共 ${count} 次旅程</span><span>最近 ${last?fmtShort(last):'—'}</span></div>
    </div>`).join('')}</div>`;
  el.querySelectorAll('[data-goto]').forEach(c=>c.addEventListener('click',()=>location.hash='#/traveler/'+c.dataset.goto));
}

/* ============ 新增／編輯旅人 ============ */
function pageTravelerForm(id){
  const editing=!!id;
  const t=editing?getT().find(x=>x.id===id):null;
  if(editing && !t) return `<div class="empty">${ICON.people}<p>找不到這位旅人。</p><a href="#/travelers" class="btn btn-primary">回旅人清單</a></div>`;
  return `
    <div class="page-head">
      <div class="eyebrow">${editing?'Edit':'New'} Traveler</div>
      <h1 class="page-title">${editing?'編輯旅人資料':'新增旅人'}</h1>
      <p class="page-desc">記下這位旅人的基本樣貌，之後每一次相遇都會收進他的旅程裡。</p>
    </div>
    <form id="traveler-form" class="form-card">
      <div class="field">
        <label>旅人稱呼 <span class="hint">必填</span></label>
        <input type="text" name="name" placeholder="例如：小海、B 先生、Amy" value="${esc(t?.name||'')}" required>
      </div>
      <div class="field-row">
        <div class="field">
          <label>相遇日期 <span class="hint">第一次見面</span></label>
          <input type="date" name="firstMet" value="${t?.firstMet||todayStr()}">
        </div>
        <div class="field">
          <label>目前旅程類型</label>
          <select name="journeyType">
            ${['初遇','拾光','同行'].map(x=>`<option value="${x}" ${typeOf(t)===x?'selected':''}>${x}｜${JOURNEY_TYPES[x].desc}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field">
        <label>旅程主題 <span class="hint">這段旅程想整理的方向</span></label>
        <input type="text" name="theme" placeholder="例如：生涯轉換、關係整理" value="${esc(t?.theme||'')}">
      </div>
      <div class="field">
        <label>備註 <span class="hint">聯絡方式、背景資訊等，選填</span></label>
        <textarea name="note" placeholder="想額外記住的事…">${esc(t?.note||'')}</textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">${ICON.add} ${editing?'儲存修改':'建立旅人'}</button>
        <a href="${editing?'#/traveler/'+id:'#/travelers'}" class="btn btn-ghost">取消</a>
      </div>
    </form>
  `;
}

/* ============ 旅人詳情 ============ */
function shiguangOverviewHtml(t){
  const activeId=activeShiguangJourneyId(t.id);
  if(!activeId) return '';
  const rows=shiguangRecordsOf(t.id,activeId), first=rows[0], last=rows[rows.length-1];
  const alongs=alongOfJourney(activeId);
  return `<div class="section-title" style="margin-top:26px;"><h3>拾光｜目前旅程</h3><span class="more">第 ${rows.length}/4 次相遇</span></div>
  <div class="form-card" style="margin-bottom:24px;">
    <div class="field-row"><div class="field"><label>我的起點</label><div class="helper-box">${esc(first?.sgStartingPoint||'尚未留下')}</div></div><div class="field"><label>想靠近的地方</label><div class="helper-box">${esc(first?.sgDesiredPlace||'尚未留下')}</div></div></div>
    <div class="field"><label>目前的位置</label><div class="helper-box">${esc(last?.sgCurrentPosition||'尚未留下')}</div></div>
    <div class="field"><label>上一次拾起</label><div class="helper-box">${esc(last?.sgPickedUp||'尚未留下')}</div></div>
    <div class="form-actions"><a href="#/journey-new/${t.id}?type=${encodeURIComponent('拾光')}" class="btn btn-primary">${ICON.compass} 新增這次相遇</a></div>
    <hr style="border:none;border-top:1px solid var(--line);margin:24px 0;">
    <div class="field"><label>沿途拾光 <span class="hint">生活裡出現的重要發現，可獨立留下</span></label></div>
    ${alongs.length?`<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">${alongs.slice(0,5).map(a=>`<div class="helper-box"><b>${fmtDate(a.date)}</b>｜${esc(a.content)}${a.bringBack?`<br><span class="hint">帶回下一次：${esc(a.bringBack)}</span>`:''}<button type="button" class="btn btn-danger btn-sm" style="margin-top:8px;" data-del-along="${a.id}">刪除</button></div>`).join('')}</div>`:''}
    <form data-along-form="${activeId}">
      <div class="field-row"><div class="field"><label>日期</label><input type="date" name="date" value="${todayStr()}"></div><div class="field"><label>是否帶回下一次</label><select name="bringBack"><option>是</option><option>不需要</option><option>再觀察</option></select></div></div>
      <div class="field"><label>旅人留下的內容</label><textarea name="content" required placeholder="例如：今天拒絕同事後，我發現自己一直覺得很有罪惡感。"></textarea></div>
      <div class="field"><label>我的簡短備註 <span class="hint">選填・不進旅人製作資料</span></label><textarea name="note"></textarea></div>
      <button type="submit" class="btn btn-ghost">${ICON.add} 留下沿途拾光</button>
    </form>
  </div>`;
}

function pageTravelerDetail(id){
  const t=getT().find(x=>x.id===id);
  if(!t) return `<div class="empty">${ICON.people}<p>找不到這位旅人，也許已經被刪除了。</p><a href="#/travelers" class="btn btn-primary">回旅人清單</a></div>`;
  const js=journeysOf(id);
  const tc=typeCounts(js);
  return `
    <a href="#/travelers" class="btn btn-ghost btn-sm" style="margin-bottom:18px;">${ICON.back} 回旅人清單</a>
    <div class="detail-head">
      <div class="avatar-lg">${esc((t.name||'?')[0])}</div>
      <div class="info">
        <div class="name">${esc(t.name)}</div>
        <div class="sub">${typeBadge(typeOf(t))} ${t.theme?' · '+esc(t.theme):''} · 第一次相遇於 ${fmtDate(t.firstMet)}</div>
      </div>
      <div class="actions">
        <a href="#/journey-new/${t.id}" class="btn btn-primary">${ICON.compass} 開啟新旅程</a>
        <a href="#/traveler-edit/${t.id}" class="btn btn-ghost">${ICON.edit} 編輯資料</a>
        <button class="btn btn-danger" data-del-traveler="${t.id}">${ICON.trash} 刪除旅人</button>
      </div>
    </div>
    <div class="pill-stats">
      <div class="pill">共 ${js.length} 次旅程</div>
      <div class="pill">初遇 ${tc['初遇']} 次</div>
      <div class="pill">拾光 ${tc['拾光']} 次</div>
      <div class="pill">同行 ${tc['同行']} 次</div>
      <div class="pill">最近相遇 ${js[0]?fmtShort(js[0].date):'—'}</div>
    </div>
    ${t.note?`<div class="helper-box">${esc(t.note)}</div>`:''}
    ${shiguangOverviewHtml(t)}
    <div class="section-title"><h3>旅程時間軸</h3></div>
    ${js.length?`<div class="journey-list">${js.map(j=>journeyCard(j)).join('')}</div>`:
      `<div class="empty">${ICON.book}<p>這位旅人還沒有旅程紀錄。</p><a href="#/journey-new/${t.id}" class="btn btn-primary">${ICON.compass} 開啟第一段旅程</a></div>`}
  `;
}

/* ============ 開啟旅程（選擇旅人） ============ */
function pageStartJourney(){
  const preset=hashQuery().get('type');
  const type=JOURNEY_TYPES[preset]?preset:null;
  return `
    <div class="page-head">
      <div class="eyebrow">Start a Journey</div>
      <h1 class="page-title">${type?'開啟'+type+'旅程':'開啟旅程'}</h1>
      <p class="page-desc">${type?'目前已指定「'+type+'」，選一位旅人後會直接帶入這個旅程類型。':'選一位旅人，開始寫下今天的相遇；如果是新朋友，先新增旅人資料。'}</p>
    </div>
    <div class="toolbar">
      <div class="search-wrap">${ICON.search}<input id="s-search" type="text" placeholder="搜尋旅人稱呼…"></div>
      <a href="#/traveler-new" class="btn btn-ghost">${ICON.add} 新增旅人</a>
    </div>
    <div id="s-list"></div>
  `;
}
function renderStartList(){
  const q=(document.getElementById('s-search')?.value||'').trim().toLowerCase();
  let list=getT();
  if(q) list=list.filter(t=>(t.name||'').toLowerCase().includes(q));
  list=[...list].sort((a,b)=>(a.name||'').localeCompare(b.name||'','zh-Hant'));
  const el=document.getElementById('s-list');
  if(!list.length){
    el.innerHTML=`<div class="empty">${ICON.compass}<p>${q?'找不到符合的旅人。':'還沒有旅人可以開啟旅程。'}</p>${q?'':'<a href="#/traveler-new" class="btn btn-primary">'+ICON.add+' 新增旅人</a>'}</div>`;
    return;
  }
  el.innerHTML=`<div class="t-grid">${list.map(t=>{
    const js=journeysOf(t.id);
    return `<div class="t-card" data-start="${t.id}">
      <div class="row1">
        <div class="avatar">${esc((t.name||'?')[0])}</div>
        <div><div class="name">${esc(t.name)}</div><div class="theme">${t.theme?esc(t.theme):'尚未設定旅程主題'} · ${typeBadge(typeOf(t))}</div></div>
      </div>
      <div class="meta"><span>共 ${js.length} 次旅程</span><span>下一次是第 ${js.length+1} 次</span></div>
    </div>`;
  }).join('')}</div>`;
  const preset=hashQuery().get('type');
  el.querySelectorAll('[data-start]').forEach(c=>c.addEventListener('click',()=>{
    location.hash='#/journey-new/'+c.dataset.start+(JOURNEY_TYPES[preset]?'?type='+encodeURIComponent(preset):'');
  }));
}


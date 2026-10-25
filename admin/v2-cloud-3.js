function pageDashboard(){
 const travelers=getT(),journeys=getJ(),bookings=CLOUD.bookings||[];
 const pending=bookings.filter(x=>x.status==='pending');
 const recent=[...journeys].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
 const upcoming=bookings.filter(x=>x.status!=='cancelled'&&x.booking_date&&x.booking_date>=new Date().toLocaleDateString('sv-SE')).sort((a,b)=>(a.booking_date||'').localeCompare(b.booking_date||'')||(a.booking_time||'').localeCompare(b.booking_time||'')).slice(0,3);
 return `
 <div class="page-head"><div class="eyebrow">SHIGUANG STUDIO · OVERVIEW</div><h1 class="page-title">拾光所・今日總覽 ✿</h1><p class="page-desc">只看需要留意的事情，完整內容到各分類查看。</p></div>
 <div class="sg-overview-stats">
 <a href="#/bookings" class="sg-stat"><span class="sg-stat-icon">✉</span><strong>${pending.length}</strong><span>待確認預約</span></a>
 <a href="#/travelers" class="sg-stat"><span class="sg-stat-icon">♡</span><strong>${travelers.length}</strong><span>旅人總數</span></a>
 <a href="#/more" class="sg-stat"><span class="sg-stat-icon">✦</span><strong>${journeys.length}</strong><span>旅程紀錄</span></a>
 </div>
 <section class="sg-overview-section"><div class="section-title"><h3>接下來的預約</h3><a class="more" href="#/bookings">查看全部 →</a></div>
 ${upcoming.length?'<div class="sg-overview-list">'+upcoming.map(x=>'<div class="sg-overview-item"><span class="sg-overview-dot">✿</span><div><b>'+esc(x.traveler_name||'旅人')+'</b><small>'+esc(x.journey||'服務')+'・'+esc(x.booking_date||'')+' '+esc(x.booking_time||'')+'</small></div></div>').join('')+'</div>':'<div class="sg-empty">目前沒有即將到來的預約 ♡</div>'}
 </section>
 <section class="sg-overview-section"><div class="section-title"><h3>最近留下的紀錄</h3><a class="more" href="#/travelers">旅人紀錄 →</a></div>
 ${recent.length?'<div class="sg-overview-list">'+recent.map(j=>{const t=travelers.find(x=>x.id===j.travelerId);return '<a class="sg-overview-item" href="#/traveler/'+encodeURIComponent(j.travelerId||'')+'"><span class="sg-overview-dot">✧</span><div><b>'+esc(t?.name||'旅人')+'</b><small>'+esc(typeOf(j))+'・'+esc(j.date||'')+'</small></div><span class="sg-chevron">›</span></a>'}).join('')+'</div>':'<div class="sg-empty">還沒有旅程紀錄，從旅人紀錄開始就好。</div>'}
 </section>
 <div class="sg-quick-actions"><a href="#/travelers">♡ 旅人紀錄</a><a href="#/settings">⚙ 服務設定</a></div>`;
}

function initialProductionText(j,t){
  const name=t?t.name:'（旅人已刪除）';
  return `製作初遇紀錄\n\n旅人：${name}\n相遇日期：${fmtDate(j.date)}\n\n【此刻的光】\n顏色：${j.lightColor||'—'}\n我感受到的訊息：${j.lightMessage||'—'}\n旅人的回應：${j.lightResponse||'—'}\n\n【今天主要走過什麼】\n${j.walked||j.topics||'—'}\n\n【陪伴中的看見｜我注意到】\n${j.noticed||j.observations||'—'}\n\n【旅人的重要原話】\n${j.importantQuote||j.quotes||'—'}\n\n【這一次拾起了什麼】\n${j.pickedUp||j.direction||'—'}\n\n【留給接下來的觀察】\n${j.nextObservation||'—'}\n\n請先依以上實際資料整理《初遇紀錄｜專屬文案草稿》，不要直接製作正式電子版；未提供的內容不要自行補寫。`;
}


function shiguangProductionText(j,t){
  const name=t?t.name:'（旅人已刪除）';
  const all=getJ().filter(x=>x.travelerId===j.travelerId&&typeOf(x)==='拾光'&&(j.shiguangJourneyId?x.shiguangJourneyId===j.shiguangJourneyId:true)).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const first=all[0]||j, last=all[all.length-1]||j;
  const walked=all.map((x,i)=>`第 ${x.visitCount||i+1} 次｜${fmtDate(x.date)}\n今天走過：${x.sgWalked||x.topics||'—'}\n旅人原話：${x.sgQuote||x.quotes||'—'}\n拾起：${x.sgPickedUp||x.direction||'—'}\n目前位置：${x.sgCurrentPosition||'—'}\n旅程狀態：${x.sgMapStatus||'—'}${x.sgMapChange?'｜'+x.sgMapChange:''}${x.sgAlongTheWay?'\n舊版沿途拾光：'+x.sgAlongTheWay:''}`).join('\n\n');
  const alongs=j.shiguangJourneyId?alongOfJourney(j.shiguangJourneyId):[];
  const alongText=alongs.length?alongs.slice().reverse().map(a=>`${fmtDate(a.date)}｜${a.content||'—'}${a.bringBack?'｜帶回下一次：'+a.bringBack:''}`).join('\n'):'—';
  return `製作拾光紀錄\n\n旅人：${name}\n旅程開始：${fmtDate(first.sgStartDate||first.date)}\n\n【我的起點】\n${first.sgStartingPoint||'—'}\n\n【我想靠近的地方】\n${first.sgDesiredPlace||'—'}\n\n【真正走過的旅程】\n${walked}\n\n【沿途拾光】\n${alongText}\n\n【現在的我】\n${last.sgFinalSelf||last.sgCurrentPosition||'—'}\n\n【一路最重要的轉折】\n${last.sgFinalTurningPoint||'—'}\n\n【這趟旅程拾起了什麼】\n${last.sgFinalPickedUp||'—'}\n\n【想帶往接下來生活的東西】\n${last.sgCarryForward||'—'}\n\n【最後重要原話】\n${last.sgFinalQuote||'—'}\n\n請先依以上實際資料整理《拾光紀錄｜3頁專屬文案草稿》：P1 我走過的旅程地圖、P2 一路拾起的自己、P3 帶著這些繼續走。不要直接製作正式電子版；未提供的內容不要自行補寫。陪伴者私人欄位、未確認假設與方法工具不得使用。`;
}

function companionProductionText(j,t){
  const name=t?t.name:'（旅人已刪除）';
  const all=getJ().filter(x=>x.travelerId===j.travelerId&&typeOf(x)==='同行'&&(j.companionJourneyId?x.companionJourneyId===j.companionJourneyId:true)).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const first=all[0]||j, last=all[all.length-1]||j;
  const sessions=all.map((x,i)=>`第 ${x.visitCount||i+1} 次｜${fmtDate(x.date)}\n最近發生：${x.cpRecent||'—'}\n今天走進：${x.cpFocus||'—'}\n當時反應：${x.cpReaction||'—'}\n開始注意到：${x.cpNoticed||'—'}\n和以前相比：${x.cpCompared||'—'}${x.cpComparedNote?'｜'+x.cpComparedNote:''}\n重要原話：${x.cpQuote||'—'}\n正在長出：${x.cpGrowing||'—'}\n仍在反覆：${x.cpRepeating||'—'}\n想試試看：${x.cpTry||'—'}\n生活拾光：${x.cpLifePickup||'—'}\n生活軌跡：${x.cpLifeTrack||'—'}`).join('\n\n');
  return `製作同行紀錄\n\n旅人：${name}\n旅程開始：${fmtDate(first.cpStartDate||first.date)}\n預計結束：${fmtDate(first.cpExpectedEnd||'')}\n\n【旅程起點】\n為什麼開始：${first.cpWhy||'—'}\n生活裡反覆出現：${first.cpRepeats||'—'}\n想慢慢練習：${first.cpPractice||'—'}\n如果有一點不同，可能會注意到：${first.cpDifference||'—'}\n當時的我：${first.cpStartingSelf||'—'}\n\n【五次正式相遇與生活軌跡】\n${sessions}\n\n【最後回望】\n三個月前的我：${last.cpFinalBefore||'—'}\n曾經反覆走回去的是：${last.cpFinalRepeated||'—'}\n第一次發現不一樣的是：${last.cpFinalDifferent||'—'}\n做過哪些以前較不容易的選擇：${last.cpFinalChoices||'—'}\n現在的我正在長出：${last.cpFinalGrowing||'—'}\n還在路上的：${last.cpFinalOnRoad||'—'}\n接下來想繼續保留的是：${last.cpFinalKeep||'—'}\n最後重要原話：${last.cpFinalQuote||'—'}\n\n請先依以上實際資料整理《同行｜生活軌跡｜4頁專屬文案草稿》：P1 那時候的我、P2 我的生活軌跡、P3 我正在長出的自己、P4 帶著現在的我，繼續生活。不得直接製作正式版；不得把反覆包裝成突破，不得宣稱已療癒或已改變；未提供的內容不得補寫。陪伴者的「我還在好奇」、方法／工具、私人備註不得輸出。`;
}

function journeyCard(j,opts={}){
  const t=getT().find(x=>x.id===j.travelerId);
  const name=t?t.name:'（旅人已刪除）';
  const initial=name?name[0]:'?';
  const washi=['t1','t2','t3'][Math.abs(hashCode(j.id))%3];
  const isInitial=typeOf(j)==='初遇';
  const isShiguang=typeOf(j)==='拾光';
  const isCompanion=typeOf(j)==='同行';
  const initialHtml=isInitial?`
    ${(j.arrival||'')?`<div class="jc-block"><div class="k">${ICON.flag} 來到這裡的他</div><div class="v">${esc(j.arrival)}</div></div>`:''}
    ${(j.walked||j.topics||'')?`<div class="jc-block"><div class="k">${ICON.path} 今天主要走過什麼</div><div class="v">${esc(j.walked||j.topics)}</div></div>`:''}
    ${(j.lightColor||j.lightMessage||j.lightResponse)?`<div class="jc-block"><div class="k">${ICON.moon} 此刻的光</div><div class="v">${j.lightColor?`<b>顏色｜</b>${esc(j.lightColor)}<br>`:''}${j.lightMessage?`<b>我感受到的訊息｜</b>${esc(j.lightMessage)}<br>`:''}${j.lightResponse?`<b>旅人的回應｜</b>${esc(j.lightResponse)}`:''}</div></div>`:''}
    ${(j.noticed||j.observations||j.curious)?`<div class="jc-block"><div class="k">${ICON.compass} 陪伴中的看見</div><div class="v">${(j.noticed||j.observations)?`<b>我注意到｜</b>${esc(j.noticed||j.observations)}<br>`:''}${j.curious?`<b>我還在好奇｜</b>${esc(j.curious)}`:''}</div></div>`:''}
    ${(j.importantQuote||j.quotes)?`<div class="jc-block"><div class="k">${ICON.quote} 旅人的重要原話</div><div class="jc-quote">${esc(j.importantQuote||j.quotes)}</div></div>`:''}
    ${(j.pickedUp||j.direction)?`<div class="jc-block"><div class="k">${ICON.compass} 這一次拾起了什麼</div><div class="jc-dir">${esc(j.pickedUp||j.direction)}</div></div>`:''}
    ${j.nextObservation?`<div class="jc-block"><div class="k">${ICON.flag} 留給接下來的觀察</div><div class="v">${esc(j.nextObservation)}</div></div>`:''}
    ${j.privateNote?`<details class="jc-block"><summary class="k">僅自己可見｜陪伴備註</summary><div class="v" style="margin-top:8px;">${esc(j.privateNote)}</div></details>`:''}
  `:isShiguang?`
    ${(j.sgStartingPoint||j.sgDesiredPlace)?`<div class="jc-block"><div class="k">${ICON.flag} 旅程起點</div><div class="v">${j.sgStartingPoint?`<b>我的起點｜</b>${esc(j.sgStartingPoint)}<br>`:''}${j.sgDesiredPlace?`<b>想靠近的地方｜</b>${esc(j.sgDesiredPlace)}`:''}</div></div>`:''}
    ${(j.sgWalked||j.topics)?`<div class="jc-block"><div class="k">${ICON.path} 今天走過哪裡</div><div class="v">${esc(j.sgWalked||j.topics)}</div></div>`:''}
    ${j.sgQuote?`<div class="jc-block"><div class="k">${ICON.quote} 旅人的重要原話</div><div class="jc-quote">${esc(j.sgQuote)}</div></div>`:''}
    ${j.sgPickedUp?`<div class="jc-block"><div class="k">${ICON.compass} 今天拾起了什麼</div><div class="jc-dir">${esc(j.sgPickedUp)}</div></div>`:''}
    ${j.sgCurrentPosition?`<div class="jc-block"><div class="k">${ICON.compass} 目前的位置</div><div class="v">${esc(j.sgCurrentPosition)}</div></div>`:''}
    ${j.sgMapStatus?`<div class="jc-block"><div class="k">${ICON.path} 這次旅程怎麼走</div><div class="v">${esc(j.sgMapStatus)}${j.sgMapChange?'｜'+esc(j.sgMapChange):''}</div></div>`:''}
    ${j.sgAlongTheWay?`<div class="jc-block"><div class="k">${ICON.moon} 沿途拾光</div><div class="v">${esc(j.sgAlongTheWay)}</div></div>`:''}
    ${(j.sgCurious||j.sgPrivateNote||j.sgTools)?`<details class="jc-block"><summary class="k">僅自己可見｜陪伴資料</summary><div class="v" style="margin-top:8px;">${j.sgCurious?`<b>我還在好奇｜</b>${esc(j.sgCurious)}<br>`:''}${j.sgTools?`<b>方法／工具｜</b>${esc(j.sgTools)}<br>`:''}${j.sgPrivateNote?`<b>私人備註｜</b>${esc(j.sgPrivateNote)}`:''}</div></details>`:''}
  `:`
    ${j.topics?`<div class="jc-block"><div class="k">${ICON.flag} 今天主要談了什麼</div><div class="v">${esc(j.topics)}</div></div>`:''}
    ${j.observations?`<div class="jc-block"><div class="k">${ICON.compass} 觀察到的重點</div><div class="v">${esc(j.observations)}</div></div>`:''}
    ${j.quotes?`<div class="jc-block"><div class="k">${ICON.quote} 旅人說過的話</div><div class="jc-quote">${esc(j.quotes)}</div></div>`:''}
    ${j.direction?`<div class="jc-block"><div class="k">${ICON.compass} 方向與提醒</div><div class="jc-dir">${esc(j.direction)}</div></div>`:''}
  `;
  return `
  <div class="paper-card">
    <div class="washi ${washi}"></div>
    <div class="jc-head">
      <div class="jc-who">
        <div class="avatar">${esc(initial)}</div>
        <div><div class="jc-name">${esc(name)}</div><div class="jc-meta">${fmtDate(j.date)} · 第 ${j.visitCount||1} 次相遇</div></div>
      </div>
      ${typeBadge(typeOf(j))}
    </div>
    ${initialHtml}
    <div class="jc-foot">
      ${isInitial?`<button class="btn btn-primary btn-sm" data-copy-initial="${j.id}">${ICON.book} 整理製作資料</button>`:''}${isShiguang?`<button class="btn btn-primary btn-sm" data-copy-shiguang="${j.id}">${ICON.book} 整理拾光紀錄資料</button>`:''}${isCompanion?`<button class="btn btn-primary btn-sm" data-copy-companion="${j.id}">${ICON.book} 整理同行紀錄資料</button>`:''}
      ${t?`<a href="#/traveler/${t.id}" class="btn btn-ghost btn-sm">${ICON.people} 查看旅人</a>`:''}
      <a href="#/journey-edit/${j.id}" class="btn btn-ghost btn-sm">${ICON.edit} 編輯</a>
      <button class="btn btn-danger btn-sm" data-del-journey="${j.id}">${ICON.trash} 刪除</button>
    </div>
  </div>`;
}
function hashCode(s){let h=0;for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;}return h;}


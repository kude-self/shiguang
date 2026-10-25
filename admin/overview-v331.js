window.pageDashboard=function pageDashboard(){
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
};

window.addEventListener('load',()=>{if(location.hash===''||location.hash==='#/dashboard'){if(typeof render==='function')render()}});

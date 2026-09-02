/* v325 traveler list: service badges come from actual records, never default birthday-only travelers to 初遇 */
(function(){
  function birthdayOrdersOf(id){return (CLOUD.birthday||[]).filter(function(b){return String(b.travelerId||'')===String(id)})}
  function actualServices(t){
    var out=[],js=journeysOf(t.id);
    ['初遇','拾光','同行'].forEach(function(x){if(js.some(function(j){return typeOf(j)===x}))out.push(x)});
    if(birthdayOrdersOf(t.id).length)out.push('生日拾光');
    return out;
  }
  function badges(t){
    var s=actualServices(t);
    if(!s.length)return '<span class="hint">尚無服務紀錄</span>';
    return s.map(function(x){return '<span class="type-badge '+(x==='生日拾光'?'type-light':'')+'">'+esc(x)+'</span>'}).join(' ');
  }
  window.renderTravelerList=function(){
    var q=(document.getElementById('t-search')&&document.getElementById('t-search').value||'').trim().toLowerCase();
    var sort=(document.getElementById('t-sort')&&document.getElementById('t-sort').value)||'recent';
    var type=(document.getElementById('t-type')&&document.getElementById('t-type').value)||'all';
    var list=getT();
    if(q)list=list.filter(function(t){return (t.name||'').toLowerCase().includes(q)||(t.theme||'').toLowerCase().includes(q)});
    if(type!=='all')list=list.filter(function(t){return actualServices(t).indexOf(type)>=0});
    var withMeta=list.map(function(t){var js=journeysOf(t.id),bds=birthdayOrdersOf(t.id),dates=js.map(function(j){return j.date||''}).concat(bds.map(function(b){return b.serviceDate||b.service_date||b.orderDate||''})).filter(Boolean).sort().reverse();return {t:t,count:js.length+bds.length,last:dates[0]||t.firstMet||''}});
    if(sort==='name')withMeta.sort(function(a,b){return (a.t.name||'').localeCompare(b.t.name||'','zh-Hant')});
    else if(sort==='count')withMeta.sort(function(a,b){return b.count-a.count});
    else withMeta.sort(function(a,b){return (b.last||'').localeCompare(a.last||'')});
    var el=document.getElementById('t-list');if(!el)return;
    if(!withMeta.length){el.innerHTML='<div class="empty">'+ICON.people+'<p>'+(q?'找不到符合的旅人。':'還沒有旅人紀錄，新增第一位旅人吧。')+'</p>'+(q?'':'<a href="#/traveler-new" class="btn btn-primary">'+ICON.add+' 新增旅人</a>')+'</div>';return}
    el.innerHTML='<div class="t-grid">'+withMeta.map(function(m){var t=m.t;return '<div class="t-card" data-goto="'+t.id+'"><div class="row1"><div class="avatar">'+esc((t.name||'?')[0])+'</div><div><div class="name">'+esc(t.name||'未命名')+'</div><div class="theme">'+(t.theme?esc(t.theme)+' · ':'')+badges(t)+'</div></div></div><div class="meta"><span>共 '+m.count+' 次服務紀錄</span><span>最近 '+(m.last?fmtShort(m.last):'—')+'</span></div></div>'}).join('')+'</div>';
    el.querySelectorAll('[data-goto]').forEach(function(c){c.addEventListener('click',function(){location.hash='#/traveler/'+c.dataset.goto})});
  };
  var oldPage=window.pageTravelerList;
  if(typeof oldPage==='function')window.pageTravelerList=function(){var html=oldPage();html=html.replace('<option value="同行">同行</option>','<option value="同行">同行</option><option value="生日拾光">生日拾光</option>');return html};
})();
/* v324 traveler service display: birthday light is an independent service, not a fourth journey */
(function(){
  var oldLoad=window.loadCloud;
  if(typeof oldLoad==='function'){
    window.loadCloud=async function(){
      await oldLoad();
      try{
        var r=await sbReq('/rest/v1/birthday_light_orders?select=id,traveler_id');
        if(r.ok){
          var rows=await r.json(),map={};
          rows.forEach(function(x){map[String(x.id)]=x.traveler_id||null});
          (CLOUD.birthday||[]).forEach(function(b){b.travelerId=map[String(b.id)]||b.travelerId||null});
        }
      }catch(e){console.error('birthday traveler link load',e)}
    };
  }
  function birthdayOrdersOf(id){return (CLOUD.birthday||[]).filter(function(b){return String(b.travelerId||'')===String(id)})}
  function servicesOf(t){
    var out=[];
    var js=journeysOf(t.id);
    ['初遇','拾光','同行'].forEach(function(x){if(js.some(function(j){return typeOf(j)===x}))out.push(x)});
    if(birthdayOrdersOf(t.id).length)out.push('生日拾光');
    return out;
  }
  var oldForm=window.pageTravelerForm;
  if(typeof oldForm==='function'){
    window.pageTravelerForm=function(id){
      var html=oldForm(id);
      if(!id)return html;
      var t=getT().find(function(x){return String(x.id)===String(id)});
      if(!t)return html;
      var services=servicesOf(t);
      var current=services.length?services:['尚無服務紀錄'];
      var chips=current.map(function(x){var extra=x==='生日拾光'?'｜獨立服務':'';return '<span class="program-chip" style="font-size:14px;padding:8px 12px;">'+esc(x+extra)+'</span>'}).join(' ');
      var replacement='<div class="field"><label>目前服務</label><div class="helper-box" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;min-height:52px;">'+chips+'</div><input type="hidden" name="journeyType" value="'+esc(t.journeyType||'初遇')+'"><div class="hint" style="margin-top:7px;">生日拾光會顯示在旅人服務紀錄中，但不列入初遇／拾光／同行三段旅程。</div></div>';
      return html.replace(/<div class="field">\s*<label>目前旅程類型<\/label>[\s\S]*?<\/select>\s*<\/div>/,replacement);
    };
  }
  var oldDetail=window.pageTravelerDetail;
  if(typeof oldDetail==='function'){
    window.pageTravelerDetail=function(id){
      var html=oldDetail(id),t=getT().find(function(x){return String(x.id)===String(id)});
      if(!t)return html;
      var bds=birthdayOrdersOf(id);
      if(!bds.length)return html;
      var js=journeysOf(id);
      if(!js.length){
        html=html.replace(typeBadge(typeOf(t)),'<span class="type-badge type-light">生日拾光</span>');
      }
      html=html.replace('<div class="pill-stats">','<div class="pill-stats"><div class="pill">生日拾光 '+bds.length+' 次</div>');
      return html;
    };
  }
})();
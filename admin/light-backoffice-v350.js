/* 光之療癒：共用旅人主檔與既有預約，不建立平行資料 */
(function(){
  const oldLoad=window.loadCloud;
  window.loadCloud=async function(){
    await oldLoad();
    try{
      const r=await sbReq('/rest/v1/light_healing_records?select=id,traveler_id,traveler_name,session_date,session_number,created_at&order=session_date.desc');
      if(!r.ok)throw Error('load light records: '+r.status);
      CLOUD.lightRecords=await r.json();
    }catch(e){console.error('光之療癒紀錄載入失敗',e);CLOUD.lightRecords=CLOUD.lightRecords||[]}
  };
  const serviceList=['初遇','拾光','同行','光之療癒','生日拾光'];
  function serviceSelect(selected){
    return '<div class="field"><label>服務類型</label><select name="journeyType" aria-label="服務類型">'+serviceList.map(k=>'<option value="'+k+'" '+(k===selected?'selected':'')+'>'+k+'</option>').join('')+'</select><div class="hint">光之療癒和生日拾光為獨立服務，紀錄與初遇／拾光／同行分開保存。</div></div>';
  }
  const baseForm=window.pageTravelerForm;
  window.pageTravelerForm=function(id){
    let h=baseForm(id);const t=id&&getT().find(x=>String(x.id)===String(id));
    if(t){
      h=h.replace(/<div class="field"><label>目前服務<\/label>[\s\S]*?<\/div>\s*<\/div>/,serviceSelect(t.journeyType||'初遇'));
      h=h.replace(/<input type="hidden" name="journeyType"[^>]*>/, '');
      if(!h.includes('name="journeyType"')) h=h.replace('</form>',serviceSelect(t.journeyType||'初遇')+'</form>');
    }else{
      h=h.replace(/<div class="field">\s*<label>目前旅程類型<\/label>[\s\S]*?<\/select>\s*<\/div>/,serviceSelect((new URLSearchParams((location.hash.split('?')[1]||''))).get('service')==='光之療癒'?'光之療癒':'初遇'));
    }
    return h;
  };
  const baseDetail=window.pageTravelerDetail;
  window.pageTravelerDetail=function(id){
    let h=baseDetail(id);
    const t=getT().find(x=>String(x.id)===String(id));
    if(!t)return h;
    const rec=(CLOUD.lightRecords||[]).filter(r=>String(r.traveler_id)===String(id));
    const bk=(CLOUD.bookings||[]).filter(b=>b.journey==='光之療癒'&&String(b.traveler_id)===String(id));
    const card='<section class="form-card" style="margin-top:20px"><div class="section-title"><h3>✦ 光之療癒</h3></div><p class="page-desc">療癒紀錄 '+rec.length+' 次 ・ 預約 '+bk.length+' 筆</p><div class="form-actions"><a class="btn btn-primary" href="./light-record.html?traveler='+encodeURIComponent(id)+'">新增光之療癒紀錄</a><a class="btn btn-ghost" href="#/light-healing">回光之療癒管理</a></div></section>';
    return h.replace('<div class="pill-stats">',card+'<div class="pill-stats">');
  };
  const oldPageLight=window.pageLightHealing;
  if(typeof oldPageLight==='function')window.pageLightHealing=function(){
    let h=oldPageLight();
    const n=(CLOUD.lightRecords||[]).length;
    const link='<div class="form-actions" style="margin:12px 0"><a class="btn btn-ghost" href="./light-record.html?record-list=1">歷次療癒紀錄（'+n+'）</a><a class="btn btn-ghost" href="#/travelers">選擇旅人並新增紀錄</a></div>';
    return h.replace('<div class="section-title"><h3>光之療癒預約</h3></div>',link+'<div class="section-title"><h3>光之療癒預約</h3></div>');
  };
})();
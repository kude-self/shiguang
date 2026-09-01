/* v310 launch fixes: unified calendar + cancel/delete controls */
(function(){
  const originalOpenConfirm = openConfirm;
  window.openConfirm = function(msg,onOk){
    const hardDelete = /刪除/.test(msg);
    if(!hardDelete) return originalOpenConfirm(msg,onOk);
    return originalOpenConfirm(msg,()=>originalOpenConfirm('再次確認：這是永久刪除，資料無法復原。',onOk));
  };

  const originalJourneyCard = journeyCard;
  window.journeyCard = function(j,opts={}){
    let html=originalJourneyCard(j,opts);
    if(j.status!=='cancelled'){
      html=html.replace(/(<button class="btn btn-danger btn-sm" data-del-journey="([^"]+)">)/,`<button class="btn btn-ghost btn-sm" data-cancel-journey="$2">取消旅程</button>$1`);
    }else{
      html=html.replace(/(<div class="jc-meta">[^<]*<\/div>)/,`$1<div style="margin-top:5px"><span class="type-badge" style="background:#eee;color:#777">已取消</span></div>`);
    }
    return html;
  };

  const originalBirthday = pageBirthday;
  window.pageBirthday = function(){
    let html=originalBirthday();
    html=html.replace(/(<button class="btn btn-danger btn-sm" data-del-birthday="([^"]+)">刪除<\/button>)/g,(m,del,id)=>`<button class="btn btn-ghost btn-sm" data-cancel-birthday="${id}">取消</button>${del}`);
    return html;
  };

  const originalBirthdayForm = pageBirthdayForm;
  window.pageBirthdayForm = function(id){
    let html=originalBirthdayForm(id);
    const b=id?getB().find(x=>x.id===id):null;
    html=html.replace(/(<label>狀態<\/label><select name="status">)([\s\S]*?)(<\/select>)/,(m,a,bopts,c)=>a+bopts+`<option ${b?.status==='已取消'?'selected':''}>已取消</option>`+c);
    return html;
  };

  function pad2(n){return String(n).padStart(2,'0')}
  function monthKey(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)}
  function bookingCalendarEvents(){
    const out=[];
    (CLOUD.bookings||[]).forEach(x=>{
      if(x.status==='cancelled'||!x.booking_date)return;
      out.push({date:String(x.booking_date).slice(0,10),name:x.traveler_name||'旅人',type:x.journey||'三段旅程',time:String(x.booking_time||'').slice(0,5),status:bookingStatusLabel(x.status)});
    });
    (CLOUD.birthday||[]).forEach(b=>{
      if(b.status==='已取消'||!b.serviceDate)return;
      out.push({date:String(b.serviceDate).slice(0,10),name:b.cardName||b.name||'旅人',type:'生日拾光',time:'',status:b.status||'待確認'});
    });
    return out.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  }
  function calendarHtml(){
    if(!window._bookingCalendarMonth){const n=new Date();window._bookingCalendarMonth=new Date(n.getFullYear(),n.getMonth(),1)}
    const cur=window._bookingCalendarMonth,y=cur.getFullYear(),m=cur.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),lead=first.getDay(),events=bookingCalendarEvents(),byDate={};
    events.forEach(e=>(byDate[e.date]||(byDate[e.date]=[])).push(e));
    let cells='';
    for(let i=0;i<lead;i++)cells+='<div class="bkcal-day empty-day"></div>';
    for(let d=1;d<=days;d++){
      const ds=y+'-'+pad2(m+1)+'-'+pad2(d),items=byDate[ds]||[];
      cells+=`<div class="bkcal-day"><div class="bkcal-num">${d}</div>${items.map(e=>`<div class="bkcal-event ${e.type==='生日拾光'?'birthday':'journey'}"><strong>${esc(e.name)}</strong><span>${esc(e.type)}${e.time?'・'+esc(e.time):''}</span></div>`).join('')}</div>`;
    }
    const total=events.filter(e=>e.date.slice(0,7)===monthKey(cur)).length;
    return `<div class="paper-card" style="padding:18px;margin-bottom:20px"><div class="section-title" style="margin:0 0 12px"><h3>預約月曆</h3><div style="display:flex;align-items:center;gap:8px"><button class="btn btn-ghost btn-sm" data-cal-prev>‹</button><strong>${y}年${m+1}月</strong><button class="btn btn-ghost btn-sm" data-cal-next>›</button></div></div><div style="font-size:12px;color:var(--muted);margin-bottom:10px">本月 ${total} 筆有效預約｜三段旅程與生日拾光自動顯示</div><div class="bkcal-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="bkcal-grid">${cells}</div></div>`;
  }
  function ensureCalendarStyle(){
    if(document.getElementById('bkcal-style'))return;
    const s=document.createElement('style');s.id='bkcal-style';s.textContent=`.bkcal-week,.bkcal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}.bkcal-week{font-size:12px;color:#8a8379;text-align:center;margin-bottom:6px}.bkcal-day{min-height:92px;border:1px solid rgba(55,53,47,.09);border-radius:14px;padding:7px;background:rgba(255,255,255,.72);overflow:hidden}.bkcal-day.empty-day{background:transparent;border-color:transparent}.bkcal-num{font-size:12px;font-weight:700;margin-bottom:5px}.bkcal-event{border-radius:8px;padding:5px 6px;margin-top:4px;font-size:10px;line-height:1.35;overflow-wrap:anywhere}.bkcal-event strong,.bkcal-event span{display:block}.bkcal-event.journey{background:#edf3ea}.bkcal-event.birthday{background:#f8e9e7}@media(max-width:600px){.bkcal-week,.bkcal-grid{gap:3px}.bkcal-day{min-height:72px;padding:4px;border-radius:10px}.bkcal-event{padding:4px;font-size:9px}.bkcal-event span{display:none}}`;
    document.head.appendChild(s);
  }

  window.pageBookings = function(){
    ensureCalendarStyle();
    const rows=[...(CLOUD.bookings||[])];
    const pending=rows.filter(x=>x.status==='pending');
    const active=rows.filter(x=>x.status!=='cancelled');
    return `<div class="page-head"><div class="eyebrow">Booking</div><h1 class="page-title">預約管理</h1><p class="page-desc">三段旅程與生日拾光只要有預約日期，就會自動顯示在下方月曆；取消後不列入有效日程。</p></div>
    ${calendarHtml()}
    <div class="stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));">
      <div class="stat-card"><div class="icon ic-a">${ICON.book}</div><div class="num">${pending.length}</div><div class="lbl">待確認</div></div>
      <div class="stat-card"><div class="icon ic-b">${ICON.path}</div><div class="num">${active.length}</div><div class="lbl">三段旅程有效預約</div></div>
      <div class="stat-card"><div class="icon ic-d">${ICON.dash}</div><div class="num">${rows.length}</div><div class="lbl">三段旅程全部預約</div></div>
    </div>
    <div class="section-title"><h3>三段旅程預約</h3></div>
    ${rows.length?`<div class="journey-list">${rows.map(x=>`<div class="paper-card">
      <div class="jc-head"><div><div class="jc-name">${esc(x.traveler_name||'旅人')}</div><div class="jc-meta">${esc(x.journey||'')}・${fmtDate(x.booking_date)} ${esc(String(x.booking_time||'').slice(0,5))}</div></div><span class="type-badge">${esc(bookingStatusLabel(x.status))}</span></div>
      <div class="jc-block"><div class="k">聯絡資訊</div><div class="v">${esc(x.contact_method||'—')}｜${esc(x.instagram||x.line_display_name||'—')}</div></div>
      <div class="form-actions">${x.status==='pending'?`<button class="btn btn-primary btn-sm" data-confirm-booking="${x.id}">確認成立</button>`:''}${x.status!=='cancelled'?`<button class="btn btn-ghost btn-sm" data-cancel-booking="${x.id}">取消預約</button>`:''}<button class="btn btn-danger btn-sm" data-delete-booking="${x.id}">刪除</button></div>
    </div>`).join('')}</div>`:`<div class="empty">${ICON.book}<p>目前沒有三段旅程預約資料。</p></div>`}`;
  };

  const originalBindPageEvents = bindPageEvents;
  window.bindPageEvents = function(page){
    originalBindPageEvents(page);
    document.querySelectorAll('[data-cal-prev]').forEach(btn=>btn.addEventListener('click',()=>{const d=window._bookingCalendarMonth;window._bookingCalendarMonth=new Date(d.getFullYear(),d.getMonth()-1,1);render()}));
    document.querySelectorAll('[data-cal-next]').forEach(btn=>btn.addEventListener('click',()=>{const d=window._bookingCalendarMonth;window._bookingCalendarMonth=new Date(d.getFullYear(),d.getMonth()+1,1);render()}));
    document.querySelectorAll('[data-delete-booking]').forEach(btn=>btn.addEventListener('click',()=>openConfirm('確定要永久刪除這筆預約嗎？此動作無法復原。',async()=>{
      try{const r=await sbReq('/rest/v1/traveler_bookings?id=eq.'+encodeURIComponent(btn.dataset.deleteBooking),{method:'DELETE'});if(!r.ok)throw new Error(await r.text());await loadCloud();toast('預約已刪除');render()}catch(e){alert('刪除失敗：'+e.message)}
    })));
    document.querySelectorAll('[data-cancel-journey]').forEach(btn=>btn.addEventListener('click',()=>openConfirm('確定要取消這段旅程嗎？紀錄會保留，但不視為有效旅程。',()=>{
      const id=btn.dataset.cancelJourney;setJ(getJ().map(j=>j.id===id?{...j,status:'cancelled',updatedAt:Date.now()}:j));toast('旅程已取消');render();
    })));
    document.querySelectorAll('[data-cancel-birthday]').forEach(btn=>btn.addEventListener('click',()=>openConfirm('確定要取消這筆生日拾光嗎？紀錄會保留，收入不計入。',()=>{
      const id=btn.dataset.cancelBirthday;setB(getB().map(b=>b.id===id?{...b,status:'已取消',updatedAt:Date.now()}:b));toast('生日拾光已取消');render();
    })));
  };
})();

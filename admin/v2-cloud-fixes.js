/* v303 launch fixes: cancel/delete controls + double confirmation for hard deletes */
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

  window.pageBookings = function(){
    const rows=[...(CLOUD.bookings||[])];
    const pending=rows.filter(x=>x.status==='pending');
    const active=rows.filter(x=>x.status!=='cancelled');
    return `<div class="page-head"><div class="eyebrow">Booking</div><h1 class="page-title">預約管理</h1><p class="page-desc">旅人送出表單後會先停在待確認；完成付款與 LINE 核對後，再按「確認成立」。</p></div>
    <div class="stat-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));">
      <div class="stat-card"><div class="icon ic-a">${ICON.book}</div><div class="num">${pending.length}</div><div class="lbl">待確認</div></div>
      <div class="stat-card"><div class="icon ic-b">${ICON.path}</div><div class="num">${active.length}</div><div class="lbl">有效預約</div></div>
      <div class="stat-card"><div class="icon ic-d">${ICON.dash}</div><div class="num">${rows.length}</div><div class="lbl">全部預約</div></div>
    </div>
    <div class="section-title"><h3>旅人預約</h3></div>
    ${rows.length?`<div class="journey-list">${rows.map(x=>`<div class="paper-card">
      <div class="jc-head"><div><div class="jc-name">${esc(x.traveler_name||'旅人')}</div><div class="jc-meta">${esc(x.journey||'')}・${fmtDate(x.booking_date)} ${esc(String(x.booking_time||'').slice(0,5))}</div></div><span class="type-badge">${esc(bookingStatusLabel(x.status))}</span></div>
      <div class="jc-block"><div class="k">聯絡資訊</div><div class="v">${esc(x.contact_method||'—')}｜${esc(x.instagram||x.line_display_name||'—')}</div></div>
      <div class="form-actions">${x.status==='pending'?`<button class="btn btn-primary btn-sm" data-confirm-booking="${x.id}">確認成立</button>`:''}${x.status!=='cancelled'?`<button class="btn btn-ghost btn-sm" data-cancel-booking="${x.id}">取消預約</button>`:''}<button class="btn btn-danger btn-sm" data-delete-booking="${x.id}">刪除</button></div>
    </div>`).join('')}</div>`:`<div class="empty">${ICON.book}<p>目前沒有預約資料。</p></div>`}`;
  };

  const originalBindPageEvents = bindPageEvents;
  window.bindPageEvents = function(page){
    originalBindPageEvents(page);
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

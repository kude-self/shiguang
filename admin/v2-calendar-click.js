/* v316 clickable booking calendar */
(function(){
  function pad2(n){return String(n).padStart(2,'0')}
  function ymdFromDay(day){
    var d=window._bookingCalendarMonth||new Date();
    return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(day);
  }
  function eventsOn(date){
    var out=[];
    (CLOUD.bookings||[]).forEach(function(x){
      if(x.status==='cancelled'||!x.booking_date)return;
      if(String(x.booking_date).slice(0,10)!==date)return;
      out.push({kind:'booking',id:x.id,name:x.traveler_name||'旅人',type:x.journey||'三段旅程',time:String(x.booking_time||'').slice(0,5),status:typeof bookingStatusLabel==='function'?bookingStatusLabel(x.status):x.status,contact:x.instagram||x.line_display_name||''});
    });
    (CLOUD.birthday||[]).forEach(function(b){
      if(b.status==='已取消'||!b.serviceDate)return;
      if(String(b.serviceDate).slice(0,10)!==date)return;
      out.push({kind:'birthday',id:b.id,name:b.cardName||b.name||'旅人',type:'生日拾光',time:'',status:b.status||'待確認',contact:b.instagram||b.lineName||''});
    });
    return out;
  }
  function ensureStyle(){
    if(document.getElementById('v316-cal-click-style'))return;
    var s=document.createElement('style');s.id='v316-cal-click-style';s.textContent=`
.bkcal-day.has-events{cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}.bkcal-day.has-events:active{transform:scale(.97)}
.cal-detail-backdrop{position:fixed;inset:0;background:rgba(69,58,51,.34);z-index:9998;display:flex;align-items:flex-end;justify-content:center;padding:16px}.cal-detail-sheet{width:min(100%,560px);max-height:76vh;overflow:auto;background:#fffdf9;border-radius:28px;padding:18px;box-shadow:0 22px 60px rgba(72,58,48,.22);border:1.5px solid #ead8cf}.cal-detail-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.cal-detail-head h3{margin:0;font-size:20px}.cal-detail-close{border:0;background:#f4ece7;width:38px;height:38px;border-radius:50%;font-size:20px;color:#685d56}.cal-detail-item{width:100%;text-align:left;border:1.5px solid #eadfd8;background:#fff;border-radius:20px;padding:14px;margin-top:10px;color:#4f4741}.cal-detail-item.birthday{background:#fff7f6;border-color:#efcfcc}.cal-detail-item.booking{background:#f8fbf6;border-color:#d6e4d0}.cal-detail-name{font-weight:800;font-size:16px}.cal-detail-meta{font-size:12px;color:#8d8179;margin-top:5px}.cal-highlight{box-shadow:0 0 0 4px rgba(207,169,116,.25),0 14px 30px rgba(90,75,60,.12)!important;transition:box-shadow .2s ease}
`;
    document.head.appendChild(s);
  }
  function closeSheet(){var el=document.getElementById('cal-detail-backdrop');if(el)el.remove()}
  function openBookingCard(id){
    closeSheet();
    var card=document.querySelector('[data-booking-card="'+CSS.escape(id)+'"]');
    if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('cal-highlight');setTimeout(function(){card.classList.remove('cal-highlight')},2200)}
  }
  function openSheet(date,items){
    closeSheet();
    var back=document.createElement('div');back.id='cal-detail-backdrop';back.className='cal-detail-backdrop';
    var html='<div class="cal-detail-sheet" role="dialog" aria-modal="true"><div class="cal-detail-head"><h3>'+esc(fmtDate(date))+'</h3><button class="cal-detail-close" type="button" aria-label="關閉">×</button></div>';
    html+=items.map(function(e){return '<button type="button" class="cal-detail-item '+e.kind+'" data-kind="'+e.kind+'" data-id="'+esc(e.id)+'"><div class="cal-detail-name">'+esc(e.name)+'</div><div class="cal-detail-meta">'+esc(e.type)+(e.time?'・'+esc(e.time):'')+'・'+esc(e.status||'')+'</div>'+(e.contact?'<div class="cal-detail-meta">'+esc(e.contact)+'</div>':'')+'</button>'}).join('');
    html+='</div>';back.innerHTML=html;document.body.appendChild(back);
    back.addEventListener('click',function(ev){if(ev.target===back||ev.target.closest('.cal-detail-close'))return closeSheet();var item=ev.target.closest('.cal-detail-item');if(!item)return;if(item.dataset.kind==='birthday'){location.hash='#/birthday-edit/'+item.dataset.id;closeSheet()}else{openBookingCard(item.dataset.id)}});
  }
  function bindCalendarClicks(){
    ensureStyle();
    var rows=[].slice.call(document.querySelectorAll('.journey-list .paper-card'));
    (CLOUD.bookings||[]).forEach(function(b,i){if(rows[i])rows[i].setAttribute('data-booking-card',b.id)});
    [].slice.call(document.querySelectorAll('.bkcal-day:not(.empty-day)')).forEach(function(cell){
      var num=cell.querySelector('.bkcal-num');if(!num)return;var day=parseInt(num.textContent,10);if(!day)return;var date=ymdFromDay(day),items=eventsOn(date);if(!items.length)return;cell.classList.add('has-events');cell.setAttribute('role','button');cell.setAttribute('tabindex','0');cell.setAttribute('aria-label',fmtDate(date)+'，'+items.length+'筆預約');
      function open(){openSheet(date,items)}
      cell.addEventListener('click',open);cell.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
    });
  }
  var oldBind=window.bindPageEvents;
  window.bindPageEvents=function(page){if(typeof oldBind==='function')oldBind(page);if(location.hash==='#/bookings'||location.hash===''||page==='bookings')setTimeout(bindCalendarClicks,0)};
})();

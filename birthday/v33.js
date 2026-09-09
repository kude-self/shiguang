(function(){
  'use strict';
  var FN='https://tgfxrbghzzttqbpfwypw.supabase.co/functions/v1/birthday-light';
  var YEAR=2026;
  var now=new Date();
  var MONTH=now.getMonth();
  var TAKEN=[];
  var selected='';
  function $(id){return document.getElementById(id)}
  function pad(n){return n<10?'0'+n:String(n)}
  function iso(y,m,d){return y+'-'+pad(m+1)+'-'+pad(d)}
  function hasTaken(key){for(var i=0;i<TAKEN.length;i++){if(TAKEN[i]===key)return true}return false}
  function todayStart(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
  function renderCalendar(){
    var title=$('monthTitle'),days=$('calendarDays'),prev=$('prevMonth'),next=$('nextMonth');
    if(!title||!days)return;
    title.innerHTML=(MONTH+1)+' 月';
    while(days.firstChild)days.removeChild(days.firstChild);
    var firstDay=new Date(YEAR,MONTH,1).getDay();
    var total=new Date(YEAR,MONTH+1,0).getDate();
    var today=todayStart();
    var i;
    for(i=0;i<firstDay;i++){
      var blank=document.createElement('span');blank.className='day blank';days.appendChild(blank);
    }
    for(i=1;i<=total;i++){
      (function(day){
        var key=iso(YEAR,MONTH,day);
        var dateObj=new Date(YEAR,MONTH,day);
        var b=document.createElement('button');
        b.type='button'; b.className='day'; b.appendChild(document.createTextNode(String(day)));
        if(dateObj<today){b.className+=' past';b.disabled=true}
        else if(hasTaken(key)){b.className+=' taken';b.disabled=true}
        else{
          if(selected===key)b.className+=' selected';
          b.onclick=function(){
            selected=key;
            $('serviceDate').value=key;
            $('pickedDate').style.display='block';
            $('pickedDate').innerHTML='你選擇的是 '+(MONTH+1)+' 月 '+day+' 日';
            renderCalendar();
          };
        }
        days.appendChild(b);
      })(i);
    }
    if(prev)prev.disabled=MONTH<=now.getMonth();
    if(next)next.disabled=MONTH>=11;
  }
  function loadAvailability(){
    renderCalendar();
    var x=new XMLHttpRequest();
    x.open('GET',FN+'?action=availability&_='+(new Date().getTime()),true);
    x.onreadystatechange=function(){
      if(x.readyState!==4)return;
      if(x.status>=200&&x.status<300){
        try{var data=JSON.parse(x.responseText);TAKEN=data.taken||[]}catch(e){TAKEN=[]}
      }
      renderCalendar();
    };
    x.onerror=function(){renderCalendar()};
    x.send(null);
  }
  function setRequired(name,yes){var el=document.getElementsByName(name)[0];if(el)el.required=!!yes}
  function setDelivery(value){
    var paper=value==='paper';
    var box=$('shippingBox'),digital=$('digitalCard'),paperCard=$('paperCard');
    if(box)box.style.display=paper?'block':'none';
    if(digital)digital.className=paper?'delivery-card':'delivery-card active';
    if(paperCard)paperCard.className=paper?'delivery-card paper active':'delivery-card paper';
    setRequired('recipient_name',paper);setRequired('phone',paper);setRequired('shipping_address',paper);setRequired('payment_last5',paper);
  }
  function showError(text){var e=$('err');e.innerHTML=text;e.style.display='block';$('ok').style.display='none'}
  function clearMessages(){$('err').style.display='none';$('ok').style.display='none'}
  function init(){
    renderCalendar();
    loadAvailability();
    var prev=$('prevMonth'),next=$('nextMonth');
    if(prev)prev.onclick=function(){if(MONTH>now.getMonth()){MONTH--;renderCalendar()}};
    if(next)next.onclick=function(){if(MONTH<11){MONTH++;renderCalendar()}};
    var radios=document.getElementsByName('delivery_type');
    for(var i=0;i<radios.length;i++){radios[i].onclick=function(){setDelivery(this.value)}}
    setDelivery('digital');
    var photo=$('photo');
    if(photo)photo.onchange=function(){
      var file=photo.files&&photo.files[0];
      if(!file){$('preview').style.display='none';return}
      if(file.size>8*1024*1024){showError('照片請小於 8MB。');photo.value='';$('preview').style.display='none';return}
      $('previewImg').src=URL.createObjectURL(file);$('preview').style.display='block';
    };
    var form=$('birthdayForm');
    form.onsubmit=function(e){
      if(e&&e.preventDefault)e.preventDefault();
      clearMessages();
      var fd=new FormData(form);
      var birthday=String(fd.get('birthday')||'');
      var service=String(fd.get('service_date')||'');
      var delivery=String(fd.get('delivery_type')||'digital');
      var file=photo.files&&photo.files[0];
      if(!service){showError('請先選擇生日拾光日期。');return false}
      if(birthday.length>=10&&birthday.substr(5,5)!==service.substr(5,5)){showError('生日拾光日期需要與你的生日月日相同。');return false}
      if(!file){showError('請上傳近三個月內的照片。');return false}
      if(delivery==='paper'){
        var last5=String(fd.get('payment_last5')||'');
        if(!/^\d{5}$/.test(last5)){showError('請填寫 5 位數的付款帳號後五碼。');return false}
      }
      var payload={
        display_name:String(fd.get('display_name')||''),birthday:birthday,service_date:service,
        instagram:String(fd.get('instagram')||''),current_state:String(fd.get('current_state')||''),
        self_message:String(fd.get('self_message')||''),wished_direction:'',delivery_type:delivery,
        recipient_name:delivery==='paper'?String(fd.get('recipient_name')||''):'',
        phone:delivery==='paper'?String(fd.get('phone')||''):'',postal_code:delivery==='paper'?String(fd.get('postal_code')||''):'',
        shipping_address:delivery==='paper'?String(fd.get('shipping_address')||''):'',
        payment_last5:delivery==='paper'?String(fd.get('payment_last5')||''):'',
        notes:String(fd.get('notes')||''),consent_privacy:true,consent_custom_product:true
      };
      var send=new FormData();send.append('payload',JSON.stringify(payload));send.append('photo',file,file.name||'photo.jpg');
      var btn=$('submitBtn');btn.disabled=true;btn.innerHTML='送出中…';
      var xhr=new XMLHttpRequest();xhr.open('POST',FN,true);
      xhr.onreadystatechange=function(){
        if(xhr.readyState!==4)return;
        btn.disabled=false;btn.innerHTML='送出生日拾光';
        var data={};try{data=JSON.parse(xhr.responseText||'{}')}catch(ex){}
        if(xhr.status>=200&&xhr.status<300&&data.ok){
          var ok=$('ok');ok.innerHTML='資料已送出。<br>請到官方 LINE 私訊確認，確認後才完成預約。<a class="linebtn" href="https://lin.ee/7COHyXu" target="_blank" rel="noopener">加入官方 LINE</a>';ok.style.display='block';
          form.reset();selected='';$('serviceDate').value='';$('pickedDate').style.display='none';$('preview').style.display='none';setDelivery('digital');loadAvailability();ok.scrollIntoView();
        }else{
          var m=data.error||'送出時發生問題，請稍後再試。';
          if(m==='birthday_date_taken')m='這個日期已經有旅人預約，請重新選擇。';
          else if(m==='monthly_limit_reached')m='目前開放名額已滿。';
          else if(m==='photo_required')m='請上傳照片。';
          else if(m==='invalid_payment_last5')m='請確認付款帳號後五碼。';
          else if(m==='shipping_info_required')m='請完整填寫紙本寄送資料。';
          showError(m);
        }
      };
      xhr.onerror=function(){btn.disabled=false;btn.innerHTML='送出生日拾光';showError('連線失敗，請稍後再試。')};
      xhr.send(send);
      return false;
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
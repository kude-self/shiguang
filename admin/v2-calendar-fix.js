/* v310 birthday calendar/date + authoritative time-code display */
(function(){
  const originalLoadCloudV310 = window.loadCloud;
  if(typeof originalLoadCloudV310 === 'function'){
    window.loadCloud = async function(){
      await originalLoadCloudV310();
      try{
        const r=await sbReq('/rest/v1/birthday_light_orders?select=id,service_date,time_code,confirmed_at');
        if(!r.ok)throw new Error(await r.text());
        const rows=await r.json();
        const byId=new Map(rows.map(x=>[x.id,x]));
        CLOUD.birthday=(CLOUD.birthday||[]).map(b=>{
          const r=byId.get(b.id)||{};
          return {...b,serviceDate:r.service_date||null,timeCode:r.time_code||null,confirmedAt:r.confirmed_at||null};
        });
      }catch(e){
        console.error('birthday calendar enrichment',e);
      }
    };
  }

  const originalBirthdayFormV310 = window.pageBirthdayForm;
  if(typeof originalBirthdayFormV310 === 'function'){
    window.pageBirthdayForm = function(id){
      let html=originalBirthdayFormV310(id);
      const b=id?(getB().find(x=>x.id===id)||null):null;
      if(!b || !b.timeCode){
        html=html.replace(/<input name="timeCode" value="[^"]*" readonly>/,
          '<input name="timeCode" value="" placeholder="付款確認後自動生成" readonly>');
      }
      return html;
    };
  }
})();

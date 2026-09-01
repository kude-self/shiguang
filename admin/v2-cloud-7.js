/* ============ 事件綁定 ============ */
function bindPageEvents(page){
  if(page==='bookings'){
    document.querySelectorAll('[data-confirm-booking]').forEach(btn=>btn.addEventListener('click',async()=>{try{await patchCloud('traveler_bookings',btn.dataset.confirmBooking,{status:'confirmed'});await loadCloud();toast('預約已確認成立');render()}catch(e){alert('確認失敗：'+e.message)}}));
    document.querySelectorAll('[data-cancel-booking]').forEach(btn=>btn.addEventListener('click',()=>openConfirm('確定取消這筆預約嗎？',async()=>{try{await patchCloud('traveler_bookings',btn.dataset.cancelBooking,{status:'cancelled'});await loadCloud();toast('預約已取消');render()}catch(e){alert('取消失敗：'+e.message)}})));
  }

  if(page==='birthday-new'||page==='birthday-edit'){
    const form=document.getElementById('birthday-form');
    const photo=document.getElementById('birthday-photo');
    if(photo) photo.addEventListener('change',e=>{
      const file=e.target.files[0]; if(!file)return;
      const img=new Image(), reader=new FileReader();
      reader.onload=()=>{ img.onload=()=>{ const max=900, scale=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale); c.getContext('2d').drawImage(img,0,0,c.width,c.height); const data=c.toDataURL('image/jpeg',.72); form.elements.photoData.value=data; document.getElementById('birthday-photo-preview').innerHTML=`<img src="${data}" alt="旅人近照" style="max-width:180px;max-height:240px;border-radius:12px;object-fit:cover;border:1px solid var(--line);">`; }; img.src=reader.result; }; reader.readAsDataURL(file);
    });
    form.addEventListener('submit',e=>{
      e.preventDefault(); const fd=new FormData(form), parts=parseHash(), id=page==='birthday-edit'?parts[1]:null, old=id?getB().find(x=>x.id===id):null;
      const fields=['timeCode','status','orderDate','confirmedDate','name','cardName','birthday','phone','lineName','paymentLast5','paymentStatus','recipient','address','photoData','recentState','recentPhrase','lightColor','lightDetail','lightFirst','lightRaw','lightEnergy','lightMessage','lightCore','deckName','cardDrawn','cardKeyword','cardFeeling','cardWithLight','cardMessage','card1Copy','card2Copy','card1Front','card1Back','card2Front','card2Back','copyStatus','cardStatus','completedDate','shipDate','shippingInfo','feedback','feedbackConsent','privateFeeling','privateUncertain','privateAfter'];
      const data={}; fields.forEach(k=>data[k]=(fd.get(k)||'').trim());
      if(!data.name&&!data.cardName){toast('請至少填寫旅人姓名或卡片稱呼');return;}
      let list=getB();
      if(old){ list=list.map(x=>x.id===id?{...x,...data,timeCode:old.timeCode,updatedAt:Date.now()}:x); setB(list); toast('已儲存生日拾光'); }
      else { const item={id:uid(),...data,timeCode:nextBirthdayCode(data.orderDate),createdAt:Date.now()}; list.push(item); setB(list); toast('已建立生日拾光'); }
      location.hash='#/birthday';
    });
  }
  if(page==='birthday'){
    const orderImport=document.getElementById('birthday-order-import');
    if(orderImport) orderImport.addEventListener('change',()=>{ const file=orderImport.files&&orderImport.files[0]; if(!file)return; const r=new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(r.result); if(d.type!=='birthday-light-order') throw new Error('不是生日拾光下單資料'); const now=Date.now(); const rec={id:uid(),timeCode:nextBirthdayCode(),status:'待確認',orderDate:(d.submittedAt||'').slice(0,10)||todayStr(),confirmedDate:'',name:d.name||'',cardName:d.cardName||'',birthday:d.birthday||'',phone:d.phone||'',lineName:d.lineName||'',paymentLast5:d.paymentLast5||'',paymentStatus:'待確認',recipient:d.recipient||'',address:d.address||'',recentState:d.recentState||'',recentPhrase:d.recentPhrase||'',photoData:d.photoData||'',copyStatus:'草稿',cardStatus:'未製作',createdAt:now,updatedAt:now}; setB([...getB(),rec]); toast('已匯入生日拾光下單資料'); render(); }catch(err){alert('匯入失敗：'+err.message);} }; r.readAsText(file); });
    document.querySelectorAll('[data-del-birthday]').forEach(btn=>btn.addEventListener('click',()=>openConfirm('確定要刪除這筆生日拾光嗎？此動作無法復原。',()=>{setB(getB().filter(x=>x.id!==btn.dataset.delBirthday));toast('已刪除生日拾光');render();})));
  }
  if(page==='travelers'){
    renderTravelerList();
    document.getElementById('t-search').addEventListener('input',renderTravelerList);
    document.getElementById('t-sort').addEventListener('change',renderTravelerList);
    document.getElementById('t-type').addEventListener('change',renderTravelerList);
  }
  if(page==='start'){
    renderStartList();
    document.getElementById('s-search').addEventListener('input',renderStartList);
  }
  if(page==='traveler-new'||page==='traveler-edit'){
    document.getElementById('traveler-form').addEventListener('submit',e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const name=(fd.get('name')||'').trim();
      if(!name){ toast('請填寫旅人稱呼'); return; }
      const parts=parseHash();
      const editingId=page==='traveler-edit'?parts[1]:null;
      let list=getT();
      if(editingId){
        list=list.map(t=>t.id===editingId?{...t,name,firstMet:fd.get('firstMet')||t.firstMet,theme:(fd.get('theme')||'').trim(),journeyType:fd.get('journeyType')||'初遇',note:(fd.get('note')||'').trim()}:t);
        setT(list);
        toast('已儲存修改');
        location.hash='#/traveler/'+editingId;
      }else{
        const t={id:uid(),name,firstMet:fd.get('firstMet')||todayStr(),theme:(fd.get('theme')||'').trim(),journeyType:fd.get('journeyType')||'初遇',note:(fd.get('note')||'').trim(),createdAt:Date.now()};
        list.push(t); setT(list);
        toast('已新增旅人');
        location.hash='#/traveler/'+t.id;
      }
    });
  }
  if(page==='journey-new'||page==='journey-edit'){
    const typeSelect=document.getElementById('journey-type-select');
    const syncJourneyFields=()=>{
      const isInitial=typeSelect.value==='初遇';
      const isShiguang=typeSelect.value==='拾光';
      const isCompanion=typeSelect.value==='同行';
      document.getElementById('initial-fields').style.display=isInitial?'block':'none';
      document.getElementById('shiguang-fields').style.display=isShiguang?'block':'none';
      document.getElementById('companion-fields').style.display=isCompanion?'block':'none';
      document.getElementById('legacy-fields').style.display='none';
    };
    typeSelect.addEventListener('change',syncJourneyFields);
    document.getElementById('journey-form').addEventListener('submit',e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const parts=parseHash();
      const isInitial=(fd.get('journeyType')||'初遇')==='初遇';
      const isShiguang=(fd.get('journeyType')||'初遇')==='拾光';
      const data={travelerId:fd.get('travelerId'),journeyType:fd.get('journeyType')||'初遇',date:fd.get('date')||todayStr(),visitCount:parseInt(fd.get('visitCount'))||1};
      if(isInitial){
        Object.assign(data,{
          arrival:(fd.get('arrival')||'').trim(), walked:(fd.get('walked')||'').trim(), lightColor:(fd.get('lightColor')||'').trim(), lightMessage:(fd.get('lightMessage')||'').trim(), lightResponse:(fd.get('lightResponse')||'').trim(), noticed:(fd.get('noticed')||'').trim(), curious:(fd.get('curious')||'').trim(), importantQuote:(fd.get('importantQuote')||'').trim(), pickedUp:(fd.get('pickedUp')||'').trim(), nextObservation:(fd.get('nextObservation')||'').trim(), privateNote:(fd.get('privateNote')||'').trim(),
          // 同步保留舊欄位，避免既有顯示／匯出相容性問題
          topics:(fd.get('walked')||'').trim(), observations:(fd.get('noticed')||'').trim(), quotes:(fd.get('importantQuote')||'').trim(), direction:(fd.get('pickedUp')||'').trim()
        });
      }else if(isShiguang){
        Object.assign(data,{
          shiguangJourneyId:(page==='journey-edit'?(getJ().find(x=>x.id===parts[1])?.shiguangJourneyId||uid()):(activeShiguangJourneyId(data.travelerId)||uid())),
          sgStartingPoint:(fd.get('sgStartingPoint')||'').trim(),sgDesiredPlace:(fd.get('sgDesiredPlace')||'').trim(),sgPossibleDirections:(fd.get('sgPossibleDirections')||'').trim(),sgReturnedFrom:(fd.get('sgReturnedFrom')||'').trim(),sgWalked:(fd.get('sgWalked')||'').trim(),sgNoticed:(fd.get('sgNoticed')||'').trim(),sgCurious:(fd.get('sgCurious')||'').trim(),sgQuote:(fd.get('sgQuote')||'').trim(),sgPickedUp:(fd.get('sgPickedUp')||'').trim(),sgCurrentPosition:(fd.get('sgCurrentPosition')||'').trim(),sgMapStatus:(fd.get('sgMapStatus')||'').trim(),sgMapChange:(fd.get('sgMapChange')||'').trim(),sgLifeObservation:(fd.get('sgLifeObservation')||'').trim(),sgAlongTheWay:(page==='journey-edit'?(getJ().find(x=>x.id===parts[1])?.sgAlongTheWay||''):''),sgTools:(fd.get('sgTools')||'').trim(),sgPrivateNote:(fd.get('sgPrivateNote')||'').trim(),sgFinalSelf:(fd.get('sgFinalSelf')||'').trim(),sgFinalTurningPoint:(fd.get('sgFinalTurningPoint')||'').trim(),sgFinalPickedUp:(fd.get('sgFinalPickedUp')||'').trim(),sgCarryForward:(fd.get('sgCarryForward')||'').trim(),sgFinalQuote:(fd.get('sgFinalQuote')||'').trim(),
          topics:(fd.get('sgWalked')||'').trim(),observations:(fd.get('sgNoticed')||'').trim(),quotes:(fd.get('sgQuote')||'').trim(),direction:(fd.get('sgPickedUp')||'').trim()
        });
      }else{
        const old=page==='journey-edit'?getJ().find(x=>x.id===parts[1]):null;
        const existingCp=getJ().filter(x=>x.travelerId===data.travelerId&&typeOf(x)==='同行').sort((a,b)=>(a.date||'').localeCompare(b.date||''));
        const cpId=old?.companionJourneyId||(existingCp.length?existingCp[existingCp.length-1].companionJourneyId:null)||uid();
        const base=existingCp.find(x=>x.companionJourneyId===cpId)||{};
        Object.assign(data,{companionJourneyId:cpId,
          cpStartDate:(fd.get('cpStartDate')||base.cpStartDate||data.date).trim(),cpExpectedEnd:(fd.get('cpExpectedEnd')||base.cpExpectedEnd||'').trim(),cpWhy:(fd.get('cpWhy')||base.cpWhy||'').trim(),cpRepeats:(fd.get('cpRepeats')||base.cpRepeats||'').trim(),cpPractice:(fd.get('cpPractice')||base.cpPractice||'').trim(),cpDifference:(fd.get('cpDifference')||base.cpDifference||'').trim(),cpStartingSelf:(fd.get('cpStartingSelf')||base.cpStartingSelf||'').trim(),
          cpRecent:(fd.get('cpRecent')||'').trim(),cpFocus:(fd.get('cpFocus')||'').trim(),cpReaction:(fd.get('cpReaction')||'').trim(),cpNoticed:(fd.get('cpNoticed')||'').trim(),cpCompared:(fd.get('cpCompared')||'').trim(),cpComparedNote:(fd.get('cpComparedNote')||'').trim(),cpQuote:(fd.get('cpQuote')||'').trim(),cpGrowing:(fd.get('cpGrowing')||'').trim(),cpRepeating:(fd.get('cpRepeating')||'').trim(),cpTry:(fd.get('cpTry')||'').trim(),cpLifePickup:(fd.get('cpLifePickup')||'').trim(),cpLifeTrack:(fd.get('cpLifeTrack')||'').trim(),cpCurious:(fd.get('cpCurious')||'').trim(),cpTools:(fd.get('cpTools')||'').trim(),cpPrivateNote:(fd.get('cpPrivateNote')||'').trim(),cpFinalBefore:(fd.get('cpFinalBefore')||'').trim(),cpFinalRepeated:(fd.get('cpFinalRepeated')||'').trim(),cpFinalDifferent:(fd.get('cpFinalDifferent')||'').trim(),cpFinalChoices:(fd.get('cpFinalChoices')||'').trim(),cpFinalGrowing:(fd.get('cpFinalGrowing')||'').trim(),cpFinalOnRoad:(fd.get('cpFinalOnRoad')||'').trim(),cpFinalKeep:(fd.get('cpFinalKeep')||'').trim(),cpFinalQuote:(fd.get('cpFinalQuote')||'').trim(),
          topics:(fd.get('cpFocus')||'').trim(),observations:(fd.get('cpNoticed')||'').trim(),quotes:(fd.get('cpQuote')||'').trim(),direction:(fd.get('cpTry')||'').trim()});
      }
      let list=getJ();
      if(page==='journey-edit'){
        const jid=parts[1];
        list=list.map(j=>j.id===jid?{...j,...data,updatedAt:Date.now()}:j);
        setJ(list); toast('已儲存旅程紀錄');
      }else{
        const j={id:uid(),...data,createdAt:Date.now()}; list.push(j); setJ(list); toast('已完成旅程紀錄');
      }
      location.hash='#/traveler/'+data.travelerId;
    });
  }
  if(page==='backup'){
    document.getElementById('btn-export').addEventListener('click',()=>{
      const payload={version:4,exportedAt:new Date().toISOString(),travelers:getT(),journeys:getJ(),alongTheWay:getA(),birthdayLight:getB(),bookings:CLOUD.bookings||[],income:CLOUD.income||[]};
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      const stamp=todayStr();
      a.href=url; a.download=`拾光者備份_${stamp}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast('備份已下載');
    });
    document.getElementById('file-import').addEventListener('change',e=>{
      const file=e.target.files[0]; if(!file) return;
      const reader=new FileReader();
      reader.onload=()=>{
        try{
          const data=JSON.parse(reader.result);
          if(!Array.isArray(data.travelers)||!Array.isArray(data.journeys)) throw new Error('格式不正確');
          openConfirm(`即將匯入 ${data.travelers.length} 位旅人、${data.journeys.length} 筆旅程，並覆蓋目前的資料，確定嗎？`,()=>{
            setT(data.travelers); setJ(data.journeys); setA(Array.isArray(data.alongTheWay)?data.alongTheWay:[]); setB(Array.isArray(data.birthdayLight)?data.birthdayLight:[]);
            toast('資料已匯入');
            render();
          });
        }catch(err){ toast('備份檔格式錯誤，匯入失敗'); }
        e.target.value='';
      };
      reader.readAsText(file);
    });
  }

  document.querySelectorAll('[data-copy-birthday]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const b=getB().find(x=>x.id===btn.dataset.copyBirthday); if(!b)return;
      const text=birthdayProductionText(b);
      try{ await navigator.clipboard.writeText(text); toast('生日拾光製作資料已整理並複製'); }
      catch(err){ window.prompt('請複製以下製作資料：',text); }
    });
  });

  document.querySelectorAll('[data-copy-initial]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const j=getJ().find(x=>x.id===btn.dataset.copyInitial);
      const t=j?getT().find(x=>x.id===j.travelerId):null;
      if(!j)return;
      const text=initialProductionText(j,t);
      try{ await navigator.clipboard.writeText(text); toast('初遇製作資料已整理並複製'); }
      catch(err){ window.prompt('請複製以下製作資料：',text); }
    });
  });

  document.querySelectorAll('[data-copy-shiguang]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const j=getJ().find(x=>x.id===btn.dataset.copyShiguang);
      const t=j?getT().find(x=>x.id===j.travelerId):null;
      if(!j)return;
      const text=shiguangProductionText(j,t);
      try{ await navigator.clipboard.writeText(text); toast('拾光製作資料已整理並複製'); }
      catch(err){ window.prompt('請複製以下製作資料：',text); }
    });
  });


  document.querySelectorAll('[data-copy-companion]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const j=getJ().find(x=>x.id===btn.dataset.copyCompanion);
      const t=j?getT().find(x=>x.id===j.travelerId):null;
      if(!j)return;
      const text=companionProductionText(j,t);
      try{ await navigator.clipboard.writeText(text); toast('同行製作資料已整理並複製'); }
      catch(err){ window.prompt('請複製以下製作資料：',text); }
    });
  });

  document.querySelectorAll('[data-along-form]').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const fd=new FormData(form), content=(fd.get('content')||'').trim();
      if(!content){ toast('請先寫下沿途拾光內容'); return; }
      const item={id:uid(),shiguangJourneyId:form.dataset.alongForm,date:fd.get('date')||todayStr(),content,note:(fd.get('note')||'').trim(),bringBack:(fd.get('bringBack')||'再觀察').trim(),createdAt:Date.now()};
      const list=getA(); list.push(item); setA(list); toast('已留下沿途拾光'); render();
    });
  });
  document.querySelectorAll('[data-del-along]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      openConfirm('確定要刪除這筆沿途拾光嗎？此動作無法復原。',()=>{ setA(getA().filter(a=>a.id!==btn.dataset.delAlong)); toast('已刪除沿途拾光'); render(); });
    });
  });

  document.querySelectorAll('[data-del-journey]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.delJourney;
      openConfirm('確定要刪除這筆旅程紀錄嗎？此動作無法復原。',()=>{
        setJ(getJ().filter(j=>j.id!==id));
        toast('已刪除旅程紀錄');
        render();
      });
    });
  });
  document.querySelectorAll('[data-del-traveler]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.dataset.delTraveler;
      const n=journeysOf(id).length;
      openConfirm(`確定要刪除這位旅人嗎？${n?`他的 ${n} 筆旅程紀錄也會一併刪除。`:''}此動作無法復原。`,()=>{
        const sgIds=new Set(getJ().filter(j=>j.travelerId===id&&j.shiguangJourneyId).map(j=>j.shiguangJourneyId));
        setT(getT().filter(t=>t.id!==id));
        setJ(getJ().filter(j=>j.travelerId!==id));
        setA(getA().filter(a=>!sgIds.has(a.shiguangJourneyId)));
        toast('已刪除旅人');
        location.hash='#/travelers';
      });
    });
  });
}


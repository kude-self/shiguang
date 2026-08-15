/* 拾光所｜第一階・初遇 正式母版 v2 */
(()=>{
  const $=id=>document.getElementById(id);
  const W=1080,H=1350;
  const SERIF='"Songti TC","Noto Serif TC",serif';
  const SANS='"PingFang TC","Noto Sans TC",sans-serif';
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  let initialCanvas=null, initialRec=null, logo=null;
  const oldBuildDraft=window.buildDraft;
  const oldShowRecordPreview=window.showRecordPreview;
  const oldPrintRecord=window.printRecord;
  const oldSaveRecordImage=window.saveRecordImage;

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function latestSession(id){return (window.data?.sessions||[]).filter(s=>s.travelerId===id).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0]||{}}
  function keywordGuess(t,s){
    const pool=[s.bring,s.insight,s.change,s.light,t?.concern,t?.hope].filter(Boolean).join('、');
    const stop=['今天','自己','這次','一個','覺得','想要','可以','開始','真的','比較','目前','事情','感覺'];
    const words=pool.split(/[、，。；：／/\s]+/).map(x=>x.trim()).filter(x=>x&&x.length<=8&&!stop.includes(x));
    return [...new Set(words)].slice(0,3).join('、');
  }
  function field(label,helper,value,placeholder=''){
    return `<div class="draft-section"><label>${esc(label)}</label>${helper?`<div style="font-size:13px;color:#978474;line-height:1.6;margin:-2px 0 8px">${esc(helper)}</div>`:''}<textarea placeholder="${esc(placeholder)}">${esc(value||'')}</textarea></div>`;
  }

  window.buildDraft=function(){
    const type=$('recordType')?.value;
    if(type!=='初遇紀錄') return typeof oldBuildDraft==='function'?oldBuildDraft():undefined;
    const id=$('createTraveler')?.value,t=window.data?.travelers?.find(x=>x.id===id);
    $('recordPreviewCard')&&($('recordPreviewCard').style.display='none');
    if($('draftTitle')) $('draftTitle').textContent='初遇紀錄｜文案確認／編輯';
    if(!t){
      if($('draftFields')) $('draftFields').innerHTML='<p class="muted">先選擇一位旅人，再開始整理《今日拾光》。</p>';
      if($('sourceSummary')) $('sourceSummary').textContent='選擇旅人後，會自動整理最近一次相遇的重點。';
      return;
    }
    const s=latestSession(id);
    const brought=s.bring||t.concern||'';
    const seen=s.insight||s.change||'';
    const need=s.light||t.hope||s.leave||'';
    const leave=s.quote||s.leave||'';
    const kw=keywordGuess(t,s);
    $('draftFields').innerHTML=
      field('今天，我帶來的是','這次來到拾光所，你最想整理、最在意，或一直放在心上的事情是？',brought,'整理這次前來的主要議題')+
      field('今天出現的三個關鍵字','從整段對話中，留下最明顯的三個詞彙。',kw,'例如：焦慮、期待、自由')+
      field('我好像看見了……','在這段對話裡，你逐漸察覺、理解或看見的內在狀態是？',seen,'整理這次真正看見的自己')+
      field('此刻，我真正需要的是','如果只為了現在的自己，你真正需要、最重要的是什麼？',need,'用一句話收斂此刻真正的需要')+
      field('留給現在的自己','從這段旅程中，最想帶走的一句話或一個提醒。',leave,'保留旅人的原話，或整理成一句提醒');
    if($('sourceSummary')) $('sourceSummary').innerHTML=`<p>旅人｜${esc(t.name)}</p><p>日期｜${esc(s.date||t.date||'—')}</p><p>目前最在意｜${esc(t.concern||'—')}</p><p>她希望帶走｜${esc(t.hope||'—')}</p>`;
    if($('sideLights')) $('sideLights').innerHTML=s.light?`<div class="record-type"><strong>${esc(s.light)}</strong></div>`:'<p class="muted">這次還沒有另外留下「拾起的光」。</p>';
  };

  async function getLogo(){
    if(logo)return logo; logo=new Image(); logo.crossOrigin='anonymous'; logo.src='32CCD19A-16B9-451E-8559-4A40F8CA3D92.png';
    await new Promise(r=>{logo.onload=logo.onerror=r}); return logo;
  }
  function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke()}}
  function wrap(ctx,text,x,y,w,lh,max=5){let line='',lines=[];for(const ch of String(text||'—')){if(ch==='\n'){lines.push(line);line='';continue}const t=line+ch;if(ctx.measureText(t).width>w&&line){lines.push(line);line=ch}else line=t}if(line)lines.push(line);lines.slice(0,max).forEach((l,i)=>ctx.fillText(l,x,y+i*lh));return lines.length}
  function leaf(ctx,x,y,s=.7,rot=0,a=.26){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=a;ctx.strokeStyle='#71845d';ctx.fillStyle='#81956c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-110*s);ctx.stroke();for(let i=0;i<4;i++){let yy=-22*s-i*24*s;ctx.beginPath();ctx.ellipse(-20*s,yy,25*s,11*s,-.45,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(20*s,yy-8*s,25*s,11*s,.45,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function label(ctx,text,x,y){ctx.fillStyle='#5d6d4c';ctx.font=`600 26px ${SERIF}`;ctx.fillText(text,x,y)}
  function answer(ctx,text,x,y,w,fs=24,max=3){ctx.fillStyle='#493d34';ctx.font=`400 ${fs}px ${SERIF}`;wrap(ctx,text||'—',x,y,w,fs*1.55,max)}
  function card(ctx,x,y,w,h,icon,title,helper,text,green=false){rounded(ctx,x,y,w,h,22,green?'rgba(229,234,215,.66)':'rgba(250,246,238,.80)','rgba(205,190,165,.56)');rounded(ctx,x+18,y+24,92,92,46,'rgba(141,153,114,.20)',null);ctx.fillStyle='#74845c';ctx.font=`500 42px ${SANS}`;ctx.textAlign='center';ctx.fillText(icon,x+64,y+84);ctx.textAlign='left';label(ctx,title,x+135,y+45);ctx.fillStyle='#86796b';ctx.font=`400 17px ${SERIF}`;wrap(ctx,helper,x+135,y+76,240,26,3);rounded(ctx,x+420,y+20,w-445,h-40,18,'rgba(255,253,248,.70)',null);answer(ctx,text,x+445,y+63,w-495,24,4);leaf(ctx,x+w-24,y+h-10,.55,.45,.18)}
  function vals(rec){
    const ps=Array.isArray(rec?.parts)?rec.parts:[];
    const find=(key,i)=>ps.find(p=>String(p.label||'').includes(key))?.text||ps[i]?.text||'';
    return {brought:find('今天，我帶來的是',0),keywords:find('三個關鍵字',1),seen:find('我好像看見了',2),need:find('真正需要',3),leave:find('留給現在的自己',4)};
  }
  async function drawInitial(rec){
    const t=window.data?.travelers?.find(x=>x.id===rec.travelerId)||{},v=vals(rec);const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
    const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#fffdf8');g.addColorStop(1,'#f1e7d8');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const light=ctx.createRadialGradient(120,80,20,120,80,520);light.addColorStop(0,'rgba(255,255,255,.96)');light.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
    for(let i=0;i<220;i++){ctx.globalAlpha=.05;ctx.fillStyle='#8e7b63';ctx.fillRect(Math.random()*W,Math.random()*H,1,1)}ctx.globalAlpha=1;
    leaf(ctx,70,245,.9,-.4,.20);leaf(ctx,1045,430,.9,.28,.25);leaf(ctx,1020,1100,.75,.25,.18);
    await getLogo(); if(logo?.complete){ctx.globalAlpha=.92;ctx.drawImage(logo,82,1120,150,150);ctx.globalAlpha=1}
    ctx.textAlign='center';ctx.fillStyle='#617051';ctx.font=`500 26px ${SERIF}`;ctx.fillText('❧  拾光所｜初遇紀錄  ❧',W/2,70);ctx.font=`600 64px ${SERIF}`;ctx.fillText('今日拾光',W/2,145);ctx.fillStyle='#6f6154';ctx.font=`400 28px ${SERIF}`;ctx.fillText('一段故事，一次新的看見。',W/2,200);ctx.textAlign='left';
    // thank-you note
    ctx.save();ctx.translate(865,90);ctx.rotate(.035);rounded(ctx,-120,-10,225,155,4,'rgba(242,229,208,.86)',null);ctx.fillStyle='rgba(209,184,147,.48)';ctx.fillRect(-45,-24,90,20);ctx.fillStyle='#67584c';ctx.font=`400 20px ${SERIF}`;wrap(ctx,'謝謝你願意\n把自己帶到這裡\n願我們一起\n看見與理解內在',-92,35,180,28,5);ctx.restore();
    // traveler/date row
    rounded(ctx,145,235,790,62,17,'rgba(255,252,245,.74)','rgba(211,195,170,.55)');ctx.fillStyle='#6e765a';ctx.font=`500 22px ${SANS}`;ctx.fillText('● 旅人｜',178,274);ctx.fillStyle='#493e35';ctx.fillText(t.name||'旅人',285,274);ctx.fillStyle='#6e765a';ctx.fillText('▣ 日期｜',580,274);ctx.fillStyle='#493e35';ctx.fillText((rec.date||t.date||'').slice(0,10).replaceAll('-',' / ')||'—',690,274);
    card(ctx,120,325,840,180,'❧','今天，我帶來的是','這次來到拾光所，你最想整理、最在意，或一直放在心上的事情是？',v.brought);
    // keywords special row
    rounded(ctx,120,520,840,170,22,'rgba(250,246,238,.80)','rgba(205,190,165,.56)');rounded(ctx,138,544,92,92,46,'rgba(141,153,114,.20)',null);ctx.fillStyle='#74845c';ctx.font=`500 38px ${SANS}`;ctx.textAlign='center';ctx.fillText('✦',184,604);ctx.textAlign='left';label(ctx,'今天出現的三個關鍵字',255,565);ctx.fillStyle='#86796b';ctx.font=`400 17px ${SERIF}`;ctx.fillText('這次對話中，最明顯的三個詞彙',255,598);const kws=String(v.keywords||'').split(/[、，／,\s]+/).filter(Boolean).slice(0,3);for(let i=0;i<3;i++){rounded(ctx,500+i*135,555,115,90,45,'rgba(229,230,215,.78)',null);ctx.fillStyle='#5e594f';ctx.font=`500 22px ${SERIF}`;ctx.textAlign='center';ctx.fillText(kws[i]||`0${i+1}`,558+i*135,610)}ctx.textAlign='left';
    card(ctx,120,705,840,175,'◉','我好像看見了……','在這段對話裡，你逐漸察覺、理解或看見的內在狀態是？',v.seen,true);
    card(ctx,120,895,840,165,'♡','此刻，我真正需要的是','如果只為了現在的自己，你真正需要、最重要的是什麼？',v.need);
    card(ctx,120,1075,840,155,'❧','留給現在的自己','從這段旅程中，最想帶走的一句話或一個提醒。',v.leave,true);
    rounded(ctx,255,1240,570,70,18,'rgba(250,244,232,.76)','rgba(206,188,159,.55)');ctx.fillStyle='#6e6256';ctx.font=`400 18px ${SERIF}`;ctx.textAlign='center';ctx.fillText('這份紀錄不是替你定義答案，而是把今天被你看見的自己留下來。',W/2,1270);ctx.fillText('等過一段時間再回來讀，也許你會再次遇見不同的自己。',W/2,1298);ctx.textAlign='left';
    return c;
  }

  function renderInitialPreview(rec,canvas){
    initialCanvas=canvas;initialRec=rec;window.__sgActiveRecord=rec;
    const card=$('recordPreviewCard');if(!card)return;card.dataset.recordId=rec.id||'';card.style.display='block';
    if($('previewTitle')) $('previewTitle').textContent='初遇紀錄｜正式電子版預覽';
    if($('previewSub')) $('previewSub').textContent='《今日拾光》｜預覽、圖片與 PDF 使用同一張固定母版';
    $('previewBody').innerHTML='';const img=new Image();img.src=canvas.toDataURL('image/png');img.alt='拾光所｜今日拾光';img.style.cssText='display:block;width:100%;height:auto;border-radius:18px;box-shadow:0 12px 30px rgba(82,62,39,.10)';$('previewBody').appendChild(img);card.scrollIntoView({behavior:'smooth',block:'start'});
  }
  window.showRecordPreview=async function(rec){
    if(rec?.type!=='初遇紀錄') return typeof oldShowRecordPreview==='function'?oldShowRecordPreview(rec):undefined;
    renderInitialPreview(rec,await drawInitial(rec));
  };
  async function ensureInitial(){
    let rec=initialRec||window.__sgActiveRecord;const id=$('recordPreviewCard')?.dataset?.recordId;if((!rec||rec.type!=='初遇紀錄')&&id)rec=window.data?.confirmed?.find(x=>x.id===id);
    if(!rec||rec.type!=='初遇紀錄')return null;if(!initialCanvas)initialCanvas=await drawInitial(rec);initialRec=rec;return rec;
  }
  async function loadJsPDF(){if(window.jspdf?.jsPDF)return;await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  window.saveRecordImage=async function(){const rec=await ensureInitial();if(!rec)return typeof oldSaveRecordImage==='function'?oldSaveRecordImage():undefined;const blob=await new Promise(r=>initialCanvas.toBlob(r,'image/png',1));const name=`拾光所-${esc((window.data.travelers.find(t=>t.id===rec.travelerId)?.name)||'旅人')}-初遇紀錄.png`;if(isIOS&&navigator.share&&blob){const f=new File([blob],name,{type:'image/png'});try{await navigator.share({files:[f],title:'拾光所｜初遇紀錄'});return}catch(e){if(e?.name==='AbortError')return}}const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),60000)};
  window.printRecord=async function(){const rec=await ensureInitial();if(!rec)return typeof oldPrintRecord==='function'?oldPrintRecord():undefined;await loadJsPDF();const {jsPDF}=window.jspdf,pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});pdf.addImage(initialCanvas.toDataURL('image/jpeg',.95),'JPEG',0,0,210,262.5);const blob=pdf.output('blob'),name=`拾光所-${esc((window.data.travelers.find(t=>t.id===rec.travelerId)?.name)||'旅人')}-初遇紀錄.pdf`;if(isIOS&&navigator.share){const f=new File([blob],name,{type:'application/pdf'});try{await navigator.share({files:[f],title:'拾光所｜初遇紀錄'});return}catch(e){if(e?.name==='AbortError')return}}const url=URL.createObjectURL(blob),a=document.createElement('a');a.download=name;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)};
  document.documentElement.dataset.sgInitialV2='20260816';
})();
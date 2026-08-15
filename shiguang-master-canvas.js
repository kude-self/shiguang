/* 拾光所｜固定視覺母版＋程式填入 v1 */
(()=>{
  const $=id=>document.getElementById(id);
  const W=1080,H=1350;
  const FONT='"PingFang TC","Noto Sans TC",sans-serif';
  const SERIF='"Songti TC","Noto Serif TC",serif';
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  let logoImg=null;

  async function loadLogo(){
    if(logoImg)return logoImg;
    logoImg=new Image(); logoImg.crossOrigin='anonymous'; logoImg.src='32CCD19A-16B9-451E-8559-4A40F8CA3D92.png';
    await new Promise(r=>{logoImg.onload=logoImg.onerror=r}); return logoImg;
  }
  function escName(s){return String(s||'旅人').replace(/[\\/:*?"<>|]/g,'-')}
  function parts(rec){
    if(Array.isArray(rec?.parts)&&rec.parts.length)return rec.parts.map(p=>({label:p.label||'',text:p.text||'—'}));
    return String(rec?.text||'').split(/\n\s*\n/).filter(Boolean).map(b=>{const a=b.split('\n');return{label:a.shift()||'',text:a.join('\n')||'—'}})
  }
  function splitText(ctx,text,maxWidth){
    const out=[]; let line='';
    for(const ch of String(text||'')){
      if(ch==='\n'){out.push(line);line='';continue}
      const t=line+ch;
      if(ctx.measureText(t).width>maxWidth&&line){out.push(line);line=ch}else line=t;
    }
    if(line||!out.length)out.push(line); return out;
  }
  function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){
    const lines=splitText(ctx,text,maxWidth).slice(0,maxLines);
    lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));
    return y+lines.length*lineHeight;
  }
  function roundRect(ctx,x,y,w,h,r,fill,stroke){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r); if(fill){ctx.fillStyle=fill;ctx.fill()} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.stroke()}
  }
  function paperNoise(ctx){
    ctx.save();ctx.globalAlpha=.09;ctx.fillStyle='#8c795f';
    for(let i=0;i<260;i++){const x=Math.random()*W,y=Math.random()*H,r=Math.random()*1.2+.2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  }
  function leaf(ctx,x,y,s,rot,color='#81936a',alpha=.36){
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4*s;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-120*s);ctx.stroke();
    for(let i=0;i<4;i++){
      const yy=-25*s-i*25*s;
      ctx.beginPath();ctx.ellipse(-22*s,yy,27*s,12*s,-.45,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(23*s,yy-10*s,27*s,12*s,.45,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function tape(ctx,x,y,w,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle='rgba(214,190,151,.42)';ctx.fillRect(-w/2,-11,w,22);ctx.restore()}
  function bg(ctx,variant=0){
    const g=ctx.createLinearGradient(0,0,W,H);
    const sets=[['#fffdf8','#f0e4d3'],['#fbf8f1','#e9e6d9'],['#fffaf4','#efe3d1'],['#fbf7ef','#e9e0d2'],['#fffdf7','#eee5d6'],['#f9f6ef','#e7e3d7']];
    const s=sets[variant%sets.length];g.addColorStop(0,s[0]);g.addColorStop(1,s[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const light=ctx.createRadialGradient(150,120,20,150,120,450);light.addColorStop(0,'rgba(255,255,255,.8)');light.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=light;ctx.fillRect(0,0,W,H);paperNoise(ctx);
  }
  async function brand(ctx,kicker,title,sub,page,total,variant){
    await loadLogo();
    ctx.globalAlpha=.94; if(logoImg?.complete)ctx.drawImage(logoImg,72,64,118,118); ctx.globalAlpha=1;
    ctx.fillStyle='#91734d';ctx.font=`500 24px ${SERIF}`;ctx.fillText(`拾光所｜${kicker}${total>1?`  ${page}/${total}`:''}`,220,88);
    ctx.fillStyle='#473a31';ctx.font=`600 46px ${SERIF}`;drawWrapped(ctx,title,220,143,760,58,2);
    ctx.fillStyle='#806f61';ctx.font=`400 25px ${SERIF}`;drawWrapped(ctx,sub,220,218,720,37,2);
    ctx.strokeStyle='rgba(184,157,115,.45)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(72,285);ctx.lineTo(1008,285);ctx.stroke();
    leaf(ctx,990,240,.6,-.45,variant%2?'#7c8e69':'#9a815f',.22);
  }
  function label(ctx,text,x,y){ctx.fillStyle='#a07c49';ctx.font=`600 22px ${SERIF}`;ctx.fillText('✦ '+text,x,y)}
  function body(ctx,text,x,y,w,fs=28,maxLines=5){ctx.fillStyle='#493e35';ctx.font=`400 ${fs}px ${SERIF}`;return drawWrapped(ctx,text,x,y,w,fs*1.65,maxLines)}
  function noteCard(ctx,x,y,w,h,title,text,opt={}){
    roundRect(ctx,x,y,w,h,opt.r||24,opt.fill||'rgba(255,253,249,.74)',opt.stroke||'rgba(210,192,164,.55)');
    if(opt.tape)tape(ctx,x+w*.55,y+2,110,opt.tapeRot||-.05);
    label(ctx,title,x+28,y+45);body(ctx,text,x+28,y+88,w-56,opt.fs||27,opt.lines||5);
  }
  function footer(ctx,text){ctx.strokeStyle='rgba(184,157,115,.4)';ctx.beginPath();ctx.moveTo(74,1247);ctx.lineTo(1006,1247);ctx.stroke();ctx.fillStyle='#8b7867';ctx.font=`400 20px ${SERIF}`;ctx.fillText(text,74,1288);ctx.textAlign='right';ctx.fillText('𓇼 拾光所',1006,1288);ctx.textAlign='left'}
  function keywords(text){return String(text||'').split(/[、／,，\s]+/).filter(Boolean).slice(0,3)}

  async function drawInitial(rec,t){
    const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');bg(ctx,0);
    await brand(ctx,'初遇紀錄',`${t?.name||'旅人'}｜《初遇紀錄》`,'一場相遇，留下第一次看見。',1,1,0);
    // window scene
    roundRect(ctx,700,330,260,230,18,'rgba(224,232,218,.55)','rgba(149,152,126,.35)');
    ctx.strokeStyle='rgba(137,145,120,.45)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(830,330);ctx.lineTo(830,560);ctx.moveTo(700,445);ctx.lineTo(960,445);ctx.stroke();
    const p=parts(rec);const a=p[0]||{},b=p[1]||{},d=p[2]||{},q=p[3]||{},l=p.find(x=>/拾起的光/.test(x.label))||p[4]||{};
    ctx.fillStyle='#5c4b3d';ctx.font=`600 36px ${SERIF}`;ctx.fillText('今天，我帶來的是',84,360);body(ctx,b.text||a.text,84,410,540,31,4);
    noteCard(ctx,84,560,430,220,'三個關鍵字',keywords(b.text||a.text).join('　｜　')||'此刻　｜　感受　｜　看見',{fill:'rgba(247,235,215,.78)',tape:true,fs:26,lines:3});
    noteCard(ctx,560,600,400,265,'我好像看見了……',d.text||q.text||'—',{fill:'rgba(239,239,222,.78)',tape:true,tapeRot:.05,fs:27,lines:5});
    noteCard(ctx,84,835,876,245,'有一句話，我想留下來',q.text||a.text||'—',{fill:'rgba(255,250,243,.82)',fs:29,lines:4});
    roundRect(ctx,84,1110,876,96,26,'rgba(226,235,205,.78)','rgba(177,184,143,.5)');label(ctx,'這次拾起的光',110,1150);ctx.fillStyle='#4f5c3e';ctx.font=`600 29px ${SERIF}`;drawWrapped(ctx,l.text||'—',340,1150,590,42,2);
    leaf(ctx,1000,1030,.75,.1,'#7f9168',.25);footer(ctx,'把這次看見的自己，好好收藏下來。');return c;
  }
  async function drawJourneyPage(rec,t,page,total,type,title,sub,items,variant){
    const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');bg(ctx,variant);await brand(ctx,type,title,sub,page,total,variant);
    if(variant%3===0){
      roundRect(ctx,700,330,250,200,16,'rgba(223,231,215,.52)','rgba(147,154,128,.28)');ctx.strokeStyle='rgba(139,149,124,.38)';ctx.beginPath();ctx.moveTo(825,330);ctx.lineTo(825,530);ctx.moveTo(700,430);ctx.lineTo(950,430);ctx.stroke();leaf(ctx,975,530,.6,-.3,'#82946a',.25)
    }else if(variant%3===1){
      roundRect(ctx,760,340,180,120,60,'rgba(209,186,151,.42)',null);ctx.fillStyle='rgba(116,92,67,.22)';ctx.beginPath();ctx.ellipse(850,475,115,25,0,0,Math.PI*2);ctx.fill();leaf(ctx,130,480,.7,.2,'#7e8e69',.25)
    }else{leaf(ctx,930,490,.85,-.35,'#8a9870',.27);tape(ctx,780,365,150,.08)}
    const ys=[360,565,770,975];
    items.slice(0,4).forEach((it,i)=>noteCard(ctx,84,ys[i],i%2?790:700,170,it.label||`旅程片段 ${i+1}`,it.text||'—',{fill:i%2?'rgba(245,237,224,.8)':'rgba(255,253,248,.78)',tape:i===1,fs:27,lines:3}));
    if(!items.length)noteCard(ctx,84,390,820,220,'這一頁想留下的','這段旅程正在慢慢發生。',{fill:'rgba(255,253,248,.78)',fs:30,lines:4});
    footer(ctx,type==='拾光紀錄'?`四週旅程｜${page}/${total}`:`同行｜三個月陪伴｜${page}/${total}`);return c;
  }
  async function buildCanvases(rec){
    const t=window.data?.travelers?.find(x=>x.id===rec.travelerId)||{};const p=parts(rec);
    if(rec.type==='初遇紀錄')return [await drawInitial(rec,t)];
    if(rec.type==='拾光紀錄'){
      const titles=['這一次，我慢慢看見了自己','有些聲音聽了很久，才發現不一定都是我的','拾起的光，不是答案，而是更靠近自己的方向。'];
      const subs=['四週的開始，把一路發生的感受留下來。','分辨外在的期待、害怕與真正的自己。','把看見帶回生活，留下真正想做的選擇。'];
      const groups=[[],[],[]];p.forEach((x,i)=>groups[i%3].push(x));const out=[];for(let i=0;i<3;i++)out.push(await drawJourneyPage(rec,t,i+1,3,'拾光紀錄',titles[i],subs[i],groups[i],i+1));return out;
    }
    const titles=['出發時的我','我看見的自己','我真正重視的事','我正在練習的選擇','現在的我','一路走來'];
    const subs=['把最初的狀態留在這一頁。','重新認識自己，也重新理解自己的需要。','把注意力帶回真正重要的位置。','讓新的選擇慢慢發生在生活裡。','看見三個月後此刻站著的自己。','把這段旅程收進心裡，也帶回未來的日常。'];
    const groups=Array.from({length:6},()=>[]);p.forEach((x,i)=>groups[i%6].push(x));const out=[];for(let i=0;i<6;i++)out.push(await drawJourneyPage(rec,t,i+1,6,'旅程紀錄',titles[i],subs[i],groups[i],i+2));return out;
  }
  function activeRec(){
    if(window.__sgActiveRecord)return window.__sgActiveRecord;
    const id=$('recordPreviewCard')?.dataset?.recordId; if(id){const r=window.data?.confirmed?.find(x=>x.id===id);if(r)return r}
    const tid=$('createTraveler')?.value,type=$('recordType')?.value; if(tid&&type){const m=(window.data?.confirmed||[]).filter(x=>x.travelerId===tid&&x.type===type);if(m.length)return m[0]}
    return (window.data?.confirmed||[])[0]||null;
  }
  function showCanvas(index){
    const cs=window.__sgMasterCanvases||[];if(!cs.length)return;index=Math.max(0,Math.min(index,cs.length-1));window.__sgMasterPage=index;
    const img=document.createElement('img');img.src=cs[index].toDataURL('image/png');img.alt='拾光所正式電子紀錄';img.style.cssText='display:block;width:100%;height:auto;border-radius:18px;box-shadow:0 12px 30px rgba(82,62,39,.10)';
    const host=document.createElement('div');host.id='sgMasterHost';host.appendChild(img);
    const nav=cs.length>1?`<div style="display:flex;justify-content:center;align-items:center;gap:12px;margin:0 0 14px"><button class="btn" onclick="sgMasterPrev()">← 上一張</button><span id="sgMasterCount" class="pill">${index+1} / ${cs.length}</span><button class="btn" onclick="sgMasterNext()">下一張 →</button></div>`:'';
    $('previewBody').innerHTML=nav;$('previewBody').appendChild(host);
  }
  window.sgMasterPrev=()=>showCanvas((window.__sgMasterPage||0)-1);window.sgMasterNext=()=>showCanvas((window.__sgMasterPage||0)+1);
  window.showRecordPreview=async rec=>{
    window.__sgActiveRecord=rec;$('recordPreviewCard').dataset.recordId=rec.id||'';$('recordPreviewCard').style.display='block';$('previewTitle').textContent='正式電子版預覽';$('previewSub').textContent='固定視覺母版＋旅人專屬內容';$('previewBody').innerHTML='<div class="empty">正在製作正式電子版…</div>';
    try{window.__sgMasterCanvases=await buildCanvases(rec);window.__sgMasterPage=0;showCanvas(0);$('recordPreviewCard').scrollIntoView({behavior:'smooth',block:'start'})}catch(e){console.error(e);$('previewBody').innerHTML='<div class="empty">正式電子版製作失敗，請重新開啟紀錄。</div>'}
  };
  async function ensureBuilt(){const r=activeRec();if(!r)return null;if(window.__sgActiveRecord?.id!==r.id||!(window.__sgMasterCanvases||[]).length){await window.showRecordPreview(r);await sleep(80)}return r}
  async function ensureJsPDF(){if(window.jspdf?.jsPDF)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  window.saveRecordImage=async()=>{
    const r=await ensureBuilt();if(!r)return alert('目前沒有可輸出的正式紀錄。');const cs=window.__sgMasterCanvases||[];const t=window.data?.travelers?.find(x=>x.id===r.travelerId);
    try{for(let i=0;i<cs.length;i++){const blob=await new Promise(res=>cs[i].toBlob(res,'image/png',1));const name=`拾光所-${escName(t?.name)}-${escName(r.type)}-${i+1}.png`;if(isIOS&&navigator.share&&blob){const file=new File([blob],name,{type:'image/png'});if(!navigator.canShare||navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'拾光所正式紀錄'});continue}catch(e){if(e?.name==='AbortError')return}}}const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),60000)}}catch(e){console.error(e);alert('圖片儲存失敗，請再試一次。')}
  };
  window.printRecord=async()=>{
    const r=await ensureBuilt();if(!r)return alert('目前沒有可輸出的正式紀錄。');try{await ensureJsPDF();const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});const cs=window.__sgMasterCanvases||[];for(let i=0;i<cs.length;i++){if(i)pdf.addPage('a4','portrait');pdf.addImage(cs[i].toDataURL('image/jpeg',.95),'JPEG',0,0,210,262.5,undefined,'FAST')}const t=window.data?.travelers?.find(x=>x.id===r.travelerId);const name=`拾光所-${escName(t?.name)}-${escName(r.type)}.pdf`;if(isIOS){const blob=pdf.output('blob');const file=new File([blob],name,{type:'application/pdf'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'拾光所正式紀錄'});return}catch(e){if(e?.name==='AbortError')return}}const url=URL.createObjectURL(blob);window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),120000)}else pdf.save(name)}catch(e){console.error(e);alert('PDF 製作失敗，請再試一次。')}
  };
  document.documentElement.dataset.sgMasterCanvas='v1';
})();
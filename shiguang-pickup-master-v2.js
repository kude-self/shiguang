/* 拾光所｜第二階・拾光四週旅程 正式母版 v2 */
(()=>{
 const $=id=>document.getElementById(id),W=1080,H=1350;
 const SERIF='"Songti TC","Noto Serif TC",serif',SANS='"PingFang TC","Noto Sans TC",sans-serif';
 const oldBuild=window.buildDraft,oldShow=window.showRecordPreview;
 let logo=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function getLogo(){if(logo)return logo;logo=new Image();logo.crossOrigin='anonymous';logo.src='32CCD19A-16B9-451E-8559-4A40F8CA3D92.png';await new Promise(r=>{logo.onload=logo.onerror=r});return logo}
 function sessions(id){return (window.data?.sessions||[]).filter(s=>s.travelerId===id).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).slice(-4)}
 function txt(s,k){return s?.[k]||''}
 function field(label,helper,value,ph=''){return `<div class="draft-section"><label>${esc(label)}</label>${helper?`<div style="font-size:13px;color:#978474;line-height:1.6;margin:-2px 0 8px">${esc(helper)}</div>`:''}<textarea placeholder="${esc(ph)}">${esc(value||'')}</textarea></div>`}
 window.buildDraft=function(){
  if($('recordType')?.value!=='拾光紀錄')return typeof oldBuild==='function'?oldBuild():undefined;
  const id=$('createTraveler')?.value,t=window.data?.travelers?.find(x=>x.id===id),ss=sessions(id);
  $('recordPreviewCard')&&($('recordPreviewCard').style.display='none');if($('draftTitle'))$('draftTitle').textContent='拾光紀錄｜四週旅程文案確認';
  if(!t){$('draftFields').innerHTML='<p class="muted">先選擇一位旅人，再整理四週旅程。</p>';return}
  const all=ss.map(s=>[s.bring,s.insight,s.change,s.light,s.quote,s.leave].filter(Boolean).join('、')).join('、');
  const ws=[...new Set(all.split(/[、，。；：／/\s]+/).map(x=>x.trim()).filter(x=>x&&x.length<=8&&!['今天','自己','這次','覺得','想要','可以','開始','真的','比較','事情','感覺'].includes(x)))].slice(0,3).join('、');
  const first=ss[0]||{},last=ss.at(-1)||{};
  const html=[
   ['旅程開始時的我','回到四週旅程剛開始時，當時的你正帶著什麼？',txt(first,'bring')||t.concern],
   ['四週反覆出現的三個關鍵字','把一路反覆出現、最值得記住的三個詞留下來。',ws],
   ['我開始看見……','這四週裡，你逐漸看見了哪些以前沒有注意到的自己？',txt(first,'insight')||txt(last,'insight')],
   ['我開始分辨……','哪些是外界期待、害怕或習慣？哪些才是你真正的聲音？',ss.map(s=>s.insight).filter(Boolean).join('\n')],
   ['我真正所在意的是……','拿掉「應該」之後，什麼才是你真正放不下、真正珍惜的？',t.concern||txt(last,'light')],
   ['我重新找回了……','這段旅程裡，你重新找回了自己的哪一部分？',txt(last,'change')||txt(last,'light')],
   ['旅人原話／核心句','如果要留下一句最像你的話，你想留下哪一句？',txt(last,'quote')||txt(last,'leave')],
   ['現在的我','四週走到這裡，現在的你和剛開始時有什麼不同？',txt(last,'insight')||txt(last,'change')],
   ['我想做出的選擇','接下來，你想在生活裡為自己做出什麼選擇？',txt(last,'leave')||t.hope],
   ['留給未來的自己','如果未來又迷惘了，你想提醒自己什麼？',txt(last,'quote')||txt(last,'light')],
   ['拾光所想留給你的話','不是替旅人給答案，而是整理這一路最值得被記住的看見。','願你記得，真正屬於你的聲音，不需要很大聲，也值得被你聽見。']
  ].map(x=>field(...x)).join('');
  $('draftFields').innerHTML=html;
  if($('sourceSummary'))$('sourceSummary').innerHTML=`<p>旅人｜${esc(t.name)}</p><p>服務｜拾光・四週旅程</p><p>相遇次數｜${ss.length} / 4</p><p>旅程主軸｜看見 → 分辨 → 找回 → 選擇</p>`;
 };
 function parts(rec){return Array.isArray(rec?.parts)?rec.parts:[]}
 function val(rec,key,i){const p=parts(rec);return p.find(x=>String(x.label||'').includes(key))?.text||p[i]?.text||'—'}
 function rr(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke()}}
 function wrap(ctx,text,x,y,w,lh,max=5){let line='',ls=[];for(const ch of String(text||'—')){if(ch==='\n'){ls.push(line);line='';continue}const q=line+ch;if(ctx.measureText(q).width>w&&line){ls.push(line);line=ch}else line=q}if(line)ls.push(line);ls.slice(0,max).forEach((l,i)=>ctx.fillText(l,x,y+i*lh))}
 function bg(ctx,v){const g=ctx.createLinearGradient(0,0,W,H);const sets=[['#fffdf8','#efe6d9'],['#fbf8f1','#e9eadf'],['#fffaf3','#eee2d1']];let s=sets[v];g.addColorStop(0,s[0]);g.addColorStop(1,s[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);const l=ctx.createRadialGradient(140,100,20,140,100,530);l.addColorStop(0,'rgba(255,255,255,.95)');l.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=l;ctx.fillRect(0,0,W,H);ctx.globalAlpha=.05;ctx.fillStyle='#866f56';for(let i=0;i<240;i++)ctx.fillRect(Math.random()*W,Math.random()*H,1,1);ctx.globalAlpha=1}
 function leaf(ctx,x,y,s=.7,rot=0,a=.24,color='#788b66'){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=a;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-115*s);ctx.stroke();for(let i=0;i<4;i++){let yy=-24*s-i*24*s;ctx.beginPath();ctx.ellipse(-20*s,yy,25*s,11*s,-.45,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(20*s,yy-8*s,25*s,11*s,.45,0,Math.PI*2);ctx.fill()}ctx.restore()}
 function tape(ctx,x,y,w,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle='rgba(211,185,145,.38)';ctx.fillRect(-w/2,-10,w,20);ctx.restore()}
 async function brand(ctx,t,page,title,sub){ctx.textAlign='center';ctx.fillStyle='#687456';ctx.font=`500 23px ${SERIF}`;ctx.fillText(`拾光所｜拾光紀錄  0${page}`,W/2,64);ctx.fillStyle='#4e503d';ctx.font=`600 49px ${SERIF}`;wrap(ctx,title,W/2-410,130,820,61,2);ctx.fillStyle='#77695c';ctx.font=`400 23px ${SERIF}`;ctx.fillText(sub,W/2,225);ctx.textAlign='left';rr(ctx,110,255,860,58,16,'rgba(255,252,245,.72)','rgba(211,194,169,.50)');ctx.fillStyle='#65704f';ctx.font=`500 20px ${SANS}`;ctx.fillText('旅人｜',140,292);ctx.fillStyle='#4a3f36';ctx.fillText(t?.name||'旅人',210,292);ctx.fillStyle='#65704f';ctx.fillText('四週旅程｜看見 → 分辨 → 找回 → 選擇',520,292)}
 function block(ctx,x,y,w,h,title,text,opt={}){rr(ctx,x,y,w,h,24,opt.fill||'rgba(255,253,248,.78)','rgba(207,192,170,.55)');ctx.fillStyle='#79835f';ctx.font=`600 23px ${SERIF}`;ctx.fillText('✦ '+title,x+26,y+42);ctx.fillStyle='#493e35';ctx.font=`400 ${opt.fs||27}px ${SERIF}`;wrap(ctx,text,x+26,y+85,w-52,(opt.fs||27)*1.55,opt.max||4);if(opt.tape)tape(ctx,x+w*.72,y+2,110,.04)}
 async function footer(ctx){await getLogo();if(logo?.complete){ctx.globalAlpha=.94;ctx.drawImage(logo,872,1135,120,120);ctx.globalAlpha=1}ctx.strokeStyle='rgba(187,160,119,.38)';ctx.beginPath();ctx.moveTo(90,1270);ctx.lineTo(830,1270);ctx.stroke();ctx.fillStyle='#877466';ctx.font=`400 18px ${SERIF}`;ctx.fillText('拾起的光，不是答案，而是更靠近自己的方向。',90,1305)}
 async function page1(rec,t){const c=document.createElement('canvas');c.width=W;c.height=H;let x=c.getContext('2d');bg(x,0);await brand(x,t,1,'這一次，我慢慢看見了自己','把四週開始時的自己，與一路出現的看見留下來。');leaf(x,90,430,.8,-.35,.20);leaf(x,1015,620,.8,.25,.22);block(x,95,350,890,235,'旅程開始時的我',val(rec,'旅程開始時的我',0),{fill:'rgba(248,239,225,.80)',fs:29});rr(x,95,605,890,205,24,'rgba(255,253,248,.78)','rgba(207,192,170,.55)');x.fillStyle='#79835f';x.font=`600 23px ${SERIF}`;x.fillText('✦ 四週反覆出現的三個關鍵字',125,650);const ks=String(val(rec,'三個關鍵字',1)).split(/[、，／,\s]+/).filter(Boolean).slice(0,3);for(let i=0;i<3;i++){rr(x,180+i*245,690,190,82,41,'rgba(230,233,215,.88)',null);x.fillStyle='#555946';x.font=`500 25px ${SERIF}`;x.textAlign='center';x.fillText(ks[i]||`0${i+1}`,275+i*245,740)}x.textAlign='left';block(x,95,835,890,270,'我開始看見……',val(rec,'我開始看見',2),{fill:'rgba(237,239,222,.74)',fs:29});await footer(x);return c}
 async function page2(rec,t){const c=document.createElement('canvas');c.width=W;c.height=H;let x=c.getContext('2d');bg(x,1);await brand(x,t,2,'有些聲音聽了很久，才發現，不一定都是我的。','慢慢分辨：哪些來自外界、害怕與習慣，哪些才是真正的自己。');leaf(x,1020,430,.9,.35,.21);tape(x,800,350,145,-.06);block(x,95,350,890,225,'我開始分辨……',val(rec,'我開始分辨',3),{fill:'rgba(244,242,229,.82)',fs:28});block(x,95,595,420,225,'我真正所在意的是……',val(rec,'真正所在意',4),{fill:'rgba(255,251,243,.82)',fs:26});block(x,535,595,450,225,'我重新找回了……',val(rec,'重新找回',5),{fill:'rgba(232,238,219,.78)',fs:26});block(x,135,855,810,245,'旅人原話／核心句',val(rec,'旅人原話',6),{fill:'rgba(248,231,210,.72)',fs:31,tape:true,max:4});await footer(x);return c}
 async function page3(rec,t){const c=document.createElement('canvas');c.width=W;c.height=H;let x=c.getContext('2d');bg(x,2);await brand(x,t,3,'拾起的光，不是答案，而是更靠近自己的方向。','把四週的看見帶回生活，留下真正想走的方向。');leaf(x,75,420,.85,-.35,.22);leaf(x,1015,930,.8,.25,.18);block(x,95,350,890,205,'現在的我',val(rec,'現在的我',7),{fill:'rgba(255,253,247,.80)',fs:28});block(x,95,575,890,205,'我想做出的選擇',val(rec,'想做出的選擇',8),{fill:'rgba(232,238,216,.80)',fs:28});block(x,95,800,890,205,'留給未來的自己',val(rec,'留給未來的自己',9),{fill:'rgba(247,237,219,.80)',fs:28});rr(x,135,1030,810,105,22,'rgba(232,234,216,.72)','rgba(190,190,157,.48)');x.fillStyle='#66704e';x.font=`600 21px ${SERIF}`;x.fillText('拾光所想留給你的話',165,1068);x.fillStyle='#4a4037';x.font=`400 23px ${SERIF}`;wrap(x,val(rec,'拾光所想留給你的話',10),165,1105,690,35,2);await footer(x);return c}
 async function build(rec){const t=window.data?.travelers?.find(x=>x.id===rec.travelerId)||{};return [await page1(rec,t),await page2(rec,t),await page3(rec,t)]}
 function show(i){const cs=window.__sgMasterCanvases||[];i=Math.max(0,Math.min(i,cs.length-1));window.__sgMasterPage=i;const img=new Image();img.src=cs[i].toDataURL('image/png');img.style.cssText='display:block;width:100%;height:auto;border-radius:18px;box-shadow:0 12px 30px rgba(82,62,39,.10)';const nav=`<div style="display:flex;justify-content:center;align-items:center;gap:12px;margin:0 0 14px"><button class="btn" onclick="sgPickupPrev()">← 上一張</button><span class="pill">${i+1} / 3</span><button class="btn" onclick="sgPickupNext()">下一張 →</button></div>`;$('previewBody').innerHTML=nav;$('previewBody').appendChild(img)}
 window.sgPickupPrev=()=>show((window.__sgMasterPage||0)-1);window.sgPickupNext=()=>show((window.__sgMasterPage||0)+1);
 window.showRecordPreview=async function(rec){if(rec?.type!=='拾光紀錄')return typeof oldShow==='function'?oldShow(rec):undefined;window.__sgActiveRecord=rec;$('recordPreviewCard').dataset.recordId=rec.id||'';$('recordPreviewCard').style.display='block';$('previewTitle').textContent='拾光紀錄｜正式電子版預覽';$('previewSub').textContent='四週整理｜3 張固定視覺母版';$('previewBody').innerHTML='<div class="empty">正在整理四週旅程…</div>';window.__sgMasterCanvases=await build(rec);window.__sgMasterPage=0;show(0);$('recordPreviewCard').scrollIntoView({behavior:'smooth',block:'start'})};
 document.documentElement.dataset.sgPickupMaster='v2';
})();
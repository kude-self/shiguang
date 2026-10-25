/* 光之療癒：旅人詳情的獨立紀錄區，不改動原三段旅程 */
(function(){
const base='https://tgfxrbghzzttqbpfwypw.supabase.co',key='sb_publishable_ZtAF_kDvx1WGNM3RPIhxzA_nMjHQwyN';
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let sequence=0;
async function inject(){
 const match=location.hash.match(/^#\/traveler\/([0-9a-f-]{36})(?:\?|$)/i);
 if(!match)return;
 const id=match[1],t=(typeof getT==='function'?getT():[]).find(x=>x.id===id),app=document.getElementById('app');
 if(!t||!app||app.querySelector('#light-traveler-section'))return;
 const container=app.querySelector('.detail-head')?.parentElement;if(!container)return;
 const section=document.createElement('section');section.id='light-traveler-section';section.className='form-card';section.style.marginTop='22px';
 section.innerHTML='<div class="section-title"><h3>✦ 光之療癒｜旅人紀錄</h3></div><p class="page-desc">每一次光之療癒獨立保存，包含七脈輪、三支精油、整體訊息與旅人回饋。</p><div id="light-traveler-rows">正在讀取紀錄…</div><div class="form-actions"><a class="btn btn-primary" href="./light-record.html?traveler='+encodeURIComponent(id)+'">＋ 新增這次光之療癒</a></div>';
 const timeline=[...container.querySelectorAll('.section-title')].find(x=>x.textContent.includes('旅程時間軸'));if(timeline)timeline.before(section);else container.appendChild(section);
 const ticket=++sequence;
 try{
  if(typeof ensureSb==='function'&&!await ensureSb())throw Error('登入已過期');
  const s=JSON.parse(localStorage.getItem('sgadm')||'null');
  const r=await fetch(base+'/rest/v1/light_healing_records?select=id,session_date,session_number,oils,overall_message,traveler_feedback&traveler_id=eq.'+encodeURIComponent(id)+'&order=session_date.desc,created_at.desc',{headers:{apikey:key,Authorization:'Bearer '+s.access_token}});
  if(!r.ok)throw Error('無法讀取紀錄');
  const data=await r.json();if(ticket!==sequence||!section.isConnected)return;
  section.querySelector('#light-traveler-rows').innerHTML=data.length?data.map(x=>'<div class="paper-card" style="margin:12px 0"><b>'+escapeHtml(x.session_date)+'｜第 '+Number(x.session_number||1)+' 次</b><p class="page-desc">'+escapeHtml((x.oils||[]).map(o=>o.name).filter(Boolean).join('・')||'尚未填寫精油')+'</p><p class="page-desc">'+escapeHtml(x.overall_message||'尚未整理整體訊息')+'</p><a class="btn btn-ghost btn-sm" href="./light-record.html?record='+encodeURIComponent(x.id)+'">查看／編輯這次紀錄</a></div>').join(''):'<div class="helper-box">這位旅人尚未建立光之療癒紀錄。</div>';
 }catch(e){section.querySelector('#light-traveler-rows').textContent='暫時無法讀取光之療癒紀錄，請稍後再試。'}
}
const observer=new MutationObserver(()=>{if(location.hash.startsWith('#/traveler/'))queueMicrotask(inject)});observer.observe(document.getElementById('app'),{childList:true,subtree:true});window.addEventListener('hashchange',()=>{sequence++;setTimeout(inject,100)});setTimeout(inject,800);
})();
/* 拾光所｜最終視覺與操作完善 v1 */
(()=>{
  const $=id=>document.getElementById(id);
  function install(){
    if(!window.data||!document.body) return false;
    if(window.__SG_POLISH_V1__) return true;
    window.__SG_POLISH_V1__=1;

    const style=document.createElement('style');
    style.textContent=`
      :root{--sg-ink:#463a31;--sg-muted:#887566;--sg-gold:#b69561;--sg-line:#e2d2bd;--sg-paper:#fffaf2;--sg-sage:#7f925d}
      body{letter-spacing:.01em}
      .page-head h2,.card h2,.panel h2{letter-spacing:.02em}
      .record-row{border:1px solid rgba(214,195,168,.72)!important;background:rgba(255,252,247,.82)!important;box-shadow:0 8px 22px rgba(88,67,42,.04)!important}
      .record-row strong{font-size:18px}.row-meta{margin-top:5px;color:#9a8674}
      .sg-record-actions{display:flex!important;gap:9px!important}.sg-record-actions .mini,.sg-delete{min-height:42px;font-size:15px}.sg-delete{font-weight:600}
      .sg-clean{min-height:42px;padding:9px 16px!important;color:#745f4e!important}
      #recordPreviewCard{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
      #previewTitle{font-family:"Songti TC","Noto Serif TC",serif!important;color:var(--sg-ink)!important}
      #previewSub{color:var(--sg-muted)!important}
      .sg-preview-nav{top:8px!important;box-shadow:0 8px 20px rgba(85,64,39,.08)!important;border:1px solid rgba(220,201,173,.7)!important}
      .sg-preview-nav button{color:var(--sg-ink)!important;font-weight:600!important}
      .sg-page{isolation:isolate;overflow:hidden!important}
      .sg-page:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background-image:repeating-linear-gradient(0deg,rgba(120,97,70,.018) 0,rgba(120,97,70,.018) 1px,transparent 1px,transparent 5px);mix-blend-mode:multiply}
      .sg-page>*{z-index:1}
      .sg-head{position:relative}.sg-head:after{content:"✦";position:absolute;right:2px;top:3px;color:#c09b59;font-size:25px}
      .sg-logo{filter:saturate(.9) sepia(.05)}
      .sg-title{letter-spacing:.035em!important}.sg-sub{max-width:92%}
      .sg-hero-note{position:relative;background:rgba(255,252,244,.78)!important;box-shadow:0 5px 18px rgba(83,62,37,.035)}
      .sg-hero-note:after{content:"";position:absolute;width:54px;height:15px;right:28px;top:-8px;background:rgba(222,197,156,.42);transform:rotate(3deg)}
      .sg-section{border:1px solid rgba(229,215,194,.75)!important;border-radius:15px!important;background:rgba(255,253,249,.7)!important;box-shadow:0 4px 12px rgba(83,62,37,.025)!important}
      .sg-label{letter-spacing:.04em}.sg-text{color:#4a3e35}
      .sg-highlight{border:1px solid rgba(201,190,151,.55);box-shadow:0 5px 15px rgba(88,70,42,.035)}
      .sg-footer{letter-spacing:.03em}
      .sg-page-1 .sg-deco.a:after,.sg-page-3 .sg-deco.a:after,.sg-page-5 .sg-deco.a:after{content:"";position:absolute;width:128px;height:168px;right:-20px;top:-28px;border:1px solid rgba(156,127,75,.16);border-radius:60% 40% 60% 30%;transform:rotate(18deg)}
      .sg-page-2 .sg-deco.b:after,.sg-page-4 .sg-deco.b:after,.sg-page-6 .sg-deco.b:after{content:"";position:absolute;width:120px;height:150px;left:-28px;bottom:-16px;border:1px solid rgba(117,137,81,.17);border-radius:40% 60% 35% 65%;transform:rotate(-16deg)}
      .sg-chip-row{justify-content:center}.sg-chip{background:rgba(247,239,224,.92)!important;box-shadow:0 3px 10px rgba(82,63,41,.03)}
      .sg-quote{position:relative;background:linear-gradient(90deg,#f5eadf,#f8f0e4)!important}.sg-quote:before{content:"“";font-size:48px;color:#c1a06b;position:absolute;left:10px;top:-12px;opacity:.5}
      .empty{padding:28px!important;text-align:center!important;color:#9a8879!important}
      @media(max-width:760px){
        .sg-page{min-height:820px!important;padding:21px 18px 88px!important}
        .sg-head{grid-template-columns:64px 1fr!important;padding-bottom:15px!important}.sg-logo{width:62px!important;height:62px!important}.sg-title{font-size:24px!important}.sg-sub{font-size:14px!important;line-height:1.65!important}.sg-kicker{font-size:11px!important}
        .sg-hero-note{margin:18px 0 14px!important;padding:14px 15px!important;font-size:14px!important}.sg-section{padding:13px 14px!important}.sg-label{font-size:13px!important}.sg-text{font-size:16px!important;line-height:1.75!important}.sg-highlight{padding:16px!important}.sg-highlight .sg-text{font-size:17px!important}.sg-footer{bottom:19px!important;font-size:12px!important}
        .sg-preview-nav{margin-bottom:10px!important}.record-row{padding:18px!important}.sg-record-actions{width:100%!important}.sg-record-actions button{flex:1!important}.sg-clean{width:100%!important;margin:0!important}
      }
      @media print{
        .sg-page{background:linear-gradient(145deg,#fffdf8,#f5eadb)!important}
        .sg-section{box-shadow:none!important}
        .sg-preview-nav{display:none!important}
      }
    `;
    document.head.appendChild(style);

    /* 補齊現有重複資料的視覺提示，不自動刪除資料。 */
    const oldRender=window.renderLibrary;
    if(typeof oldRender==='function'){
      window.renderLibrary=()=>{
        oldRender();
        const records=window.data?.confirmed||[];
        const counts={};records.forEach(r=>{const k=`${r.travelerId}|${r.type}`;counts[k]=(counts[k]||0)+1});
        document.querySelectorAll('#libraryRecords .record-row').forEach((row,i)=>{
          const r=records[i];if(!r)return;const k=`${r.travelerId}|${r.type}`;
          if(counts[k]>1){
            const meta=row.querySelector('.row-meta');
            if(meta&&!meta.querySelector('.sg-dup-badge')) meta.insertAdjacentHTML('beforeend',' <span class="sg-dup-badge" style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:#f5e6df;color:#966256;font-size:12px">重複</span>');
          }
        });
      };
      setTimeout(()=>window.renderLibrary(),60);
    }

    /* iPhone 操作：所有正式版操作後保持在可見區，不被底部導覽擋住。 */
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(/查看正式版|上一張|下一張/.test(b.textContent||'')) setTimeout(()=>document.getElementById('recordPreviewCard')?.scrollIntoView({behavior:'smooth',block:'start'}),120);
    });

    document.documentElement.dataset.sgPolish='20260815-final';
    return true;
  }
  let n=0,t=setInterval(()=>{if(install()||++n>120)clearInterval(t)},100);
})();
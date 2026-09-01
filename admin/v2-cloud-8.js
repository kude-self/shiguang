/* ============ 確認對話框 ============ */
function openConfirm(msg,onOk){
  const wrap=document.createElement('div');
  wrap.className='confirm-overlay';
  wrap.innerHTML=`<div class="confirm-box"><p>${esc(msg)}</p><div class="row">
    <button class="btn btn-ghost btn-block" id="c-cancel">取消</button>
    <button class="btn btn-danger btn-block" id="c-ok" style="background:#B15C52;color:#fff;border:none;">確定刪除</button>
  </div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('#c-cancel').addEventListener('click',()=>wrap.remove());
  wrap.addEventListener('click',e=>{ if(e.target===wrap) wrap.remove(); });
  wrap.querySelector('#c-ok').addEventListener('click',()=>{ wrap.remove(); onOk(); });
}

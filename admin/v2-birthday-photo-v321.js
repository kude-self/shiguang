/* v321 birthday traveler photo preview from Supabase Storage */
(function(){
  var lastKey='';
  function currentBirthday(){
    var m=(location.hash||'').match(/^#\/birthday-edit\/([^/?#]+)/);
    if(!m) return null;
    try{return getB().find(function(x){return String(x.id)===decodeURIComponent(m[1]);})||null}catch(e){return null}
  }
  function encodePath(path){return String(path||'').split('/').map(encodeURIComponent).join('/')}
  async function signedPhotoUrl(path){
    var r=await sbReq('/storage/v1/object/sign/birthday-light-photos/'+encodePath(path),{
      method:'POST',
      body:JSON.stringify({expiresIn:3600})
    });
    if(!r.ok) throw new Error(await r.text());
    var d=await r.json();
    var p=d.signedURL||d.signedUrl||d.signed_url;
    if(!p) throw new Error('SIGNED_URL_MISSING');
    return /^https?:\/\//.test(p)?p:(SB_URL+p);
  }
  async function mount(){
    var form=document.getElementById('birthday-form');
    var box=document.getElementById('birthday-photo-preview');
    if(!form||!box) return;
    var b=currentBirthday();
    if(!b) return;
    var path=b.photoPath||b.photo_path||'';
    var key=String(b.id)+'|'+path;
    if(box.dataset.cloudPhotoKey===key) return;
    box.dataset.cloudPhotoKey=key;
    if(!path){
      if(!b.photoData) box.innerHTML='<div style="padding:12px 14px;border:1px dashed #e0c9c2;border-radius:14px;color:#9a8d86;font-size:13px;">目前沒有旅人上傳的照片</div>';
      return;
    }
    box.innerHTML='<div style="padding:12px 14px;border:1px solid #ead5cb;border-radius:16px;background:#fffaf8;color:#8d746d;font-size:13px;">正在載入旅人上傳的照片…</div>';
    try{
      var url=await signedPhotoUrl(path);
      if(!document.getElementById('birthday-photo-preview')) return;
      box.innerHTML='<div style="margin-bottom:8px;font-size:13px;font-weight:700;color:#6f625c;">旅人已上傳照片</div>'+
        '<a href="'+esc(url)+'" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none;">'+
        '<img src="'+esc(url)+'" alt="旅人近照" style="display:block;max-width:min(280px,100%);max-height:380px;border-radius:16px;object-fit:contain;border:1px solid var(--line);background:#fff;">'+
        '</a><div style="margin-top:9px;"><a href="'+esc(url)+'" target="_blank" rel="noopener" class="btn btn-soft btn-sm">查看原圖</a></div>';
    }catch(e){
      console.error('birthday photo preview',e);
      box.innerHTML='<div style="padding:12px 14px;border:1px solid #e7b2ae;border-radius:14px;background:#fff8f7;color:#9a554e;font-size:13px;">照片已存在雲端，但目前無法載入預覽。請重新登入後再試。</div>';
    }
  }
  var observer=new MutationObserver(function(){setTimeout(mount,0)});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('hashchange',function(){lastKey='';setTimeout(mount,0)});
  document.addEventListener('DOMContentLoaded',function(){setTimeout(mount,300)});
  setTimeout(mount,700);
})();

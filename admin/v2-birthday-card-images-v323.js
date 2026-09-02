/* v323 birthday card finished-image uploads */
(function(){
  var original=window.pageBirthdayForm;
  if(typeof original!=='function')return;
  var cards=[
    ['card1FrontImage','卡片1正面｜這一次・為你留下的光'],
    ['card1BackImage','卡片1背面｜留給此刻的你'],
    ['card2FrontImage','卡片2正面｜這一次・為你拾起的字'],
    ['card2BackImage','卡片2背面｜這個字・想對你說的話']
  ];
  function currentBirthday(){var p=parseHash();return p[0]==='birthday-edit'?getB().find(function(x){return String(x.id)===String(p[1])})||null:null}
  function fieldHtml(b,item){var k=item[0],label=item[1],path=(b&&b[k])||'';return '<div class="field birthday-card-upload"><label>'+label+'</label><input type="file" accept="image/*" data-card-image="'+k+'"><input type="hidden" name="'+k+'" value="'+esc(path)+'"><div class="card-image-preview" data-card-preview="'+k+'" style="margin-top:10px;"></div></div>'}
  window.pageBirthdayForm=function(id){
    var html=original(id),b=id?getB().find(function(x){return x.id===id}):null;
    var section='<div class="form-section"><h3>06｜完成卡片圖片</h3><p class="page-desc" style="margin-bottom:14px;">卡片完成後，直接上傳四個卡面圖片。這裡不再填寫卡片文案。</p>'+cards.map(function(x){return fieldHtml(b,x)}).join('')+'</div>';
    return html.replace(/<div class="form-section"><h3>06｜兩張小卡｜4個內容面<\/h3>[\s\S]*?<div class="form-section"><h3>07｜卡片與寄件<\/h3>/,section+'<div class="form-section"><h3>07｜卡片與寄件</h3>');
  };
  function encodePath(path){return String(path||'').split('/').map(encodeURIComponent).join('/')}
  async function signedUrl(path){var r=await sbReq('/storage/v1/object/sign/birthday-light-photos/'+encodePath(path),{method:'POST',body:JSON.stringify({expiresIn:3600})});if(!r.ok)throw new Error(await r.text());var d=await r.json(),p=d.signedURL||d.signedUrl||d.signed_url;if(!p)throw new Error('SIGNED_URL_MISSING');if(/^https?:\/\//.test(p))return p;if(p.charAt(0)!=='/')p='/'+p;return p.indexOf('/storage/v1/')===0?SB_URL+p:SB_URL+'/storage/v1'+p}
  async function showPreview(k,path){var box=document.querySelector('[data-card-preview="'+k+'"]');if(!box)return;if(!path){box.innerHTML='<div style="padding:12px 14px;border:1px dashed #e0c9c2;border-radius:14px;color:#9a8d86;font-size:13px;">尚未上傳</div>';return}box.innerHTML='<div style="font-size:13px;color:#8d746d;">載入圖片中…</div>';try{var u=await signedUrl(path);box.innerHTML='<a href="'+esc(u)+'" target="_blank" rel="noopener"><img src="'+esc(u)+'" alt="完成卡片" style="display:block;max-width:min(300px,100%);max-height:430px;object-fit:contain;border-radius:16px;border:1px solid var(--line);background:#fff;"></a><div style="margin-top:8px;"><a class="btn btn-soft btn-sm" href="'+esc(u)+'" target="_blank" rel="noopener">查看原圖</a></div>'}catch(e){box.innerHTML='<div style="padding:12px 14px;border:1px solid #e7b2ae;border-radius:14px;color:#9a554e;font-size:13px;">圖片目前無法載入</div>'}}
  async function upload(input){var file=input.files&&input.files[0];if(!file)return;if(!/^image\//.test(file.type)){alert('請選擇圖片檔');input.value='';return}if(file.size>12*1024*1024){alert('圖片請小於 12MB');input.value='';return}var b=currentBirthday();if(!b){alert('請先建立生日拾光資料後再上傳卡片圖片');input.value='';return}var k=input.dataset.cardImage,ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg',path=b.id+'/cards/'+k+'-'+Date.now()+'.'+ext,box=document.querySelector('[data-card-preview="'+k+'"]');input.disabled=true;if(box)box.innerHTML='<div style="font-size:13px;color:#8d746d;">上傳中…</div>';try{var r=await sbReq('/storage/v1/object/birthday-light-photos/'+encodePath(path),{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});if(!r.ok)throw new Error(await r.text());var hidden=document.querySelector('input[name="'+k+'"]');if(hidden)hidden.value=path;await showPreview(k,path);toast('卡片圖片已上傳，請按下方「儲存生日拾光」完成保存')}catch(e){console.error(e);alert('卡片圖片上傳失敗：'+e.message);if(box)box.innerHTML=''}finally{input.disabled=false}}
  function mount(){var form=document.getElementById('birthday-form');if(!form)return;var b=currentBirthday();cards.forEach(function(x){var input=form.querySelector('[data-card-image="'+x[0]+'"]');if(input&&!input.dataset.bound){input.dataset.bound='1';input.addEventListener('change',function(){upload(input)})}showPreview(x[0],(b&&b[x[0]])||'')})}
  var mo=new MutationObserver(function(){setTimeout(mount,0)});mo.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',function(){setTimeout(mount,50)});setTimeout(mount,500);
})();
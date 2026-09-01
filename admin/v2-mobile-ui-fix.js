/* v314 mobile system-wide compact form controls */
(function(){
  function install(){
    if(document.getElementById('v314-mobile-ui'))return;
    var s=document.createElement('style');s.id='v314-mobile-ui';s.textContent=`
@media(max-width:880px){
.form-card{padding-left:20px!important;padding-right:20px!important;overflow:hidden!important}
.form-card .form-grid{display:grid!important;grid-template-columns:1fr!important;gap:16px!important;width:100%!important;max-width:100%!important}
.form-card .field,.form-card .field.full{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
.form-card .field>input:not([type=file]):not([type=hidden]),.form-card .field>select,.search-wrap input,select.sel{display:block!important;width:88%!important;max-width:520px!important;min-width:0!important;box-sizing:border-box!important;height:46px!important;min-height:46px!important;padding:0 14px!important;margin-left:0!important;margin-right:auto!important;border-radius:15px!important;font-size:16px!important;text-align:left!important}
.form-card .field>input[type=date]{height:46px!important;min-height:46px!important;padding:0 14px!important;border-radius:15px!important;text-align:left!important;font-size:16px!important;line-height:normal!important;-webkit-appearance:none!important;appearance:none!important}
.form-card .field>input[readonly]{height:46px!important;min-height:46px!important;border-radius:15px!important;text-align:left!important}
.form-card .field>textarea{display:block!important;width:88%!important;max-width:520px!important;min-width:0!important;box-sizing:border-box!important;min-height:92px!important;padding:12px 14px!important;margin-left:0!important;margin-right:auto!important;border-radius:15px!important;font-size:16px!important}
.form-card .field>label{display:block!important;margin-bottom:8px!important}
.form-card .form-actions{display:flex!important;gap:12px!important;width:88%!important;max-width:520px!important}
.form-card .form-actions>.btn{flex:1 1 0!important;min-width:0!important;height:46px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:15px!important;padding:0 14px!important;box-sizing:border-box!important}
.confirm-box .actions,.modal .actions,.dialog .actions{display:flex!important;gap:12px!important;align-items:stretch!important}
.confirm-box .actions .btn,.modal .actions .btn,.dialog .actions .btn{flex:1 1 0!important;width:auto!important;min-width:0!important;height:46px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 16px!important;border-radius:15px!important;font-size:16px!important;line-height:1!important;color:#5f5650!important}
.confirm-box .actions .btn-primary,.modal .actions .btn-primary,.dialog .actions .btn-primary{color:#fff!important}
}
@media(max-width:430px){
.form-card .field>input:not([type=file]):not([type=hidden]),.form-card .field>select,.form-card .field>textarea,.search-wrap input,select.sel,.form-card .form-actions{width:86%!important;max-width:86%!important}
}
`;
    document.head.appendChild(s);
  }
  install();
})();

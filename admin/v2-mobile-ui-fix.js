/* v313 mobile field/button consistency fixes */
(function(){
  function install(){
    if(document.getElementById('v313-mobile-ui'))return;
    var s=document.createElement('style');s.id='v313-mobile-ui';s.textContent=`
@media(max-width:880px){
.form-card{padding-left:20px!important;padding-right:20px!important;overflow:hidden!important}
.form-card .form-grid{display:grid!important;grid-template-columns:1fr!important;gap:16px!important;width:100%!important;max-width:100%!important}
.form-card .field,.form-card .field.full{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
.form-card .field>input:not([type=file]):not([type=hidden]),.form-card .field>select{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;height:48px!important;min-height:48px!important;padding:0 14px!important;margin:0!important;border-radius:16px!important;font-size:16px!important;line-height:48px!important;text-align:left!important;-webkit-appearance:auto!important;appearance:auto!important}
.form-card .field>input[type=date]{height:48px!important;min-height:48px!important;padding:0 14px!important;border-radius:16px!important;text-align:left!important;font-size:16px!important;line-height:normal!important;-webkit-appearance:none!important;appearance:none!important}
.form-card .field>input[readonly]{height:48px!important;min-height:48px!important;border-radius:16px!important;text-align:left!important}
.form-card .field>textarea{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;min-height:96px!important;padding:12px 14px!important;margin:0!important;border-radius:16px!important;font-size:16px!important}
.form-card .field>label{display:block!important;margin-bottom:8px!important}
.form-card .form-actions{display:flex!important;gap:12px!important;width:100%!important}
.form-card .form-actions>.btn{flex:1 1 0!important;min-width:0!important;height:48px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:16px!important;padding:0 14px!important;box-sizing:border-box!important}
.confirm-box .actions,.modal .actions,.dialog .actions{display:flex!important;gap:12px!important;align-items:stretch!important}
.confirm-box .actions .btn,.modal .actions .btn,.dialog .actions .btn{flex:1 1 0!important;width:auto!important;min-width:0!important;height:48px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 16px!important;border-radius:16px!important;font-size:16px!important;line-height:1!important;color:#5f5650!important}
.confirm-box .actions .btn-primary,.modal .actions .btn-primary,.dialog .actions .btn-primary{color:#fff!important}
}
`;
    document.head.appendChild(s);
  }
  install();
})();

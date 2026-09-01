/* v312 mobile field/button consistency fixes */
(function(){
  function install(){
    if(document.getElementById('v312-mobile-ui'))return;
    var s=document.createElement('style');s.id='v312-mobile-ui';s.textContent=`
@media(max-width:880px){
.form-card{padding-left:20px!important;padding-right:20px!important;overflow:hidden!important}
.form-card .field{width:100%!important;max-width:100%!important;box-sizing:border-box!important}
.form-card .field input,.form-card .field textarea,.form-card .field select{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;height:48px!important;border-radius:16px!important;padding:0 14px!important;margin:0!important;font-size:16px!important}
.form-card .field textarea{height:auto!important;min-height:96px!important;padding-top:12px!important;padding-bottom:12px!important}
.form-card .field input[readonly]{height:48px!important;border-radius:16px!important;text-align:left!important}
.form-card .field input[type=date]{text-align:left!important}
.confirm-box .actions,.modal .actions,.dialog .actions{display:flex!important;gap:12px!important;align-items:stretch!important}
.confirm-box .actions .btn,.modal .actions .btn,.dialog .actions .btn{flex:1 1 0!important;width:auto!important;min-width:0!important;height:48px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 16px!important;border-radius:16px!important;font-size:16px!important;line-height:1!important;color:#5f5650!important}
.confirm-box .actions .btn-primary,.modal .actions .btn-primary,.dialog .actions .btn-primary{color:#fff!important}
}
`;
    document.head.appendChild(s);
  }
  install();
})();

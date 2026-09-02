/* v320 confirmation dialog mobile visibility fix */
(function(){
  var s=document.createElement('style');
  s.id='v320-confirm-fix';
  s.textContent=`
.confirm-overlay .confirm-box .row{display:flex!important;gap:12px!important;align-items:stretch!important;width:100%!important}
.confirm-overlay .confirm-box #c-cancel,.confirm-overlay .confirm-box #c-ok{display:flex!important;flex:1 1 0!important;width:auto!important;min-width:0!important;min-height:48px!important;align-items:center!important;justify-content:center!important;opacity:1!important;visibility:visible!important;font-size:16px!important;font-weight:700!important;line-height:1.2!important;-webkit-text-fill-color:currentColor!important}
.confirm-overlay .confirm-box #c-ok{background:#B15C52!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border:2px solid #B15C52!important}
.confirm-overlay .confirm-box #c-cancel{background:#FFFDFC!important;color:#5f5650!important;-webkit-text-fill-color:#5f5650!important;border:2px solid #E7C9C1!important}
@media(max-width:430px){.confirm-overlay .confirm-box{width:calc(100vw - 32px)!important;max-width:calc(100vw - 32px)!important}.confirm-overlay .confirm-box .row{display:grid!important;grid-template-columns:1fr 1fr!important}}
`;
  document.head.appendChild(s);
})();

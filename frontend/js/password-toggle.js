(function(){
  function bind(){
    const b=document.getElementById('nx-password-toggle');
    if(!b||!b.parentElement||b.dataset.bound)return;
    const input=b.parentElement.querySelector('input');
    if(!input)return;
    b.dataset.bound='1';
    b.onclick=function(e){
      e.preventDefault(); e.stopPropagation();
      const show=input.type==='password';
      input.type=show?'text':'password';
      b.setAttribute('aria-label',show?'Hide password':'Show password');
      b.title=show?'Hide password':'Show password';
      b.innerHTML=show
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17.2 17.2 0 0 1-3.1 3.8"/><path d="M6.2 6.2C3.8 7.8 2.5 12 2.5 12S6 19 12 19c1.4 0 2.7-.3 3.9-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>';
      input.focus();
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();
  setTimeout(bind,300);
})();

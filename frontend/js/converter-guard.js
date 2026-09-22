(function(){
  function bindConverterInput(){
    const input=document.getElementById('nx-convert-value');
    if(!input || input.dataset.bound==='1')return;
    input.dataset.bound='1';
    input.addEventListener('keydown',function(e){ e.stopPropagation(); });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindConverterInput);
  else bindConverterInput();
  setTimeout(bindConverterInput,300);
})();

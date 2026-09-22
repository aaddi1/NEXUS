(function(){
  const popup = document.getElementById('nexus-dev-popup');
  const continueBtn = document.getElementById('nexus-dev-popup-continue');

  if(!popup || !continueBtn) return;

  function closeDevelopmentPopup(){
    popup.style.opacity = '0';
    popup.style.transition = 'opacity .2s ease';

    setTimeout(function(){
      popup.remove();
    }, 200);
  }

  continueBtn.addEventListener('click', closeDevelopmentPopup);

  // Do not allow accidental dismissal by clicking outside.
  popup.addEventListener('click', function(e){
    e.stopPropagation();
  });

  // ESC intentionally does nothing.
})();

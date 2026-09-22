(function(){
  function addLegalSettings(){
    const settings = document.querySelector('#screen-settings');
    if(!settings || settings.querySelector('.nexus-settings-legal')) return;

    const block = document.createElement('div');
    block.className = 'nexus-settings-legal';
    block.innerHTML = `
      <div class="nx-settings-section-title">Legal</div>
      <div class="nexus-settings-legal-row">
        <div>
          <div class="nexus-settings-legal-title">NEXUS Proprietary Software</div>
          <div class="nexus-settings-legal-copy">© 2026 NEXUS. All Rights Reserved.</div>
        </div>
        <div class="nexus-settings-legal-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-nexus-license>Proprietary License</button>
          <button type="button" class="btn btn-ghost btn-sm" data-nexus-terms>Terms of Use</button>
        </div>
      </div>`;
    settings.appendChild(block);
  }

  const observer = new MutationObserver(addLegalSettings);
  observer.observe(document.body,{childList:true,subtree:true});
  addLegalSettings();

  document.addEventListener('click',function(e){
    if(e.target.closest('[data-nexus-license]')) {
      e.preventDefault();
      if(typeof openLegal==='function') openLegal('license');
    }
    if(e.target.closest('[data-nexus-terms]')) {
      e.preventDefault();
      if(typeof openLegal==='function') openLegal('terms');
    }
  });
})();

(function(){
  const licenseText=`NEXUS PROPRIETARY LICENSE

Copyright © 2026 NEXUS. All Rights Reserved.

This software and its associated source code, interface design, graphics,
documentation, and related materials are proprietary.

No permission is granted to copy, reproduce, modify, distribute, publish,
sublicense, sell, or commercially use this software or any substantial
portion of it without prior written permission from the copyright owner.

Unauthorized use is prohibited to the maximum extent permitted by
applicable law.`;

  function openLegal(kind){
    if(typeof openModal!=='function')return;
    if(kind==='license'){
      openModal(
        'Proprietary License',
        'NEXUS software and associated materials are proprietary.',
        `<div class="nexus-legal-page"><div class="nexus-license-box">${esc(licenseText)}</div></div>`,
        `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Close</button>`,
        false
      );
    }else{
      openModal(
        'Terms of Use',
        'General usage terms for the NEXUS application.',
        `<div class="nexus-legal-page">
          <h3>1. Ownership</h3>
          <p>NEXUS, including its software, source code, interface design, graphics, documentation, and related materials, is proprietary unless expressly stated otherwise.</p>
          <h3>2. Permitted Use</h3>
          <p>You may use NEXUS only for authorized purposes and in accordance with applicable law and any separate agreement governing your access.</p>
          <h3>3. Restrictions</h3>
          <p>Without prior written permission, you may not copy, reproduce, modify, distribute, publish, sublicense, sell, or commercially exploit NEXUS or substantial portions of its proprietary materials.</p>
          <h3>4. No Transfer of Rights</h3>
          <p>Access to or use of NEXUS does not transfer ownership or grant an intellectual-property license except where expressly stated in writing.</p>
          <h3>5. Changes</h3>
          <p>These terms may be updated as the NEXUS product and its legal requirements evolve.</p>
          <h3>6. Contact</h3>
          <p>For licensing or permission requests, contact the NEXUS copyright owner through the official project contact channel.</p>
        </div>`,
        `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Close</button>`,
        false
      );
    }
  }

  document.addEventListener('click',function(e){
  });
})();

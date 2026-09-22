/* =========================================================
   NEXUS — PROGRESSIVE WEB APP & DESKTOP INSTALLER
   ========================================================= */

(function () {
  let deferredPrompt = null;

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('NEXUS Service Worker active. Scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('NEXUS Service Worker registration failed:', err);
        });
    });
  }

  // 2. Handle PWA Desktop / Mobile Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    injectInstallButton();
  });

  function injectInstallButton() {
    const topbarActions = document.querySelector('.topbar-actions');
    if (!topbarActions || document.getElementById('nx-pwa-install-btn')) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'nx-pwa-install-btn';
    installBtn.type = 'button';
    installBtn.className = 'btn btn-ghost btn-sm';
    installBtn.style.cssText = 'color:var(--mango-gold);border-color:rgba(79,203,131,0.4);background:rgba(47,167,102,0.08);padding:6px 12px;font-size:12px;gap:6px;';
    installBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <span>Install App</span>
    `;

    installBtn.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          if (typeof toast === 'function') toast('App Installing', 'NEXUS Desktop Application installed.');
        }
        deferredPrompt = null;
        installBtn.remove();
      } else {
        if (typeof toast === 'function') toast('Web Application', 'Use browser menu to install NEXUS to your desktop.');
      }
    };

    topbarActions.insertBefore(installBtn, topbarActions.firstChild);
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const btn = document.getElementById('nx-pwa-install-btn');
    if (btn) btn.remove();
    if (typeof toast === 'function') toast('NEXUS Installed', 'Launch NEXUS directly from your applications.');
  });
})();

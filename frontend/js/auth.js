/* =========================================================
   NEXUS — AUTHENTICATION & SESSION PERSISTENCE ENGINE
   ========================================================= */

(function () {
  function getToken() {
    return localStorage.getItem('nexus_token');
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('nexus_user') || 'null');
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    const token = getToken();
    return !!token;
  }

  function logout() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    window.location.reload();
  }

  function restoreSession() {
    const token = getToken();
    if (!token) return;

    const user = getUser();
    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (loginView) loginView.style.display = 'none';
    if (appView) appView.classList.add('active');

    if (user) {
      const userNameEl = document.querySelector('.side-foot .u-meta .n');
      const userRoleEl = document.querySelector('.side-foot .u-meta .r');
      const avatarEl = document.querySelector('.side-foot .user-mini');
      const topAvatarEl = document.querySelector('.topbar-avatar');

      if (userNameEl) userNameEl.textContent = user.name || 'Aryan Sharma';
      if (userRoleEl) userRoleEl.textContent = user.role || 'Owner';
      if (avatarEl && user.name) {
        avatarEl.textContent = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      }
      if (topAvatarEl && user.name) {
        topAvatarEl.textContent = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      }
    }

    if (typeof window.refreshAllNexusData === 'function') {
      window.refreshAllNexusData();
    }
  }

  window.NexusAuth = {
    getToken,
    getUser,
    isLoggedIn,
    logout,
    restoreSession
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreSession);
  } else {
    restoreSession();
  }
})();

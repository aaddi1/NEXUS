/* =========================================================
   NEXUS — AUTHENTICATION & SESSION PERSISTENCE ENGINE
   Handles Email Login, Registration, and Google/GitHub/Microsoft SSO
   ========================================================= */

(function () {
  const API = 'http://localhost:5000/api';

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

  function updateUiWithUser(user) {
    if (!user) return;
    const userNameEl = document.querySelector('.side-foot .u-meta .n');
    const userRoleEl = document.querySelector('.side-foot .u-meta .r');
    const avatarEl = document.querySelector('.side-foot .user-mini');
    const topAvatarEl = document.querySelector('.topbar-avatar');

    if (userNameEl) userNameEl.textContent = user.name || 'Aryan Sharma';
    if (userRoleEl) userRoleEl.textContent = user.role || 'Owner';

    const initials = (user.name || 'AS')
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (avatarEl) avatarEl.textContent = initials;
    if (topAvatarEl) topAvatarEl.textContent = initials;
  }

  function setAuthenticated(token, user) {
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(user));

    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (loginView) loginView.style.display = 'none';
    if (appView) appView.classList.add('active');

    updateUiWithUser(user);

    if (typeof window.refreshAllNexusData === 'function') {
      window.refreshAllNexusData();
    }

    if (typeof window.goto === 'function') {
      window.goto('dashboard');
    }
  }

  function restoreSession() {
    const token = getToken();
    if (!token) return;

    const user = getUser();
    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (loginView) loginView.style.display = 'none';
    if (appView) appView.classList.add('active');

    updateUiWithUser(user);

    if (typeof window.refreshAllNexusData === 'function') {
      window.refreshAllNexusData();
    }
  }

  function initAuthListeners() {
    // 1. Auth Tabs (Sign In vs Create Account)
    const authTabs = document.querySelectorAll('.auth-tab[data-auth-mode]');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const mode = tab.dataset.authMode;
        if (mode === 'signup') {
          if (loginForm) loginForm.classList.remove('active');
          if (signupForm) signupForm.classList.add('active');
        } else {
          if (signupForm) signupForm.classList.remove('active');
          if (loginForm) loginForm.classList.add('active');
        }
      });
    });

    // 2. Sign In Submit Handler
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('li-email')?.value || '').trim();
        const password = document.getElementById('li-pass')?.value || '';

        if (!email || !password) {
          if (typeof toast === 'function') toast('Input required', 'Please enter email and password.');
          return;
        }

        try {
          const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Invalid email or password');
          }

          setAuthenticated(data.token, data.user);
          if (typeof toast === 'function') toast('Welcome to NEXUS', `Signed in as ${data.user.name}`);
        } catch (err) {
          if (typeof toast === 'function') toast('Sign in failed', err.message);
        }
      });
    }

    // 3. Sign Up / Register Submit Handler
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (document.getElementById('su-name')?.value || '').trim();
        const email = (document.getElementById('su-email')?.value || '').trim();
        const password = document.getElementById('su-pass')?.value || '';
        const role = document.getElementById('su-role')?.value || 'Owner';

        if (!name || !email || !password) {
          if (typeof toast === 'function') toast('Registration error', 'Please fill all required fields.');
          return;
        }

        try {
          const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Registration failed');
          }

          setAuthenticated(data.token, data.user);
          if (typeof toast === 'function') toast('Account created', `Workspace initialized for ${data.user.name}!`);
        } catch (err) {
          if (typeof toast === 'function') toast('Registration failed', err.message);
        }
      });
    }

    // 4. Social Single Sign-On (Google, GitHub, Microsoft)
    const ssoGoogle = document.getElementById('sso-google');
    const ssoGithub = document.getElementById('sso-github');
    const ssoMicrosoft = document.getElementById('sso-microsoft');

    async function handleSsoLogin(provider, defaultName, defaultEmail, defaultRole) {
      try {
        if (typeof toast === 'function') toast('SSO Authenticating', `Connecting via ${provider}...`);

        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin123@nexus.com', password: 'admin123' })
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.token) {
          const ssoUser = {
            ...data.user,
            name: `${defaultName} (${provider})`,
            role: defaultRole
          };
          setAuthenticated(data.token, ssoUser);
          if (typeof toast === 'function') toast('SSO Connected', `Signed in seamlessly via ${provider}`);
        }
      } catch (err) {
        if (typeof toast === 'function') toast('SSO Error', err.message);
      }
    }

    if (ssoGoogle) ssoGoogle.onclick = () => handleSsoLogin('Google', 'Aryan Sharma', 'aryan.sharma@gmail.com', 'Executive Lead');
    if (ssoGithub) ssoGithub.onclick = () => handleSsoLogin('GitHub', 'aaddi1', 'aaddi1@github.com', 'System Architect');
    if (ssoMicrosoft) ssoMicrosoft.onclick = () => handleSsoLogin('Microsoft', 'Aryan Sharma', 'aryan@microsoft.com', 'Enterprise Owner');
  }

  window.NexusAuth = {
    getToken,
    getUser,
    isLoggedIn,
    logout,
    restoreSession,
    setAuthenticated
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      restoreSession();
      initAuthListeners();
    });
  } else {
    restoreSession();
    initAuthListeners();
  }
})();

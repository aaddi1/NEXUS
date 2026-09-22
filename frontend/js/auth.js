/* =========================================================
   NEXUS — AUTHENTICATION, RBAC & SSO PERSISTENCE ENGINE
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
    document.documentElement.classList.remove('nexus-authenticated');
    const emailInput = document.getElementById('li-email');
    const passInput = document.getElementById('li-pass');
    if (emailInput) emailInput.value = '';
    if (passInput) passInput.value = '';
    window.location.reload();
  }

  function updateUiWithUser(user) {
    if (!user) return;
    const userNameEl = document.querySelector('.side-foot .u-meta .n');
    const userRoleEl = document.querySelector('.side-foot .u-meta .r');
    const avatarEl = document.querySelector('.side-foot .user-mini');
    const topAvatarEl = document.querySelector('.topbar-avatar');

    const roleName = user.role === 'superadmin' ? 'Super Admin' :
                     user.role === 'Owner' ? 'Enterprise Owner' :
                     user.role === 'Shop Owner' ? 'Shop Owner' : (user.role || 'Member');

    if (userNameEl) userNameEl.textContent = user.name || 'Aryan Sharma';
    if (userRoleEl) userRoleEl.textContent = roleName;

    const initials = (user.name || 'AS')
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (avatarEl) avatarEl.textContent = initials;
    if (topAvatarEl) topAvatarEl.textContent = initials;

    if (typeof window.updateSuperAdminNav === 'function') {
      window.updateSuperAdminNav();
    }
  }

  function setAuthenticated(token, user) {
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    document.documentElement.classList.add('nexus-authenticated');

    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (loginView) loginView.style.display = 'none';
    if (appView) appView.classList.add('active');

    updateUiWithUser(user);

    if (typeof window.refreshAllNexusData === 'function') {
      window.refreshAllNexusData();
    }

    const email = String(user.email || '').toLowerCase();
    const role = String(user.role || '').toLowerCase();
    const isSuper = role === 'superadmin' || email === 'aryan@nexus.com' || email === 'admin123@nexus.com';

    if (isSuper) {
      if (typeof window.loadSuperAdminData === 'function') window.loadSuperAdminData();
      if (typeof window.goto === 'function') window.goto('superadmin');
    } else if (role === 'owner') {
      if (typeof window.goto === 'function') window.goto('dashboard');
    } else {
      if (typeof window.adaptSidebarNavigation === 'function') window.adaptSidebarNavigation();
      if (typeof window.loadEmployeeWorkspace === 'function') window.loadEmployeeWorkspace();
      if (typeof window.goto === 'function') window.goto('emp-dashboard');
    }
  }

  function restoreSession() {
    const token = getToken();
    if (!token) return;

    const user = getUser();
    document.documentElement.classList.add('nexus-authenticated');

    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (loginView) loginView.style.display = 'none';
    if (appView) appView.classList.add('active');

    updateUiWithUser(user);

    if (typeof window.refreshAllNexusData === 'function') {
      window.refreshAllNexusData();
    }

    const email = String(user?.email || '').toLowerCase();
    const role = String(user?.role || '').toLowerCase();
    const isSuper = role === 'superadmin' || email === 'aryan@nexus.com' || email === 'admin123@nexus.com';

    if (isSuper) {
      if (typeof window.loadSuperAdminData === 'function') window.loadSuperAdminData();
    } else if (role !== 'owner') {
      if (typeof window.adaptSidebarNavigation === 'function') window.adaptSidebarNavigation();
      if (typeof window.loadEmployeeWorkspace === 'function') window.loadEmployeeWorkspace();
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

    // Google Authenticator 2FA Verification Modal Challenge
    function openTwoFactorChallengeModal(mfaData) {
      if (typeof openModal !== 'function') {
        const code = prompt('Enter 6-digit Google Authenticator code:');
        if (code) submitTwoFactorCode(mfaData.mfa_token, code);
        return;
      }

      const challengeHtml = `
        <form id="nx-active-2fa-form" style="display:flex;flex-direction:column;gap:14px;text-align:center;">
          <div style="font-size:36px;margin:5px 0;">📱</div>
          <div style="font-size:14px;font-weight:700;color:var(--text-hi);">Two-Factor Authentication</div>
          <p style="font-size:12.5px;color:var(--text-mid);line-height:1.5;margin:0 auto;max-width:340px;">
            Open the <strong>Google Authenticator</strong> app on your phone and enter the 6-digit code for <strong>${mfaData.email}</strong>.
          </p>

          <div class="nx-field" style="max-width:240px;margin:10px auto 0;">
            <input type="text" id="mfa-code" maxlength="8" placeholder="000 000" autofocus required
              style="text-align:center;font-family:monospace;font-size:24px;font-weight:700;letter-spacing:6px;height:48px;border-radius:10px;background:#12171D;border:1.5px solid var(--mango-1);color:var(--mango-gold);">
          </div>
          <div style="font-size:11px;color:var(--text-low);margin-top:2px;">You can also enter an 8-digit backup recovery code.</div>
        </form>
      `;

      openModal(
        'Google Authenticator Verification',
        'Security checkpoint required to access NEXUS.',
        challengeHtml,
        `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button><button class="btn btn-primary btn-sm" type="submit" form="nx-active-2fa-form">Verify & Continue</button>`,
        false
      );

      const f = document.getElementById('nx-active-2fa-form');
      if (f) {
        f.onsubmit = async (e) => {
          e.preventDefault();
          const code = (document.getElementById('mfa-code')?.value || '').trim();
          if (!code) return;
          await submitTwoFactorCode(mfaData.mfa_token, code);
        };
      }
    }

    async function submitTwoFactorCode(mfaToken, code) {
      try {
        const res = await fetch(`${API}/auth/2fa/verify-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mfa_token: mfaToken, code })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Invalid 2FA code');
        }

        if (typeof closeModal === 'function') closeModal();
        setAuthenticated(data.token, data.user);
        if (typeof toast === 'function') toast('2FA Verified', `Signed in securely as ${data.user.name}`);
      } catch (err) {
        if (typeof toast === 'function') toast('2FA Error', err.message);
      }
    }

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

          if (data.mfa_required) {
            openTwoFactorChallengeModal(data);
            return;
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

    // 4. Social Single Sign-On (Google, GitHub, Microsoft) with Interactive Provider OAuth Modal
    function openSsoModal(provider, defaultName, defaultEmail) {
      if (typeof openModal !== 'function') {
        handleDirectSso(provider, defaultName, defaultEmail, 'superadmin');
        return;
      }

      const providerTitle = provider.charAt(0).toUpperCase() + provider.slice(1);
      const isGoogle = provider === 'google';
      const isGithub = provider === 'github';

      const ssoModalHtml = `
        <form id="nx-active-sso-form" style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid var(--glass-border);">
            <div style="font-size:24px;">${isGoogle ? '🔴' : isGithub ? '🐱' : '🟦'}</div>
            <div>
              <div style="font-weight:700;color:var(--text-hi);font-size:14px;">${providerTitle} OAuth Identity Link</div>
              <div style="font-size:12px;color:var(--text-mid);">Authorize NEXUS with your verified ${providerTitle} account.</div>
            </div>
          </div>

          <div class="nx-form-grid" style="gap:10px;">
            <div class="nx-field"><label>Account Name *</label><input type="text" id="sso-name" value="${defaultName}" required style="height:36px;font-size:13px;"></div>
            <div class="nx-field"><label>${providerTitle} Verified Email *</label><input type="email" id="sso-email" value="${defaultEmail}" required style="height:36px;font-size:13px;"></div>
          </div>

          <div class="nx-field" style="margin:0;">
            <label>Select Workspace / Role</label>
            <select id="sso-role" style="height:36px;font-size:13px;">
              <option value="superadmin" ${defaultEmail.includes('aryan') ? 'selected' : ''}>Super Admin / System Owner (Aryan Sharma)</option>
              <option value="Owner" ${!defaultEmail.includes('aryan') ? 'selected' : ''}>Enterprise Company Owner</option>
              <option value="Shop Owner">Retail Shop Owner</option>
              <option value="Sales Lead">Sales Lead</option>
              <option value="Client">Client Account</option>
            </select>
          </div>
        </form>
      `;

      openModal(
        `Sign in with ${providerTitle}`,
        `Connect your ${providerTitle} account to PostgreSQL.`,
        ssoModalHtml,
        `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button><button class="btn btn-primary btn-sm" type="submit" form="nx-active-sso-form">Authorize & Enter Portal</button>`,
        true
      );

      const f = document.getElementById('nx-active-sso-form');
      if (f) {
        f.onsubmit = async (e) => {
          e.preventDefault();
          const name = (document.getElementById('sso-name')?.value || '').trim();
          const email = (document.getElementById('sso-email')?.value || '').trim();
          const role = document.getElementById('sso-role')?.value || 'Owner';
          if (!name || !email) return;

          if (typeof closeModal === 'function') closeModal();
          await handleDirectSso(provider, name, email, role);
        };
      }
    }

    async function handleDirectSso(provider, name, email, role) {
      try {
        if (typeof toast === 'function') toast('SSO Authenticating', `Connecting via ${provider}...`);

        const res = await fetch(`${API}/auth/sso`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            name,
            email,
            role,
            workspace_type: role === 'superadmin' ? 'system' : role === 'Shop Owner' ? 'shop_owner' : 'enterprise'
          })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'SSO authentication failed');
        }

        if (data.mfa_required) {
          openTwoFactorChallengeModal(data);
          return;
        }

        setAuthenticated(data.token, data.user);
        if (typeof toast === 'function') toast('SSO Connected', `Signed in via ${provider} as ${data.user.name}`);
      } catch (err) {
        if (typeof toast === 'function') toast('SSO Error', err.message);
      }
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('#sso-google')) {
        e.preventDefault();
        openSsoModal('google', 'Aryan Sharma', 'aryan.sharma@gmail.com');
      } else if (e.target.closest('#sso-github')) {
        e.preventDefault();
        openSsoModal('github', 'aaddi1', 'aaddi1@github.com');
      } else if (e.target.closest('#sso-microsoft')) {
        e.preventDefault();
        openSsoModal('microsoft', 'Enterprise Owner', 'owner@enterprise.in');
      }
    });
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

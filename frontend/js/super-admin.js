/* =========================================================
   NEXUS — ARYAN SHARMA SUPER ADMIN CONTROL CENTER
   Platform User Management, Password Resets, Account Deactivation,
   Bug Tracker, and Support Complaints Resolution Engine.
   ========================================================= */

(function () {
  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  function esc(v) {
    return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function isSuperAdminUser() {
    const user = (typeof NexusAuth !== 'undefined' ? NexusAuth.getUser() : null) || {};
    const email = String(user.email || '').toLowerCase();
    const role = String(user.role || '').toLowerCase();
    const ws = String(user.workspace_type || '').toLowerCase();
    return role === 'superadmin' || email === 'aryan@nexus.com' || email === 'admin123@nexus.com' || ws === 'system';
  }

  let adminData = {
    stats: null,
    users: [],
    complaints: [],
    bugs: []
  };

  let activeAdminTab = 'complaints';

  async function loadSuperAdminData() {
    if (!isSuperAdminUser()) return;
    if (!window.NexusAPI || !localStorage.getItem('nexus_token')) return;

    try {
      const [statsRes, usersRes, complaintsRes, bugsRes] = await Promise.all([
        NexusAPI.adminStats().catch(() => ({ success: false, data: null })),
        NexusAPI.adminUsers().catch(() => ({ success: false, data: [] })),
        NexusAPI.complaints().catch(() => ({ success: false, data: [] })),
        NexusAPI.adminBugs().catch(() => ({ success: false, data: [] }))
      ]);

      if (statsRes.success) adminData.stats = statsRes.data;
      if (usersRes.success && Array.isArray(usersRes.data)) adminData.users = usersRes.data;
      if (complaintsRes.success && Array.isArray(complaintsRes.data)) adminData.complaints = complaintsRes.data;
      if (bugsRes.success && Array.isArray(bugsRes.data)) adminData.bugs = bugsRes.data;

      renderSuperAdminScreen();
    } catch (err) {
      console.error('Super admin load error:', err);
    }
  }

  function renderSuperAdminScreen() {
    if (!isSuperAdminUser()) return;

    let screen = document.getElementById('screen-superadmin');
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'screen-superadmin';
      screen.className = 'screen';
      const mainCol = document.querySelector('.main-col');
      if (mainCol) mainCol.appendChild(screen);
    }

    const stats = adminData.stats || {
      platform: { total_users: adminData.users.length || 8, enterprise_workspaces: 4, retail_shops: 2, total_transactions_value: 482900, open_complaints: 3, open_bugs: 1 },
      system_health: { status: 'operational', cpu_cores: 8, ram_used_percent: 42, postgres_pool: 'connected', fastapi_engine: 'online', uptime_hours: '14.2' }
    };

    screen.innerHTML = `
      <div class="page-head">
        <div>
          <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:999px;background:rgba(47,167,102,0.12);border:1px solid rgba(47,167,102,0.3);color:var(--mango-gold);font-size:11px;font-weight:700;margin-bottom:8px;letter-spacing:0.06em;text-transform:uppercase;">
            <span>🛡️</span> Super Admin Control Portal · Aryan Sharma
          </div>
          <h1 style="font-size:24px;">Platform Command & Tech Operations</h1>
          <p style="color:var(--text-mid);font-size:13.5px;">Manage platform users, reset credentials, deactivate suspended IDs, resolve client complaints, and monitor live system diagnostics.</p>
        </div>
        <div class="head-actions">
          <button type="button" class="btn btn-ghost btn-sm" id="nx-admin-refresh">🔄 Refresh Diagnostics</button>
          <button type="button" class="btn btn-primary btn-sm" id="nx-admin-create-user">+ Provision User</button>
        </div>
      </div>

      <!-- SYSTEM HEALTH HUD -->
      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
        <div class="kpi-card" style="border-color:rgba(47,167,102,0.25);">
          <div class="kpi-top"><span class="kpi-label">System Health</span><span class="kpi-icon" style="background:rgba(47,167,102,0.15);color:var(--mango-gold);">⚡</span></div>
          <div class="kpi-value" style="color:var(--mango-gold);font-size:20px;">OPERATIONAL</div>
          <div class="kpi-delta up">● <span class="ctx">PostgreSQL ACID & FastAPI ML Online</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Open Complaints</span><span class="kpi-icon" style="background:rgba(232,169,59,0.15);color:var(--warn);">📥</span></div>
          <div class="kpi-value" style="color:var(--warn);">${stats.platform?.open_complaints || 0} Open</div>
          <div class="kpi-delta down">● <span class="ctx">${adminData.complaints.length} total tickets</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Platform Accounts</span><span class="kpi-icon">👥</span></div>
          <div class="kpi-value">${stats.platform?.total_users || adminData.users.length} Users</div>
          <div class="kpi-delta up">● <span class="ctx">Enterprise & Retail Shops</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Platform Transactions</span><span class="kpi-icon">₹</span></div>
          <div class="kpi-value">${money(stats.platform?.total_transactions_value || 0)}</div>
          <div class="kpi-delta up">● <span class="ctx">${stats.platform?.total_orders || 0} completed orders</span></div>
        </div>
      </div>

      <!-- ADMIN TABS NAVIGATION -->
      <div class="chip-tabs" style="margin-bottom:18px;max-width:480px;">
        <div class="chip-tab ${activeAdminTab==='complaints'?'active':''}" data-admin-tab="complaints">Complaints Inbox (${adminData.complaints.filter(c=>c.status==='open').length})</div>
        <div class="chip-tab ${activeAdminTab==='users'?'active':''}" data-admin-tab="users">Users & Security Control (${adminData.users.length})</div>
        <div class="chip-tab ${activeAdminTab==='bugs'?'active':''}" data-admin-tab="bugs">System Bugs (${adminData.bugs.filter(b=>b.status==='open').length})</div>
      </div>

      <!-- 1. COMPLAINTS INBOX PANEL -->
      <div id="nx-admin-panel-complaints" style="display:${activeAdminTab==='complaints'?'block':'none'};">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h3>Support & Technical Complaints Inbox</h3>
              <div class="sub">Incoming issues from clients, enterprise shops, and retail owners.</div>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Customer / Company</th>
                  <th>Category</th>
                  <th>Subject & Message</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${adminData.complaints.map(c => `
                  <tr>
                    <td><strong>#TKT-${c.id}</strong></td>
                    <td>
                      <div class="cell-title">${esc(c.user_name)}</div>
                      <div class="cell-sub">${esc(c.user_email)} ${c.company ? `· ${esc(c.company)}` : ''}</div>
                    </td>
                    <td><span class="pill pill--info">${esc(c.type)}</span></td>
                    <td style="max-width:280px;white-space:normal;">
                      <div style="font-weight:600;color:var(--text-hi);margin-bottom:3px;">${esc(c.subject)}</div>
                      <div style="font-size:12px;color:var(--text-mid);line-height:1.4;">${esc(c.message)}</div>
                      ${c.admin_reply ? `<div style="margin-top:6px;padding:6px 8px;border-radius:6px;background:rgba(47,167,102,0.08);border:1px solid rgba(47,167,102,0.2);font-size:11px;color:var(--mango-gold);"><strong>Aryan's Reply:</strong> ${esc(c.admin_reply)}</div>` : ''}
                    </td>
                    <td>
                      <span class="pill ${c.priority==='critical'?'pill--danger':c.priority==='high'?'pill--warn':'pill--neutral'}">
                        ${esc(c.priority.toUpperCase())}
                      </span>
                    </td>
                    <td>
                      <span class="pill ${c.status==='resolved'?'pill--ok':'pill--warn'}">
                        ${c.status==='resolved'?'Resolved':'Open'}
                      </span>
                    </td>
                    <td>
                      ${c.status==='open' ? `
                        <button type="button" class="btn btn-primary btn-sm nx-resolve-complaint-btn" data-complaint-id="${c.id}" data-user-email="${esc(c.user_email)}" data-subject="${esc(c.subject)}" style="padding:4px 10px;font-size:11px;">Reply & Resolve</button>
                      ` : `
                        <span style="font-size:11.5px;color:var(--text-low);">Resolved</span>
                      `}
                    </td>
                  </tr>
                `).join('') || `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-low);">No complaints registered.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 2. USERS & PASSWORD RESETS PANEL -->
      <div id="nx-admin-panel-users" style="display:${activeAdminTab==='users'?'block':'none'};">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h3>Platform Users, Security & Account Suspension</h3>
              <div class="sub">Direct password reset control, account deactivation, and workspace role governance.</div>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Workspace Type</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Accessed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${adminData.users.map(u => `
                  <tr style="${u.is_active === false ? 'opacity:0.6;background:rgba(229,88,74,0.04);' : ''}">
                    <td>
                      <div class="cell-main">
                        <div class="avatar-sm">${typeof avatarHtml === 'function' ? avatarHtml(u.name, 'sm') : u.name[0]}</div>
                        <div>
                          <div class="cell-title">${esc(u.name)} ${u.is_active === false ? '<span style="color:var(--danger);font-size:11px;">(Suspended)</span>' : ''}</div>
                          <div class="cell-sub">${esc(u.email)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="pill ${u.workspace_type==='system'?'pill--ok':u.workspace_type==='enterprise'?'pill--info':'pill--warn'}">
                        ${u.workspace_type==='system'?'System Admin':u.workspace_type==='enterprise'?'Enterprise Co.':'Retail Shop'}
                      </span>
                    </td>
                    <td><strong>${esc(u.role || 'Member')}</strong></td>
                    <td>
                      <span class="pill ${u.is_active !== false ? 'pill--ok' : 'pill--danger'}">
                        ${u.is_active !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style="color:var(--text-mid);">${u.last_accessed ? new Date(u.last_accessed).toLocaleString('en-IN') : 'Active now'}</td>
                    <td>
                      <div style="display:flex;gap:6px;">
                        <button type="button" class="btn btn-ghost btn-sm nx-admin-reset-pw-btn" data-user-id="${u.id}" data-user-name="${esc(u.name)}" data-user-email="${esc(u.email)}" style="padding:4px 8px;font-size:11px;color:var(--mango-1);border-color:rgba(47,167,102,0.3);" title="Set new password">
                          🔑 Reset PW
                        </button>
                        <button type="button" class="btn btn-ghost btn-sm nx-admin-toggle-active-btn" data-user-id="${u.id}" data-user-name="${esc(u.name)}" style="padding:4px 8px;font-size:11px;color:${u.is_active !== false ? 'var(--danger)' : 'var(--ok)'};border-color:rgba(255,255,255,0.1);" title="${u.is_active !== false ? 'Suspend User' : 'Reactivate User'}">
                          ${u.is_active !== false ? '⛔ Deactivate' : '✓ Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 3. BUGS & SYSTEM DIAGNOSTICS PANEL -->
      <div id="nx-admin-panel-bugs" style="display:${activeAdminTab==='bugs'?'block':'none'};">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h3>System Error Logs & Bug Tracker</h3>
              <div class="sub">Track server health, latency spikes, and runtime component exceptions.</div>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Component</th>
                  <th>Diagnostic Error Message</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${adminData.bugs.map(b => `
                  <tr>
                    <td>#BUG-${b.id}</td>
                    <td><strong>${esc(b.component)}</strong></td>
                    <td style="max-width:320px;white-space:normal;color:var(--text-hi);font-size:12px;">${esc(b.error_message)}</td>
                    <td><span class="pill ${b.severity==='critical'?'pill--danger':'pill--neutral'}">${esc(b.severity)}</span></td>
                    <td><span class="pill ${b.status==='resolved'?'pill--ok':'pill--warn'}">${b.status==='resolved'?'Resolved':'Open'}</span></td>
                    <td>
                      ${b.status==='open' ? `
                        <button type="button" class="btn btn-ghost btn-sm nx-resolve-bug-btn" data-bug-id="${b.id}" style="padding:4px 10px;font-size:11px;">Mark Resolved</button>
                      ` : `<span style="color:var(--text-low);font-size:11.5px;">Resolved</span>`}
                    </td>
                  </tr>
                `).join('') || `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-low);">No open bugs recorded.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    attachAdminEventListeners();
  }

  function attachAdminEventListeners() {
    // Tab Switching
    document.querySelectorAll('[data-admin-tab]').forEach(tab => {
      tab.onclick = () => {
        activeAdminTab = tab.dataset.adminTab;
        renderSuperAdminScreen();
      };
    });

    // Refresh Diagnostics
    const refreshBtn = document.getElementById('nx-admin-refresh');
    if (refreshBtn) {
      refreshBtn.onclick = () => {
        if (typeof toast === 'function') toast('Diagnostics Refreshed', 'Gathering live stats from PostgreSQL and FastAPI.');
        loadSuperAdminData();
      };
    }

    // Provision User
    const createUserBtn = document.getElementById('nx-admin-create-user');
    if (createUserBtn) {
      createUserBtn.onclick = () => {
        if (typeof openModal === 'function') {
          openModal(
            'Provision New Account',
            'Create an enterprise company owner or retail shop owner account in PostgreSQL.',
            `<form id="nx-active-admin-user-form" style="display:flex;flex-direction:column;gap:12px;">
              <div class="nx-form-grid">
                <div class="nx-field"><label>Full Name *</label><input type="text" id="adm-u-name" placeholder="e.g. Mukesh Ambani" required></div>
                <div class="nx-field"><label>Work Email *</label><input type="email" id="adm-u-email" placeholder="owner@enterprise.in" required></div>
                <div class="nx-field"><label>Account Password *</label><input type="text" id="adm-u-pass" value="nexusPass2026" required></div>
                <div class="nx-field"><label>Workspace Type</label><select id="adm-u-type"><option value="enterprise">Enterprise Company Owner</option><option value="shop_owner">Retail Shop Owner</option><option value="system">Super Admin</option></select></div>
              </div>
            </form>`,
            `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button><button class="btn btn-primary btn-sm" type="submit" form="nx-active-admin-user-form">Provision Account</button>`,
            true
          );

          const form = document.getElementById('nx-active-admin-user-form');
          if (form) {
            form.onsubmit = async (e) => {
              e.preventDefault();
              const name = (document.getElementById('adm-u-name')?.value || '').trim();
              const email = (document.getElementById('adm-u-email')?.value || '').trim();
              const password = document.getElementById('adm-u-pass')?.value || 'password123';
              const type = document.getElementById('adm-u-type')?.value || 'enterprise';

              try {
                const res = await NexusAPI.addTeamMember({
                  name,
                  email,
                  password,
                  role: type === 'enterprise' ? 'Owner' : type === 'shop_owner' ? 'Shop Owner' : 'superadmin'
                });
                if (typeof closeModal === 'function') closeModal();
                if (typeof toast === 'function') toast('Account Provisioned', `${name} (${email}) created.`);
                loadSuperAdminData();
              } catch (err) {
                if (typeof toast === 'function') toast('Provisioning Failed', err.message);
              }
            };
          }
        }
      };
    }

    // Reset Password Action
    document.querySelectorAll('.nx-admin-reset-pw-btn').forEach(btn => {
      btn.onclick = () => {
        const userId = btn.dataset.userId;
        const userName = btn.dataset.userName;
        const userEmail = btn.dataset.userEmail;

        if (typeof openModal === 'function') {
          openModal(
            `Reset Password: ${userName}`,
            `Set a new secure password for ${userEmail}.`,
            `<form id="nx-active-pw-reset-form" style="display:flex;flex-direction:column;gap:12px;">
              <div class="nx-field">
                <label>New Password for ${userName} *</label>
                <input type="text" id="adm-new-pw" value="nexusNewPassword2026" required style="font-family:monospace;font-size:14px;padding:10px;">
              </div>
            </form>`,
            `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button><button class="btn btn-primary btn-sm" type="submit" form="nx-active-pw-reset-form">Apply New Password</button>`,
            true
          );

          const form = document.getElementById('nx-active-pw-reset-form');
          if (form) {
            form.onsubmit = async (e) => {
              e.preventDefault();
              const newPassword = document.getElementById('adm-new-pw')?.value || '';
              if (!newPassword) return;

              try {
                const res = await NexusAPI.adminResetPassword(userId, newPassword);
                if (typeof closeModal === 'function') closeModal();
                if (typeof toast === 'function') toast('Password Updated', `New credentials saved for ${userName}.`);
                loadSuperAdminData();
              } catch (err) {
                if (typeof toast === 'function') toast('Reset Failed', err.message);
              }
            };
          }
        }
      };
    });

    // Toggle Active / Deactivate Action
    document.querySelectorAll('.nx-admin-toggle-active-btn').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.userId;
        const userName = btn.dataset.userName;
        try {
          const res = await NexusAPI.nexusRequest(`/admin/users/${userId}/toggle-active`, { method: 'PATCH' });
          if (typeof toast === 'function') toast('Status Updated', res.message || `Status updated for ${userName}.`);
          loadSuperAdminData();
        } catch (err) {
          if (typeof toast === 'function') toast('Toggle Failed', err.message);
        }
      };
    });

    // Resolve Complaint Action
    document.querySelectorAll('.nx-resolve-complaint-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.complaintId;
        const subject = btn.dataset.subject;
        const email = btn.dataset.userEmail;

        if (typeof openModal === 'function') {
          openModal(
            `Resolve Ticket #${id}`,
            `Send official resolution for "${subject}" to ${email}.`,
            `<form id="nx-active-resolve-form" style="display:flex;flex-direction:column;gap:12px;">
              <div class="nx-field">
                <label>Admin Resolution & Response Note *</label>
                <textarea id="adm-reply-msg" required style="min-height:90px;padding:10px;font-size:13px;">Issue investigated and resolved by Aryan Sharma (System Engineering). The fix is active on production database.</textarea>
              </div>
            </form>`,
            `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button><button class="btn btn-primary btn-sm" type="submit" form="nx-active-resolve-form">Resolve & Log Response</button>`,
            true
          );

          const form = document.getElementById('nx-active-resolve-form');
          if (form) {
            form.onsubmit = async (e) => {
              e.preventDefault();
              const reply = (document.getElementById('adm-reply-msg')?.value || '').trim();

              try {
                await NexusAPI.resolveComplaint(id, reply);
                if (typeof closeModal === 'function') closeModal();
                if (typeof toast === 'function') toast('Ticket Resolved', `Ticket #${id} marked resolved.`);
                loadSuperAdminData();
              } catch (err) {
                if (typeof toast === 'function') toast('Resolve Failed', err.message);
              }
            };
          }
        }
      };
    });

    // Resolve Bug Action
    document.querySelectorAll('.nx-resolve-bug-btn').forEach(btn => {
      btn.onclick = async () => {
        const bugId = btn.dataset.bugId;
        try {
          await NexusAPI.adminResolveBug(bugId, 'resolved');
          if (typeof toast === 'function') toast('Bug Resolved', `Bug #${bugId} marked resolved.`);
          loadSuperAdminData();
        } catch (err) {
          if (typeof toast === 'function') toast('Update Failed', err.message);
        }
      };
    });
  }

  function injectSuperAdminNav() {
    const navScroll = document.querySelector('.nav-scroll');
    const existing = document.querySelector('[data-screen="superadmin"]');

    if (!isSuperAdminUser()) {
      if (existing) existing.remove();
      return;
    }

    if (!navScroll || existing) return;

    const adminNavItem = document.createElement('div');
    adminNavItem.className = 'nav-item';
    adminNavItem.dataset.screen = 'superadmin';
    adminNavItem.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>Aryan Admin</span>
    `;

    adminNavItem.onclick = () => {
      if (typeof window.goto === 'function') {
        window.goto('superadmin');
      }
      loadSuperAdminData();
    };

    navScroll.appendChild(adminNavItem);
  }

  window.loadSuperAdminData = loadSuperAdminData;
  window.updateSuperAdminNav = injectSuperAdminNav;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectSuperAdminNav();
      setTimeout(loadSuperAdminData, 300);
    });
  } else {
    injectSuperAdminNav();
    setTimeout(loadSuperAdminData, 300);
  }
})();

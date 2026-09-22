/* =========================================================
   NEXUS — EMPLOYEE WORKSPACE & SELF-SERVICE ENGINE
   Personal Sales, Assigned Items, Salary Ledger & Issues
   ========================================================= */

(function () {
  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  function esc(v) {
    return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function isEmployeeUser() {
    const user = (typeof NexusAuth !== 'undefined' ? NexusAuth.getUser() : null) || {};
    const role = String(user.role || '').toLowerCase();
    const email = String(user.email || '').toLowerCase();
    const isSuper = role === 'superadmin' || email === 'aryan@nexus.com' || email === 'admin123@nexus.com';
    const isOwner = role === 'owner';
    return !isSuper && !isOwner;
  }

  let empData = {
    profile: {},
    stats: { my_sales_count: 0, my_revenue_generated: 0, items_held: 0, last_salary_amount: 0, next_salary_date: '2026-10-01', open_issues_count: 0 },
    sales: [],
    items: [],
    salaries: [],
    issues: []
  };

  async function loadEmployeeWorkspace() {
    if (!window.NexusAPI || !localStorage.getItem('nexus_token')) return;

    try {
      const res = await NexusAPI.employeeWorkspace();
      if (res.success && res.data) {
        empData = res.data;
        renderEmployeeScreens();
      }
    } catch (err) {
      console.warn('Employee workspace load:', err.message);
    }
  }

  function renderEmployeeScreens() {
    renderEmployeeDashboard();
    renderEmployeeSales();
    renderEmployeeItems();
    renderEmployeeSalary();
    renderEmployeeIssues();
  }

  function renderEmployeeDashboard() {
    let host = document.getElementById('screen-emp-dashboard');
    if (!host) {
      host = document.createElement('div');
      host.id = 'screen-emp-dashboard';
      host.className = 'screen';
      const mainCol = document.querySelector('.main-col');
      if (mainCol) mainCol.appendChild(host);
    }

    const st = empData.stats || {};
    const user = empData.profile || {};

    host.innerHTML = `
      <div class="page-head">
        <div>
          <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:999px;background:rgba(47,167,102,0.12);border:1px solid rgba(47,167,102,0.3);color:var(--mango-gold);font-size:11px;font-weight:700;margin-bottom:8px;letter-spacing:0.06em;text-transform:uppercase;">
            <span>💼</span> Employee Workspace · ${esc(user.name || 'Team Member')}
          </div>
          <h1 style="font-size:24px;">Personal Performance & Operational Hub</h1>
          <p style="color:var(--text-mid);font-size:13.5px;">Track your personal sales attribution, issued inventory samples, compensation history, and operational requests.</p>
        </div>
        <div class="head-actions">
          <button type="button" class="btn btn-primary btn-sm" id="nx-emp-create-sale">+ Record Sale</button>
          <button type="button" class="btn btn-ghost btn-sm" data-open-complaint>Raise Issue</button>
        </div>
      </div>

      <!-- PERSONAL KPI HUD -->
      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
        <div class="kpi-card" style="border-color:rgba(47,167,102,0.3);">
          <div class="kpi-top"><span class="kpi-label">My Revenue Generated</span><span class="kpi-icon">₹</span></div>
          <div class="kpi-value" style="color:var(--mango-1);">${money(st.my_revenue_generated || 0)}</div>
          <div class="kpi-delta up">● <span class="ctx">${st.my_sales_count || 0} personal sales</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Next Salary Payout</span><span class="kpi-icon">📅</span></div>
          <div class="kpi-value" style="font-size:20px;">01 Oct 2026</div>
          <div class="kpi-delta up">● <span class="ctx">Last paid: ${money(st.last_salary_amount || 0)}</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Sample Items Held</span><span class="kpi-icon">📦</span></div>
          <div class="kpi-value">${st.items_held || 0} Units</div>
          <div class="kpi-delta up">● <span class="ctx">Assigned client stock</span></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">My Open Issues</span><span class="kpi-icon">💬</span></div>
          <div class="kpi-value" style="color:${st.open_issues_count > 0 ? 'var(--warn)' : 'var(--ok)'};">${st.open_issues_count || 0} Active</div>
          <div class="kpi-delta up">● <span class="ctx">Support tickets</span></div>
        </div>
      </div>

      <!-- RECENT SALES & ASSIGNED ITEMS GRID -->
      <div class="grid-2" style="margin-bottom:24px;">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h3>Recent Sales Attributed to Me</h3>
              <div class="sub">Orders directly credited to your employee profile.</div>
            </div>
            <a href="#" class="view-all" data-emp-goto="emp-sales">View All</a>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                ${empData.sales.slice(0, 5).map(s => `
                  <tr>
                    <td><strong>#NX-${s.id}</strong></td>
                    <td>${esc(s.customer || 'Customer')}</td>
                    <td>${money(s.total)}</td>
                    <td><span class="pill pill--ok">${esc(s.status)}</span></td>
                  </tr>
                `).join('') || `<tr><td colspan="4" style="text-align:center;padding:25px;color:var(--text-low);">No sales credited yet.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <div>
              <h3>Assigned Samples & Inventory</h3>
              <div class="sub">Items currently issued to you for customer demos.</div>
            </div>
            <a href="#" class="view-all" data-emp-goto="emp-items">View All</a>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Product</th><th>Qty</th><th>Status</th></tr></thead>
              <tbody>
                ${empData.items.slice(0, 5).map(i => `
                  <tr>
                    <td>
                      <div class="cell-title">${esc(i.product_name)}</div>
                      <div class="cell-sub">${esc(i.sku)}</div>
                    </td>
                    <td><strong>${i.quantity}</strong></td>
                    <td><span class="pill ${i.status==='issued'?'pill--warn':'pill--ok'}">${esc(i.status)}</span></td>
                  </tr>
                `).join('') || `<tr><td colspan="3" style="text-align:center;padding:25px;color:var(--text-low);">No items assigned.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const createSaleBtn = host.querySelector('#nx-emp-create-sale');
    if (createSaleBtn && window.NEXUS_UI?.createOrder) {
      createSaleBtn.onclick = () => window.NEXUS_UI.createOrder();
    }
  }

  function renderEmployeeSales() {
    let host = document.getElementById('screen-emp-sales');
    if (!host) {
      host = document.createElement('div');
      host.id = 'screen-emp-sales';
      host.className = 'screen';
      const mainCol = document.querySelector('.main-col');
      if (mainCol) mainCol.appendChild(host);
    }

    host.innerHTML = `
      <div class="page-head">
        <div>
          <h1>My Sales Ledger</h1>
          <p>Complete historical list of commercial orders attributed to you.</p>
        </div>
        <div class="head-actions">
          <button type="button" class="btn btn-primary btn-sm" id="nx-emp-sales-create">+ New Sale</button>
        </div>
      </div>

      <div class="panel">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Fulfillment</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${empData.sales.map(s => `
                <tr>
                  <td><strong>#NX-${s.id}</strong></td>
                  <td>${esc(s.customer || 'Customer')}</td>
                  <td><strong>${money(s.total)}</strong></td>
                  <td><span class="pill pill--ok">${esc(s.status)}</span></td>
                  <td><span class="pill pill--info">${esc(s.payment_status)}</span></td>
                  <td style="color:var(--text-mid);">${s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              `).join('') || `<tr><td colspan="6" style="text-align:center;padding:35px;color:var(--text-low);">No sales records found.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const createBtn = host.querySelector('#nx-emp-sales-create');
    if (createBtn && window.NEXUS_UI?.createOrder) {
      createBtn.onclick = () => window.NEXUS_UI.createOrder();
    }
  }

  function renderEmployeeItems() {
    let host = document.getElementById('screen-emp-items');
    if (!host) {
      host = document.createElement('div');
      host.id = 'screen-emp-items';
      host.className = 'screen';
      const mainCol = document.querySelector('.main-col');
      if (mainCol) mainCol.appendChild(host);
    }

    host.innerHTML = `
      <div class="page-head">
        <div>
          <h1>My Assigned Items & Samples</h1>
          <p>Inventory samples and hardware assets issued to your custody.</p>
        </div>
      </div>

      <div class="panel">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Issued Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${empData.items.map(i => `
                <tr>
                  <td>
                    <div class="cell-title">${esc(i.product_name)}</div>
                    <div class="cell-sub">${esc(i.sku)} · ${money(i.price)}</div>
                  </td>
                  <td><strong>${i.quantity} units</strong></td>
                  <td style="color:var(--text-mid);">${i.issued_date || '—'}</td>
                  <td style="color:var(--text-mid);">${i.returned_date || 'In possession'}</td>
                  <td><span class="pill ${i.status==='issued'?'pill--warn':'pill--ok'}">${esc(i.status)}</span></td>
                  <td style="font-size:12px;color:var(--text-mid);">${esc(i.notes || 'Client demonstration stock')}</td>
                </tr>
              `).join('') || `<tr><td colspan="6" style="text-align:center;padding:35px;color:var(--text-low);">No items assigned.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderEmployeeSalary() {
    let host = document.getElementById('screen-emp-salary');
    if (!host) {
      host = document.createElement('div');
      host.id = 'screen-emp-salary';
      host.className = 'screen';
      const mainCol = document.querySelector('.main-col');
      if (mainCol) mainCol.appendChild(host);
    }

    host.innerHTML = `
      <div class="page-head">
        <div>
          <h1>My Compensation & Salary Invoices</h1>
          <p>Historical payroll statements, salary payment dates, and payment receipts.</p>
        </div>
      </div>

      <div class="panel">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Salary Invoice #</th>
                <th>Payroll Period</th>
                <th>Amount Paid</th>
                <th>Disbursement Date</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${empData.salaries.map(s => `
                <tr>
                  <td><strong>${esc(s.salary_invoice_number || `SAL-${s.id}`)}</strong></td>
                  <td>${esc(s.salary_month)}</td>
                  <td><strong style="color:var(--mango-1);font-size:14px;">${money(s.amount)}</strong></td>
                  <td style="color:var(--text-mid);">${s.payment_date}</td>
                  <td><span class="pill pill--ok">${esc(s.payment_status)}</span></td>
                  <td style="font-size:12px;color:var(--text-mid);">${esc(s.notes || 'Monthly salary disbursement')}</td>
                </tr>
              `).join('') || `<tr><td colspan="6" style="text-align:center;padding:35px;color:var(--text-low);">No salary invoices recorded yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderEmployeeIssues() {
    let host = document.getElementById('screen-emp-issues');
    if (!host) {
      host = document.createElement('div');
      host.id = 'screen-emp-issues';
      host.className = 'screen';
      const mainCol = document.querySelector('.main-col');
      if (mainCol) mainCol.appendChild(host);
    }

    host.innerHTML = `
      <div class="page-head">
        <div>
          <h1>My Operational Issues & Tickets</h1>
          <p>Support tickets submitted to Founder / Super Admin Aryan Sharma.</p>
        </div>
        <div class="head-actions">
          <button type="button" class="btn btn-primary btn-sm" data-open-complaint>+ Raise New Issue</button>
        </div>
      </div>

      <div class="panel">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Category</th>
                <th>Subject & Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Admin Resolution</th>
              </tr>
            </thead>
            <tbody>
              ${empData.issues.map(i => `
                <tr>
                  <td><strong>#TKT-${i.id}</strong></td>
                  <td><span class="pill pill--info">${esc(i.type)}</span></td>
                  <td style="max-width:260px;white-space:normal;">
                    <div style="font-weight:600;color:var(--text-hi);">${esc(i.subject)}</div>
                    <div style="font-size:12px;color:var(--text-mid);">${esc(i.message)}</div>
                  </td>
                  <td><span class="pill ${i.priority==='critical'?'pill--danger':i.priority==='high'?'pill--warn':'pill--neutral'}">${esc(i.priority.toUpperCase())}</span></td>
                  <td><span class="pill ${i.status==='resolved'?'pill--ok':'pill--warn'}">${i.status==='resolved'?'Resolved':'Open'}</span></td>
                  <td style="max-width:240px;white-space:normal;font-size:12px;color:var(--text-hi);">
                    ${i.admin_reply ? `<div style="padding:6px 8px;border-radius:6px;background:rgba(47,167,102,0.08);border:1px solid rgba(47,167,102,0.2);color:var(--mango-gold);"><strong>Aryan's Reply:</strong> ${esc(i.admin_reply)}</div>` : '<span style="color:var(--text-low)">Awaiting admin review</span>'}
                  </td>
                </tr>
              `).join('') || `<tr><td colspan="6" style="text-align:center;padding:35px;color:var(--text-low);">No open issues.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function adaptSidebarNavigation() {
    const user = (typeof NexusAuth !== 'undefined' ? NexusAuth.getUser() : null) || {};
    const navScroll = document.querySelector('.nav-scroll');
    if (!navScroll) return;

    const isEmp = isEmployeeUser();

    if (isEmp) {
      // Build tailored Employee Navigation
      navScroll.innerHTML = `
        <div class="nav-group-label">Workspace</div>
        <div class="nav-item active" data-screen="emp-dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
          <span>Dashboard</span>
        </div>
        <div class="nav-item" data-screen="emp-sales">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1.2-5 3.2S9.2 10 12 10s5 1 5 3.3-2.2 3.2-5 3.2-5-1-5-3"/></svg>
          <span>My Sales</span>
        </div>
        <div class="nav-item" data-screen="emp-items">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>
          <span>My Items</span>
        </div>
        <div class="nav-item" data-screen="emp-salary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <span>My Salary</span>
        </div>
        <div class="nav-item" data-screen="emp-issues">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>My Issues</span>
        </div>
        <div class="nav-group-label">Account</div>
        <div class="nav-item" data-screen="settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          <span>My Profile</span>
        </div>
      `;

      if (typeof window.goto === 'function') {
        window.goto('emp-dashboard');
      }
    }
  }

  document.addEventListener('click', e => {
    const target = e.target.closest('[data-emp-goto]');
    if (target) {
      e.preventDefault();
      if (typeof window.goto === 'function') {
        window.goto(target.dataset.empGoto);
      }
    }
  });

  window.loadEmployeeWorkspace = loadEmployeeWorkspace;
  window.adaptSidebarNavigation = adaptSidebarNavigation;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      adaptSidebarNavigation();
      loadEmployeeWorkspace();
    });
  } else {
    adaptSidebarNavigation();
    loadEmployeeWorkspace();
  }
})();

/* =========================================================
   NEXUS — LIVE DATA HYDRATION ENGINE
   Syncs customers, products, inventory, orders, invoices,
   deals, team members, and notifications from PostgreSQL.
   ========================================================= */

(function () {
  async function refreshAllNexusData() {
    if (!window.NexusAPI || !localStorage.getItem('nexus_token')) {
      return;
    }

    try {
      // 1. Fetch Core Resources Concurrently
      const [
        customerResult,
        orderResult,
        productResult,
        inventoryResult,
        invoiceResult,
        dealResult,
        teamResult,
        notifResult
      ] = await Promise.all([
        NexusAPI.customers().catch(err => ({ success: false, error: err.message })),
        NexusAPI.orders().catch(err => ({ success: false, error: err.message })),
        NexusAPI.products().catch(err => ({ success: false, error: err.message })),
        NexusAPI.inventory().catch(err => ({ success: false, error: err.message })),
        NexusAPI.invoices().catch(err => ({ success: false, error: err.message })),
        NexusAPI.deals().catch(err => ({ success: false, error: err.message })),
        NexusAPI.team().catch(err => ({ success: false, error: err.message })),
        NexusAPI.notifications().catch(err => ({ success: false, error: err.message }))
      ]);

      // 2. Hydrate Customers
      if (customerResult.success && Array.isArray(customerResult.data)) {
        const liveCustomers = customerResult.data.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          company: c.company || '',
          city: c.city || '',
          orders: Number(c.orders) || 0,
          ltv: Number(c.ltv) || 0,
          last: c.last_order
            ? new Date(c.last_order).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : '—',
          seg: Number(c.orders) > 5 ? 'VIP' : Number(c.orders) > 0 ? 'Standard' : 'New',
          notes: ''
        }));

        window.NEXUS_LIVE_CUSTOMERS = liveCustomers;

        if (Array.isArray(window.customersData)) {
          window.customersData.splice(0, window.customersData.length, ...liveCustomers);
        }
        if (typeof customersData !== 'undefined' && Array.isArray(customersData)) {
          customersData.splice(0, customersData.length, ...liveCustomers);
          if (typeof renderCustomersTable === 'function') renderCustomersTable();
        }
      }

      // 3. Hydrate Inventory & Products
      const stockByProduct = {};
      if (inventoryResult.success && Array.isArray(inventoryResult.data)) {
        const liveInventory = inventoryResult.data.map(i => {
          const qty = Number(i.quantity) || 0;
          const pid = Number(i.product_id);
          stockByProduct[pid] = (stockByProduct[pid] || 0) + qty;
          return {
            id: i.id,
            product_id: i.product_id,
            name: i.product || '',
            sku: i.sku || '',
            loc: i.warehouse || '',
            onhand: qty,
            reserved: 0,
            avail: qty,
            reorder: 50,
            pct: Math.min(100, Math.max(0, (qty / 300) * 100)),
            updated: i.updated_at || null
          };
        });

        window.NEXUS_LIVE_INVENTORY = liveInventory;

        if (typeof inventoryData !== 'undefined' && Array.isArray(inventoryData)) {
          inventoryData.splice(0, inventoryData.length, ...liveInventory);
          const inventoryTable = document.getElementById('inventory-table');
          if (inventoryTable) {
            inventoryTable.innerHTML = `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Location</th>
                    <th>On hand</th>
                    <th>Reserved</th>
                    <th>Available</th>
                    <th>Reorder point</th>
                    <th>Stock level</th>
                  </tr>
                </thead>
                <tbody>
                  ${liveInventory.map(i => `
                    <tr>
                      <td>
                        <span class="cell-title">${typeof esc === 'function' ? esc(i.name) : i.name}</span>
                        <div class="cell-sub">${typeof esc === 'function' ? esc(i.sku) : i.sku}</div>
                      </td>
                      <td>${typeof esc === 'function' ? esc(i.loc) : i.loc}</td>
                      <td>${i.onhand}</td>
                      <td>${i.reserved}</td>
                      <td>${i.avail}</td>
                      <td style="color:var(--text-mid);">${i.reorder}</td>
                      <td>
                        <div class="progress-track">
                          <div class="progress-fill" style="width:${i.pct}%;"></div>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`;
          }
        }
      }

      if (productResult.success && Array.isArray(productResult.data)) {
        const liveProducts = productResult.data.map(p => {
          const stock = stockByProduct[Number(p.id)] !== undefined ? stockByProduct[Number(p.id)] : 0;
          return {
            id: p.id,
            name: p.name || '',
            sku: p.sku || '',
            cat: p.category || 'Uncategorized',
            price: Number(p.price) || 0,
            stock,
            status: stock === 0 ? 'danger' : stock < 50 ? 'warn' : 'ok',
            updated: null
          };
        });

        window.NEXUS_LIVE_PRODUCTS = liveProducts;

        if (typeof products !== 'undefined' && Array.isArray(products)) {
          products.splice(0, products.length, ...liveProducts);
          if (typeof renderProductsTable === 'function') renderProductsTable();
        }
      }

      // 4. Hydrate Orders
      if (orderResult.success && Array.isArray(orderResult.data)) {
        const liveOrders = orderResult.data.map(o => ({
          id: o.id,
          cust: o.customer || 'Customer',
          total: Number(o.total) || 0,
          fulfill: String(o.status || 'pending').toLowerCase(),
          date: o.created_at
            ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : '—',
          payment: o.payment_status || 'pending'
        }));

        window.NEXUS_LIVE_ORDERS = liveOrders;

        if (Array.isArray(window.ordersData)) {
          window.ordersData.splice(0, window.ordersData.length, ...liveOrders);
        }
        if (typeof ordersData !== 'undefined' && Array.isArray(ordersData)) {
          ordersData.splice(0, ordersData.length, ...liveOrders);
          if (typeof renderOrders === 'function') renderOrders('all');
        }
      }

      // 5. Hydrate Invoices
      if (invoiceResult.success && Array.isArray(invoiceResult.data)) {
        const liveInvoices = invoiceResult.data.map(i => ({
          id: i.id,
          num: i.invoice_number || `INV-${i.id}`,
          cust: i.customer || 'Customer',
          issue: i.issue_date ? new Date(i.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—',
          due: i.due_date ? new Date(i.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—',
          amount: Number(i.total) || 0,
          status: i.status === 'paid' ? 'ok' : i.status === 'overdue' ? 'danger' : i.status === 'due' ? 'warn' : 'neutral'
        }));

        window.NEXUS_LIVE_INVOICES = liveInvoices;
        if (typeof invoicesData !== 'undefined' && Array.isArray(invoicesData)) {
          invoicesData.splice(0, invoicesData.length, ...liveInvoices);
          if (typeof renderInvoicesTable === 'function') renderInvoicesTable();
        }
      }

      // 6. Hydrate Deals
      if (dealResult.success && Array.isArray(dealResult.data)) {
        const stageLabelMap = { lead: 'Discovery', proposal: 'Proposal', negotiation: 'Negotiation', closed_won: 'Closed won' };
        const liveDeals = dealResult.data.map(d => ({
          id: d.id,
          name: d.name,
          acct: d.customer || 'Account',
          stage: stageLabelMap[String(d.stage || '').toLowerCase()] || d.stage || 'Discovery',
          value: Number(d.value) || 0,
          owner: 'Aryan Sharma',
          close: d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—',
          probability: Number(d.probability) || 0
        }));

        window.NEXUS_LIVE_DEALS = liveDeals;
        if (typeof dealsData !== 'undefined' && Array.isArray(dealsData)) {
          dealsData.splice(0, dealsData.length, ...liveDeals);
          if (typeof renderSalesTable === 'function') renderSalesTable();
        }
      }

      // 7. Hydrate Team
      if (teamResult.success && Array.isArray(teamResult.data)) {
        const liveTeam = teamResult.data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'Member'
        }));

        window.NEXUS_LIVE_TEAM = liveTeam;
        if (typeof teamData !== 'undefined' && Array.isArray(teamData)) {
          teamData.splice(0, teamData.length, ...liveTeam);
          const teamBox = document.getElementById('team-table');
          if (teamBox) {
            teamBox.innerHTML = `
              <table class="data-table">
                <thead><tr><th>Member</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                  ${liveTeam.map(m => `
                    <tr>
                      <td>
                        <div class="cell-main">
                          <div class="avatar-sm">${typeof avatarHtml === 'function' ? avatarHtml(m.name, 'sm') : m.name[0]}</div>
                          <div>
                            <div class="cell-title">${typeof esc === 'function' ? esc(m.name) : m.name}</div>
                            <div class="cell-sub">${typeof esc === 'function' ? esc(m.email) : m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>${typeof esc === 'function' ? esc(m.role) : m.role}</td>
                      <td><span class="pill pill--ok">Active</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`;
          }
        }
      }

      // 8. Hydrate Notifications
      if (notifResult.success && Array.isArray(notifResult.data)) {
        window.NEXUS_LIVE_NOTIFICATIONS = notifResult.data;
        const notifContainer = document.getElementById('screen-notifications');
        if (notifContainer) {
          const list = notifContainer.querySelector('.nx-notify-list');
          if (list) {
            list.innerHTML = notifResult.data.map(n => `
              <div class="nx-notify ${n.unread ? 'unread' : ''}" data-goto-screen="${n.screen || 'dashboard'}">
                <div class="nx-notify-dot"></div>
                <div>
                  <p><strong>${typeof esc === 'function' ? esc(n.title) : n.title}</strong> — ${typeof esc === 'function' ? esc(n.message) : n.message}</p>
                  <small>${typeof esc === 'function' ? esc(n.time) : n.time}</small>
                </div>
              </div>
            `).join('') || '<div style="padding:20px;color:var(--text-low)">No notifications.</div>';
          }
        }
      }

      // 9. Trigger Dashboard & Analytics Live Refresh
      if (window.NexusDashboard?.load) window.NexusDashboard.load();
      if (window.NexusAnalytics?.load) window.NexusAnalytics.load();

      console.log('NEXUS: Live hydration synchronized with PostgreSQL.');
    } catch (error) {
      console.error('NEXUS live hydration failed:', error);
    }
  }

  window.refreshAllNexusData = refreshAllNexusData;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(refreshAllNexusData, 100));
  } else {
    setTimeout(refreshAllNexusData, 100);
  }
})();

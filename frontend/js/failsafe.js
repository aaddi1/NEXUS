/* =========================================================
   NEXUS ACTION DISPATCHER & DELEGATION LAYER
   Directs top action buttons to real application modal functions.
   ========================================================= */

(function () {
  const q = s => document.querySelector(s);
  const qa = s => Array.from(document.querySelectorAll(s));

  function dispatchAction(name) {
    const ui = window.NEXUS_UI || {};

    if (name === 'newOrder' || name === 'createOrder') {
      if (typeof ui.createOrder === 'function') return ui.createOrder();
    }
    if (name === 'newInvoice' || name === 'createInvoice') {
      if (typeof ui.createInvoice === 'function') return ui.createInvoice();
    }
    if (name === 'newDeal') {
      if (typeof ui.newDeal === 'function') return ui.newDeal();
    }
    if (name === 'addProduct') {
      if (typeof ui.addProduct === 'function') return ui.addProduct();
    }
    if (name === 'adjustStock') {
      if (typeof ui.adjustStock === 'function') return ui.adjustStock();
    }
    if (name === 'transferStock') {
      if (typeof ui.transferStock === 'function') return ui.transferStock();
    }
    if (name === 'addCustomer') {
      if (typeof ui.addCustomer === 'function') return ui.addCustomer();
    }
    if (name === 'exportReport') {
      if (typeof ui.exportReport === 'function') return ui.exportReport();
    }
  }

  function bind() {
    document.addEventListener('click', function (e) {
      // 1. Navigation items
      const nav = e.target.closest('.nav-item[data-screen]');
      if (nav) {
        e.preventDefault();
        qa('.nav-item[data-screen]').forEach(x => x.classList.remove('active'));
        nav.classList.add('active');
        qa('.screen').forEach(x => x.classList.remove('active'));

        const screenName = nav.dataset.screen;
        const target = q('#screen-' + screenName);
        if (target) target.classList.add('active');

        const title = q('#topbar-title');
        if (title) title.textContent = screenName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        window.scrollTo(0, 0);

        // Screen specific hooks
        if (screenName === 'analytics') {
          if (window.NexusAnalytics?.load) setTimeout(window.NexusAnalytics.load, 50);
          if (typeof window.loadNexusForecast === 'function') setTimeout(window.loadNexusForecast, 80);
          if (typeof window.loadNexusDemand === 'function') setTimeout(window.loadNexusDemand, 100);
        } else if (screenName === 'orders') {
          if (window.NexusOrders?.load) setTimeout(window.NexusOrders.load, 50);
        } else if (screenName === 'invoices') {
          if (window.NexusInvoices?.load) setTimeout(window.NexusInvoices.load, 50);
        } else if (screenName === 'sales') {
          if (window.NexusDeals?.load) setTimeout(window.NexusDeals.load, 50);
        } else if (screenName === 'dashboard') {
          if (window.NexusDashboard?.load) setTimeout(window.NexusDashboard.load, 50);
        }

        return;
      }

      // 2. Action buttons
      const b = e.target.closest('button');
      if (!b || b.closest('#nx-modal') || b.closest('.auth-card') || b.closest('#view-login')) return;

      const text = (b.textContent || '').trim().toLowerCase();

      if (text === 'new order' || text === 'create order') {
        e.preventDefault();
        dispatchAction('createOrder');
      } else if (text === 'new invoice' || text === 'create invoice') {
        e.preventDefault();
        dispatchAction('createInvoice');
      } else if (text === 'new deal') {
        e.preventDefault();
        dispatchAction('newDeal');
      } else if (text === 'add product') {
        e.preventDefault();
        dispatchAction('addProduct');
      } else if (text === 'adjust stock') {
        e.preventDefault();
        dispatchAction('adjustStock');
      } else if (text === 'transfer stock') {
        e.preventDefault();
        dispatchAction('transferStock');
      } else if (text === 'add customer') {
        e.preventDefault();
        dispatchAction('addCustomer');
      } else if (text === 'export report' || (text === 'export' && b.closest('.page-head'))) {
        e.preventDefault();
        dispatchAction('exportReport');
      } else if (text === 'invite member') {
        e.preventDefault();
        if (typeof openModal === 'function') {
          openModal(
            'Invite Team Member',
            'Add a new team member to your PostgreSQL workspace.',
            `<form id="nx-active-form">
              <div class="nx-form-grid">
                <div class="nx-field"><label>Member Name *</label><input name="name" type="text" placeholder="e.g. Maya Patel" required></div>
                <div class="nx-field"><label>Work Email *</label><input name="email" type="email" placeholder="maya@nexus.com" required></div>
                <div class="nx-field"><label>Role / Position</label><select name="role"><option value="Sales Lead">Sales Lead</option><option value="Inventory Manager">Inventory Manager</option><option value="Finance Lead">Finance Lead</option><option value="Member">Member</option></select></div>
                <div class="nx-field"><label>Temporary Password</label><input name="password" type="text" value="nexus123" required></div>
              </div>
            </form>`,
            `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button><button class="btn btn-primary btn-sm" type="submit" form="nx-active-form">Add Member</button>`,
            true
          );
          const f = document.getElementById('nx-active-form');
          if (f) {
            f.onsubmit = async (evt) => {
              evt.preventDefault();
              const fd = new FormData(f);
              try {
                const res = await NexusAPI.addTeamMember({
                  name: fd.get('name'),
                  email: fd.get('email'),
                  role: fd.get('role'),
                  password: fd.get('password')
                });
                if (typeof closeModal === 'function') closeModal();
                if (typeof toast === 'function') toast('Member Added', `${fd.get('name')} registered.`);
                if (typeof window.refreshAllNexusData === 'function') window.refreshAllNexusData();
              } catch (err) {
                if (typeof toast === 'function') toast('Failed to add member', err.message);
              }
            };
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

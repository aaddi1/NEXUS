/* =========================================================
   NEXUS — UNIVERSAL HELP & COMPLAINT DISPATCH SYSTEM
   Available across all client, shop owner, and admin portals.
   ========================================================= */

(function () {
  function openComplaintModal() {
    const user = (typeof NexusAuth !== 'undefined' ? NexusAuth.getUser() : null) || {};
    const defaultName = user.name || '';
    const defaultEmail = user.email || '';

    const contentHtml = `
      <form id="nx-active-complaint-form" style="display:flex;flex-direction:column;gap:14px;">
        <div style="background:rgba(47,167,102,0.06);border:1px solid rgba(47,167,102,0.25);border-radius:10px;padding:12px;font-size:12.5px;color:var(--text-mid);line-height:1.5;">
          Direct dispatch to <strong style="color:var(--mango-gold);">Aryan Sharma (Super Admin & System Owner)</strong>. All technical, billing, and operational issues are prioritized by system engineering.
        </div>

        <div class="nx-form-grid" style="gap:10px;">
          <div class="nx-field" style="margin:0;">
            <label>Your Name *</label>
            <input type="text" id="cp-name" value="${typeof esc === 'function' ? esc(defaultName) : defaultName}" placeholder="e.g. Riya Mehta" required style="height:36px;font-size:13px;">
          </div>
          <div class="nx-field" style="margin:0;">
            <label>Contact Email *</label>
            <input type="email" id="cp-email" value="${typeof esc === 'function' ? esc(defaultEmail) : defaultEmail}" placeholder="your.name@company.com" required style="height:36px;font-size:13px;">
          </div>
        </div>

        <div class="nx-form-grid" style="gap:10px;">
          <div class="nx-field" style="margin:0;">
            <label>Company / Shop Name</label>
            <input type="text" id="cp-company" placeholder="e.g. Aarav Organics / Retail Mart" style="height:36px;font-size:13px;">
          </div>
          <div class="nx-field" style="margin:0;">
            <label>Issue Category *</label>
            <select id="cp-type" style="height:36px;font-size:13px;" required>
              <option value="Bug / Technical Glitch" selected>Bug / Technical Glitch</option>
              <option value="Billing & Invoice Issue">Billing & Invoice Issue</option>
              <option value="Stock / Warehouse Desync">Stock / Warehouse Desync</option>
              <option value="Account & Access">Account & Access / Password Reset</option>
              <option value="Feature Request / Feedback">Feature Request / System Feedback</option>
            </select>
          </div>
        </div>

        <div class="nx-form-grid" style="gap:10px;">
          <div class="nx-field" style="margin:0;">
            <label>Subject / Summary *</label>
            <input type="text" id="cp-subject" placeholder="Brief summary of the issue" required style="height:36px;font-size:13px;">
          </div>
          <div class="nx-field" style="margin:0;">
            <label>Severity Level</label>
            <select id="cp-priority" style="height:36px;font-size:13px;">
              <option value="critical">Critical (Blocking Commercial Sales)</option>
              <option value="high">High (Needs Urgent Resolution)</option>
              <option value="medium" selected>Medium (Standard Inquiry)</option>
              <option value="low">Low (General Feedback / Tweak)</option>
            </select>
          </div>
        </div>

        <div class="nx-field" style="margin:0;">
          <label>Detailed Explanation & Steps to Reproduce *</label>
          <textarea id="cp-message" placeholder="Please describe the issue in detail..." required style="min-height:90px;font-size:13px;padding:10px;"></textarea>
        </div>
      </form>
    `;

    if (typeof openModal === 'function') {
      openModal(
        'Raise a Complaint / Support Request',
        'Direct connection to Aryan Sharma Admin Portal & Engineering Team.',
        contentHtml,
        `<button class="btn btn-ghost btn-sm" type="button" data-close-modal>Cancel</button><button class="btn btn-primary btn-sm" type="submit" form="nx-active-complaint-form">Submit to Admin</button>`,
        true
      );

      const f = document.getElementById('nx-active-complaint-form');
      if (f) {
        f.onsubmit = async (e) => {
          e.preventDefault();
          const name = (document.getElementById('cp-name')?.value || '').trim();
          const email = (document.getElementById('cp-email')?.value || '').trim();
          const company = (document.getElementById('cp-company')?.value || '').trim();
          const type = document.getElementById('cp-type')?.value || 'Technical Glitch';
          const priority = document.getElementById('cp-priority')?.value || 'medium';
          const subject = (document.getElementById('cp-subject')?.value || '').trim();
          const message = (document.getElementById('cp-message')?.value || '').trim();

          if (!name || !email || !subject || !message) {
            if (typeof toast === 'function') toast('Validation Error', 'Please complete all required fields.');
            return;
          }

          try {
            const res = await NexusAPI.submitComplaint({
              user_name: name,
              user_email: email,
              company,
              type,
              priority,
              subject,
              message
            });

            if (typeof closeModal === 'function') closeModal();
            if (typeof toast === 'function') {
              toast('Ticket Dispatched', `Complaint #${res.data?.id || ''} sent directly to Aryan Sharma Admin Portal.`);
            }
          } catch (err) {
            console.error('Complaint dispatch error:', err);
            if (typeof toast === 'function') toast('Dispatch Failed', err.message);
          }
        };
      }
    }
  }

  window.openComplaintModal = openComplaintModal;

  function renderFloatingSupportButton() {
    if (document.getElementById('nx-floating-help-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'nx-floating-help-btn';
    btn.type = 'button';
    btn.title = 'Raise a Complaint / Help Center';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>Help & Complaint</span>
    `;

    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 15px;
      border-radius: 999px;
      background: linear-gradient(180deg, #16202A, #0D1116);
      border: 1px solid rgba(79, 203, 131, 0.4);
      color: #62D98A;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(47, 167, 102, 0.15);
      transition: transform 0.15s ease, filter 0.15s ease;
    `;

    btn.onmouseenter = () => { btn.style.transform = 'translateY(-2px)'; btn.style.filter = 'brightness(1.1)'; };
    btn.onmouseleave = () => { btn.style.transform = 'translateY(0)'; btn.style.filter = 'brightness(1)'; };
    btn.onclick = openComplaintModal;

    document.body.appendChild(btn);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-complaint]')) {
      e.preventDefault();
      openComplaintModal();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFloatingSupportButton);
  } else {
    renderFloatingSupportButton();
  }
})();

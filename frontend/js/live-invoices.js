(async function () {
  if (!window.NexusAPI || !localStorage.getItem('nexus_token')) {
    return;
  }

  try {
    const result = await NexusAPI.invoices();

    if (!result.success || !Array.isArray(result.data)) {
      return;
    }

    window.NEXUS_LIVE_INVOICES = result.data;

    const container = document.getElementById('invoices-table');

    if (container) {
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Issue date</th>
              <th>Due date</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${result.data.map(invoice => `
              <tr>
                <td>
                  <span class="cell-title">
                    ${invoice.invoice_number}
                  </span>
                </td>

                <td>
                  ${invoice.customer || '—'}
                </td>

                <td>
                  <span class="pill ${
                    invoice.status === 'paid'
                      ? 'pill-ok'
                      : invoice.status === 'overdue'
                        ? 'pill-danger'
                        : invoice.status === 'sent'
                          ? 'pill-warn'
                          : 'pill-neutral'
                  }">
                    ${invoice.status || 'draft'}
                  </span>
                </td>

                <td style="color:var(--text-mid);">
                  ${invoice.issue_date
                    ? new Date(invoice.issue_date).toLocaleDateString('en-IN')
                    : '—'}
                </td>

                <td style="color:var(--text-mid);">
                  ${invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString('en-IN')
                    : '—'}
                </td>

                <td>
                  ${money(Number(invoice.total) || 0)}
                </td>

                <td style="text-align:right;">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm nx-invoice-pdf"
                    data-invoice-id="${invoice.id}"
                    title="View invoice PDF"
                    aria-label="View invoice PDF"
                    style="
                      width:36px;
                      height:36px;
                      padding:0;
                      display:inline-flex;
                      align-items:center;
                      justify-content:center;
                    "
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6"/>
                      <path d="M8 13h8"/>
                      <path d="M8 17h6"/>
                    </svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    console.log(
      `NEXUS: ${result.data.length} invoices loaded from PostgreSQL`
    );

  } catch (error) {
    console.error('NEXUS live invoices load failed:', error);
  }
})();


/* NEXUS_LIVE_INVOICE_PDF_HANDLER */
document.addEventListener('click', async function(e) {
  const button = e.target.closest('.nx-invoice-pdf');
  if (!button) return;

  e.preventDefault();
  e.stopPropagation();

  const invoiceId = button.dataset.invoiceId;

  if (!invoiceId) {
    if (typeof toast === 'function') {
      toast('PDF unavailable', 'Invoice ID is missing.');
    }
    return;
  }

  const token = localStorage.getItem('nexus_token');
  const pdfWindow = window.open('about:blank', '_blank');

  if (!pdfWindow) {
    if (typeof toast === 'function') {
      toast('PDF blocked', 'Allow pop-ups for NEXUS.');
    }
    return;
  }

  pdfWindow.document.write(`
    <html>
      <head>
        <title>NEXUS Invoice</title>
      </head>
      <body style="
        margin:0;
        display:flex;
        align-items:center;
        justify-content:center;
        height:100vh;
        background:#0b0f14;
        color:#aab4c0;
        font-family:Arial,sans-serif;
      ">
        Opening invoice PDF…
      </body>
    </html>
  `);
  pdfWindow.document.close();

  try {
    const response = await fetch(
      'http://localhost:5000/api/invoices/' +
      encodeURIComponent(invoiceId) +
      '/pdf',
      {
        headers: token
          ? { Authorization: 'Bearer ' + token }
          : {}
      }
    );

    if (!response.ok) {
      let message = 'Unable to generate invoice PDF.';
      try {
        const data = await response.json();
        if (data.message) message = data.message;
      } catch (_) {}
      throw new Error(message);
    }

    const blob = await response.blob();
    const pdfUrl = URL.createObjectURL(blob);

    pdfWindow.location.href = pdfUrl;

    setTimeout(function() {
      URL.revokeObjectURL(pdfUrl);
    }, 60000);

  } catch (error) {
    console.error('NEXUS PDF:', error);

    try {
      pdfWindow.close();
    } catch (_) {}

    if (typeof toast === 'function') {
      toast('PDF failed', error.message);
    }
  }
});

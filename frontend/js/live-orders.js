(async function () {
  if (!window.NexusAPI || !localStorage.getItem('nexus_token')) {
    return;
  }

  try {
    const result = await NexusAPI.orders();

    if (!result.success || !Array.isArray(result.data)) {
      return;
    }

    window.NEXUS_LIVE_ORDERS = result.data;

    const container = document.getElementById('orders-table');

    if (container) {
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${result.data.map(order => `
              <tr>
                <td>
                  <span class="cell-title">#NX-${order.id}</span>
                </td>
                <td>${order.customer || '—'}</td>
                <td>
                  <span class="pill ${
                    order.status === 'completed'
                      ? 'pill-ok'
                      : order.status === 'processing'
                        ? 'pill-warn'
                        : 'pill-neutral'
                  }">
                    ${order.status || 'pending'}
                  </span>
                </td>
                <td>${order.payment_status || 'pending'}</td>
                <td>${money(Number(order.total) || 0)}</td>
                <td style="color:var(--text-mid);">
                  ${order.created_at
                    ? new Date(order.created_at).toLocaleDateString('en-IN')
                    : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    console.log(
      `NEXUS: ${result.data.length} orders loaded from PostgreSQL`
    );

  } catch (error) {
    console.error('NEXUS live orders load failed:', error);
  }
})();

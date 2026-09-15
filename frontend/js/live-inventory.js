(async function () {
  if (!window.NexusAPI || !localStorage.getItem('nexus_token')) {
    return;
  }

  try {
    const result = await NexusAPI.inventory();

    if (!result.success || !Array.isArray(result.data)) {
      return;
    }

    window.NEXUS_LIVE_INVENTORY = result.data;

    const table = document.getElementById('inventory-table');

    if (table) {
      table.innerHTML = `
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
            ${result.data.map(item => {
              const quantity = Number(item.quantity) || 0;
              const reserved = 0;
              const available = quantity - reserved;
              const reorder = 50;
              const pct = Math.min(100, Math.max(0, (quantity / 300) * 100));

              return `
                <tr>
                  <td>
                    <span class="cell-title">${item.product || '—'}</span>
                    <div class="cell-sub">${item.sku || ''}</div>
                  </td>
                  <td>${item.warehouse || '—'}</td>
                  <td>${quantity}</td>
                  <td>${reserved}</td>
                  <td>${available}</td>
                  <td style="color:var(--text-mid);">${reorder}</td>
                  <td>
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        style="width:${pct}%;background:${pct < 35
                          ? 'linear-gradient(90deg,#E5584A,#E8A93B)'
                          : 'linear-gradient(90deg,var(--mango-1),var(--mango-gold))'};">
                      </div>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

      const sub = document.querySelector('#screen-inventory .panel-head .sub');

      if (sub) {
        sub.textContent =
          `${result.data.length} inventory records tracked across warehouses`;
      }
    }

    console.log(
      `NEXUS: ${result.data.length} inventory records loaded from PostgreSQL`
    );

  } catch (error) {
    console.error('NEXUS live inventory load failed:', error);
  }
})();

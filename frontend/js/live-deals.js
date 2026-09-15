(async function () {
  if (!window.NexusAPI || !localStorage.getItem('nexus_token')) return;

  try {
    const result = await NexusAPI.deals();

    if (!result.success || !Array.isArray(result.data)) return;

    window.NEXUS_LIVE_DEALS = result.data;

    const container =
      document.getElementById('deals-table') ||
      document.getElementById('pipeline-table');

    if (container) {
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Customer</th>
              <th>Stage</th>
              <th>Value</th>
              <th>Probability</th>
              <th>Weighted value</th>
            </tr>
          </thead>
          <tbody>
            ${result.data.map(deal => {
              const value = Number(deal.value) || 0;
              const probability = Number(deal.probability) || 0;
              const weighted = value * probability / 100;

              return `
                <tr>
                  <td>
                    <span class="cell-title">
                      ${deal.name}
                    </span>
                  </td>

                  <td>${deal.customer || '—'}</td>

                  <td>
                    <span class="pill pill-neutral">
                      ${deal.stage || 'lead'}
                    </span>
                  </td>

                  <td>${money(value)}</td>

                  <td>${probability}%</td>

                  <td>${money(weighted)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    console.log(
      `NEXUS: ${result.data.length} deals loaded from PostgreSQL`
    );

  } catch (error) {
    console.error('NEXUS live deals load failed:', error);
  }
})();

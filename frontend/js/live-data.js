(async function () {
  if (!window.NexusAPI || !localStorage.getItem('nexus_token')) {
    return;
  }

  try {
    const [customerResult, orderResult] = await Promise.all([
      NexusAPI.customers(),
      NexusAPI.orders()
    ]);

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
          ? new Date(c.last_order).toLocaleDateString('en-IN')
          : '—',
        seg: Number(c.orders) > 5 ? 'VIP' : 'Active',
        notes: ''
      }));

      window.NEXUS_LIVE_CUSTOMERS = liveCustomers;

      if (Array.isArray(window.customersData)) {
        window.customersData.splice(
          0,
          window.customersData.length,
          ...liveCustomers
        );
      }

      if (typeof customersData !== 'undefined') {
        customersData.splice(
          0,
          customersData.length,
          ...liveCustomers
        );

        if (typeof renderCustomersTable === 'function') {
          renderCustomersTable();
        }
      }

      console.log(
        `NEXUS: ${liveCustomers.length} customers loaded from PostgreSQL`
      );
    }

    const [productResult, inventoryResult] = await Promise.all([
      NexusAPI.products(),
      NexusAPI.inventory()
    ]);

    if (productResult.success && Array.isArray(productResult.data)) {
      const inventoryRows =
        inventoryResult.success && Array.isArray(inventoryResult.data)
          ? inventoryResult.data
          : [];

      const stockByProduct = {};

      inventoryRows.forEach(row => {
        const id = Number(row.product_id);
        stockByProduct[id] = (stockByProduct[id] || 0) + Number(row.quantity || 0);
      });

      const liveProducts = productResult.data.map(p => {
        const stock = stockByProduct[Number(p.id)] || 0;

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

      if (typeof products !== 'undefined') {
        products.splice(
          0,
          products.length,
          ...liveProducts
        );

        if (typeof renderProductsTable === 'function') {
          renderProductsTable();
        }
      }

      console.log(
        `NEXUS: ${liveProducts.length} products loaded from PostgreSQL`
      );
    }

    if (inventoryResult.success && Array.isArray(inventoryResult.data)) {
      const liveInventory = inventoryResult.data.map(i => ({
        id: i.id,
        product_id: i.product_id,
        name: i.product || '',
        sku: i.sku || '',
        loc: i.warehouse || '',
        onhand: Number(i.quantity) || 0,
        reserved: 0,
        avail: Number(i.quantity) || 0,
        reorder: 0,
        pct: 100,
        updated: i.updated_at || null
      }));

      window.NEXUS_LIVE_INVENTORY = liveInventory;

      if (typeof inventoryData !== 'undefined') {
        inventoryData.splice(
          0,
          inventoryData.length,
          ...liveInventory
        );

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
                  <th>Reorder</th>
                  <th>Stock level</th>
                </tr>
              </thead>
              <tbody>
                ${inventoryData.map(i => `
                  <tr>
                    <td><span class="cell-title">${typeof esc === 'function' ? esc(i.name) : i.name}</span></td>
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

      console.log(
        `NEXUS: ${liveInventory.length} inventory records loaded from PostgreSQL`
      );
    }

    if (orderResult.success && Array.isArray(orderResult.data)) {
      const liveOrders = orderResult.data.map(o => ({
        id: o.id,
        cust: o.customer || 'Unknown customer',
        total: Number(o.total) || 0,
        fulfill: String(o.status || 'pending').toLowerCase(),
        date: o.created_at
          ? new Date(o.created_at).toLocaleDateString('en-IN')
          : '—',
        payment: o.payment_status || 'pending'
      }));

      window.NEXUS_LIVE_ORDERS = liveOrders;

      if (Array.isArray(window.ordersData)) {
        window.ordersData.splice(
          0,
          window.ordersData.length,
          ...liveOrders
        );
      }

      if (typeof ordersData !== 'undefined') {
        ordersData.splice(
          0,
          ordersData.length,
          ...liveOrders
        );

        if (typeof renderOrders === 'function') {
          renderOrders('all');
        }
      }

      console.log(
        `NEXUS: ${liveOrders.length} orders loaded from PostgreSQL`
      );
    }
  } catch (error) {
    console.error('NEXUS live data load failed:', error);
  }
})();

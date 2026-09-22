(async function () {
  if (!window.NexusAPI || !localStorage.getItem('nexus_token')) {
    return;
  }

  try {
    const [result, invResult] = await Promise.all([
      NexusAPI.products(),
      NexusAPI.inventory().catch(() => ({ success: false, data: [] }))
    ]);

    if (!result.success || !Array.isArray(result.data)) {
      return;
    }

    const stockMap = {};
    if (invResult.success && Array.isArray(invResult.data)) {
      invResult.data.forEach(item => {
        const pid = Number(item.product_id);
        stockMap[pid] = (stockMap[pid] || 0) + (Number(item.quantity) || 0);
      });
    }

    const liveProducts = result.data.map(p => {
      const stock = stockMap[Number(p.id)] !== undefined ? stockMap[Number(p.id)] : 0;
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        cat: p.category || 'Uncategorized',
        price: Number(p.price) || 0,
        stock,
        status: stock === 0 ? 'danger' : stock < 50 ? 'warn' : 'ok'
      };
    });

    window.NEXUS_LIVE_PRODUCTS = liveProducts;

    if (typeof products !== 'undefined' && Array.isArray(products)) {
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
  } catch (error) {
    console.error('NEXUS live product load failed:', error);
  }
})();

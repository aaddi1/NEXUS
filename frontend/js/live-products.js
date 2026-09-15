(async function () {
  if (!window.NexusAPI || !localStorage.getItem('nexus_token')) {
    return;
  }

  try {
    const result = await NexusAPI.products();

    if (!result.success || !Array.isArray(result.data)) {
      return;
    }

    const liveProducts = result.data.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      cat: p.category || 'Uncategorized',
      price: Number(p.price) || 0,
      stock: 0,
      status: 'ok'
    }));

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

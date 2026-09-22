const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET COMPREHENSIVE DASHBOARD METRICS
router.get('/stats', async (req, res) => {
  try {
    const [kpiRes, recentOrdersRes, topProductsRes, activityRes] = await Promise.all([
      // Aggregated KPIs
      pool.query(`
        SELECT
          (SELECT COALESCE(SUM(total), 0) FROM orders) AS total_revenue,
          (SELECT COUNT(*) FROM orders) AS total_orders,
          (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL) AS total_customers,
          (SELECT COALESCE(SUM(i.quantity * p.price), 0) FROM inventory i JOIN products p ON p.id = i.product_id) AS inventory_value,
          (SELECT COUNT(*) FROM inventory WHERE quantity < 50) AS low_stock_count,
          (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status NOT IN ('paid', 'dismissed')) AS outstanding_invoices
      `),
      // 5 Most recent orders
      pool.query(`
        SELECT
          o.id,
          o.total,
          o.status,
          o.payment_status,
          o.created_at,
          c.name AS customer
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        ORDER BY o.id DESC
        LIMIT 5
      `),
      // Top products by actual sales revenue and units sold
      pool.query(`
        SELECT
          p.id,
          p.name,
          p.sku,
          p.price,
          COALESCE(sales.units_sold, 0)::int AS units_sold,
          COALESCE(sales.revenue, 0)::float AS rev,
          COALESCE(inv.stock, 0)::int AS stock
        FROM products p
        LEFT JOIN (
          SELECT product_id, SUM(quantity) AS units_sold, SUM(quantity * unit_price) AS revenue
          FROM order_items
          GROUP BY product_id
        ) sales ON sales.product_id = p.id
        LEFT JOIN (
          SELECT product_id, SUM(quantity) AS stock
          FROM inventory
          GROUP BY product_id
        ) inv ON inv.product_id = p.id
        ORDER BY rev DESC, units_sold DESC
        LIMIT 5
      `),
      // Recent activities feed
      pool.query(`
        SELECT * FROM (
          SELECT
            'order' AS type,
            CONCAT('Order #NX-', o.id, ' created for ', COALESCE(c.name, 'Customer')) AS text,
            o.created_at AS time
          FROM orders o
          LEFT JOIN customers c ON c.id = o.customer_id

          UNION ALL

          SELECT
            'invoice' AS type,
            CONCAT('Invoice ', i.invoice_number, ' generated') AS text,
            i.created_at AS time
          FROM invoices i

          UNION ALL

          SELECT
            'deal' AS type,
            CONCAT('Deal "', d.name, '" updated in pipeline') AS text,
            d.created_at AS time
          FROM deals d
        ) activities
        ORDER BY time DESC
        LIMIT 6
      `)
    ]);

    const stats = kpiRes.rows[0];

    res.json({
      success: true,
      data: {
        kpis: {
          revenue: Number(stats.total_revenue || 0),
          orders: Number(stats.total_orders || 0),
          customers: Number(stats.total_customers || 0),
          inventory_value: Number(stats.inventory_value || 0),
          low_stock_count: Number(stats.low_stock_count || 0),
          outstanding_invoices: Number(stats.outstanding_invoices || 0)
        },
        recent_orders: recentOrdersRes.rows,
        top_products: topProductsRes.rows,
        activities: activityRes.rows
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard metrics'
    });
  }
});

module.exports = router;

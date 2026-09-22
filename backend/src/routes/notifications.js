const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET DYNAMIC BUSINESS NOTIFICATIONS
router.get('/', async (req, res) => {
  try {
    const notifications = [];

    // 1. Low stock alerts
    const lowStock = await pool.query(`
      SELECT
        p.name AS product,
        p.sku,
        i.warehouse,
        i.quantity
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE i.quantity <= 50
      ORDER BY i.quantity ASC
      LIMIT 5
    `);

    lowStock.rows.forEach(item => {
      notifications.push({
        id: `stock-${item.sku}-${item.warehouse}`,
        type: 'alert',
        title: item.quantity === 0 ? 'Out of stock alert' : 'Low stock warning',
        message: `${item.product} (${item.sku}) in ${item.warehouse} warehouse has only ${item.quantity} units remaining.`,
        time: 'Active alert',
        unread: item.quantity === 0,
        screen: 'inventory'
      });
    });

    // 2. Overdue / Due invoices
    const dueInvoices = await pool.query(`
      SELECT
        i.invoice_number,
        i.total,
        i.due_date,
        i.status,
        c.name AS customer
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      WHERE i.status IN ('due', 'overdue')
      ORDER BY i.due_date ASC
      LIMIT 5
    `);

    dueInvoices.rows.forEach(inv => {
      notifications.push({
        id: `inv-${inv.invoice_number}`,
        type: 'invoice',
        title: inv.status === 'overdue' ? 'Overdue Invoice' : 'Invoice Payment Due',
        message: `Invoice ${inv.invoice_number} for ${inv.customer || 'Customer'} (₹${Number(inv.total).toLocaleString('en-IN')}) is ${inv.status}.`,
        time: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : 'Action needed',
        unread: inv.status === 'overdue',
        screen: 'invoices'
      });
    });

    // 3. Recent orders
    const recentOrders = await pool.query(`
      SELECT
        o.id,
        o.total,
        o.status,
        o.created_at,
        c.name AS customer
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY o.id DESC
      LIMIT 5
    `);

    recentOrders.rows.forEach(ord => {
      notifications.push({
        id: `ord-${ord.id}`,
        type: 'order',
        title: 'Order Status Update',
        message: `Order #NX-${ord.id} for ${ord.customer || 'Customer'} is ${ord.status} (₹${Number(ord.total).toLocaleString('en-IN')}).`,
        time: ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN') : 'Recent',
        unread: ord.status === 'pending',
        screen: 'orders'
      });
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET ALL ORDERS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.status,
        o.payment_status,
        o.total,
        o.created_at,
        c.name AS customer
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY o.id DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// GET ONE ORDER WITH ITEMS
router.get('/:id', async (req, res) => {
  try {
    const order = await pool.query(`
      SELECT
        o.id,
        o.customer_id,
        c.name AS customer,
        o.status,
        o.payment_status,
        o.total,
        o.created_at
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1
    `, [req.params.id]);

    if (order.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const items = await pool.query(`
      SELECT
        oi.id,
        oi.product_id,
        p.name AS product,
        oi.quantity,
        oi.unit_price,
        oi.quantity * oi.unit_price AS subtotal
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...order.rows[0],
        items: items.rows
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// CREATE ORDER
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      items,
      status = 'pending',
      payment_status = 'pending'
    } = req.body;

    if (
      !customer_id ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Customer and order items are required'
      });
    }

    await client.query('BEGIN');

    const customer = await client.query(
      'SELECT id FROM customers WHERE id = $1',
      [customer_id]
    );

    if (customer.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    let total = 0;

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          success: false,
          message: 'Each item needs a valid product and quantity'
        });
      }

      const product = await client.query(
        'SELECT id, price FROM products WHERE id = $1',
        [item.product_id]
      );

      if (product.rows.length === 0) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          success: false,
          message: `Product ${item.product_id} not found`
        });
      }

      const unitPrice = Number(product.rows[0].price);
      total += unitPrice * Number(item.quantity);
    }

    const order = await client.query(
      `INSERT INTO orders
       (customer_id, status, payment_status, total)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_id, status, payment_status, total]
    );

    const orderId = order.rows[0].id;

    for (const item of items) {
      const product = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [item.product_id]
      );

      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [
          orderId,
          item.product_id,
          item.quantity,
          product.rows[0].price
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: order.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  } finally {
    client.release();
  }
});

// UPDATE ORDER STATUS
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, payment_status } = req.body;

    const result = await pool.query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           payment_status = COALESCE($2, payment_status)
       WHERE id = $3
       RETURNING *`,
      [status || null, payment_status || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

module.exports = router;

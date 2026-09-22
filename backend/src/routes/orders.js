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
        o.payment_method,
        o.warehouse,
        o.subtotal,
        o.discount,
        o.tax_rate,
        o.tax_amount,
        o.total,
        o.notes,
        o.employee_id,
        o.created_at,
        c.name AS customer,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.company AS customer_company,
        u.name AS sales_person,
        COUNT(oi.id)::int AS items_count
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN users u ON u.id = o.employee_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, c.id, u.id
      ORDER BY o.id DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch orders error:', error);
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
        o.employee_id,
        c.name AS customer,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.company AS customer_company,
        c.city AS customer_city,
        u.name AS sales_person,
        o.status,
        o.payment_status,
        o.payment_method,
        o.warehouse,
        o.subtotal,
        o.discount,
        o.tax_rate,
        o.tax_amount,
        o.total,
        o.notes,
        o.created_at
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN users u ON u.id = o.employee_id
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
        p.sku,
        oi.quantity,
        oi.unit_price,
        oi.unit_cost,
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
    console.error('Fetch order detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// CREATE ORDER WITH ATOMIC STOCK ROW LOCKING, MOVEMENT LEDGER, AND OPTIONAL INVOICE
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      items,
      status = 'pending',
      payment_status = 'pending',
      payment_method = 'upi',
      warehouse = 'Mumbai',
      discount = 0,
      tax_rate = 0,
      notes = '',
      employee_id,
      generate_invoice = false
    } = req.body;

    if (!customer_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer and order items are required'
      });
    }

    const assignedEmployeeId = employee_id || (req.user ? req.user.id : null);

    await client.query('BEGIN');

    const customer = await client.query(
      'SELECT id, name, email, phone, company, city FROM customers WHERE id = $1',
      [customer_id]
    );

    if (customer.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    let rawSubtotal = 0;
    const resolvedItems = [];

    // Step 1: Validate stock with SELECT ... FOR UPDATE (Prevents Overselling)
    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Math.max(1, Number(item.quantity) || 1);

      const product = await client.query(
        'SELECT id, name, sku, price, unit_cost FROM products WHERE id = $1',
        [productId]
      );

      if (product.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: `Product ID ${productId} not found`
        });
      }

      // Lock warehouse stock row
      const stockRow = await client.query(
        `SELECT quantity FROM inventory
         WHERE product_id = $1 AND warehouse = $2
         FOR UPDATE`,
        [productId, warehouse]
      );

      const availableStock = stockRow.rows.length > 0 ? Number(stockRow.rows[0].quantity) : 0;

      if (availableStock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.rows[0].name}" in ${warehouse} warehouse. Available: ${availableStock}, Requested: ${quantity}.`
        });
      }

      const unitPrice = Number(item.unit_price !== undefined ? item.unit_price : product.rows[0].price);
      const unitCost = Number(product.rows[0].unit_cost || 0);
      const lineTotal = unitPrice * quantity;
      rawSubtotal += lineTotal;

      resolvedItems.push({
        product_id: productId,
        product_name: product.rows[0].name,
        sku: product.rows[0].sku,
        quantity,
        unit_price: unitPrice,
        unit_cost: unitCost,
        subtotal: lineTotal
      });
    }

    const discountAmount = Math.max(0, Number(discount) || 0);
    const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
    const taxRatePercent = Math.max(0, Math.min(100, Number(tax_rate) || 0));
    const taxAmount = Math.round(taxableAmount * (taxRatePercent / 100) * 100) / 100;
    const finalTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

    // Step 2: Insert Order
    const orderResult = await client.query(
      `INSERT INTO orders
       (customer_id, employee_id, status, payment_status, payment_method, warehouse, subtotal, discount, tax_rate, tax_amount, total, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        customer_id,
        assignedEmployeeId,
        status,
        payment_status,
        payment_method,
        warehouse,
        rawSubtotal.toFixed(2),
        discountAmount.toFixed(2),
        taxRatePercent,
        taxAmount.toFixed(2),
        finalTotal.toFixed(2),
        notes || null
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Step 3: Insert Order Items, Decrement Inventory & Record Movements Ledger
    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price, unit_cost)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.unit_cost]
      );

      // Decrement warehouse stock
      await client.query(
        `UPDATE inventory
         SET quantity = quantity - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2 AND warehouse = $3`,
        [item.quantity, item.product_id, warehouse]
      );

      // Record in permanent inventory movements ledger
      await client.query(
        `INSERT INTO inventory_movements
         (product_id, warehouse, quantity_change, movement_type, reference_type, reference_id, actor_id, notes)
         VALUES ($1, $2, $3, 'sale', 'order', $4, $5, $6)`,
        [
          item.product_id,
          warehouse,
          -(item.quantity),
          orderId,
          assignedEmployeeId,
          `Sale for order #NX-${orderId} (${customer.rows[0].name})`
        ]
      );
    }

    // Step 4: Optional Instant Invoice & Payment Record
    let generatedInvoice = null;
    if (generate_invoice) {
      const sequence = await client.query(
        `SELECT nextval('nexus_invoice_seq') AS number`
      );

      const invoiceNumber = `NEXUS-INV-${new Date().getFullYear()}-${String(sequence.rows[0].number).padStart(5, '0')}`;
      const invoiceStatus = payment_status === 'paid' ? 'paid' : 'due';

      const invoiceResult = await client.query(
        `INSERT INTO invoices
         (customer_id, invoice_number, status, issue_date, due_date, total, tax_rate, discount, payment_method)
         VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', $4, $5, $6, $7)
         RETURNING *`,
        [
          customer_id,
          invoiceNumber,
          invoiceStatus,
          finalTotal.toFixed(2),
          taxRatePercent,
          discountAmount.toFixed(2),
          payment_method
        ]
      );

      const invoiceId = invoiceResult.rows[0].id;

      for (const item of resolvedItems) {
        await client.query(
          `INSERT INTO invoice_items
           (invoice_id, product_id, description, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [invoiceId, item.product_id, item.product_name, item.quantity, item.unit_price]
        );
      }

      // Record payment transaction if paid
      if (payment_status === 'paid') {
        await client.query(
          `INSERT INTO payments (invoice_id, amount, payment_method, payment_status)
           VALUES ($1, $2, $3, 'completed')`,
          [invoiceId, finalTotal.toFixed(2), payment_method]
        );
      }

      generatedInvoice = {
        id: invoiceId,
        invoice_number: invoiceNumber,
        status: invoiceStatus,
        total: finalTotal
      };
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...orderResult.rows[0],
        customer_name: customer.rows[0].name,
        items: resolvedItems,
        invoice: generatedInvoice
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
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
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

module.exports = router;

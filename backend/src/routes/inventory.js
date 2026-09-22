const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET ALL INVENTORY
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.product_id,
        p.name AS product,
        p.sku,
        i.warehouse,
        i.quantity,
        i.updated_at
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      ORDER BY i.id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory'
    });
  }
});

// GET PRODUCT STOCK
router.get('/product/:productId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.product_id,
        p.name AS product,
        p.sku,
        i.warehouse,
        i.quantity,
        i.updated_at
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE i.product_id = $1
      ORDER BY i.warehouse
    `, [req.params.productId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product stock'
    });
  }
});

// ADJUST STOCK
router.patch('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const result = await pool.query(
      `UPDATE inventory
       SET quantity = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [Number(quantity), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
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
      message: 'Failed to adjust stock'
    });
  }
});

// TRANSFER STOCK
router.post('/transfer', async (req, res) => {
  const client = await pool.connect();

  try {
    const product_id = req.body.product_id;
    const from_warehouse = req.body.from_warehouse || req.body.from;
    const to_warehouse = req.body.to_warehouse || req.body.to;
    const quantity = req.body.quantity;

    if (
      !product_id ||
      !from_warehouse ||
      !to_warehouse ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product, warehouses and valid quantity are required'
      });
    }

    if (from_warehouse === to_warehouse) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination warehouses must be different'
      });
    }

    await client.query('BEGIN');

    const source = await client.query(
      `SELECT *
       FROM inventory
       WHERE product_id = $1
       AND warehouse = $2
       FOR UPDATE`,
      [product_id, from_warehouse]
    );

    if (source.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        success: false,
        message: 'Source warehouse stock not found'
      });
    }

    if (source.rows[0].quantity < Number(quantity)) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    await client.query(
      `UPDATE inventory
       SET quantity = quantity - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [Number(quantity), source.rows[0].id]
    );

    await client.query(
      `INSERT INTO inventory
       (product_id, warehouse, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, warehouse)
       DO UPDATE SET
         quantity = inventory.quantity + EXCLUDED.quantity,
         updated_at = CURRENT_TIMESTAMP`,
      [product_id, to_warehouse, Number(quantity)]
    );

    // Record movement in inventory_movements ledger
    const actorId = req.user ? req.user.id : null;
    await client.query(
      `INSERT INTO inventory_movements
       (product_id, warehouse, quantity_change, movement_type, reference_type, actor_id, notes)
       VALUES ($1, $2, $3, 'transfer_out', 'transfer', $4, $5)`,
      [product_id, from_warehouse, -Number(quantity), actorId, `Transfer to ${to_warehouse}`]
    );
    await client.query(
      `INSERT INTO inventory_movements
       (product_id, warehouse, quantity_change, movement_type, reference_type, actor_id, notes)
       VALUES ($1, $2, $3, 'transfer_in', 'transfer', $4, $5)`,
      [product_id, to_warehouse, Number(quantity), actorId, `Transfer from ${from_warehouse}`]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Stock transferred successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transfer stock error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to transfer stock'
    });
  } finally {
    client.release();
  }
});

module.exports = router;

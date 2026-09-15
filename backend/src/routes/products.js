const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.price,
        p.category_id,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// GET ONE
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.price,
        p.category_id,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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
      message: 'Failed to fetch product'
    });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { name, sku, category_id, price } = req.body;

    if (!name || !sku || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU and price are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO products
       (name, sku, category_id, price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, sku, category_id || null, price]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, category_id, price } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           sku = $2,
           category_id = $3,
           price = $4
       WHERE id = $5
       RETURNING *`,
      [name, sku, category_id || null, price, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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
      message: 'Failed to update product'
    });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Product cannot be deleted because it is being used'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

module.exports = router;

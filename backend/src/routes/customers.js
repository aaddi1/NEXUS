const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET ALL CUSTOMERS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.city,
        c.created_at,
        COUNT(DISTINCT o.id)::int AS orders,
        COALESCE(SUM(o.total), 0) AS ltv,
        MAX(o.created_at) AS last_order
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
});

// GET ONE CUSTOMER
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.city,
        c.created_at,
        COUNT(DISTINCT o.id)::int AS orders,
        COALESCE(SUM(o.total), 0) AS ltv,
        MAX(o.created_at) AS last_order
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      WHERE c.id = $1 AND c.deleted_at IS NULL
      GROUP BY c.id
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
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
      message: 'Failed to fetch customer'
    });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, city } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const result = await pool.query(
      `INSERT INTO customers
       (name, email, phone, company, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email || null, phone || null, company || null, city || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer'
    });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, company, city } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET name = $1,
           email = $2,
           phone = $3,
           company = $4,
           city = $5
       WHERE id = $6
       RETURNING *`,
      [name, email || null, phone || null, company || null, city || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
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
      message: 'Failed to update customer'
    });
  }
});

// DELETE / ARCHIVE
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE customers
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer archived',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive customer'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET ALL DEALS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.name,
        d.stage,
        d.value,
        d.probability,
        d.created_at,
        d.customer_id,
        c.name AS customer
      FROM deals d
      LEFT JOIN customers c ON c.id = d.customer_id
      ORDER BY d.id DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deals'
    });
  }
});

// GET ONE DEAL
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.*,
        c.name AS customer
      FROM deals d
      LEFT JOIN customers c ON c.id = d.customer_id
      WHERE d.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
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
      message: 'Failed to fetch deal'
    });
  }
});

// CREATE DEAL
router.post('/', async (req, res) => {
  try {
    const {
      customer_id,
      name,
      stage = 'lead',
      value = 0,
      probability = 0
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Deal name is required'
      });
    }

    if (Number(value) < 0 || Number(probability) < 0 || Number(probability) > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid value or probability'
      });
    }

    const result = await pool.query(
      `INSERT INTO deals
       (customer_id, name, stage, value, probability)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        customer_id || null,
        name,
        stage,
        Number(value),
        Number(probability)
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deal'
    });
  }
});

// UPDATE DEAL
router.put('/:id', async (req, res) => {
  try {
    const {
      customer_id,
      name,
      stage,
      value,
      probability
    } = req.body;

    const result = await pool.query(
      `UPDATE deals
       SET customer_id = $1,
           name = $2,
           stage = $3,
           value = $4,
           probability = $5
       WHERE id = $6
       RETURNING *`,
      [
        customer_id || null,
        name,
        stage,
        Number(value),
        Number(probability),
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
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
      message: 'Failed to update deal'
    });
  }
});

// UPDATE STAGE
router.patch('/:id/stage', async (req, res) => {
  try {
    const { stage, probability } = req.body;

    if (!stage) {
      return res.status(400).json({
        success: false,
        message: 'Stage is required'
      });
    }

    const result = await pool.query(
      `UPDATE deals
       SET stage = $1,
           probability = COALESCE($2, probability)
       WHERE id = $3
       RETURNING *`,
      [
        stage,
        probability === undefined ? null : Number(probability),
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
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
      message: 'Failed to update deal stage'
    });
  }
});

// DELETE DEAL
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM deals WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.json({
      success: true,
      message: 'Deal deleted',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deal'
    });
  }
});

module.exports = router;

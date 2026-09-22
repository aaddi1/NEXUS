const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// SUBMIT A COMPLAINT (Open to authenticated clients, shop owners, and admins)
router.post('/', async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      company = '',
      type,
      subject,
      message,
      priority = 'medium'
    } = req.body;

    if (!user_name || !user_email || !type || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, category type, subject, and message are required'
      });
    }

    const userId = req.user ? req.user.id : null;

    const result = await pool.query(
      `INSERT INTO complaints
       (user_id, user_name, user_email, company, type, subject, message, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
       RETURNING *`,
      [
        userId,
        user_name.trim(),
        user_email.trim().toLowerCase(),
        company.trim(),
        type.trim(),
        subject.trim(),
        message.trim(),
        priority.toLowerCase()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and dispatched to Aryan Sharma Admin Portal',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint'
    });
  }
});

// GET ALL COMPLAINTS (For Admin Portal)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.user_id,
        c.user_name,
        c.user_email,
        c.company,
        c.type,
        c.subject,
        c.message,
        c.priority,
        c.status,
        c.admin_reply,
        c.created_at,
        c.resolved_at
      FROM complaints c
      ORDER BY
        CASE WHEN c.status = 'open' THEN 1 ELSE 2 END,
        CASE WHEN c.priority = 'critical' THEN 1 WHEN c.priority = 'high' THEN 2 ELSE 3 END,
        c.id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
});

// RESOLVE COMPLAINT & SEND ADMIN REPLY
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { admin_reply = 'Resolved by Super Admin Aryan Sharma' } = req.body;

    const result = await pool.query(
      `UPDATE complaints
       SET status = 'resolved',
           admin_reply = $1,
           resolved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [admin_reply, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint resolved and response logged',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve complaint'
    });
  }
});

// DELETE COMPLAINT
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM complaints WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint purged',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint'
    });
  }
});

module.exports = router;

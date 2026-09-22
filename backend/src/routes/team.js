const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db/database');

// GET ALL TEAM MEMBERS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        created_at
      FROM users
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members'
    });
  }
});

// ADD TEAM MEMBER
router.post('/', async (req, res) => {
  try {
    const { name, email, role = 'member', password = 'password123' } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, LOWER($2), $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.trim(), passwordHash, role.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Team member added',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add team member error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add team member'
    });
  }
});

// DELETE TEAM MEMBER
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      message: 'Team member removed',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member'
    });
  }
});

module.exports = router;

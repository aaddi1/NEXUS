const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-development-secret';

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'member' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
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

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// SSO LOGIN / REGISTRATION (Google, GitHub, Microsoft)
router.post('/sso', async (req, res) => {
  try {
    const { provider = 'SSO', email, name, role = 'member' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    let user = await pool.query(
      'SELECT id, name, email, role FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (user.rows.length === 0) {
      const dummySalt = await bcrypt.genSalt(10);
      const dummyHash = await bcrypt.hash('sso_authenticated_user_nexus_2026', dummySalt);

      const inserted = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [cleanName, cleanEmail, dummyHash, role]
      );
      user = inserted;
    }

    const userData = user.rows[0];

    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: `Signed in via ${provider}`,
      token,
      user: userData
    });
  } catch (error) {
    console.error('SSO backend error:', error);
    res.status(500).json({
      success: false,
      message: 'SSO authentication failed'
    });
  }
});

// GET CURRENT AUTH USER
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;

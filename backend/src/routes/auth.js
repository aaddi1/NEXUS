const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nexus-development-secret';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

function getUserAgent(req) {
  return req.headers['user-agent'] || 'Unknown Browser';
}

async function logUserLogin(userId, email, method, ip, ua, status) {
  try {
    await pool.query(
      `INSERT INTO user_logins (user_id, email, login_method, ip_address, user_agent, status)
       VALUES ($1, LOWER($2), $3, $4, $5, $6)`,
      [userId || null, email, method, ip, ua, status]
    );
  } catch (err) {
    console.error('Failed to record login audit log:', err.message);
  }
}

// LOGIN
router.post('/login', async (req, res) => {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, workspace_type, is_active, company_name
       FROM users
       WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      await logUserLogin(null, cleanEmail, 'password', ip, ua, 'failed_user_not_found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    if (user.is_active === false) {
      await logUserLogin(user.id, cleanEmail, 'password', ip, ua, 'blocked_suspended');
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated/suspended. Please contact Super Admin Aryan Sharma.'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      await logUserLogin(user.id, cleanEmail, 'password', ip, ua, 'failed_wrong_password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last accessed
    await pool.query('UPDATE users SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    await logUserLogin(user.id, cleanEmail, 'password', ip, ua, 'success');

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        workspace_type: user.workspace_type
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspace_type: user.workspace_type,
        company_name: user.company_name,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  try {
    const { name, email, password, role = 'Owner', workspace_type = 'enterprise', company_name = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, workspace_type, company_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING id, name, email, role, workspace_type, company_name, is_active, created_at`,
      [cleanName, cleanEmail, passwordHash, role.trim(), workspace_type.trim(), company_name.trim() || null]
    );

    const user = result.rows[0];
    await logUserLogin(user.id, cleanEmail, 'registration', ip, ua, 'success');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, workspace_type: user.workspace_type },
      JWT_SECRET,
      { expiresIn: '30d' }
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
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  try {
    const { provider = 'SSO', email, name, role = 'Owner', workspace_type = 'enterprise' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    let user = await pool.query(
      'SELECT id, name, email, role, workspace_type, is_active, company_name FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (user.rows.length === 0) {
      const dummySalt = await bcrypt.genSalt(10);
      const dummyHash = await bcrypt.hash('sso_authenticated_user_nexus_2026', dummySalt);

      const inserted = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, workspace_type, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING id, name, email, role, workspace_type, company_name, is_active, created_at`,
        [cleanName, cleanEmail, dummyHash, role, workspace_type]
      );
      user = inserted;
    }

    const userData = user.rows[0];

    if (userData.is_active === false) {
      await logUserLogin(userData.id, cleanEmail, provider.toLowerCase(), ip, ua, 'blocked_suspended');
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated/suspended. Please contact Super Admin Aryan Sharma.'
      });
    }

    await pool.query('UPDATE users SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1', [userData.id]);
    await logUserLogin(userData.id, cleanEmail, provider.toLowerCase(), ip, ua, 'success');

    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role, workspace_type: userData.workspace_type },
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
      'SELECT id, name, email, role, workspace_type, is_active, company_name, created_at FROM users WHERE id = $1',
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

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/database');
const {
  generateSecret,
  verifyTOTP,
  generateOtpAuthUri,
  generateQrCodeDataUrl,
  generateBackupCodes
} = require('../utils/totp');
const { authenticateToken } = require('../middleware');

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

// 1. LOGIN (PASSWORD)
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
      `SELECT id, name, email, password_hash, role, workspace_type, is_active, company_name, two_factor_enabled, two_factor_secret
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

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      await logUserLogin(user.id, cleanEmail, 'password', ip, ua, 'failed_wrong_password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if Two-Factor Authentication is Enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
      const mfaToken = jwt.sign(
        { id: user.id, email: user.email, mfa_pending: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        success: true,
        mfa_required: true,
        mfa_token: mfaToken,
        email: user.email,
        name: user.name,
        message: 'Google Authenticator 2FA code required'
      });
    }

    // Standard Login
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
        is_active: user.is_active,
        two_factor_enabled: user.two_factor_enabled || false
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

// 2. 2FA VERIFY LOGIN CODE (Google Authenticator / Backup Code)
router.post('/2fa/verify-login', async (req, res) => {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  try {
    const { mfa_token, code } = req.body;

    if (!mfa_token || !code) {
      return res.status(400).json({
        success: false,
        message: 'MFA token and verification code are required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(mfa_token, JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'MFA session expired. Please sign in again.'
      });
    }

    if (!decoded.mfa_pending) {
      return res.status(401).json({ success: false, message: 'Invalid MFA session' });
    }

    const userRes = await pool.query(
      `SELECT id, name, email, role, workspace_type, is_active, company_name, two_factor_secret, two_factor_backup_codes
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];
    const cleanedCode = String(code).trim().toUpperCase();

    // Verify via TOTP Algorithm
    let isTotpValid = verifyTOTP(user.two_factor_secret, cleanedCode, 1);
    let usedBackupCode = false;

    // Check backup codes if TOTP doesn't match
    if (!isTotpValid && Array.isArray(user.two_factor_backup_codes)) {
      const idx = user.two_factor_backup_codes.indexOf(cleanedCode);
      if (idx !== -1) {
        isTotpValid = true;
        usedBackupCode = true;
        // Consume backup code
        user.two_factor_backup_codes.splice(idx, 1);
        await pool.query('UPDATE users SET two_factor_backup_codes = $1 WHERE id = $2', [
          JSON.stringify(user.two_factor_backup_codes),
          user.id
        ]);
      }
    }

    if (!isTotpValid) {
      await logUserLogin(user.id, user.email, '2fa_totp', ip, ua, 'failed_invalid_code');
      return res.status(400).json({
        success: false,
        message: 'Invalid 6-digit Google Authenticator code or backup code'
      });
    }

    // Successful 2FA verification
    await pool.query('UPDATE users SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    await logUserLogin(user.id, user.email, usedBackupCode ? '2fa_backup_code' : '2fa_totp', ip, ua, 'success');

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
      message: 'Two-factor authentication verified',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspace_type: user.workspace_type,
        company_name: user.company_name,
        is_active: user.is_active,
        two_factor_enabled: true
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA code'
    });
  }
});

// 3. 2FA SETUP (GENERATE SECRET & QR CODE)
router.post('/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const secret = generateSecret(20);
    const otpAuthUri = generateOtpAuthUri(userRes.rows[0].email, secret, 'NEXUS');
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri);
    const backupCodes = generateBackupCodes(6);

    res.json({
      success: true,
      secret,
      otpauth_uri: otpAuthUri,
      qr_code_data_url: qrCodeDataUrl,
      backup_codes: backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate 2FA setup' });
  }
});

// 4. 2FA CONFIRM & ACTIVATE SETUP
router.post('/2fa/verify-setup', authenticateToken, async (req, res) => {
  try {
    const { secret, code, backup_codes } = req.body;

    if (!secret || !code) {
      return res.status(400).json({ success: false, message: 'Secret and verification code are required' });
    }

    const isValid = verifyTOTP(secret, String(code).trim(), 1);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check Google Authenticator and try again.'
      });
    }

    await pool.query(
      `UPDATE users
       SET two_factor_enabled = TRUE,
           two_factor_secret = $1,
           two_factor_backup_codes = $2
       WHERE id = $3`,
      [secret, JSON.stringify(backup_codes || []), req.user.id]
    );

    res.json({
      success: true,
      message: 'Google Authenticator 2FA successfully activated on your account!'
    });
  } catch (error) {
    console.error('2FA verify setup error:', error);
    res.status(500).json({ success: false, message: 'Failed to activate 2FA' });
  }
});

// 5. 2FA DISABLE
router.post('/2fa/disable', authenticateToken, async (req, res) => {
  try {
    const { password, code } = req.body;

    const userRes = await pool.query('SELECT password_hash, two_factor_secret FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];

    if (password) {
      const validPw = await bcrypt.compare(password, user.password_hash);
      if (!validPw) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }
    } else if (code) {
      const validTotp = verifyTOTP(user.two_factor_secret, code, 1);
      if (!validTotp) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Password or 2FA code required to disable 2FA' });
    }

    await pool.query(
      `UPDATE users
       SET two_factor_enabled = FALSE,
           two_factor_secret = NULL,
           two_factor_backup_codes = '[]'::jsonb
       WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Two-factor authentication has been disabled.'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
});

// 6. REGISTER
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

    let safeRole = role.trim();
    let safeWorkspace = workspace_type.trim();
    if (safeRole.toLowerCase() === 'superadmin') safeRole = 'Owner';
    if (safeWorkspace.toLowerCase() === 'system') safeWorkspace = 'enterprise';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, workspace_type, company_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING id, name, email, role, workspace_type, company_name, is_active, created_at`,
      [cleanName, cleanEmail, passwordHash, safeRole, safeWorkspace, company_name.trim() || null]
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

// 7. FORGOT PASSWORD REQUEST
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    const result = await pool.query(
      `UPDATE users
       SET reset_password_token = $1,
           reset_password_expires = $2
       WHERE LOWER(email) = $3
       RETURNING id, name, email`,
      [resetToken, expires, cleanEmail]
    );

    res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been generated.',
      reset_token: result.rows.length > 0 ? resetToken : null
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process password reset request' });
  }
});

// 8. RESET PASSWORD SUBMIT
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           reset_password_token = NULL,
           reset_password_expires = NULL
       WHERE reset_password_token = $2 AND reset_password_expires > CURRENT_TIMESTAMP
       RETURNING id, name, email`,
      [passwordHash, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    res.json({
      success: true,
      message: `Password reset successfully for ${result.rows[0].email}`
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// 9. SSO LOGIN / REGISTRATION WITH IDENTITY LINKING
router.post('/sso', async (req, res) => {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  try {
    const { provider = 'google', email, name, provider_user_id, role = 'Owner', workspace_type = 'enterprise' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanProvider = provider.trim().toLowerCase();
    const provUserId = provider_user_id || `${cleanProvider}_${cleanEmail}`;

    const identityRes = await pool.query(
      `SELECT ai.user_id, u.id, u.name, u.email, u.role, u.workspace_type, u.company_name, u.is_active, u.two_factor_enabled, u.two_factor_secret
       FROM auth_identities ai
       JOIN users u ON u.id = ai.user_id
       WHERE ai.provider = $1 AND ai.provider_user_id = $2`,
      [cleanProvider, provUserId]
    );

    let user;

    if (identityRes.rows.length > 0) {
      user = identityRes.rows[0];
    } else {
      const existingUserRes = await pool.query(
        'SELECT id, name, email, role, workspace_type, company_name, is_active, two_factor_enabled, two_factor_secret FROM users WHERE LOWER(email) = $1',
        [cleanEmail]
      );

      if (existingUserRes.rows.length > 0) {
        user = existingUserRes.rows[0];
      } else {
        const dummySalt = await bcrypt.genSalt(10);
        const dummyHash = await bcrypt.hash('sso_authenticated_user_nexus_2026', dummySalt);

        let safeRole = role.trim();
        let safeWorkspace = workspace_type.trim();
        if (safeRole.toLowerCase() === 'superadmin') safeRole = 'Owner';
        if (safeWorkspace.toLowerCase() === 'system') safeWorkspace = 'enterprise';

        const inserted = await pool.query(
          `INSERT INTO users (name, email, password_hash, role, workspace_type, is_active)
           VALUES ($1, $2, $3, $4, $5, TRUE)
           RETURNING id, name, email, role, workspace_type, company_name, is_active, created_at`,
          [cleanName, cleanEmail, dummyHash, safeRole, safeWorkspace]
        );
        user = inserted.rows[0];
      }

      await pool.query(
        `INSERT INTO auth_identities (user_id, provider, provider_user_id, email, profile_data)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (provider, provider_user_id) DO NOTHING`,
        [user.id, cleanProvider, provUserId, cleanEmail, JSON.stringify({ name: cleanName, provider: cleanProvider })]
      );
    }

    if (user.is_active === false) {
      await logUserLogin(user.id, cleanEmail, cleanProvider, ip, ua, 'blocked_suspended');
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated/suspended. Please contact Super Admin Aryan Sharma.'
      });
    }

    // Check if Two-Factor Authentication is Enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
      const mfaToken = jwt.sign(
        { id: user.id, email: user.email, mfa_pending: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        success: true,
        mfa_required: true,
        mfa_token: mfaToken,
        email: user.email,
        name: user.name,
        message: 'Google Authenticator 2FA code required for OAuth account'
      });
    }

    await pool.query('UPDATE users SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    await logUserLogin(user.id, cleanEmail, cleanProvider, ip, ua, 'success');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, workspace_type: user.workspace_type },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: `Signed in via ${provider}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspace_type: user.workspace_type,
        company_name: user.company_name,
        is_active: user.is_active,
        two_factor_enabled: user.two_factor_enabled || false
      }
    });
  } catch (error) {
    console.error('SSO backend error:', error);
    res.status(500).json({
      success: false,
      message: 'SSO authentication failed'
    });
  }
});

// 10. GET CURRENT AUTH USER
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      'SELECT id, name, email, role, workspace_type, is_active, company_name, two_factor_enabled, created_at FROM users WHERE id = $1',
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

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const os = require('os');
const pool = require('../db/database');

// GET PLATFORM-WIDE SUPER ADMIN STATS
router.get('/stats', async (req, res) => {
  try {
    const [userCount, enterpriseCount, shopCount, orderTotal, invoiceTotal, openComplaints, totalComplaints, bugCount] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query("SELECT COUNT(*)::int AS count FROM users WHERE workspace_type = 'enterprise'"),
      pool.query("SELECT COUNT(*)::int AS count FROM users WHERE workspace_type = 'shop_owner'"),
      pool.query('SELECT COALESCE(SUM(total), 0)::float AS total, COUNT(*)::int AS count FROM orders'),
      pool.query('SELECT COALESCE(SUM(total), 0)::float AS total, COUNT(*)::int AS count FROM invoices'),
      pool.query("SELECT COUNT(*)::int AS count FROM complaints WHERE status = 'open'"),
      pool.query('SELECT COUNT(*)::int AS count FROM complaints'),
      pool.query("SELECT COUNT(*)::int AS count FROM bug_reports WHERE status = 'open'")
    ]);

    // System metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPct = Math.round(((totalMem - freeMem) / totalMem) * 100);
    const cpus = os.cpus().length;
    const uptimeSec = Math.round(os.uptime());

    res.json({
      success: true,
      data: {
        platform: {
          total_users: userCount.rows[0].count,
          enterprise_workspaces: enterpriseCount.rows[0].count,
          retail_shops: shopCount.rows[0].count,
          total_transactions_value: orderTotal.rows[0].total,
          total_orders: orderTotal.rows[0].count,
          total_invoices: invoiceTotal.rows[0].count,
          open_complaints: openComplaints.rows[0].count,
          total_complaints: totalComplaints.rows[0].count,
          open_bugs: bugCount.rows[0].count
        },
        system_health: {
          status: 'operational',
          cpu_cores: cpus,
          ram_used_percent: usedMemPct,
          postgres_pool: 'connected',
          fastapi_engine: 'online',
          uptime_hours: (uptimeSec / 3600).toFixed(1)
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute admin analytics'
    });
  }
});

// GET ALL PLATFORM USERS & WORKSPACES
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.workspace_type,
        u.is_active,
        u.last_accessed,
        u.created_at,
        COUNT(DISTINCT o.id)::int AS total_orders,
        COALESCE(SUM(o.total), 0)::float AS total_spent
      FROM users u
      LEFT JOIN customers c ON LOWER(c.email) = LOWER(u.email)
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform users'
    });
  }
});

// TOGGLE USER ACTIVE / DEACTIVATED STATUS (Super Admin Action)
router.patch('/users/:id/toggle-active', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET is_active = NOT COALESCE(is_active, TRUE)
       WHERE id = $1
       RETURNING id, name, email, role, is_active`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const u = result.rows[0];
    res.json({
      success: true,
      message: `Account for ${u.name} is now ${u.is_active ? 'Active' : 'Deactivated / Suspended'}`,
      data: u
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
});

// RESET USER PASSWORD DIRECTLY (Super Admin Action)
router.post('/users/reset-password', async (req, res) => {
  try {
    const { user_id, new_password } = req.body;

    if (!user_id || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new password are required'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2
       RETURNING id, name, email, role`,
      [passwordHash, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `Password reset successfully for ${result.rows[0].name} (${result.rows[0].email})`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// GET ALL BUG REPORTS
router.get('/bugs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bug_reports
      ORDER BY
        CASE WHEN status = 'open' THEN 1 ELSE 2 END,
        id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch bugs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bug reports'
    });
  }
});

// RESOLVE BUG REPORT
router.patch('/bugs/:id/status', async (req, res) => {
  try {
    const { status = 'resolved' } = req.body;

    const result = await pool.query(
      `UPDATE bug_reports
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }

    res.json({
      success: true,
      message: `Bug marked as ${status}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update bug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bug report'
    });
  }
});

module.exports = router;

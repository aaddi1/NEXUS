const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// 1. GET ALL EMPLOYEES (Founder / Admin view)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.workspace_type,
        u.company_name,
        u.is_active,
        u.last_accessed,
        u.created_at,
        COUNT(DISTINCT o.id)::int AS sales_count,
        COALESCE(SUM(o.total), 0)::float AS revenue_generated,
        (
          SELECT COALESCE(SUM(ei.quantity), 0)::int
          FROM employee_items ei
          WHERE ei.employee_id = u.id AND ei.status = 'issued'
        ) AS items_held,
        (
          SELECT amount::float
          FROM employee_salaries es
          WHERE es.employee_id = u.id
          ORDER BY es.payment_date DESC
          LIMIT 1
        ) AS last_salary_paid,
        (
          SELECT payment_date
          FROM employee_salaries es
          WHERE es.employee_id = u.id
          ORDER BY es.payment_date DESC
          LIMIT 1
        ) AS last_salary_date
      FROM users u
      LEFT JOIN orders o ON o.employee_id = u.id
      WHERE u.workspace_type IN ('enterprise', 'shop_owner')
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workforce data'
    });
  }
});

// 2. GET PERSONAL EMPLOYEE WORKSPACE (Employee Self-Service)
router.get('/me/workspace', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [userRes, salesRes, itemsRes, salariesRes, issuesRes] = await Promise.all([
      pool.query('SELECT id, name, email, role, workspace_type, company_name, is_active FROM users WHERE id = $1', [userId]),
      pool.query(`
        SELECT
          o.id,
          o.total,
          o.status,
          o.payment_status,
          o.created_at,
          c.name AS customer
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        WHERE o.employee_id = $1
        ORDER BY o.id DESC
      `, [userId]),
      pool.query(`
        SELECT
          ei.id,
          ei.quantity,
          ei.issued_date,
          ei.returned_date,
          ei.status,
          ei.notes,
          p.name AS product_name,
          p.sku,
          p.price
        FROM employee_items ei
        JOIN products p ON p.id = ei.product_id
        WHERE ei.employee_id = $1
        ORDER BY ei.id DESC
      `, [userId]),
      pool.query(`
        SELECT
          id,
          amount::float,
          payment_date,
          salary_month,
          payment_status,
          salary_invoice_number,
          notes
        FROM employee_salaries
        WHERE employee_id = $1
        ORDER BY payment_date DESC
      `, [userId]),
      pool.query(`
        SELECT
          id,
          type,
          subject,
          message,
          priority,
          status,
          admin_reply,
          created_at,
          resolved_at
        FROM complaints
        WHERE user_id = $1 OR LOWER(user_email) = (SELECT LOWER(email) FROM users WHERE id = $1)
        ORDER BY id DESC
      `, [userId])
    ]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const user = userRes.rows[0];
    const sales = salesRes.rows;
    const totalSalesCount = sales.length;
    const totalRevenueGenerated = sales.reduce((a, s) => a + Number(s.total || 0), 0);
    const lastSalary = salariesRes.rows[0] || null;

    res.json({
      success: true,
      data: {
        profile: user,
        stats: {
          my_sales_count: totalSalesCount,
          my_revenue_generated: totalRevenueGenerated,
          items_held: itemsRes.rows.filter(i => i.status === 'issued').reduce((a, b) => a + b.quantity, 0),
          last_salary_amount: lastSalary ? lastSalary.amount : 0,
          next_salary_date: '2026-10-01',
          open_issues_count: issuesRes.rows.filter(i => i.status === 'open').length
        },
        sales,
        items: itemsRes.rows,
        salaries: salariesRes.rows,
        issues: issuesRes.rows
      }
    });
  } catch (error) {
    console.error('Fetch employee workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personal workspace'
    });
  }
});

// 3. PAY SALARY & GENERATE SALARY INVOICE (Founder / Admin)
router.post('/salary/pay', async (req, res) => {
  try {
    const {
      employee_id,
      amount,
      salary_month = 'September 2026',
      notes = 'Monthly executive salary payout'
    } = req.body;

    if (!employee_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and salary amount are required'
      });
    }

    const salaryInvoiceNumber = `SAL-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO employee_salaries
       (employee_id, amount, payment_date, salary_month, payment_status, salary_invoice_number, notes)
       VALUES ($1, $2, CURRENT_DATE, $3, 'paid', $4, $5)
       RETURNING *`,
      [employee_id, Number(amount), salary_month, salaryInvoiceNumber, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Salary paid and invoice issued',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Salary payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record salary payment'
    });
  }
});

// 4. ISSUE ITEMS / SAMPLES TO EMPLOYEE (Founder / Admin)
router.post('/items/issue', async (req, res) => {
  try {
    const {
      employee_id,
      product_id,
      quantity = 1,
      notes = 'Client demo and sample stock'
    } = req.body;

    if (!employee_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: 'Employee and product are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO employee_items
       (employee_id, product_id, quantity, issued_date, status, notes)
       VALUES ($1, $2, $3, CURRENT_DATE, 'issued', $4)
       RETURNING *`,
      [employee_id, product_id, Math.max(1, Number(quantity) || 1), notes]
    );

    res.status(201).json({
      success: true,
      message: 'Item issued to employee',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Issue item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue item'
    });
  }
});

// 5. RETURN / ADJUST ISSUED ITEM
router.patch('/items/:id/return', async (req, res) => {
  try {
    const { status = 'returned', notes = 'Item returned to warehouse' } = req.body;

    const result = await pool.query(
      `UPDATE employee_items
       SET status = $1,
           returned_date = CURRENT_DATE,
           notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [status, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issued item record not found'
      });
    }

    res.json({
      success: true,
      message: 'Item marked as returned',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Return item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to return item'
    });
  }
});

module.exports = router;

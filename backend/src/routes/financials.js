const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET FINANCIAL OVERVIEW & PROFIT BREAKDOWN (Founder / Admin)
router.get('/overview', async (req, res) => {
  try {
    const [revRes, invoiceRes, expenseRes, salaryRes] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total), 0)::float AS total_revenue, COUNT(*)::int AS order_count FROM orders'),
      pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0)::float AS collected_invoices,
          COALESCE(SUM(CASE WHEN status IN ('due', 'overdue') THEN total ELSE 0 END), 0)::float AS outstanding_receivables,
          COUNT(*)::int AS invoice_count
        FROM invoices
      `),
      pool.query('SELECT COALESCE(SUM(amount), 0)::float AS total_expenses, COUNT(*)::int AS expense_count FROM expenses'),
      pool.query('SELECT COALESCE(SUM(amount), 0)::float AS total_salaries_paid FROM employee_salaries WHERE payment_status = \'paid\'')
    ]);

    const totalRevenue = revRes.rows[0].total_revenue || 0;
    const collectedRevenue = invoiceRes.rows[0].collected_invoices || 0;
    const outstandingReceivables = invoiceRes.rows[0].outstanding_receivables || 0;
    const totalOperatingExpenses = expenseRes.rows[0].total_expenses || 0;
    const totalSalaries = salaryRes.rows[0].total_salaries_paid || 0;

    const totalSpending = totalOperatingExpenses + totalSalaries;
    const companyGrossProfit = totalRevenue - totalOperatingExpenses;
    const companyNetProfit = totalRevenue - totalSpending;

    // Recent Expenses
    const recentExpenses = await pool.query(`
      SELECT id, category, amount::float, description, expense_date
      FROM expenses
      ORDER BY expense_date DESC, id DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        financials: {
          total_revenue: totalRevenue,
          collected_revenue: collectedRevenue,
          outstanding_receivables: outstandingReceivables,
          operating_expenses: totalOperatingExpenses,
          salaries_paid: totalSalaries,
          total_spending: totalSpending,
          gross_profit: companyGrossProfit,
          net_profit: companyNetProfit,
          profit_margin_percent: totalRevenue > 0 ? Math.round((companyNetProfit / totalRevenue) * 100) : 0
        },
        expenses: recentExpenses.rows
      }
    });
  } catch (error) {
    console.error('Fetch financials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute financial intelligence'
    });
  }
});

// RECORD OPERATING EXPENSE
router.post('/expenses', async (req, res) => {
  try {
    const { category, amount, description = '', expense_date } = req.body;

    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Category and amount are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO expenses (category, amount, description, expense_date)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
       RETURNING *`,
      [category.trim(), Number(amount), description.trim() || null, expense_date || null]
    );

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Record expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record expense'
    });
  }
});

module.exports = router;

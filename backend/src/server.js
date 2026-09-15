const customersRoutes = require('./routes/customers');
const productsRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const ordersRoutes = require('./routes/orders');
const invoicesRoutes = require('./routes/invoices');
const dealsRoutes = require('./routes/deals');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/customers', authenticateToken, customersRoutes);
app.use('/api/products', authenticateToken, productsRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/orders', authenticateToken, ordersRoutes);
app.use(
  '/api/invoices',
  (req, res, next) => {
    if (req.path.startsWith('/public/')) {
      return next();
    }

    return authenticateToken(req, res, next);
  },
  invoicesRoutes
);
app.use('/api/deals', authenticateToken, dealsRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS time');

    res.json({
      success: true,
      message: 'NEXUS backend is running',
      database: 'connected',
      time: result.rows[0].time
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`NEXUS API running on http://localhost:${PORT}`);
});

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-development-secret';

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = String(req.user.role || '').toLowerCase();
    const userEmail = String(req.user.email || '').toLowerCase();

    // Super Admin always has full access
    if (userRole === 'superadmin' || userEmail === 'aryan@nexus.com' || userEmail === 'admin123@nexus.com') {
      return next();
    }

    const matches = allowedRoles.some(r => String(r).toLowerCase() === userRole);
    if (!matches) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient role permissions'
      });
    }

    next();
  };
}

function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const userRole = String(req.user.role || '').toLowerCase();
  const userEmail = String(req.user.email || '').toLowerCase();

  if (userRole === 'superadmin' || userEmail === 'aryan@nexus.com' || userEmail === 'admin123@nexus.com') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Super Admin permissions required'
  });
}

function requireFounderOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const userRole = String(req.user.role || '').toLowerCase();
  const userEmail = String(req.user.email || '').toLowerCase();
  const ws = String(req.user.workspace_type || '').toLowerCase();

  if (
    userRole === 'superadmin' ||
    userRole === 'owner' ||
    userRole === 'shop owner' ||
    userRole === 'shop_owner' ||
    userEmail === 'aryan@nexus.com' ||
    userEmail === 'admin123@nexus.com' ||
    ws === 'system' ||
    ws === 'enterprise'
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Founder or Workspace Owner permissions required'
  });
}

// In-Memory Rate Limiting Middleware
const requestCounts = new Map();

function rateLimit({ windowMs = 60000, max = 30, message = 'Too many requests. Please try again later.' } = {}) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = requestCounts.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      requestCounts.set(ip, record);
      return next();
    }

    record.count++;
    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  requireSuperAdmin,
  requireFounderOrAdmin,
  rateLimit
};

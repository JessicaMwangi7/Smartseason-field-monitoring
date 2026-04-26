const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/jwt');
//
//  AUTHENTICATE USER (VERIFY TOKEN)
//
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

//
//  ADMIN ONLY
//
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

//
//  AGENT OR ADMIN
//
function requireAgent(req, res, next) {
  if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

//
//   GENERATE TOKEN (IMPORTANT ADD)
//
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

module.exports = {
  authenticate,
  requireAdmin,
  requireAgent,
  generateToken
};
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'tww_portal_super_secure_jwt_secret_maddenco_2026';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: {
        id: true,
        accountNumber: true,
        businessName: true,
        contactName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        creditLimit: true,
        terms: true,
      }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Customer account not found.' });
    }

    req.customer = customer;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
};


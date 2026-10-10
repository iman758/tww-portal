const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Helper to compute live balances for a customer
async function getCustomerFinancialSummary(customerId, creditLimit) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      futureBalance: true,
      currentBalance: true,
      pastDue0130: true,
      pastDue3160: true,
      pastDueOver61: true,
      totalDue: true
    }
  });

  const unpaidCount = await prisma.invoice.count({
    where: {
      customerId,
      status: { not: 'PAID' }
    }
  });

  const overdueCount = await prisma.invoice.count({
    where: {
      customerId,
      status: { in: ['OVERDUE_01', 'OVERDUE_31', 'OVERDUE_OVER'] } // simplified representation
    }
  });

  const overdueBalance = customer.pastDue0130 + customer.pastDue3160 + customer.pastDueOver61;
  const availableCredit = Math.max(0, Math.round((creditLimit - customer.totalDue) * 100) / 100);

  return {
    totalBalance: customer.totalDue,
    currentBalance: customer.currentBalance,
    futureBalance: customer.futureBalance,
    pastDue0130: customer.pastDue0130,
    pastDue3160: customer.pastDue3160,
    pastDueOver61: customer.pastDueOver61,
    overdueBalance: Math.round(overdueBalance * 100) / 100,
    overdueCount,
    unpaidCount,
    availableCredit,
  };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    let { accountNumber, pin } = req.body;

    if (!accountNumber) {
      return res.status(400).json({ error: 'MaddenCo Account Number is required (e.g. 0001330).' });
    }

    accountNumber = accountNumber.trim();

    const customer = await prisma.customer.findUnique({
      where: { accountNumber },
    });

    if (!customer) {
      return res.status(404).json({ error: `Customer account "${accountNumber}" was not found in MaddenCo database.` });
    }

    // Check PIN (default '1234')
    if (pin && customer.pin && pin !== customer.pin) {
      return res.status(401).json({ error: 'Invalid PIN. (Default demo PIN is 1234)' });
    }

    const summary = await getCustomerFinancialSummary(customer.id, customer.creditLimit);

    const token = jwt.sign(
      { customerId: customer.id, accountNumber: customer.accountNumber },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      customer: {
        id: customer.id,
        accountNumber: customer.accountNumber,
        businessName: customer.businessName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        creditLimit: customer.creditLimit,
        terms: customer.terms,
        financials: summary,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error while logging in.',
      details: error.message,
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const summary = await getCustomerFinancialSummary(req.customer.id, req.customer.creditLimit);
    res.json({
      ...req.customer,
      financials: summary,
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// GET /api/auth/demo-customers (Allows instant demo switching & search across 1000+ accounts)
router.get('/demo-customers', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search && search.trim()) {
      const q = search.trim();
      whereClause = {
        OR: [
          { accountNumber: { contains: q } },
          { businessName: { contains: q } },
          { city: { contains: q } },
        ],
      };
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      take: 30,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        accountNumber: true,
        businessName: true,
        city: true,
        state: true,
        creditLimit: true,
        terms: true,
      },
    });

    res.json(customers);
  } catch (error) {
    console.error('Demo customers error:', error);
    res.status(500).json({ error: 'Failed to list demo accounts.' });
  }
});

module.exports = router;


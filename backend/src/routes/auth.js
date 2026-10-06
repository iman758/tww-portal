const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Helper to compute live balances for a customer
async function getCustomerFinancialSummary(customerId, creditLimit) {
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      customerId,
      status: { not: 'PAID' },
    },
    select: {
      balanceDue: true,
      status: true,
      dueDate: true,
    },
  });

  const now = new Date();
  let totalBalance = 0;
  let currentBalance = 0;
  let overdueBalance = 0;
  let overdueCount = 0;

  for (const inv of unpaidInvoices) {
    totalBalance += inv.balanceDue;
    if (new Date(inv.dueDate) < now) {
      overdueBalance += inv.balanceDue;
      overdueCount++;
    } else {
      currentBalance += inv.balanceDue;
    }
  }

  totalBalance = Math.round(totalBalance * 100) / 100;
  currentBalance = Math.round(currentBalance * 100) / 100;
  overdueBalance = Math.round(overdueBalance * 100) / 100;
  const availableCredit = Math.max(0, Math.round((creditLimit - totalBalance) * 100) / 100);

  return {
    totalBalance,
    currentBalance,
    overdueBalance,
    overdueCount,
    unpaidCount: unpaidInvoices.length,
    availableCredit,
  };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    let { accountNumber, pin } = req.body;

    if (!accountNumber) {
      return res.status(400).json({ error: 'MaddenCo Account Number is required (e.g. CUST-10001).' });
    }

    accountNumber = accountNumber.trim().toUpperCase();
    if (!accountNumber.startsWith('CUST-') && /^\d+$/.test(accountNumber)) {
      accountNumber = `CUST-${accountNumber}`;
    }

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
    res.status(500).json({ error: 'Internal server error while logging in.' });
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


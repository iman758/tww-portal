const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/customers/aging-summary
// MaddenCo-style aging ledger breakdown for customer account context
router.get('/aging-summary', authenticateToken, async (req, res) => {
  try {
    const customerId = req.customer.id;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        accountNumber: true,
        businessName: true,
        creditLimit: true,
        terms: true,
        futureBalance: true,
        currentBalance: true,
        pastDue0130: true,
        pastDue3160: true,
        pastDueOver61: true,
        totalDue: true
      }
    });

    const unpaidInvoicesCount = await prisma.invoice.count({
      where: {
        customerId,
        status: { not: 'PAID' },
      }
    });

    const pastDueAmount = customer.pastDue0130 + customer.pastDue3160 + customer.pastDueOver61;
    const creditLimit = customer.creditLimit || 50000;
    const availableCredit = Math.max(0, creditLimit - customer.totalDue);

    res.json({
      accountNumber: customer.accountNumber,
      businessName: customer.businessName,
      creditLimit: Math.round(creditLimit * 100) / 100,
      availableCredit: Math.round(availableCredit * 100) / 100,
      totalOutstanding: Math.round(customer.totalDue * 100) / 100,
      pastDueAmount: Math.round(pastDueAmount * 100) / 100,
      aging: {
        future: Math.round(customer.futureBalance * 100) / 100,
        current: Math.round(customer.currentBalance * 100) / 100,
        days1to30: Math.round(customer.pastDue0130 * 100) / 100,
        days31to60: Math.round(customer.pastDue3160 * 100) / 100,
        days61to90Plus: Math.round(customer.pastDueOver61 * 100) / 100,
      },
      terms: customer.terms,
      unpaidInvoicesCount,
    });
  } catch (error) {
    console.error('Aging summary error:', error);
    res.status(500).json({ error: 'Failed to retrieve aging summary.' });
  }
});

module.exports = router;


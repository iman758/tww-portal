const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/customers/aging-summary
// MaddenCo-style aging ledger breakdown for customer account context
router.get('/aging-summary', authenticateToken, async (req, res) => {
  try {
    const customerId = req.customer.id;
    const now = new Date();

    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        customerId,
        status: { not: 'PAID' },
      },
      select: {
        id: true,
        invoiceNumber: true,
        dueDate: true,
        balanceDue: true,
        status: true,
      },
    });

    let currentAmount = 0;
    let days1to30 = 0;
    let days31to60 = 0;
    let days61to90Plus = 0;
    let totalOutstanding = 0;

    for (const inv of unpaidInvoices) {
      const balance = inv.balanceDue;
      totalOutstanding += balance;

      const dueDate = new Date(inv.dueDate);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        currentAmount += balance;
      } else if (diffDays <= 30) {
        days1to30 += balance;
      } else if (diffDays <= 60) {
        days31to60 += balance;
      } else {
        days61to90Plus += balance;
      }
    }

    const pastDueAmount = days1to30 + days31to60 + days61to90Plus;
    const creditLimit = req.customer.creditLimit || 50000;
    const availableCredit = Math.max(0, creditLimit - totalOutstanding);

    res.json({
      accountNumber: req.customer.accountNumber,
      businessName: req.customer.businessName,
      creditLimit: Math.round(creditLimit * 100) / 100,
      availableCredit: Math.round(availableCredit * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      pastDueAmount: Math.round(pastDueAmount * 100) / 100,
      aging: {
        current: Math.round(currentAmount * 100) / 100,
        days1to30: Math.round(days1to30 * 100) / 100,
        days31to60: Math.round(days31to60 * 100) / 100,
        days61to90Plus: Math.round(days61to90Plus * 100) / 100,
      },
      terms: req.customer.terms,
      unpaidInvoicesCount: unpaidInvoices.length,
    });
  } catch (error) {
    console.error('Aging summary error:', error);
    res.status(500).json({ error: 'Failed to compute aging summary.' });
  }
});

module.exports = router;


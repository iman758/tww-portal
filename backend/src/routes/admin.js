const express = require('express');
const router = express.Router();
const prisma = require('../db');

// In a real app, this should be protected by admin authentication
// For prototype purposes, we'll leave it open or use a simple check.

// GET /api/admin/zelle-payments
// List all pending Zelle payments
router.get('/zelle-payments', async (req, res) => {
  try {
    const payments = await prisma.paymentTransaction.findMany({
      where: {
        method: 'ZELLE',
        status: 'PENDING_VERIFICATION'
      },
      include: {
        customer: {
          select: {
            accountNumber: true,
            businessName: true
          }
        },
        invoice: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error('Fetch pending Zelle payments error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending Zelle payments.' });
  }
});

// POST /api/admin/zelle-payments/:id/approve
// Approve a Zelle payment and clear the invoice balance
router.post('/zelle-payments/:id/approve', async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id, 10);
    const payment = await prisma.paymentTransaction.findUnique({
      where: { id: paymentId },
      include: { invoice: true }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    if (payment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Payment is already approved.' });
    }

    // Mark payment as completed
    const updatedPayment = await prisma.paymentTransaction.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED' }
    });

    // If it's linked to an invoice, update the invoice balance
    if (payment.invoiceId) {
      const invoice = payment.invoice;
      const newBalance = Math.max(0, Math.round((invoice.balanceDue - payment.amount) * 100) / 100);
      const newStatus = newBalance <= 0.01 ? 'PAID' : invoice.status;

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          balanceDue: newBalance,
          status: newStatus
        }
      });
    }

    res.json({ success: true, payment: updatedPayment });
  } catch (error) {
    console.error('Approve Zelle payment error:', error);
    res.status(500).json({ error: 'Failed to approve Zelle payment.' });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/invoices
// Query params:
//   tab: 'all' | 'unpaid' | 'overdue' | 'paid'
//   search: string (invoice #, po #, brand)
//   sortBy: 'dueDate' | 'date' | 'total' | 'balanceDue'
//   sortOrder: 'asc' | 'desc'
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { tab = 'all', search, sortBy = 'dueDate', sortOrder = 'desc' } = req.query;

    const where = { customerId };
    const now = new Date();

    if (tab === 'unpaid') {
      where.status = { not: 'PAID' };
    } else if (tab === 'overdue') {
      where.status = { not: 'PAID' };
      where.dueDate = { lt: now };
    } else if (tab === 'paid') {
      where.status = 'PAID';
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { invoiceNumber: { contains: q } },
        { poNumber: { contains: q } },
        {
          items: {
            some: {
              OR: [
                { tireBrand: { contains: q } },
                { pattern: { contains: q } },
                { size: { contains: q } },
              ],
            },
          },
        },
      ];
    }

    const orderBy = {};
    if (['dueDate', 'date', 'total', 'balanceDue'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.dueDate = 'desc';
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy,
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            paymentNumber: true,
            amount: true,
            method: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate dynamic aging days & status label for each invoice
    const formattedInvoices = invoices.map((inv) => {
      const dueDate = new Date(inv.dueDate);
      const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let agingCategory = 'Current';
      let isOverdue = false;

      if (inv.status === 'PAID') {
        agingCategory = 'Paid';
      } else if (diffDays > 90) {
        agingCategory = '61-90+ Days Overdue';
        isOverdue = true;
      } else if (diffDays > 60) {
        agingCategory = '31-60 Days Overdue';
        isOverdue = true;
      } else if (diffDays > 0) {
        agingCategory = '1-30 Days Overdue';
        isOverdue = true;
      } else {
        agingCategory = 'Current (Within Terms)';
      }

      return {
        ...inv,
        daysOverdue: Math.max(0, diffDays),
        isOverdue,
        agingCategory,
        totalTires: inv.items.reduce((sum, item) => sum + item.qty, 0),
      };
    });

    // Counts for UI tab badges
    const totalCount = await prisma.invoice.count({ where: { customerId } });
    const unpaidCount = await prisma.invoice.count({ where: { customerId, status: { not: 'PAID' } } });
    const overdueCount = await prisma.invoice.count({
      where: {
        customerId,
        status: { not: 'PAID' },
        dueDate: { lt: now },
      },
    });
    const paidCount = await prisma.invoice.count({ where: { customerId, status: 'PAID' } });

    res.json({
      invoices: formattedInvoices,
      counts: {
        all: totalCount,
        unpaid: unpaidCount,
        overdue: overdueCount,
        paid: paidCount,
      },
    });
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ error: 'Failed to retrieve invoices.' });
  }
});

// GET /api/invoices/:id (Detailed view for invoice drawer)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const customerId = req.customer.id;

    const invoice = await prisma.invoice.findFirst({
      where: { id, customerId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        rmaClaims: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found or does not belong to your account.' });
    }

    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    res.json({
      ...invoice,
      daysOverdue: Math.max(0, diffDays),
      isOverdue: invoice.status !== 'PAID' && diffDays > 0,
      totalTires: invoice.items.reduce((sum, item) => sum + item.qty, 0),
    });
  } catch (error) {
    console.error('Fetch invoice detail error:', error);
    res.status(500).json({ error: 'Failed to load invoice details.' });
  }
});

module.exports = router;


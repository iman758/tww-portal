const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/rma
// Returns all RMA warranty/return claims for authenticated customer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customerId = req.customer.id;

    const claims = await prisma.rmaClaim.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            date: true,
            total: true,
          },
        },
      },
    });

    res.json(claims);
  } catch (error) {
    console.error('Fetch RMA claims error:', error);
    res.status(500).json({ error: 'Failed to retrieve RMA claims.' });
  }
});

// GET /api/rma/:id
// Get single claim details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const customerId = req.customer.id;

    const claim = await prisma.rmaClaim.findFirst({
      where: { id, customerId },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!claim) {
      return res.status(404).json({ error: 'RMA Claim not found.' });
    }

    res.json(claim);
  } catch (error) {
    console.error('Fetch RMA claim detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve claim details.' });
  }
});

// POST /api/rma
// Submit a new tire warranty/return claim
router.post('/', authenticateToken, async (req, res) => {
  try {
    const customerId = req.customer.id;
    const {
      invoiceId,
      tireBrand,
      tireSize,
      dotSerial,
      treadDepth,
      reason,
      notes,
      photoUrl,
    } = req.body;

    // Validation
    if (!tireBrand || !tireBrand.trim()) {
      return res.status(400).json({ error: 'Tire Brand is required.' });
    }

    if (!tireSize || !tireSize.trim()) {
      return res.status(400).json({ error: 'Tire Size is required (e.g. 265/70R17).' });
    }

    if (!dotSerial || !dotSerial.trim()) {
      return res.status(400).json({ error: 'DOT Serial Code is required (e.g. DOT 6G9L 3J8R 1424).' });
    }

    if (!treadDepth || !treadDepth.trim()) {
      return res.status(400).json({ error: 'Remaining Tread Depth is required.' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Reason for return/warranty claim is required.' });
    }

    let parsedInvoiceId = null;
    if (invoiceId) {
      const inv = await prisma.invoice.findFirst({
        where: { id: parseInt(invoiceId, 10), customerId },
      });
      if (inv) parsedInvoiceId = inv.id;
    }

    const claimNumber = `RMA-${Math.floor(70000 + Math.random() * 29000)}`;

    const newClaim = await prisma.rmaClaim.create({
      data: {
        claimNumber,
        customerId,
        invoiceId: parsedInvoiceId,
        tireBrand: tireBrand.trim(),
        tireSize: tireSize.trim(),
        dotSerial: dotSerial.trim().toUpperCase(),
        treadDepth: treadDepth.trim(),
        reason: reason.trim(),
        notes: notes ? notes.trim() : null,
        photoUrl: photoUrl || null,
        status: 'SUBMITTED',
      },
    });

    res.status(201).json({
      success: true,
      claim: newClaim,
      message: `Warranty Claim ${claimNumber} submitted successfully! Our technical inspection team will evaluate your tire claim.`,
    });
  } catch (error) {
    console.error('Submit RMA error:', error);
    res.status(500).json({ error: 'Failed to submit tire return claim.' });
  }
});

module.exports = router;


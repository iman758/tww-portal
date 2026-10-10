const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { parseAgingReport } = require('../utils/pdfParser');
const prisma = require('../db');

// Setup Multer to store uploaded file in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const data = await pdf(req.file.buffer);
    const parsedData = parseAgingReport(data.text);

    // Upsert Customers and Invoices
    let customersUpdated = 0;
    let invoicesUpdated = 0;

    for (const custData of parsedData) {
      // Upsert Customer
      const customer = await prisma.customer.upsert({
        where: { accountNumber: custData.accountNumber },
        update: {
          businessName: custData.businessName,
          phone: custData.phone,
          ...custData.totals
        },
        create: {
          accountNumber: custData.accountNumber,
          businessName: custData.businessName,
          phone: custData.phone,
          ...custData.totals,
          email: '',
          address: '',
          city: '',
          state: '',
          zip: ''
        }
      });
      customersUpdated++;

      // Upsert Invoices
      for (const invData of custData.invoices) {
        await prisma.invoice.upsert({
          where: { invoiceNumber: invData.invoiceNumber },
          update: {
            date: invData.date,
            dueDate: invData.dueDate,
            balanceDue: invData.balanceDue,
            total: invData.balanceDue,
            status: invData.status,
            agingBucket: invData.agingBucket
          },
          create: {
            invoiceNumber: invData.invoiceNumber,
            customerId: customer.id,
            date: invData.date,
            dueDate: invData.dueDate,
            balanceDue: invData.balanceDue,
            total: invData.balanceDue,
            subtotal: invData.balanceDue,
            status: invData.status,
            agingBucket: invData.agingBucket
          }
        });
        invoicesUpdated++;
      }
    }

    res.json({
      success: true,
      message: 'Aging report successfully imported',
      customersUpdated,
      invoicesUpdated
    });

  } catch (error) {
    console.error('Error importing aging report:', error);
    res.status(500).json({ error: 'Failed to process aging report' });
  }
});

module.exports = router;

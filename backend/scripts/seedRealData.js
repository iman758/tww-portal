const fs = require('fs');
const pdf = require('pdf-parse');
const { parseAgingReport } = require('../src/utils/pdfParser');
const prisma = require('../src/db');

async function seedRealData() {
  const pdfPath = 'C:/Users/rashid computer/.gemini/antigravity/brain/ec95a77a-562d-47e1-993f-21cecc4af868/.user_uploaded/media_1791639399706_56bfd24b.pdf';
  console.log('Reading PDF from', pdfPath);
  const dataBuffer = fs.readFileSync(pdfPath);
  
  console.log('Parsing PDF...');
  const data = await pdf(dataBuffer);
  
  console.log('Extracting customers and invoices...');
  const customers = parseAgingReport(data.text);
  
  console.log(`Found ${customers.length} customers.`);

  let customersUpserted = 0;
  let invoicesUpserted = 0;

  for (const cust of customers) {
    const dbCustomer = await prisma.customer.upsert({
      where: { accountNumber: cust.accountNumber },
      update: {
        businessName: cust.businessName,
        phone: cust.phone || null,
        futureBalance: cust.totals.futureBalance,
        currentBalance: cust.totals.currentBalance,
        pastDue0130: cust.totals.pastDue0130,
        pastDue3160: cust.totals.pastDue3160,
        pastDueOver61: cust.totals.pastDueOver61,
        totalDue: cust.totals.totalDue,
      },
      create: {
        accountNumber: cust.accountNumber,
        businessName: cust.businessName,
        phone: cust.phone || null,
        creditLimit: 50000.0,
        terms: 'Net 30',
        pin: '1234',
        futureBalance: cust.totals.futureBalance,
        currentBalance: cust.totals.currentBalance,
        pastDue0130: cust.totals.pastDue0130,
        pastDue3160: cust.totals.pastDue3160,
        pastDueOver61: cust.totals.pastDueOver61,
        totalDue: cust.totals.totalDue,
      }
    });

    customersUpserted++;

    for (const inv of cust.invoices) {
      await prisma.invoice.upsert({
        where: { invoiceNumber: inv.invoiceNumber },
        update: {
          balanceDue: inv.balanceDue,
          status: inv.status,
          agingBucket: inv.agingBucket,
        },
        create: {
          invoiceNumber: inv.invoiceNumber,
          customerId: dbCustomer.id,
          date: inv.date,
          dueDate: inv.dueDate,
          status: inv.status,
          agingBucket: inv.agingBucket,
          subtotal: inv.balanceDue,
          total: inv.balanceDue,
          balanceDue: inv.balanceDue,
          notes: 'Imported from daily aging report',
        }
      });
      invoicesUpserted++;
    }
  }

  console.log(`Successfully upserted ${customersUpserted} customers and ${invoicesUpserted} invoices from the real PDF!`);
}

seedRealData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


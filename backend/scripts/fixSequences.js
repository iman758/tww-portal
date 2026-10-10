const prisma = require('../src/db');

async function fixSequences() {
  console.log('Fixing sequences...');
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Customer"', 'id'), coalesce(max(id),0) + 1, false) FROM "Customer";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Invoice"', 'id'), coalesce(max(id),0) + 1, false) FROM "Invoice";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"InvoiceItem"', 'id'), coalesce(max(id),0) + 1, false) FROM "InvoiceItem";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"PaymentTransaction"', 'id'), coalesce(max(id),0) + 1, false) FROM "PaymentTransaction";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"RmaClaim"', 'id'), coalesce(max(id),0) + 1, false) FROM "RmaClaim";`);
  console.log('Done!');
}

fixSequences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


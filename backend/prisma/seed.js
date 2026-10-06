const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Seed configuration
const TOTAL_CUSTOMERS = 1050; // Meets and exceeds 1,000+ requirement
const TOTAL_INVOICES = 5250;  // Meets and exceeds 5,000+ requirement

const TIRE_CATALOG = [
  { brand: 'Michelin', pattern: 'Defender LTX M/S', size: '265/70R17 115T', ply: 'Standard Load', sku: 'MICH-2657017-DLTX', price: 188.50 },
  { brand: 'Michelin', pattern: 'CrossClimate 2', size: '225/65R17 102H', ply: 'Standard Load', sku: 'MICH-2256517-CC2', price: 172.00 },
  { brand: 'Goodyear', pattern: 'Assurance WeatherReady', size: '215/55R17 94V', ply: 'Standard Load', sku: 'GY-2155517-AWR', price: 142.25 },
  { brand: 'Goodyear', pattern: 'Wrangler DuraTrac', size: 'LT275/70R18', ply: '10-Ply / Load Range E', sku: 'GY-2757018-WDT', price: 245.00 },
  { brand: 'Firestone', pattern: 'Destination A/T2', size: '265/70R17 115S', ply: 'Standard Load', sku: 'FS-2657017-DAT2', price: 164.75 },
  { brand: 'Bridgestone', pattern: 'Dueler A/T Revo 3', size: '275/55R20 113T', ply: 'Standard Load', sku: 'BS-2755520-REVO3', price: 218.00 },
  { brand: 'Bridgestone', pattern: 'Turanza QuietTrack', size: '205/55R16 91H', ply: 'Standard Load', sku: 'BS-2055516-TQT', price: 135.50 },
  { brand: 'Continental', pattern: 'TrueContact Tour', size: '205/55R16 91H', ply: 'Standard Load', sku: 'CONT-2055516-TCT', price: 124.50 },
  { brand: 'Continental', pattern: 'ExtremeContact DWS06 Plus', size: '245/45R18 100Y', ply: 'Extra Load (XL)', sku: 'CONT-2454518-DWS06', price: 186.00 },
  { brand: 'Cooper', pattern: 'Discoverer AT3 4S', size: '265/70R16 112T', ply: 'Standard Load', sku: 'COOP-2657016-DAT3', price: 149.00 },
  { brand: 'Toyo', pattern: 'Open Country A/T III', size: '285/70R17 117T', ply: 'Standard Load', sku: 'TOYO-2857017-OC3', price: 209.00 },
  { brand: 'BFGoodrich', pattern: 'All-Terrain T/A KO2', size: 'LT265/75R16', ply: '10-Ply / Load Range E', sku: 'BFG-2657516-KO2', price: 212.00 },
  { brand: 'Falken', pattern: 'Wildpeak A/T3W', size: '265/65R18 114T', ply: 'Standard Load', sku: 'FLK-2656518-AT3W', price: 195.50 },
  { brand: 'Hankook', pattern: 'Kinergy PT H737', size: '215/60R16 95H', ply: 'Standard Load', sku: 'HK-2156016-KPT', price: 108.00 },
  { brand: 'Pirelli', pattern: 'Scorpion All Terrain Plus', size: '275/55R20 113T', ply: 'Standard Load', sku: 'PIR-2755520-SCORP', price: 226.50 },
  { brand: 'Yokohama', pattern: 'GEOLANDAR A/T G015', size: '265/70R17 113T', ply: 'Standard Load', sku: 'YOK-2657017-GEO15', price: 176.00 }
];

const BUSINESS_PREFIXES = [
  'Apex', 'MileHigh', 'Bayside', 'Sunbelt', 'Redline', 'Summit', 'Keystone', 'Lone Star',
  'Buckeye', 'Patriot', 'Tri-State', 'Precision', 'Metro', 'Sierra', 'Heartland', 'Olympic',
  'Blue Ridge', 'Great Lakes', 'Pacific', 'Alamo', 'Evergreen', 'Cascade', 'Liberty', 'Valley',
  'Premier', 'Crossroads', 'Golden Gate', 'Desert', 'Front Range', 'Mountain View', 'Express',
  'ProCare', 'Quality', 'Master', 'Elite', 'Direct', 'Total', 'All-Star', 'Superior', 'Interstate'
];

const BUSINESS_SUFFIXES = [
  'Tire & Auto Service', 'Tire Pros', 'Wholesale Tire & Wheel', 'Tire & Brake Specialists',
  'Commercial Tire Centers', 'Fleet Tire Solutions', 'Tire Crafters', 'Tire & Lube Express',
  'Complete Auto & Tire', 'Truck & Trailer Tire', 'Discount Tire Outlet', 'Performance Tire & Alignment',
  'Brothers Tire Center', 'Tire Care & Alignment', 'Motors Tire & Wheel Depot'
];

const US_LOCATIONS = [
  { city: 'Denver', state: 'CO', zip: '80202', area: '303' },
  { city: 'Dallas', state: 'TX', zip: '75201', area: '214' },
  { city: 'Atlanta', state: 'GA', zip: '30303', area: '404' },
  { city: 'Phoenix', state: 'AZ', zip: '85001', area: '602' },
  { city: 'Chicago', state: 'IL', zip: '60601', area: '312' },
  { city: 'Charlotte', state: 'NC', zip: '28202', area: '704' },
  { city: 'Columbus', state: 'OH', zip: '43215', area: '614' },
  { city: 'Indianapolis', state: 'IN', zip: '46204', area: '317' },
  { city: 'Seattle', state: 'WA', zip: '98101', area: '206' },
  { city: 'Tampa', state: 'FL', zip: '33602', area: '813' },
  { city: 'Kansas City', state: 'MO', zip: '64106', area: '816' },
  { city: 'Nashville', state: 'TN', zip: '37201', area: '615' },
  { city: 'Philadelphia', state: 'PA', zip: '19102', area: '215' },
  { city: 'Salt Lake City', state: 'UT', zip: '84101', area: '801' },
  { city: 'Houston', state: 'TX', zip: '77002', area: '713' },
  { city: 'Minneapolis', state: 'MN', zip: '55401', area: '612' },
  { city: 'Detroit', state: 'MI', zip: '48226', area: '313' },
  { city: 'St. Louis', state: 'MO', zip: '63101', area: '314' },
  { city: 'Portland', state: 'OR', zip: '97201', area: '503' },
  { city: 'Oklahoma City', state: 'OK', zip: '73102', area: '405' }
];

const FIRST_NAMES = ['Dave', 'Mike', 'Chris', 'Robert', 'James', 'Bill', 'Sarah', 'Jennifer', 'Tony', 'Carlos', 'Steve', 'Brian', 'Dan', 'Jason', 'Gary', 'Kevin', 'Mark', 'Paul'];
const LAST_NAMES = ['Miller', 'Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'White', 'Harris'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🚀 Starting TWW Distribution MaddenCo ERP Database Seed...');
  const startTime = Date.now();

  // Clear existing tables
  console.log('🧹 Cleaning existing data...');
  await prisma.rmaClaim.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log(`📦 Generating ${TOTAL_CUSTOMERS} wholesale dealer customer records...`);

  const customersData = [];
  const creditLimits = [15000, 25000, 35000, 50000, 75000, 100000, 125000, 150000];
  const termsList = ['Net 30', 'Net 30', 'Net 30', 'Net 10th Proximo', 'Net 10th Proximo', 'COD'];

  // Seed Customer 1 as flagship demo account: Apex Tire & Auto Pros
  customersData.push({
    id: 1,
    accountNumber: 'CUST-10001',
    businessName: 'Apex Tire & Auto Pros',
    contactName: 'Dave Miller',
    email: 'dmiller@apextireauto.com',
    phone: '(303) 555-0142',
    address: '4820 E 40th Ave',
    city: 'Denver',
    state: 'CO',
    zip: '80207',
    creditLimit: 75000.0,
    terms: 'Net 30',
    pin: '1234'
  });

  // Generate 2 through TOTAL_CUSTOMERS
  for (let i = 2; i <= TOTAL_CUSTOMERS; i++) {
    const prefix = getRandomItem(BUSINESS_PREFIXES);
    const suffix = getRandomItem(BUSINESS_SUFFIXES);
    const loc = getRandomItem(US_LOCATIONS);
    const fName = getRandomItem(FIRST_NAMES);
    const lName = getRandomItem(LAST_NAMES);
    const streetNum = getRandomInt(100, 9999);
    const streetName = getRandomItem(['Industrial Pkwy', 'Commercial Blvd', 'Oak St', 'Main St', 'Highway 50', 'Commerce Way', 'Center Ave', 'Market St', 'Tire Way']);
    const street = `${streetNum} ${streetName}`;
    const cleanBiz = `${prefix} ${suffix} #${getRandomInt(1, 99)}`;
    const custNum = `CUST-${10000 + i}`;

    customersData.push({
      id: i,
      accountNumber: custNum,
      businessName: cleanBiz,
      contactName: `${fName} ${lName}`,
      email: `orders@${prefix.toLowerCase().replace(/[^a-z]/g, '')}tire${loc.state.toLowerCase()}.com`,
      phone: `(${loc.area}) 555-${String(getRandomInt(1000, 9999))}`,
      address: street,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      creditLimit: getRandomItem(creditLimits),
      terms: getRandomItem(termsList),
      pin: '1234' // easy universal testing PIN
    });
  }

  // Batch insert customers in chunks of 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < customersData.length; i += BATCH_SIZE) {
    const chunk = customersData.slice(i, i + BATCH_SIZE);
    await prisma.customer.createMany({ data: chunk });
  }
  console.log(`✅ Seeded ${customersData.length} customers successfully.`);

  console.log(`📄 Generating ${TOTAL_INVOICES} tire invoices with itemized MaddenCo line items...`);

  const now = new Date('2026-10-06T12:00:00Z');
  const invoicesData = [];
  const itemsData = [];
  let itemCounter = 1;

  // Let's ensure customer 1 (Apex Tire & Auto) has a rich set of 12 realistic invoices across all aging buckets
  // Aging buckets:
  // - CURRENT (Due in next 10-30 days)
  // - OVERDUE_30 (1-30 days past due)
  // - OVERDUE_60 (31-60 days past due)
  // - OVERDUE_90 (61-90+ days past due)
  // - PAID

  const agingStatuses = ['CURRENT', 'CURRENT', 'OVERDUE_30', 'OVERDUE_30', 'OVERDUE_60', 'OVERDUE_90', 'PAID', 'PAID'];

  for (let invIndex = 1; invIndex <= TOTAL_INVOICES; invIndex++) {
    // For the first 15 invoices, assign to Customer 1 for rich demo
    let custId;
    if (invIndex <= 15) {
      custId = 1;
    } else {
      custId = getRandomInt(1, TOTAL_CUSTOMERS);
    }

    const invNum = `INV-${String(800000 + invIndex)}`;
    const poNum = `PO-${getRandomInt(1000, 9999)}`;

    let status = getRandomItem(agingStatuses);
    if (invIndex === 1) status = 'OVERDUE_30';
    if (invIndex === 2) status = 'CURRENT';
    if (invIndex === 3) status = 'OVERDUE_60';
    if (invIndex === 4) status = 'PAID';
    if (invIndex === 5) status = 'CURRENT';
    if (invIndex === 6) status = 'OVERDUE_90';

    // Calculate dates based on status
    let invoiceDate;
    let dueDate;

    if (status === 'CURRENT') {
      const daysAgo = getRandomInt(1, 20);
      invoiceDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 day terms
    } else if (status === 'OVERDUE_30') {
      const overdueDays = getRandomInt(5, 28);
      dueDate = new Date(now.getTime() - overdueDays * 24 * 60 * 60 * 1000);
      invoiceDate = new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (status === 'OVERDUE_60') {
      const overdueDays = getRandomInt(32, 58);
      dueDate = new Date(now.getTime() - overdueDays * 24 * 60 * 60 * 1000);
      invoiceDate = new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (status === 'OVERDUE_90') {
      const overdueDays = getRandomInt(65, 110);
      dueDate = new Date(now.getTime() - overdueDays * 24 * 60 * 60 * 1000);
      invoiceDate = new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else { // PAID
      const daysAgo = getRandomInt(40, 120);
      invoiceDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Generate 1 to 4 line items
    const itemCount = getRandomInt(1, 4);
    let subtotal = 0;
    let totalTireQty = 0;

    for (let li = 0; li < itemCount; li++) {
      const tire = getRandomItem(TIRE_CATALOG);
      const qty = getRandomItem([4, 4, 8, 8, 12, 16, 24]); // typical wholesale tire orders
      const extPrice = Math.round(tire.price * qty * 100) / 100;
      subtotal += extPrice;
      totalTireQty += qty;

      itemsData.push({
        id: itemCounter++,
        invoiceId: invIndex,
        tireBrand: tire.brand,
        pattern: tire.pattern,
        size: tire.size,
        ply: tire.ply,
        sku: tire.sku,
        qty: qty,
        wholesalePrice: tire.price,
        extendedPrice: extPrice
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const tireFee = Math.round(totalTireQty * 2.50 * 100) / 100; // $2.50 State scrap fee / tire
    const freight = totalTireQty >= 8 ? 0.0 : 45.0; // Free route freight over 8 units
    const total = Math.round((subtotal + tireFee + freight) * 100) / 100;
    const balanceDue = status === 'PAID' ? 0.0 : total;

    invoicesData.push({
      id: invIndex,
      invoiceNumber: invNum,
      customerId: custId,
      date: invoiceDate,
      dueDate: dueDate,
      status: status,
      subtotal: subtotal,
      tireFee: tireFee,
      freight: freight,
      total: total,
      balanceDue: balanceDue,
      poNumber: poNum,
      notes: `Warehouse Route Delivery - Truck #${getRandomInt(10, 48)}`
    });
  }

  // Batch insert invoices in chunks of 500
  for (let i = 0; i < invoicesData.length; i += BATCH_SIZE) {
    const chunk = invoicesData.slice(i, i + BATCH_SIZE);
    await prisma.invoice.createMany({ data: chunk });
  }
  console.log(`✅ Seeded ${invoicesData.length} invoices successfully.`);

  // Batch insert items in chunks of 1000
  console.log(`🔧 Inserting ${itemsData.length} itemized tire line items...`);
  const ITEM_BATCH_SIZE = 1000;
  for (let i = 0; i < itemsData.length; i += ITEM_BATCH_SIZE) {
    const chunk = itemsData.slice(i, i + ITEM_BATCH_SIZE);
    await prisma.invoiceItem.createMany({ data: chunk });
  }
  console.log(`✅ Seeded ${itemsData.length} line items successfully.`);

  // Generate historical payments for paid invoices and some recent check/Zelle submissions
  console.log('💳 Generating historical payment records (Stripe Card, Stripe Link, Zelle, Checks)...');
  const paymentsData = [];
  let paymentCounter = 1;

  // Payments for paid invoices
  const paidInvoices = invoicesData.filter(inv => inv.status === 'PAID').slice(0, 800);
  for (const inv of paidInvoices) {
    const methodChoice = getRandomItem(['STRIPE_CARD', 'STRIPE_LINK', 'ZELLE', 'CHECK']);
    const payDate = new Date(inv.dueDate.getTime() - getRandomInt(1, 10) * 24 * 60 * 60 * 1000);

    let transId = null;
    let chkNum = null;
    let chkDate = null;
    let zelleRef = null;

    if (methodChoice === 'STRIPE_CARD') {
      transId = `pi_3P${getRandomInt(10000000, 99999999)}tww`;
    } else if (methodChoice === 'STRIPE_LINK') {
      transId = `link_3P${getRandomInt(10000000, 99999999)}fast`;
    } else if (methodChoice === 'ZELLE') {
      zelleRef = `ZEL-${getRandomInt(1000000, 9999999)}`;
    } else {
      chkNum = `CHK-${getRandomInt(10200, 49800)}`;
      chkDate = payDate;
    }

    paymentsData.push({
      id: paymentCounter++,
      paymentNumber: `PAY-${100000 + paymentCounter}`,
      customerId: inv.customerId,
      invoiceId: inv.id,
      amount: inv.total,
      method: methodChoice,
      status: 'COMPLETED',
      transactionId: transId,
      checkNumber: chkNum,
      checkDate: chkDate,
      zelleConfirmation: zelleRef,
      notes: `Settled in MaddenCo ERP ledger`,
      createdAt: payDate
    });
  }

  // Also add some active PENDING checks and Zelle payments for Customer 1 (Apex Tire & Auto)
  paymentsData.push({
    id: paymentCounter++,
    paymentNumber: `PAY-${100000 + paymentCounter}`,
    customerId: 1,
    invoiceId: 1,
    amount: 1500.0,
    method: 'CHECK',
    status: 'PENDING_CLEARANCE',
    transactionId: null,
    checkNumber: 'CHK-28491',
    checkDate: new Date('2026-10-04T10:00:00Z'),
    zelleConfirmation: null,
    notes: 'Mailed physical check. Awaiting bank deposit clearance.',
    createdAt: new Date('2026-10-04T10:00:00Z')
  });

  paymentsData.push({
    id: paymentCounter++,
    paymentNumber: `PAY-${100000 + paymentCounter}`,
    customerId: 1,
    invoiceId: 3,
    amount: 2200.0,
    method: 'ZELLE',
    status: 'PENDING_VERIFICATION',
    transactionId: null,
    checkNumber: null,
    checkDate: null,
    zelleConfirmation: 'ZEL-9941029',
    notes: 'Submitted via customer portal. Pending AR clearing.',
    createdAt: new Date('2026-10-05T14:30:00Z')
  });

  for (let i = 0; i < paymentsData.length; i += BATCH_SIZE) {
    const chunk = paymentsData.slice(i, i + BATCH_SIZE);
    await prisma.payment.createMany({ data: chunk });
  }
  console.log(`✅ Seeded ${paymentsData.length} payment records.`);

  // Generate Warranty/RMA Claims
  console.log('🔄 Generating tire warranty/return (RMA) claims...');
  const rmaData = [];
  let rmaCounter = 1;

  const rmaReasons = [
    'Out-of-round / Ride vibration',
    'Sidewall blister',
    'Bead defect',
    'Casing fault',
    'Shipping error'
  ];

  const rmaDepths = ['8/32"', '9/32"', '10/32"', '11/32"', 'New (0 miles)'];

  // Add 3 detailed RMA claims for Customer 1 (Apex Tire)
  rmaData.push({
    id: 1,
    claimNumber: 'RMA-70192',
    customerId: 1,
    invoiceId: 2,
    tireBrand: 'Michelin',
    tireSize: '265/70R17 115T',
    dotSerial: 'DOT 6G9L 3J8R 1424',
    treadDepth: '10/32"',
    reason: 'Out-of-round / Ride vibration',
    status: 'UNDER_INSPECTION',
    creditAmount: null,
    creditMemoNumber: null,
    notes: 'Customer reports severe steering wheel shake at 55mph after Hunter Road Force balancing at 42 lbs.',
    createdAt: new Date('2026-10-02T09:15:00Z')
  });

  rmaData.push({
    id: 2,
    claimNumber: 'RMA-70193',
    customerId: 1,
    invoiceId: 4,
    tireBrand: 'Goodyear',
    tireSize: 'LT275/70R18',
    dotSerial: 'DOT M608 4N7X 0824',
    treadDepth: 'New (0 miles)',
    reason: 'Sidewall blister',
    status: 'CREDIT_MEMO_ISSUED',
    creditAmount: 245.0,
    creditMemoNumber: 'CM-88219',
    notes: 'Factory bubble noted upon unboxing before mounting. Approved by territory rep.',
    createdAt: new Date('2026-09-24T11:45:00Z')
  });

  rmaData.push({
    id: 3,
    claimNumber: 'RMA-70194',
    customerId: 1,
    invoiceId: 1,
    tireBrand: 'Continental',
    tireSize: '245/45R18 100Y',
    dotSerial: 'DOT A3Y8 1L29 2224',
    treadDepth: '8/32"',
    reason: 'Bead defect',
    status: 'SUBMITTED',
    creditAmount: null,
    creditMemoNumber: null,
    notes: 'Torn inner bead wire noticed during initial nitrogen inflation.',
    createdAt: new Date('2026-10-05T16:20:00Z')
  });

  // Generate 120 more RMA claims across other customers
  for (let r = 4; r <= 125; r++) {
    const tire = getRandomItem(TIRE_CATALOG);
    const custId = getRandomInt(2, TOTAL_CUSTOMERS);
    const statusChoice = getRandomItem(['SUBMITTED', 'UNDER_INSPECTION', 'CREDIT_MEMO_ISSUED', 'REJECTED']);
    const isCredit = statusChoice === 'CREDIT_MEMO_ISSUED';

    rmaData.push({
      id: r,
      claimNumber: `RMA-${70000 + r}`,
      customerId: custId,
      invoiceId: null,
      tireBrand: tire.brand,
      tireSize: tire.size,
      dotSerial: `DOT ${getRandomInt(10, 99)}A${getRandomInt(1, 9)} ${getRandomInt(10, 99)}X${getRandomInt(1, 9)} ${getRandomInt(10, 52)}${getRandomInt(22, 25)}`,
      treadDepth: getRandomItem(rmaDepths),
      reason: getRandomItem(rmaReasons),
      status: statusChoice,
      creditAmount: isCredit ? tire.price : null,
      creditMemoNumber: isCredit ? `CM-${50000 + r}` : null,
      notes: `Standard dealer warranty submission via TWW Customer Portal`,
      createdAt: new Date(now.getTime() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000)
    });
  }

  for (let i = 0; i < rmaData.length; i += BATCH_SIZE) {
    const chunk = rmaData.slice(i, i + BATCH_SIZE);
    await prisma.rmaClaim.createMany({ data: chunk });
  }
  console.log(`✅ Seeded ${rmaData.length} RMA claims.`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 Seed completed successfully in ${duration}s!`);
  console.log(`📊 Summary:`);
  console.log(`   - Customers: ${customersData.length}`);
  console.log(`   - Invoices: ${invoicesData.length}`);
  console.log(`   - Line Items: ${itemsData.length}`);
  console.log(`   - Payments: ${paymentsData.length}`);
  console.log(`   - RMA Claims: ${rmaData.length}`);
  console.log(`🔑 Demo Account: CUST-10001 (Apex Tire & Auto Pros) | PIN: 1234`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


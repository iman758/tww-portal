const pdf = require('pdf-parse');

function parseAgingReport(text) {
  const lines = text.split('\n');
  const customers = {};
  let currentCustomer = null;

  const customerRegex = /^(\d{7})\s+(.+?)\s+(\d{3}\/\d{3}-\d{4})?\s*\(Last activity/;
  const invoiceRegex = /^(\d{2}\/\d{2}\/\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+(\S+)\s+(\d{3})\s+([\d\.]+)(-?)/;
  // Totals line starts with the 7-digit account number followed by a bunch of numbers
  const totalsRegex = /^(\d{7})\s+([\d\.\-]+)\s+([\d\.\-]+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match Customer
    const custMatch = line.match(customerRegex);
    if (custMatch) {
      const acctNum = custMatch[1];
      const name = custMatch[2].trim();
      const phone = custMatch[3] || '';
      
      currentCustomer = {
        accountNumber: acctNum,
        businessName: name,
        phone,
        invoices: [],
        totals: null
      };
      customers[acctNum] = currentCustomer;
      continue;
    }

    // Match Invoice
    if (currentCustomer) {
      const invMatch = line.match(invoiceRegex);
      if (invMatch) {
        const invDateStr = invMatch[1];
        const dueDateStr = invMatch[2];
        const invoiceNumber = invMatch[3];
        let amountStr = invMatch[5];
        const isNegative = invMatch[6] === '-';
        if (amountStr.startsWith('.')) {
          amountStr = '0' + amountStr;
        }
        let amount = parseFloat(amountStr);
        if (isNegative) amount = -amount;

        // Parse date (MM/DD/YY -> 20YY-MM-DD)
        const parseDate = (str) => {
          const [m, d, y] = str.split('/');
          return new Date(`20${y}-${m}-${d}T00:00:00Z`);
        };

        const date = parseDate(invDateStr);
        const dueDate = parseDate(dueDateStr);

        // Determine bucket
        const now = new Date('2026-10-08T00:00:00Z'); // Report date
        const diffTime = now.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let bucket = 'Future';
        if (diffDays <= 0) bucket = 'Current';
        else if (diffDays <= 30) bucket = '01-30';
        else if (diffDays <= 60) bucket = '31-60';
        else bucket = 'Over 61';

        currentCustomer.invoices.push({
          invoiceNumber,
          date,
          dueDate,
          balanceDue: amount,
          status: amount <= 0 ? 'PAID' : (bucket === 'Future' || bucket === 'Current' ? 'CURRENT' : `OVERDUE_${bucket.split('-')[0]}`),
          agingBucket: bucket
        });
        continue;
      }

      // Match totals
      const totMatch = line.match(totalsRegex);
      if (totMatch && totMatch[1] === currentCustomer.accountNumber) {
        // Line has up to 6 amounts (Future, Current, 01-30, 31-60, Over 61, Total Due)
        // Since spacing varies, we extract all numbers
        const amounts = line.substring(7).trim().split(/\s+/).map(s => {
          const neg = s.endsWith('-');
          const val = parseFloat(s.replace('-', ''));
          return neg ? -val : val;
        });
        
        // The last amount is always Total Due. The others fall into buckets.
        // It's tricky because 0s are often omitted.
        // We will just calculate totals dynamically from the invoices we parsed!
        let future = 0, current = 0, p30 = 0, p60 = 0, p61 = 0, total = 0;
        for (const inv of currentCustomer.invoices) {
          if (inv.agingBucket === 'Future') future += inv.balanceDue;
          else if (inv.agingBucket === 'Current') current += inv.balanceDue;
          else if (inv.agingBucket === '01-30') p30 += inv.balanceDue;
          else if (inv.agingBucket === '31-60') p60 += inv.balanceDue;
          else p61 += inv.balanceDue;
          total += inv.balanceDue;
        }

        currentCustomer.totals = {
          futureBalance: future,
          currentBalance: current,
          pastDue0130: p30,
          pastDue3160: p60,
          pastDueOver61: p61,
          totalDue: total
        };
      }
    }
  }

  // Generate totals for those who didn't match the totals regex
  for (const acct in customers) {
    if (!customers[acct].totals) {
      let future = 0, current = 0, p30 = 0, p60 = 0, p61 = 0, total = 0;
      for (const inv of customers[acct].invoices) {
        if (inv.agingBucket === 'Future') future += inv.balanceDue;
        else if (inv.agingBucket === 'Current') current += inv.balanceDue;
        else if (inv.agingBucket === '01-30') p30 += inv.balanceDue;
        else if (inv.agingBucket === '31-60') p60 += inv.balanceDue;
        else p61 += inv.balanceDue;
        total += inv.balanceDue;
      }
      customers[acct].totals = {
        futureBalance: future,
        currentBalance: current,
        pastDue0130: p30,
        pastDue3160: p60,
        pastDueOver61: p61,
        totalDue: total
      };
    }
  }

  return Object.values(customers);
}

module.exports = {
  parseAgingReport
};

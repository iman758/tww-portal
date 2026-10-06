# 🚗 TWW Distribution | B2B Wholesale Customer Portal

A production-ready, mobile-first B2B customer web application engineered for wholesale tire shop owners and commercial fleet dealers of **TWW Distribution**. 

Designed to mimic a **MaddenCo ERP** system schema with high-contrast, consumer-grade simplicity. Built for non-technical tire shop managers to pay invoices, log check payments, send Zelle references, and file manufacturer warranty returns (RMA) in under 60 seconds on their mobile devices.

---

## 🌟 Key Features

### 1. Mobile-First Responsive Layout
- **Touch-Optimized Viewport (375px–430px)**: Dedicated bottom navigation bar (`Invoices`, `Pay Bill`, `RMA Claim`, `Payments`, `Account`), touchable action buttons, high-contrast badges, and zero crowded tables.
- **Card-First Invoice Presentation**: Converts invoice tables into clean cards with clear aging indicators, invoice number, due date, balance, and quick "Pay Now" actions.
- **MaddenCo Invoice Detail Drawer**: Line-by-line itemization featuring wholesale tire brands, patterns, dimensions, ply ratings, state scrap tire recycling fees ($2.50/tire), route delivery freight, and balance due.

### 2. Multi-Method B2B Payments (US Market)
- **Stripe & Stripe Link**: Integrated US Credit/Debit card checkout and **Stripe Link** (for instant 1-click US bank or card checkout). Generates PaymentIntents and immediately updates the customer's balance and invoice status upon completion.
- **Zelle Direct Pay**: Verified TWW Distribution recipient instructions (`ar@twwdistribution.com`, `(800) 555-8473`, `TWW Distribution LLC`) with 1-click copy-to-clipboard, memo formatting, and confirmation code submission for manual AR clearing (`Pending AR Verification`).
- **Physical Check Tracking**: Allows shop owners to log checks handed to route delivery drivers or mailed via USPS/FedEx with check number, date, amount, and issuing bank. Sets status to `Pending Deposit Clearance`.

### 3. Tire Warranty & Return Claim Center (RMA)
- Wholesale tire shops regularly return defective or vibrating tires.
- **DOT Serial Code**: Format validation for 10–12 character DOT tire serial numbers (e.g., `DOT 6G9L 3J8R 1424`).
- **Remaining Tread Depth**: Measured in 32nds of an inch (e.g., `10/32"`, `8/32"`, `New`).
- **Defect Classification**: Out-of-round / Ride vibration (Hunter Road Force), Sidewall blister, Bead defect, Casing fault, Shipping error.
- **Photo Upload**: Client-side preview and capture from mobile device cameras.
- **RMA Tracker**: Real-time status progression (`Submitted` ➔ `Under Inspection` ➔ `Credit Memo Issued` ➔ `Rejected`) with credit memo dollar amounts.

### 4. MaddenCo-Style Dummy Seeding (1,000+ Customers & 5,000+ Invoices)
- **1,050 realistic wholesale dealer accounts** with unique customer numbers (`CUST-10001` to `CUST-11050`), business names, US addresses, terms (`Net 30`, `Net 10th Proximo`, `COD`), and credit limits ($10k – $150k).
- **5,250 realistic tire invoices** across all aging brackets:
  - `Current (Within Terms)`
  - `1-30 Days Overdue`
  - `31-60 Days Overdue`
  - `61-90+ Days Overdue`
  - `Paid`
- **Wholesale Tire Catalog**: Authentic SKUs and specs from Michelin, Goodyear, Bridgestone, Continental, Firestone, Toyo, BFGoodrich, Falken, Cooper, and Pirelli.
- **Seeded historical payments & RMA claims** for instant out-of-the-box realism.

---

## 🏗️ Project Structure

```
tww_portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # MaddenCo ERP SQLite database schema
│   │   └── seed.js             # High-speed batch seed script (1,050 customers, 5,250 invoices)
│   ├── src/
│   │   ├── db.js               # Prisma Client singleton
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT session authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # Sign-in & demo dealer search endpoints
│   │   │   ├── invoices.js     # Invoices & itemized line items endpoints
│   │   │   ├── payments.js     # Stripe, Stripe Link, Zelle, and Check endpoints
│   │   │   ├── rma.js          # Tire return & warranty claim endpoints
│   │   │   └── customers.js    # AR aging breakdown & account profile endpoints
│   │   └── server.js           # Express REST API server
│   ├── .env.example            # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # Dealer identity & account switcher
│   │   │   ├── BottomNav.jsx           # Mobile viewport bottom navigation
│   │   │   ├── AccountSummaryCard.jsx  # Balance, credit limit, and aging buckets
│   │   │   ├── InvoicesTab.jsx         # Card-based invoice browser with filters
│   │   │   ├── InvoiceDetailModal.jsx  # Line items drawer & pay actions
│   │   │   ├── StripeModal.jsx         # Stripe & Stripe Link checkout modal
│   │   │   ├── ZelleModal.jsx          # Zelle verified recipient & submission modal
│   │   │   ├── CheckModal.jsx          # Physical check logging modal
│   │   │   ├── RmaTab.jsx              # Tire warranty submission & tracker
│   │   │   ├── PaymentsTab.jsx         # Historical payments & checks ledger
│   │   │   ├── AccountProfileTab.jsx   # Dealership billing & distributor dispatch
│   │   │   ├── LoginView.jsx           # Customer sign-in & 1-click test login
│   │   │   └── DemoSwitcherModal.jsx   # 1,000+ dealer switcher modal
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API client
│   │   ├── App.jsx                     # Root application coordinator
│   │   ├── main.jsx                    # React 18 DOM mount
│   │   └── index.css                   # Tailwind styles, mobile touch utilities
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .env.example
├── package.json                        # Root workspace scripts
└── README.md
```

---

## ⚙️ Environment Variables (`.env.example`)

Create a `.env` file in the root or inside `/backend` with the following:

```env
PORT=5000
NODE_ENV=development
APP_BASE_URL=http://localhost:3000

# Stripe Configuration (US Card Payments & Stripe Link)
# Obtain test keys from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_51MockTWWDistributionSecretKey1234567890abcdef
STRIPE_PUBLISHABLE_KEY=pk_test_51MockTWWDistributionPubKey1234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_mockTwwDistributionWebhookSecret1234567890

# Database
DATABASE_URL="file:./dev.db"

# JWT Authentication Secret
JWT_SECRET=tww_portal_super_secure_jwt_secret_maddenco_2026
```

> **Note**: The portal includes built-in mock/sandbox fallback mode for Stripe and Stripe Link. If mock keys are present, test transactions succeed instantly and update the SQLite ledger automatically.

---

## 🚀 Quickstart Terminal Commands

### Step 1: Install Dependencies
From the root directory (`e:\tww_portal`):

```bash
# Install backend dependencies
cd backend
npm install

# Push database schema & generate Prisma client
npx prisma db push

# Run the MaddenCo seed script (Seeds 1,050 customers & 5,250 invoices in ~3 seconds)
npm run seed

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Start the Servers

**Terminal 1 — Backend (Express API on Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (Vite Dev Server on Port 3000):**
```bash
cd frontend
npm run dev
```

Open your browser to **`http://localhost:3000`**.

---

## 🔑 Demo Login Credentials

The application provides an instant **1-Click Demo Login** button on the sign-in screen, or you can enter:

- **Flagship Demo Account**: `CUST-10001`
- **Dealer Name**: Apex Tire & Auto Pros (Denver, CO)
- **PIN**: `1234`
- **Terms**: Net 30 | Credit Limit: \$75,000

### Testing Any of the 1,000+ Seeded Accounts
Click **"Pick from 1,000+ Dealers"** on the login screen or click the **"Dealer: CUST-..."** pill in the top header once logged in to instantly search and switch to any of the 1,050 seeded tire shops across 20 US metropolitan regions.


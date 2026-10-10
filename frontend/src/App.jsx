import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AccountSummaryCard from './components/AccountSummaryCard';
import InvoicesTab from './components/InvoicesTab';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import StripeModal from './components/StripeModal';
import ZelleModal from './components/ZelleModal';
import CheckModal from './components/CheckModal';
import RmaTab from './components/RmaTab';
import PaymentsTab from './components/PaymentsTab';
import AccountProfileTab from './components/AccountProfileTab';
import LoginView from './components/LoginView';
import AdminPanel from './components/AdminPanel';
import DemoSwitcherModal from './components/DemoSwitcherModal';
import { api } from './services/api';

export default function App() {
  const [customer, setCustomer] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'payments' | 'rma' | 'account'
  
  // Invoices & Aging State
  const [invoices, setInvoices] = useState([]);
  const [invoiceCounts, setInvoiceCounts] = useState({ all: 0, unpaid: 0, overdue: 0, paid: 0 });
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agingData, setAgingData] = useState(null);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  // Modals & Drawers
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [stripeInvoice, setStripeInvoice] = useState(null);
  const [zelleInvoice, setZelleInvoice] = useState(null);
  const [checkInvoice, setCheckInvoice] = useState(null);
  const [rmaInitialInvoice, setRmaInitialInvoice] = useState(null);
  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = useState(false);

  // Load authenticated profile on startup
  useEffect(() => {
    const savedCustomer = localStorage.getItem('tww_customer');
    const token = localStorage.getItem('tww_token');

    if (savedCustomer && token) {
      try {
        setCustomer(JSON.parse(savedCustomer));
        // Verify with server
        api.getMe()
          .then((fresh) => {
            setCustomer(fresh);
            localStorage.setItem('tww_customer', JSON.stringify(fresh));
          })
          .catch(() => {
            // Token expired
            setCustomer(null);
          })
          .finally(() => setIsInitializing(false));
      } catch (e) {
        setIsInitializing(false);
      }
    } else {
      setIsInitializing(false);
    }

    const handleLogoutEvent = () => setCustomer(null);
    window.addEventListener('tww_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('tww_auth_logout', handleLogoutEvent);
  }, []);

  // Fetch Invoices & Aging whenever customer or filters change
  const refreshInvoicesAndFinancials = useCallback(async () => {
    if (!customer || customer.role === 'admin') return;
    setIsLoadingInvoices(true);
    try {
      const [invRes, agingRes] = await Promise.all([
        api.getInvoices({ tab: activeFilterTab, search: searchQuery }),
        api.getAgingSummary(),
      ]);

      setInvoices(invRes.invoices || []);
      setInvoiceCounts(invRes.counts || { all: 0, unpaid: 0, overdue: 0, paid: 0 });
      setAgingData(agingRes);

      // Refresh customer financial metrics
      setCustomer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          financials: {
            totalBalance: agingRes.totalOutstanding,
            currentBalance: agingRes.aging.current,
            overdueBalance: agingRes.pastDueAmount,
            overdueCount: invRes.counts.overdue,
            unpaidCount: invRes.counts.unpaid,
            availableCredit: agingRes.availableCredit,
          },
        };
      });
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [customer?.id, activeFilterTab, searchQuery]);

  useEffect(() => {
    if (customer) {
      refreshInvoicesAndFinancials();
    }
  }, [customer?.id, activeFilterTab, searchQuery, refreshInvoicesAndFinancials]);

  const handleLogout = () => {
    localStorage.removeItem('tww_token');
    localStorage.removeItem('tww_customer');
    setCustomer(null);
    setSelectedInvoice(null);
  };

  const handlePaymentSuccess = () => {
    refreshInvoicesAndFinancials();
    // Also refresh selected invoice if open
    if (selectedInvoice) {
      api.getInvoiceById(selectedInvoice.id).then(setSelectedInvoice).catch(() => {});
    }
  };

  // If not authenticated, show modern consumer-grade Login View
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Connecting to TWW Distribution...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return <LoginView onLoginSuccess={(cust) => setCustomer(cust)} />;
  }

  if (customer.role === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900">
      {/* Sticky Header with customer brand & demo account switcher */}
      <Header
        customer={customer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenDemoSwitcher={() => setIsDemoSwitcherOpen(true)}
      />

      {/* Main Content Area (Max width constrained for clean mobile & tablet viewing) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 pb-24 md:pb-12">
        {/* Account Context Banner (Sticky Financial Summary Card) */}
        <AccountSummaryCard
          customer={customer}
          agingData={agingData}
          onPayNow={() => {
            const firstUnpaid = invoices.find((i) => i.status !== 'PAID');
            if (firstUnpaid) {
              setStripeInvoice(firstUnpaid);
            } else {
              setActiveTab('invoices');
              setActiveFilterTab('unpaid');
            }
          }}
          onLogCheck={() => {
            setCheckInvoice(invoices.find((i) => i.status !== 'PAID') || null);
          }}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'invoices' && (
          <InvoicesTab
            invoices={invoices}
            counts={invoiceCounts}
            activeFilterTab={activeFilterTab}
            setActiveFilterTab={setActiveFilterTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isLoading={isLoadingInvoices}
            onSelectInvoice={(inv) => setSelectedInvoice(inv)}
            onPayInvoice={(inv) => setStripeInvoice(inv)}
          />
        )}

        {activeTab === 'rma' && (
          <RmaTab
            initialInvoice={rmaInitialInvoice}
            onClearInitialInvoice={() => setRmaInitialInvoice(null)}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab
            onLogNewPayment={() => {
              const firstUnpaid = invoices.find((i) => i.status !== 'PAID');
              if (firstUnpaid) setStripeInvoice(firstUnpaid);
            }}
          />
        )}

        {activeTab === 'account' && (
          <AccountProfileTab
            customer={customer}
            onLogout={handleLogout}
            onOpenDemoSwitcher={() => setIsDemoSwitcherOpen(true)}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar (Hidden on desktop) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unpaidCount={invoiceCounts.unpaid}
        overdueCount={invoiceCounts.overdue}
        onQuickPay={() => {
          const firstUnpaid = invoices.find((i) => i.status !== 'PAID');
          if (firstUnpaid) {
            setStripeInvoice(firstUnpaid);
          } else {
            setActiveTab('invoices');
          }
        }}
      />

      {/* MODAL 1: Invoice Detail Drawer */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPayWithStripe={(inv) => {
            setStripeInvoice(inv);
          }}
          onPayWithZelle={(inv) => {
            setZelleInvoice(inv);
          }}
          onLogCheck={(inv) => {
            setCheckInvoice(inv);
          }}
          onStartRma={(inv) => {
            setSelectedInvoice(null);
            setRmaInitialInvoice(inv);
            setActiveTab('rma');
          }}
        />
      )}

      {/* MODAL 2: Stripe & Stripe Link Checkout */}
      {stripeInvoice && (
        <StripeModal
          invoice={stripeInvoice}
          onClose={() => setStripeInvoice(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* MODAL 3: Zelle Instructions & Confirmation Submission */}
      {zelleInvoice && (
        <ZelleModal
          customer={customer}
          invoice={zelleInvoice}
          onClose={() => setZelleInvoice(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* MODAL 4: Check Payment Submission */}
      {checkInvoice && (
        <CheckModal
          customer={customer}
          invoice={checkInvoice}
          onClose={() => setCheckInvoice(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* MODAL 5: Demo Account Switcher (1,000+ Accounts) */}
      {isDemoSwitcherOpen && (
        <DemoSwitcherModal
          currentAccountNumber={customer.accountNumber}
          onClose={() => setIsDemoSwitcherOpen(false)}
          onSelectCustomer={(newCustomer) => {
            setCustomer(newCustomer);
            setActiveTab('invoices');
          }}
        />
      )}
    </div>
  );
}


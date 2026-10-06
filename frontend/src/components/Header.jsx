import React from 'react';
import { Building2, LogOut, Disc3, ShieldCheck, RefreshCw, ChevronDown } from 'lucide-react';

export default function Header({ customer, onLogout, onOpenDemoSwitcher, activeTab, setActiveTab }) {
  if (!customer) return null;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner / Brand */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
            <Disc3 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-tight text-lg text-white">TWW</span>
              <span className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                Distribution
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Wholesale Tire B2B Customer Portal</p>
          </div>
        </div>

        {/* Customer Context & Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Demo Account Switcher Button */}
          <button
            onClick={onOpenDemoSwitcher}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            title="Switch Dealer Account (1,000+ Seeded Accounts)"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-medium">Dealer:</span>
            <span className="font-mono-code font-semibold text-amber-400 max-w-[120px] sm:max-w-none truncate">{customer.accountNumber}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Sign Out */}
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Navigation Tabs (Hidden on Mobile, BottomNav handles mobile) */}
      <div className="hidden md:block bg-slate-950 border-t border-slate-850">
        <div className="max-w-6xl mx-auto px-4 flex space-x-1">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'invoices'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Invoices & Bills</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'payments'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Payment Log</span>
          </button>
          <button
            onClick={() => setActiveTab('rma')}
            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'rma'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Tire Warranty / RMA</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
              activeTab === 'account'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Account Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
}


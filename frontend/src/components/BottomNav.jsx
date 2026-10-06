import React from 'react';
import { FileText, CreditCard, RefreshCw, Receipt, Building2 } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onQuickPay, unpaidCount, overdueCount }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-xl pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {/* Invoices */}
        <button
          onClick={() => setActiveTab('invoices')}
          className={`relative flex flex-col items-center justify-center transition ${
            activeTab === 'invoices' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <FileText className={`w-5 h-5 ${activeTab === 'invoices' ? 'stroke-[2.5px] text-tww-800' : ''}`} />
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1">Invoices</span>
          {activeTab === 'invoices' && (
            <div className="absolute bottom-1 w-6 h-1 bg-tww-700 rounded-full" />
          )}
        </button>

        {/* Quick Pay */}
        <button
          onClick={onQuickPay}
          className="relative flex flex-col items-center justify-center text-slate-700 hover:text-tww-800"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 -mt-3 border-2 border-white">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 mt-0.5">Pay Bill</span>
        </button>

        {/* Tire Return / RMA */}
        <button
          onClick={() => setActiveTab('rma')}
          className={`relative flex flex-col items-center justify-center transition ${
            activeTab === 'rma' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${activeTab === 'rma' ? 'stroke-[2.5px] text-tww-800' : ''}`} />
          <span className="text-[11px] mt-1">RMA Claim</span>
          {activeTab === 'rma' && (
            <div className="absolute bottom-1 w-6 h-1 bg-tww-700 rounded-full" />
          )}
        </button>

        {/* Payments Log */}
        <button
          onClick={() => setActiveTab('payments')}
          className={`relative flex flex-col items-center justify-center transition ${
            activeTab === 'payments' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Receipt className={`w-5 h-5 ${activeTab === 'payments' ? 'stroke-[2.5px] text-tww-800' : ''}`} />
          <span className="text-[11px] mt-1">Payments</span>
          {activeTab === 'payments' && (
            <div className="absolute bottom-1 w-6 h-1 bg-tww-700 rounded-full" />
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveTab('account')}
          className={`relative flex flex-col items-center justify-center transition ${
            activeTab === 'account' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className={`w-5 h-5 ${activeTab === 'account' ? 'stroke-[2.5px] text-tww-800' : ''}`} />
          <span className="text-[11px] mt-1">Account</span>
          {activeTab === 'account' && (
            <div className="absolute bottom-1 w-6 h-1 bg-tww-700 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
}


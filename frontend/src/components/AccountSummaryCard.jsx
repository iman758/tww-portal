import React, { useState } from 'react';
import { CreditCard, AlertCircle, ChevronDown, ChevronUp, DollarSign, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AccountSummaryCard({ customer, agingData, onPayNow, onLogCheck }) {
  const [showAgingDetails, setShowAgingDetails] = useState(false);

  if (!customer) return null;

  const financials = customer.financials || {};
  const totalBalance = financials.totalBalance || 0;
  const creditLimit = customer.creditLimit || 50000;
  const availableCredit = financials.availableCredit ?? Math.max(0, creditLimit - totalBalance);
  const overdueBalance = financials.overdueBalance || 0;
  const overdueCount = financials.overdueCount || 0;

  // Credit usage percentage
  const usagePercent = Math.min(100, Math.round((totalBalance / creditLimit) * 100));

  const aging = agingData?.aging || {
    current: financials.currentBalance || 0,
    days1to30: 0,
    days31to60: 0,
    days61to90Plus: 0,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-5">
      {/* Primary Dealer Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900 to-slate-850 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                {customer.terms || 'Net 30'}
              </span>
              <span className="text-xs font-mono-code text-slate-300">
                #{customer.accountNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              {customer.businessName}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {customer.address}, {customer.city}, {customer.state} {customer.zip}
            </p>
          </div>

          {/* Quick Pay CTA Button */}
          <div className="mt-2 sm:mt-0 flex items-center space-x-2">
            <button
              onClick={onPayNow}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/20 touch-press transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Make a Payment</span>
            </button>
          </div>
        </div>

        {/* Overdue Warning Alert Banner if overdue balance exists */}
        {overdueBalance > 0 && (
          <div className="mt-4 p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-xs text-rose-200 font-medium">
                <strong className="text-white">${overdueBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} Past Due</strong> across {overdueCount} invoice{overdueCount > 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded">
              Action Required
            </span>
          </div>
        )}
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white">
        {/* Total Outstanding */}
        <div className="text-center p-3 sm:p-4">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Balance</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500 block">Open Ledger</span>
        </div>

        {/* Available Credit */}
        <div className="text-center p-3 sm:p-4">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Available Credit</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5">
            ${availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500 block">of ${creditLimit.toLocaleString()} limit</span>
        </div>

        {/* Credit Limit & Bar */}
        <div className="text-center p-3 sm:p-4">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Credit Used</p>
          <p className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5">
            {usagePercent}%
          </p>
          <div className="w-16 mx-auto mt-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                usagePercent > 80 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expandable MaddenCo Aging Brackets */}
      <div className="border-t border-slate-100 bg-slate-50/60">
        <button
          onClick={() => setShowAgingDetails(!showAgingDetails)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>View MaddenCo AR Aging Buckets</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-500">
            <span>{showAgingDetails ? 'Hide' : 'Show Details'}</span>
            {showAgingDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showAgingDetails && (
          <div className="px-4 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Current</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                ${(aging.current || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Within Terms</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">1 - 30 Days</span>
              <p className="text-sm font-bold text-amber-600 mt-0.5">
                ${(aging.days1to30 || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-amber-600 font-medium">Past Due</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">31 - 60 Days</span>
              <p className="text-sm font-bold text-rose-600 mt-0.5">
                ${(aging.days31to60 || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-rose-600 font-medium">Overdue</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">61 - 90+ Days</span>
              <p className="text-sm font-bold text-red-700 mt-0.5">
                ${(aging.days61to90Plus || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-red-700 font-medium">Critical</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


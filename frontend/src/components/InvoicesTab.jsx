import React, { useState } from 'react';
import { Search, Filter, Calendar, CreditCard, ChevronRight, CheckCircle2, AlertTriangle, Clock, Layers } from 'lucide-react';

export default function InvoicesTab({
  invoices,
  counts,
  activeFilterTab,
  setActiveFilterTab,
  searchQuery,
  setSearchQuery,
  onSelectInvoice,
  onPayInvoice,
  isLoading,
}) {
  const [sortBy, setSortBy] = useState('dueDate');

  // Filter tabs definition
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'unpaid', label: 'Unpaid', count: counts.unpaid, highlight: 'amber' },
    { id: 'overdue', label: 'Overdue', count: counts.overdue, highlight: 'rose' },
    { id: 'paid', label: 'Paid', count: counts.paid, highlight: 'emerald' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls: Search and Filter Tabs */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Invoice #, PO #, or Tire brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-tww-600 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {tabs.map((tab) => {
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-code ${
                    isActive
                      ? tab.highlight === 'rose'
                        ? 'bg-rose-500 text-white'
                        : tab.highlight === 'amber'
                        ? 'bg-amber-400 text-slate-950'
                        : tab.highlight === 'emerald'
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-700 text-slate-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoice Cards List (Mobile-Optimized) */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse h-32" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Invoices Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? `No invoices matched "${searchQuery}". Try clearing search.`
              : `You have no ${activeFilterTab !== 'all' ? activeFilterTab : ''} invoices in this view.`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-semibold text-tww-700 hover:underline"
            >
              Reset Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const isPaid = inv.status === 'PAID';
            const isOverdue = inv.isOverdue;
            const invoiceDate = new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const dueDate = new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Card Top: Invoice #, PO #, Status Badge */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono-code font-bold text-base text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                        {inv.poNumber && (
                          <span className="text-[11px] font-mono-code text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {inv.poNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Billed {invoiceDate}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPaid ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Paid</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>{inv.daysOverdue}d Overdue</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Current</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Line Items Preview */}
                  {inv.items && inv.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-700 font-medium truncate">
                        {inv.items[0].qty}x {inv.items[0].tireBrand} {inv.items[0].pattern} ({inv.items[0].size})
                        {inv.items.length > 1 && (
                          <span className="text-slate-400 font-normal"> +{inv.items.length - 1} more tire SKU{inv.items.length > 2 ? 's' : ''}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Total Tires: {inv.totalTires} units
                      </p>
                    </div>
                  )}

                  {/* Amount Breakdown & Actions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        {isPaid ? 'Amount Paid' : 'Balance Due'}
                      </p>
                      <p className={`text-lg sm:text-xl font-extrabold ${isPaid ? 'text-slate-700' : 'text-slate-950'}`}>
                        ${(isPaid ? inv.total : inv.balanceDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {!isPaid && inv.balanceDue < inv.total && (
                        <span className="text-[10px] text-slate-400 block">
                          Total was ${inv.total.toFixed(2)}
                        </span>
                      )}
                      {!isPaid && (
                        <span className="text-[11px] text-slate-500 block">
                          Due by <strong className={isOverdue ? 'text-rose-600' : 'text-slate-700'}>{dueDate}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      {/* View Drawer Button */}
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="flex-1 sm:flex-none justify-center px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {/* Pay Action Button */}
                      {!isPaid && (
                        <button
                          onClick={() => onPayInvoice(inv)}
                          className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-sm touch-press transition flex items-center space-x-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


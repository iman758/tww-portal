import React, { useState, useEffect } from 'react';
import { Receipt, CheckCircle2, Clock, AlertCircle, CreditCard, Zap, Truck, DollarSign, FileCheck, Search } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentsTab({ onLogNewPayment }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState('ALL');

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPayments();
      setPayments(data || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const getMethodBadge = (method) => {
    switch (method) {
      case 'STRIPE_LINK':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
            <span>Stripe Link</span>
          </span>
        );
      case 'STRIPE_CARD':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            <CreditCard className="w-3 h-3 text-slate-600" />
            <span>Card Checkout</span>
          </span>
        );
      case 'ZELLE':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <span className="font-extrabold text-[10px]">Z</span>
            <span>Zelle Pay</span>
          </span>
        );
      case 'CHECK':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <FileCheck className="w-3 h-3 text-amber-600" />
            <span>Physical Check</span>
          </span>
        );
      default:
        return <span>{method}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'PENDING_CLEARANCE':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Deposit Clearance</span>
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>Pending AR Verification</span>
          </span>
        );
      default:
        return (
          <span className="text-xs text-slate-600">{status}</span>
        );
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filterMethod === 'ALL') return true;
    if (filterMethod === 'STRIPE') return p.method === 'STRIPE_CARD' || p.method === 'STRIPE_LINK';
    if (filterMethod === 'ZELLE') return p.method === 'ZELLE';
    if (filterMethod === 'CHECK') return p.method === 'CHECK';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Payment & Check History
          </h2>
          <p className="text-xs text-slate-500">MaddenCo Ledger Reconciliation</p>
        </div>

        {/* Method Switcher */}
        <div className="flex flex-wrap gap-1.5 pb-0.5">
          {[
            { id: 'ALL', label: 'All Payments' },
            { id: 'STRIPE', label: 'Stripe & Link' },
            { id: 'ZELLE', label: 'Zelle' },
            { id: 'CHECK', label: 'Checks' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMethod(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMethod === m.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Records */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse h-24" />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Payment Records</h3>
          <p className="text-xs text-slate-500">
            No payments recorded under this filter yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPayments.map((p) => {
            const payDate = new Date(p.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-0 sm:space-x-2">
                      <span className="font-mono-code font-bold text-sm text-slate-900">
                        {p.paymentNumber}
                      </span>
                      {getMethodBadge(p.method)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Logged on {payDate}
                      {p.invoice && (
                        <span> &bull; For <strong className="font-mono-code text-slate-700">{p.invoice.invoiceNumber}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="text-left sm:text-right mt-1 sm:mt-0">
                    <span className="text-base font-extrabold text-slate-900 block">
                      ${p.amount.toFixed(2)}
                    </span>
                    {getStatusBadge(p.status)}
                  </div>
                </div>

                {/* Sub details: Check # or Zelle Confirmation */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-1 text-slate-600">
                  {p.checkNumber && (
                    <span className="font-mono-code font-semibold">
                      Check #{p.checkNumber}
                    </span>
                  )}
                  {p.zelleConfirmation && (
                    <span className="font-mono-code font-semibold text-purple-900">
                      Zelle Ref: {p.zelleConfirmation}
                    </span>
                  )}
                  {p.transactionId && (
                    <span className="font-mono-code text-[11px] text-slate-400">
                      Tx: {p.transactionId}
                    </span>
                  )}
                  {p.notes && (
                    <span className="text-[11px] text-slate-500 truncate max-w-xs">
                      {p.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


import React from 'react';
import { X, Calendar, Truck, ShieldAlert, CreditCard, ArrowRight, CheckCircle2, Clock, DollarSign, Download, Printer } from 'lucide-react';

export default function InvoiceDetailModal({
  invoice,
  onClose,
  onPayWithStripe,
  onPayWithZelle,
  onLogCheck,
  onStartRma,
}) {
  if (!invoice) return null;

  const isPaid = invoice.status === 'PAID';
  const isOverdue = invoice.isOverdue;
  const invoiceDate = new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex justify-end">
      {/* Slide-over Sheet / Responsive Drawer */}
      <div className="w-full max-w-xl bg-white min-h-screen shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono-code font-bold text-lg text-white">
                {invoice.invoiceNumber}
              </span>
              {isPaid ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  PAID
                </span>
              ) : isOverdue ? (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  OVERDUE ({invoice.daysOverdue}d)
                </span>
              ) : (
                <span className="bg-sky-500/20 text-sky-400 border border-sky-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Wholesale Delivery Invoice &bull; PO #{invoice.poNumber || 'N/A'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Invoice Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Invoice Date</span>
                <span className="font-semibold text-slate-800">{invoiceDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Due Date</span>
                <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                  {dueDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Total Invoiced</span>
                <span className="font-semibold text-slate-800">${invoice.total?.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Balance Due</span>
                <span className={`font-bold text-base ${isPaid ? 'text-emerald-600' : 'text-slate-950'}`}>
                  ${invoice.balanceDue?.toFixed(2)}
                </span>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center space-x-1.5 text-[11px] text-slate-600">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>{invoice.notes}</span>
              </div>
            )}
          </div>

          {/* Itemized Line Items (MaddenCo Wholesale Tire SKUs) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Itemized Tire Line Items
              </h3>
              <span className="text-xs text-slate-500">
                {invoice.items?.length || 0} Line Item{invoice.items?.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-2.5">
              {invoice.items && invoice.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-0 sm:space-x-1.5">
                        <span className="font-bold text-sm text-slate-900">{item.tireBrand}</span>
                        <span className="text-xs font-semibold text-slate-700">{item.pattern}</span>
                      </div>
                      <p className="text-xs font-mono-code text-slate-600 mt-0.5">
                        {item.size} {item.ply ? `• ${item.ply}` : ''}
                      </p>
                      <p className="text-[10px] font-mono-code text-slate-400">
                        SKU: {item.sku}
                      </p>
                    </div>

                    <div className="text-left sm:text-right mt-1 sm:mt-0">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        ${item.extendedPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.qty} @ ${item.wholesalePrice.toFixed(2)}/ea
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals & Surcharges */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tire Subtotal</span>
              <span className="font-semibold text-slate-800">${invoice.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>State Tire Scrap/Recycling Fee ($2.50/tire)</span>
              <span className="font-semibold text-slate-800">${invoice.tireFee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Route Delivery Freight</span>
              <span className="font-semibold text-slate-800">
                {invoice.freight > 0 ? `$${invoice.freight.toFixed(2)}` : 'FREE (Local Route)'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Invoice Total</span>
              <span>${invoice.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base pt-1 border-t border-slate-300">
              <span className={isPaid ? 'text-emerald-700' : 'text-slate-950'}>
                {isPaid ? 'Total Settled' : 'Current Balance Due'}
              </span>
              <span className={isPaid ? 'text-emerald-700' : 'text-slate-950'}>
                ${invoice.balanceDue?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment History on this Invoice (if any) */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Payments Logged on this Invoice
              </h3>
              <div className="space-y-1.5">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-900">${p.amount.toFixed(2)}</span>
                      <span className="text-slate-500 ml-1.5">via {p.method.replace('_', ' ')}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RMA Shortcut */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-amber-900 font-medium">Have a defect or ride complaint?</span>
            </div>
            <button
              onClick={() => onStartRma(invoice)}
              className="text-amber-800 font-bold hover:underline"
            >
              Start RMA Claim
            </button>
          </div>
        </div>

        {/* Footer Payment Actions */}
        {!isPaid ? (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 pb-safe">
            {/* Primary Stripe Button */}
            <button
              onClick={() => onPayWithStripe(invoice)}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-md touch-press transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay ${invoice.balanceDue?.toFixed(2)} with Card / Stripe Link</span>
            </button>

            {/* Alternative Payment Options */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onPayWithZelle(invoice)}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 rounded-xl transition"
              >
                Pay via Zelle
              </button>
              <button
                onClick={() => onLogCheck(invoice)}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 rounded-xl transition"
              >
                Log Physical Check
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border-t border-emerald-200 text-center pb-safe">
            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Invoice Settled in Full &bull; Thank you for your business!</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


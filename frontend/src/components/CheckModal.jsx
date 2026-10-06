import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, FileCheck, Truck, Mail, DollarSign, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function CheckModal({ customer, invoice, onClose, onSuccess }) {
  const [checkNumber, setCheckNumber] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(invoice?.balanceDue || '');
  const [bankName, setBankName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('driver'); // 'driver' or 'mail'
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!checkNumber.trim()) {
      setErrorMsg('Check Number is required.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid check amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitCheckPayment({
        checkNumber: checkNumber.trim(),
        checkDate,
        amount: numAmount,
        invoiceIds: invoice ? [invoice.id] : [],
        bankName: bankName.trim(),
        deliveryMethod,
        notes: notes.trim(),
      });

      setSuccessResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record physical check payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Log Physical Check Payment</h3>
              <p className="text-[11px] text-slate-400">Mailed or handed to delivery route driver</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Check Logged!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Status set to <strong>Pending Deposit Clearance</strong>. MaddenCo AR will credit your ledger upon bank clearance.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Check Number:</span>
                <span className="font-mono-code font-bold text-slate-900">#{checkNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery:</span>
                <span className="font-semibold text-slate-800">
                  {deliveryMethod === 'driver' ? 'Route Driver Delivery' : 'Mailed USPS'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Delivery Method Choice */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                How is this check being delivered?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('driver')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1.5 transition ${
                    deliveryMethod === 'driver'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Handed to Driver</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('mail')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1.5 transition ${
                    deliveryMethod === 'mail'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Mailed / Courier</span>
                </button>
              </div>
            </div>

            {/* Check Details */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Check Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14092"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-code focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Check Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Check Date
                </label>
                <input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Issuing Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wells Fargo"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Notes for AR / Driver Name
              </label>
              <input
                type="text"
                placeholder="e.g. Handed to route driver Joe on 10/06"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-sm shadow-md touch-press transition"
            >
              {isSubmitting ? 'Logging Check...' : 'Log Check for Clearance'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


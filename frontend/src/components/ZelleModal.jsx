import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { api } from '../services/api';

export default function ZelleModal({ customer, invoice, onClose, onSuccess }) {
  const [copiedField, setCopiedField] = useState('');
  const [zelleConfirmation, setZelleConfirmation] = useState('');
  const [amount, setAmount] = useState(invoice?.balanceDue || '');
  const [senderName, setSenderName] = useState(customer?.contactName || '');
  const [memo, setMemo] = useState(invoice ? `${customer?.accountNumber} / ${invoice.invoiceNumber}` : customer?.accountNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const zelleEmail = 'ar@twwdistribution.com';
  const zellePhone = '(800) 555-8473';
  const zelleLegalName = 'TWW Distribution LLC';

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!zelleConfirmation.trim()) {
      setErrorMsg('Please enter your Zelle confirmation or reference code.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitZellePayment({
        invoiceId: invoice?.id || null,
        amount: numAmount,
        zelleConfirmation: zelleConfirmation.trim(),
        senderName: senderName.trim(),
        memo: memo.trim(),
      });

      setSuccessMsg(res.message || 'Zelle submission recorded successfully.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit Zelle confirmation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 bg-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/30 text-purple-200 flex items-center justify-center font-bold text-sm">
              Z
            </div>
            <div>
              <h3 className="font-bold text-sm">Pay via Zelle Direct</h3>
              <p className="text-[11px] text-purple-200">Zero transaction fees &bull; Instant AR Clearing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {successMsg ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Zelle Confirmation Logged!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                {successMsg}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-mono-code">
              Reference: {zelleConfirmation} &bull; ${parseFloat(amount).toFixed(2)}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Recipient Details Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Step 1: Send via your Bank App to Verified Recipient
              </span>

              {/* Payee Name */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Legal Recipient:</span>
                <span className="font-bold text-slate-800">{zelleLegalName}</span>
              </div>

              {/* Payee Email */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Zelle Email:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(zelleEmail, 'email')}
                  className="font-mono-code font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                >
                  <span>{zelleEmail}</span>
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Payee Phone */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Zelle Phone:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(zellePhone, 'phone')}
                  className="font-mono-code font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                >
                  <span>{zellePhone}</span>
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Memo Instruction */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Required Memo:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(memo, 'memo')}
                  className="font-mono-code font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300 flex items-center space-x-1"
                >
                  <span>{memo}</span>
                  {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Step 2 Form: Submit Confirmation */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Step 2: Log your Confirmation for AR Clearing
              </span>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Zelle Reference / Confirmation # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZEL-8849201 or 12-character code"
                  value={zelleConfirmation}
                  onChange={(e) => setZelleConfirmation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-code focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Amount Sent ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Sender Bank Name / Rep
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Chase / Dave"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-purple-900 hover:bg-purple-800 text-white font-extrabold rounded-xl text-sm shadow-md touch-press transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Recording Confirmation...</span>
                ) : (
                  <>
                    <span>Submit Zelle Confirmation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


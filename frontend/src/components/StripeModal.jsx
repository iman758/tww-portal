import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, CreditCard, Zap, Shield, ArrowRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../services/api';

let stripePromise = null;
const getStripe = async () => {
  if (!stripePromise) {
    try {
      const config = await api.getStripeConfig();
      const key = config.publishableKey.includes('Mock') ? 'pk_test_TYooMQauvdEDq54NiTphI7jx' : config.publishableKey;
      stripePromise = loadStripe(key);
    } catch (e) {
      console.warn('Failed to load Stripe config:', e);
      stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
    }
  }
  return stripePromise;
};

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#334155',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#e11d48',
    },
  },
};

function CheckoutForm({ invoice, onClose, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [payAmount, setPayAmount] = useState(invoice?.balanceDue || 0);
  const [payType, setPayType] = useState('full');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE_CARD');
  const [zelleReferenceId, setZelleReferenceId] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (invoice) {
      setPayAmount(invoice.balanceDue);
    }
  }, [invoice]);

  const handlePayTypeChange = (type) => {
    setPayType(type);
    if (type === 'full') {
      setPayAmount(invoice.balanceDue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = parseFloat(payAmount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    if (numericAmount > invoice.balanceDue + 0.01) {
      setErrorMsg(`Amount cannot exceed the current balance due ($${invoice.balanceDue.toFixed(2)}).`);
      return;
    }

    if (paymentMethod === 'ZELLE') {
      if (!zelleReferenceId.trim()) {
        setErrorMsg('Please enter your Zelle Reference / Confirmation ID.');
        return;
      }
      setIsProcessing(true);
      try {
        const confirmRes = await api.submitZellePayment({
          customerAccountNumber: invoice.customer?.accountNumber || '',
          invoiceNumber: invoice.invoiceNumber,
          amount: numericAmount,
          zelleReferenceId: zelleReferenceId.trim(),
        });
        setSuccessResult(confirmRes);
        if (onSuccess) onSuccess();
      } catch (err) {
        setErrorMsg(err.message || 'Zelle submission failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // --- Stripe Processing ---
    if (!stripe || !elements) {
      setErrorMsg('Stripe has not loaded correctly. Please check your network connection.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Get client secret from backend
      const intentRes = await api.createStripeIntent(invoice.id, numericAmount);

      let confirmError, paymentIntent;

      if (paymentMethod === 'STRIPE_CARD') {
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) throw new Error("Card element not found");

        if (intentRes.mode === 'sandbox_simulator') {
          await new Promise((r) => setTimeout(r, 1200));
          paymentIntent = { id: intentRes.paymentIntentId, status: 'succeeded' };
        } else {
          const result = await stripe.confirmCardPayment(intentRes.clientSecret, {
            payment_method: {
              card: cardElement,
            },
          });
          confirmError = result.error;
          paymentIntent = result.paymentIntent;
        }
      } else {
        // STRIPE_LINK is handled mostly by PaymentElement, but since we are keeping the UI, 
        // we simulate it here just for fallback, as actual Link requires PaymentElement or linkAuthenticationElement.
        if (intentRes.mode === 'sandbox_simulator') {
          await new Promise((r) => setTimeout(r, 1200));
          paymentIntent = { id: intentRes.paymentIntentId, status: 'succeeded' };
        } else {
          throw new Error('Stripe Link requires the full Stripe PaymentElement UI. Please use Credit/Debit for now.');
        }
      }

      if (confirmError) {
        setErrorMsg(confirmError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
        const confirmRes = await api.confirmStripePayment(
          invoice.id,
          numericAmount,
          paymentIntent.id,
          paymentMethod
        );
        setSuccessResult(confirmRes);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg('Payment could not be completed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (successResult) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-xl font-extrabold text-slate-900">
            {paymentMethod === 'ZELLE' ? 'Payment Pending Verification' : 'Payment Successful!'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {paymentMethod === 'ZELLE'
              ? 'Your transaction has been sent to our finance team for review. Your invoice will be updated to PAID once verified.'
              : 'Transaction settled securely via Stripe & MaddenCo ERP ledger.'}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="font-bold text-slate-900">${parseFloat(payAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method:</span>
            <span className="font-semibold text-slate-800">
              {paymentMethod === 'STRIPE_LINK' ? 'Stripe Link (1-Click)' : paymentMethod === 'ZELLE' ? 'Zelle' : 'US Credit/Debit Card'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Receipt / Transaction:</span>
            <span className="font-mono-code text-[11px] text-slate-700">
              {successResult.payment?.paymentNumber || 'PAY-CONFIRMED'}
            </span>
          </div>
          {paymentMethod !== 'ZELLE' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Balance:</span>
              <span className="font-bold text-emerald-600">
                ${successResult.updatedInvoice?.balanceDue?.toFixed(2) || '0.00'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
        >
          Done & Return to Portal
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Payment Amount Choice */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
          Payment Amount
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            type="button"
            onClick={() => handlePayTypeChange('full')}
            className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
              payType === 'full'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Full Balance (${invoice.balanceDue.toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => handlePayTypeChange('partial')}
            className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
              payType === 'partial'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Pay Partial Amount
          </button>
        </div>

        {payType === 'partial' && (
          <div className="relative mt-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              min="1"
              max={invoice.balanceDue}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Payment Method Switcher */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
          Payment Method (US Market)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('STRIPE_CARD')}
            className={`py-2.5 px-2 text-[10px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
              paymentMethod === 'STRIPE_CARD'
                ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-500'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Credit/Debit</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('STRIPE_LINK')}
            className={`py-2.5 px-2 text-[10px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
              paymentMethod === 'STRIPE_LINK'
                ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 ring-1 ring-indigo-600'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>Stripe Link</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('ZELLE')}
            className={`py-2.5 px-2 text-[10px] font-bold rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
              paymentMethod === 'ZELLE'
                ? 'border-purple-600 bg-purple-50/60 text-purple-950 ring-1 ring-purple-600'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="w-4 h-4 bg-purple-600 text-white rounded font-bold flex items-center justify-center text-[10px]">Z</div>
            <span>Zelle</span>
          </button>
        </div>
      </div>

      {/* Method Details */}
      {paymentMethod === 'STRIPE_LINK' ? (
        <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold">
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>Pay with Stripe Link</span>
          </div>
          <p className="text-[11px] text-indigo-800">
            Instant 1-click checkout using your saved US bank account or debit card.
          </p>
          <div>
            <label className="text-[10px] uppercase font-bold text-indigo-900 block mb-1">
              Your Email or Mobile
            </label>
            <input
              type="text"
              defaultValue="dealer-ap@apextireauto.com"
              className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      ) : paymentMethod === 'ZELLE' ? (
        <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3 text-xs">
          <div className="flex flex-col items-center space-y-2 text-center">
            <img src="/zelle-qr.jpg" alt="Zelle QR Code" className="w-32 h-32 object-contain rounded-lg border border-purple-200 shadow-sm" />
            <div className="text-[11px]">
              <p className="font-bold text-purple-900 uppercase">TWW DISTRIBUTION, INCORPORATED</p>
              <p className="text-purple-800 font-mono-code font-bold mt-1">irshadpk332@yahoo.com</p>
              <p className="text-purple-700 mt-1">Deposit to Checking ...5086</p>
            </div>
          </div>
          <div className="pt-2 border-t border-purple-200/50">
            <label className="text-[10px] uppercase font-bold text-purple-900 block mb-1">
              Zelle Reference / Confirmation ID *
            </label>
            <input
              type="text"
              value={zelleReferenceId}
              onChange={(e) => setZelleReferenceId(e.target.value)}
              placeholder="e.g. ZEL-12345678"
              className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-mono-code focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Card Number</label>
            <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <CardNumberElement options={ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Expiration Date</label>
              <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <CardExpiryElement options={ELEMENT_OPTIONS} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">CVC</label>
              <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <CardCvcElement options={ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security note */}
      {paymentMethod !== 'ZELLE' && (
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>256-bit encrypted via official Stripe payments infrastructure</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || (paymentMethod === 'STRIPE_CARD' && !stripe)}
        className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg touch-press transition ${
          paymentMethod === 'STRIPE_LINK'
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            : paymentMethod === 'ZELLE'
            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
        } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>
              {paymentMethod === 'ZELLE' ? `Submit Zelle Payment for $${parseFloat(payAmount || 0).toFixed(2)}` : `Pay $${parseFloat(payAmount || 0).toFixed(2)} Now`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function StripeModal({ invoice, onClose, onSuccess }) {
  const [stripePromiseState, setStripePromiseState] = useState(null);

  useEffect(() => {
    getStripe().then(setStripePromiseState);
  }, []);

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Secure Payment Checkout</h3>
              <p className="text-[11px] text-slate-400 font-mono-code">Invoice {invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body wrapped in Elements if Stripe is ready */}
        {stripePromiseState ? (
          <Elements stripe={stripePromiseState}>
            <CheckoutForm invoice={invoice} onClose={onClose} onSuccess={onSuccess} />
          </Elements>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-bold">Initializing Secure Checkout...</p>
          </div>
        )}
      </div>
    </div>
  );
}

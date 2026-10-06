import React, { useState } from 'react';
import { Disc3, Building2, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function LoginView({ onLoginSuccess }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.login(accountNumber, pin);
      localStorage.setItem('tww_token', res.token);
      localStorage.setItem('tww_customer', JSON.stringify(res.customer));
      onLoginSuccess(res.customer);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your account number and PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 text-white">
      {/* Top Brand Bar */}
      <div className="max-w-md w-full mx-auto pt-6 sm:pt-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Disc3 className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">TWW</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                Distribution
              </span>
            </div>
            <p className="text-xs text-slate-400">Wholesale Tire Customer Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dealer Account Sign In
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with your MaddenCo wholesale account number to pay invoices and submit warranty returns.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                MaddenCo Account #
              </label>

              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CUST-10001"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-mono-code text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Dealer PIN / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-mono-code text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-2xl text-sm shadow-lg shadow-amber-500/20 touch-press transition flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Access Dealer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center py-4 text-xs text-slate-500">
        <p>&copy; 2026 TWW Distribution LLC &bull; MaddenCo ERP Integrated</p>
      </div>
    </div>
  );
}


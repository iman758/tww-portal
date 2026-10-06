import React from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck, LogOut, FileText, Truck, CreditCard, ChevronRight } from 'lucide-react';

export default function AccountProfileTab({ customer, onLogout, onOpenDemoSwitcher }) {
  if (!customer) return null;

  return (
    <div className="space-y-4">
      {/* Dealer Identity Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">{customer.businessName}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono-code text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {customer.accountNumber}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{customer.terms || 'Net 30'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDemoSwitcher}
            className="self-start sm:self-auto text-xs font-bold text-tww-700 hover:text-tww-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
          >
            Switch Account
          </button>
        </div>

        {/* Contact Info Table */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{customer.address}, {customer.city}, {customer.state} {customer.zip}</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{customer.phone}</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Credit Line: <strong>${(customer.creditLimit || 50000).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* MaddenCo ERP Connection Status */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>MaddenCo Tire Dealer ERP &bull; Real-Time Connected</span>
        </div>
        <p className="text-xs text-slate-300">
          Your customer account balance, aging buckets, and tire deliveries synchronize continuously with TWW Distribution’s central warehouse inventory.
        </p>
      </div>

      {/* TWW Distributor Contacts */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          TWW Distribution Support
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2.5 bg-slate-50 rounded-xl gap-2">
            <div>
              <p className="font-bold text-slate-800">Accounts Receivable (Billing)</p>
              <p className="text-slate-500 text-[11px]">ar@twwdistribution.com</p>
            </div>
            <a href="tel:8005558473" className="self-start sm:self-auto font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              (800) 555-8473
            </a>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2.5 bg-slate-50 rounded-xl gap-2">
            <div>
              <p className="font-bold text-slate-800">Warehouse Route Dispatch</p>
              <p className="text-slate-500 text-[11px]">Next-day wholesale truck delivery</p>
            </div>
            <span className="self-start sm:self-auto font-mono-code font-bold text-slate-700">
              Route #42 Denver Metro
            </span>
          </div>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 font-bold rounded-2xl text-xs transition flex items-center justify-center space-x-2 shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Dealer Portal</span>
        </button>
      </div>
    </div>
  );
}


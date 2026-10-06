import React, { useState, useEffect } from 'react';
import { X, Search, Building2, Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function DemoSwitcherModal({ currentAccountNumber, onClose, onSelectCustomer }) {
  const [search, setSearch] = useState('');
  const [dealers, setDealers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDealers = async (q = '') => {
    setIsLoading(true);
    try {
      const data = await api.getDemoCustomers(q);
      setDealers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers('');
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchDealers(val);
  };

  const handleSwitch = async (dealer) => {
    try {
      const res = await api.login(dealer.accountNumber, '1234');
      localStorage.setItem('tww_token', res.token);
      localStorage.setItem('tww_customer', JSON.stringify(res.customer));
      onSelectCustomer(res.customer);
      onClose();
    } catch (err) {
      alert('Failed to switch dealer: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Switch Wholesale Dealer Account</h3>
              <p className="text-[11px] text-slate-400">1,000+ MaddenCo Accounts in Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dealer by name, city, or CUST-ID..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-slate-400">Searching dealers...</div>
          ) : dealers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No matching dealer accounts found.</div>
          ) : (
            dealers.map((d) => {
              const isCurrent = d.accountNumber === currentAccountNumber;
              return (
                <button
                  key={d.id}
                  onClick={() => handleSwitch(d)}
                  className={`w-full p-3 text-left rounded-2xl border transition flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate mr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900 truncate">{d.businessName}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {d.city}, {d.state} &bull; Credit Line: ${(d.creditLimit || 50000).toLocaleString()} &bull; {d.terms}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono-code font-bold text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      {d.accountNumber}
                    </span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


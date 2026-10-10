import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, LogOut, FileText, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel({ onLogout }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    fetchZellePayments();
  }, []);

  const fetchZellePayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await api.getZellePayments();
      setPayments(res);
    } catch (err) {
      console.error('Failed to fetch Zelle payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('report', file);

    try {
      // Direct fetch for multipart upload since api.js might not support it natively yet
      const token = localStorage.getItem('tww_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);
      setFile(null);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      await api.approveZellePayment(paymentId);
      // Refresh the list after approval
      fetchZellePayments();
    } catch (err) {
      alert('Failed to approve payment: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TWW Admin Portal</h1>
            <p className="text-sm text-slate-500">Manage daily syncs and verify payments.</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Daily Aging Report Upload</h2>
            </div>
            
            <p className="text-sm text-slate-600">
              Upload the daily MaddenCo ERP aging report PDF to sync customer balances and invoices.
            </p>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {uploadResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Sync Complete</span>
                </div>
                <p>Updated {uploadResult.customersUpserted} customers and {uploadResult.invoicesUpserted} invoices.</p>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">Click to select PDF</span> or drag and drop
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              
              {file && (
                <div className="text-sm font-medium text-slate-700 bg-slate-100 p-3 rounded-lg border border-slate-200">
                  Selected: {file.name}
                </div>
              )}

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-sm"
              >
                {uploading ? 'Processing & Syncing...' : 'Upload & Sync Data'}
              </button>
            </form>
          </div>

          {/* Verification Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Zelle Verification</h2>
              </div>
              <button 
                onClick={fetchZellePayments}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {loadingPayments ? (
                <div className="text-center py-8 text-slate-500 text-sm">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                  No pending Zelle payments.
                </div>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Ref: {p.zelleReferenceId}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Inv: {p.invoice.invoiceNumber}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Cust: {p.customer.accountNumber} ({p.customer.businessName})</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600 text-sm">${p.amount.toFixed(2)}</div>
                        <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold mt-1 uppercase">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow-sm"
                    >
                      Verify & Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}


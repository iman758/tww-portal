import React, { useState, useEffect } from 'react';
import { ShieldAlert, Camera, Upload, CheckCircle2, Clock, FileText, AlertTriangle, ArrowRight, X, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

const RMA_REASONS = [
  'Out-of-round / Ride vibration',
  'Sidewall blister',
  'Bead defect',
  'Casing fault',
  'Shipping error',
];

const TREAD_DEPTHS = [
  'New (0 miles / Unmounted)',
  '11/32"',
  '10/32"',
  '9/32"',
  '8/32"',
  '7/32"',
  '6/32"',
  '5/32"',
  '4/32"',
  '3/32" or less',
];

export default function RmaTab({ initialInvoice, onClearInitialInvoice }) {
  const [activeSubTab, setActiveSubTab] = useState('tracker'); // 'tracker' or 'new'
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoice?.invoiceNumber || '');
  const [tireBrand, setTireBrand] = useState(initialInvoice?.items?.[0]?.tireBrand || '');
  const [tireSize, setTireSize] = useState(initialInvoice?.items?.[0]?.size || '');
  const [dotSerial, setDotSerial] = useState('');
  const [treadDepth, setTreadDepth] = useState('10/32"');
  const [reason, setReason] = useState(RMA_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialInvoice) {
      setActiveSubTab('new');
      setInvoiceNumber(initialInvoice.invoiceNumber);
      if (initialInvoice.items && initialInvoice.items[0]) {
        setTireBrand(initialInvoice.items[0].tireBrand);
        setTireSize(initialInvoice.items[0].size);
      }
    }
  }, [initialInvoice]);

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRmaClaims();
      setClaims(data || []);
    } catch (err) {
      console.error('Failed to load RMA claims:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tireBrand.trim()) {
      setErrorMsg('Tire Brand is required.');
      return;
    }

    if (!tireSize.trim()) {
      setErrorMsg('Tire Size is required.');
      return;
    }

    if (!dotSerial.trim()) {
      setErrorMsg('DOT Serial Code is required (e.g. DOT 6G9L 3J8R 1424).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitRmaClaim({
        invoiceId: initialInvoice?.id || null,
        tireBrand: tireBrand.trim(),
        tireSize: tireSize.trim(),
        dotSerial: dotSerial.trim(),
        treadDepth,
        reason,
        notes,
        photoUrl: photoPreview,
      });

      setSubmitSuccess(res.claim);
      loadClaims();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit RMA claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(null);
    setTireBrand('');
    setTireSize('');
    setDotSerial('');
    setTreadDepth('10/32"');
    setReason(RMA_REASONS[0]);
    setNotes('');
    setPhotoPreview(null);
    if (onClearInitialInvoice) onClearInitialInvoice();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREDIT_MEMO_ISSUED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Credit Memo Issued</span>
          </span>
        );
      case 'UNDER_INSPECTION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Inspection</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Claim Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Submitted</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs: Tracker vs New Claim */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex space-x-1.5">
        <button
          onClick={() => {
            setActiveSubTab('tracker');
            resetForm();
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'tracker'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Claim Tracker</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono-code">
            {claims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('new')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'new'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Submit Warranty / Return</span>
        </button>
      </div>

      {/* VIEW 1: CLAIMS TRACKER */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse h-28" />
              ))}
            </div>
          ) : claims.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No RMA Claims Filed</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Need to submit a warranty adjustment or defective tire return?
              </p>
              <button
                onClick={() => setActiveSubTab('new')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                <span>Submit New RMA Claim</span>
              </button>
            </div>
          ) : (
            claims.map((c) => {
              const claimDate = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClaim(c)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-0 sm:space-x-2">
                        <span className="font-mono-code font-bold text-sm text-slate-900">
                          {c.claimNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Filed {claimDate}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {c.tireBrand} &bull; {c.tireSize}
                      </h4>
                    </div>
                    <div className="self-start sm:self-auto">
                      {getStatusBadge(c.status)}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">DOT Serial</span>
                      <span className="font-mono-code font-semibold text-slate-800">{c.dotSerial}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Tread Depth</span>
                      <span className="font-semibold text-slate-800">{c.treadDepth}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-600 font-medium truncate max-w-[240px]">
                      Reason: <strong className="text-slate-800">{c.reason}</strong>
                    </span>

                    {c.creditAmount ? (
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +${c.creditAmount.toFixed(2)} Credit
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center space-x-1">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: SUBMIT NEW CLAIM FORM */}
      {activeSubTab === 'new' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          {submitSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">RMA Claim Submitted!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your claim has been assigned tracking number:
                </p>
                <p className="font-mono-code font-bold text-base text-tww-800 mt-1">
                  {submitSuccess.claimNumber}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                <p className="text-slate-600">
                  <strong>Tire:</strong> {submitSuccess.tireBrand} ({submitSuccess.tireSize})
                </p>
                <p className="text-slate-600">
                  <strong>DOT:</strong> {submitSuccess.dotSerial}
                </p>
                <p className="text-slate-600">
                  <strong>Status:</strong> Under Review by TWW Technical Inspection
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    resetForm();
                    setActiveSubTab('tracker');
                  }}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  View in Tracker
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Wholesale Tire Return / Warranty (RMA)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fast 60-second claim submission for manufacturer defects or road force vibration.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Associated Invoice # (Optional/Auto-populated) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Associated Invoice # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-849201"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-code focus:bg-white focus:outline-none focus:ring-2 focus:ring-tww-600"
                />
              </div>

              {/* Tire Brand & Size */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Tire Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Michelin / Goodyear"
                    value={tireBrand}
                    onChange={(e) => setTireBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-tww-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Tire Size *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 265/70R17"
                    value={tireSize}
                    onChange={(e) => setTireSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-tww-600"
                  />
                </div>
              </div>

              {/* DOT Serial Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    DOT Serial Code (10-12 Chars) *
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. DOT 6G9L 3J8R 1424</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="DOT XXXX XXXX WWYY"
                  value={dotSerial}
                  onChange={(e) => setDotSerial(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-code tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-tww-600 uppercase"
                />
              </div>

              {/* Remaining Tread Depth (in 32nds) */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Remaining Tread Depth (32nds of an inch) *
                </label>
                <select
                  value={treadDepth}
                  onChange={(e) => setTreadDepth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-tww-600"
                >
                  {TREAD_DEPTHS.map((td) => (
                    <option key={td} value={td}>{td}</option>
                  ))}
                </select>
              </div>

              {/* Reason for Claim */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Reason for Claim *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RMA_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`p-2.5 text-xs text-left rounded-xl border font-medium transition ${
                        reason === r
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Photo Upload */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Defect / DOT Photo (Optional)
                </label>
                {photoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Tire defect preview"
                      className="w-32 h-32 object-cover rounded-xl border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-slate-400 bg-slate-50 cursor-pointer transition">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Camera className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-semibold">Take Photo or Upload Tire Image</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">JPEG, PNG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Dealer Notes / Ride Vibration Symptoms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Hunter Road Force balance measured 44 lbs. Failed runout spec."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-tww-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-sm shadow-md touch-press transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Submitting Warranty Claim...</span>
                ) : (
                  <>
                    <span>Submit Tire Warranty Claim</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Detail Modal for Selected Claim */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono-code font-bold text-base text-slate-900">
                  {selectedClaim.claimNumber}
                </span>
                <p className="text-xs text-slate-500">MaddenCo Warranty File</p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tire:</span>
                <span className="font-bold text-slate-900">{selectedClaim.tireBrand} {selectedClaim.tireSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DOT Code:</span>
                <span className="font-mono-code font-bold text-slate-900">{selectedClaim.dotSerial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tread Depth:</span>
                <span className="font-semibold text-slate-800">{selectedClaim.treadDepth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="font-semibold text-slate-800">{selectedClaim.reason}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                <span className="text-slate-500">Current Status:</span>
                <div>{getStatusBadge(selectedClaim.status)}</div>
              </div>
              {selectedClaim.creditMemoNumber && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold flex justify-between">
                  <span>Credit Memo #{selectedClaim.creditMemoNumber}:</span>
                  <span>+${selectedClaim.creditAmount?.toFixed(2)}</span>
                </div>
              )}
            </div>

            {selectedClaim.photoUrl && (
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Attached Photo</span>
                <img
                  src={selectedClaim.photoUrl}
                  alt="Defect"
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            <button
              onClick={() => setSelectedClaim(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


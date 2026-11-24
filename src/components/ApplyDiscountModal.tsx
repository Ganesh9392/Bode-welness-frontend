import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit, DiscountType, VisitServiceEntry } from '../types';
import { X, Tag, Percent, IndianRupee, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

interface ApplyDiscountModalProps {
  visit: CustomerVisit;
  serviceEntry: VisitServiceEntry;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyDiscountModal: React.FC<ApplyDiscountModalProps> = ({
  visit,
  serviceEntry,
  onClose,
  onSuccess,
}) => {
  const { applyServiceDiscount, removeServiceDiscount, currentManager } = useApp();

  const [discountType, setDiscountType] = useState<DiscountType>(serviceEntry.discount?.type || 'FIXED');
  const [value, setValue] = useState<number>(serviceEntry.discount?.value || (serviceEntry.discount?.type === 'PERCENTAGE' ? 10 : 200));
  const [reason, setReason] = useState<string>(serviceEntry.discount?.reason || 'Returning customer privilege');
  const [error, setError] = useState<string | null>(null);

  // Live calculations
  let calculatedDiscount = 0;
  if (discountType === 'FIXED') {
    calculatedDiscount = Math.min(serviceEntry.originalPrice, Math.max(0, Number(value) || 0));
  } else {
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    calculatedDiscount = Math.round((serviceEntry.originalPrice * pct) / 100);
  }
  const calculatedFinalPrice = Math.max(0, serviceEntry.originalPrice - calculatedDiscount);

  const handleSave = () => {
    setError(null);
    if (value <= 0) {
      setError('Discount value must be greater than zero.');
      return;
    }
    if (discountType === 'PERCENTAGE' && value > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }
    if (discountType === 'FIXED' && value > serviceEntry.originalPrice) {
      setError(`Fixed discount cannot exceed the original service price (₹${serviceEntry.originalPrice}).`);
      return;
    }

    applyServiceDiscount(visit.id, serviceEntry.id, {
      type: discountType,
      value: Number(value),
      reason: reason.trim() || 'Manager Courtesy',
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  const handleRemove = () => {
    removeServiceDiscount(visit.id, serviceEntry.id);
    if (onSuccess) onSuccess();
    onClose();
  };

  const reasonPresets = [
    'Returning customer privilege',
    'Add-on service promo',
    'Customer loyalty reward',
    'Manager courtesy concession',
    'Festival seasonal offer',
    'Service recovery / Delay apology',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[94vh] flex flex-col overflow-hidden border border-bode-border">
        {/* Header */}
        <div className="bg-bode-forest px-4 py-3.5 sm:px-6 sm:py-4 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bode-gold text-bode-forest flex items-center justify-center font-bold shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-base truncate">Service Discount</h3>
              <p className="text-xs text-bode-gold truncate">{serviceEntry.serviceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Service Card */}
          <div className="p-3.5 bg-bode-ivory rounded-xl border border-bode-border/70">
            <div className="flex justify-between items-center text-xs">
              <span className="text-bode-muted uppercase tracking-wider font-semibold">Service Details</span>
              <span className="text-bode-forest font-semibold">{serviceEntry.durationMinutes} min session</span>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="font-serif text-base font-bold text-bode-forest">{serviceEntry.serviceName}</span>
              <span className="text-base font-bold text-bode-charcoal">
                ₹{serviceEntry.originalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-bode-muted mt-1">
              Guest: <strong>{visit.customerName}</strong> ({visit.visitReference})
            </p>
          </div>

          {/* Discount Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              Discount Calculation Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('FIXED')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  discountType === 'FIXED'
                    ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                    : 'bg-white border-bode-border text-bode-charcoal hover:bg-bode-ivory/50'
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Fixed Amount (₹ Off)</span>
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('PERCENTAGE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  discountType === 'PERCENTAGE'
                    ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                    : 'bg-white border-bode-border text-bode-charcoal hover:bg-bode-ivory/50'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Percentage (% Off)</span>
              </button>
            </div>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              {discountType === 'FIXED' ? 'Discount Amount in Rupees (₹)' : 'Discount Percentage (%)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bode-muted">
                {discountType === 'FIXED' ? <IndianRupee className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
              </div>
              <input
                type="number"
                min="0"
                max={discountType === 'PERCENTAGE' ? 100 : serviceEntry.originalPrice}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-bode-border rounded-lg text-sm text-bode-charcoal font-semibold focus:ring-2 focus:ring-bode-forest focus:outline-none"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {discountType === 'FIXED'
                ? [100, 200, 300, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setValue(amt)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-bode-ivory/70 hover:bg-bode-ivory border border-bode-border rounded text-bode-charcoal shrink-0"
                    >
                      ₹{amt}
                    </button>
                  ))
                : [5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setValue(pct)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-bode-ivory/70 hover:bg-bode-ivory border border-bode-border rounded text-bode-charcoal shrink-0"
                    >
                      {pct}%
                    </button>
                  ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              Authorization Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. VIP guest privilege"
              className="w-full px-3.5 py-2 bg-white border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none mb-1.5"
            />
            <div className="flex flex-wrap gap-1">
              {reasonPresets.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(r)}
                  className="text-[10px] px-2 py-0.5 rounded bg-bode-ivory/50 border border-bode-border text-bode-charcoal hover:bg-bode-ivory"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live Result Calculation Preview (Section 11 Requirement) */}
          <div className="p-4 rounded-xl bg-bode-forest/5 border border-bode-forest/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-bode-muted">Original Tariff:</span>
              <span className="font-semibold text-bode-charcoal">₹{serviceEntry.originalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-700 font-medium">Applied Concession:</span>
              <span className="font-bold text-red-700">-₹{calculatedDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-bode-border pt-1.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-bode-forest">
                Net Service Price:
              </span>
              <span className="font-serif text-lg font-bold text-bode-forest">
                ₹{calculatedFinalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-bode-muted italic pt-1">
              Logged by: <strong>{currentManager?.name}</strong> • Only affects <strong>{serviceEntry.serviceName}</strong>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-bode-ivory/50 px-6 py-4 border-t border-bode-border flex items-center justify-between">
          <div>
            {serviceEntry.discount && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Discount</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-bode-charcoal hover:bg-bode-border/50 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-bode-forest hover:bg-bode-forestLight rounded-lg shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

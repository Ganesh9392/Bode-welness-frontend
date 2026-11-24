import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit } from '../types';
import { X, Plus, Sparkles, Clock, Check, AlertCircle, ShieldCheck } from 'lucide-react';

interface AddServiceModalProps {
  visit: CustomerVisit;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({ visit, onClose, onSuccess }) => {
  const { branchServices, branchStaff, addAdditionalService } = useApp();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(branchServices[0]?.id || '');
  const [selectedDurationIndex, setSelectedDurationIndex] = useState<number>(0);
  const [assignedStaffId, setAssignedStaffId] = useState<string>('');
  const [startImmediately, setStartImmediately] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Requested as mid-session add-on by guest');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const selectedService = branchServices.find((s) => s.id === selectedServiceId);
  const selectedDurationOption = selectedService?.durations[selectedDurationIndex] || selectedService?.durations[0];

  const handleServiceChange = (id: string) => {
    setSelectedServiceId(id);
    setSelectedDurationIndex(0);
  };

  const handleAdd = () => {
    if (!selectedService || !selectedDurationOption) return;

    addAdditionalService(visit.id, {
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      category: selectedService.category,
      durationMinutes: selectedDurationOption.durationMinutes,
      price: selectedDurationOption.price,
      staffId: assignedStaffId || undefined,
      notes: notes.trim() || undefined,
      startImmediately,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[94vh] flex flex-col overflow-hidden border border-bode-border">
        {/* Header */}
        <div className="bg-bode-forest px-4 py-3.5 sm:px-6 sm:py-4 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-bode-gold shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-base truncate">Add Service</h3>
              <p className="text-xs text-bode-gold truncate">
                {visit.visitReference} • {visit.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Important Rule Notice */}
          <div className="p-3 bg-bode-ivory rounded-xl border border-bode-border/70 flex items-center gap-2 text-xs text-bode-charcoal">
            <Sparkles className="w-4 h-4 text-bode-gold shrink-0" />
            <p>
              Added to <strong>{visit.customerName}'s</strong> current session &amp; final bill.
            </p>
          </div>

          {/* Current services already attached */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-bode-muted mb-1.5">
              Current Visit Treatments ({visit.services.length})
            </label>
            <div className="space-y-1.5">
              {visit.services.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-lg bg-bode-ivory/50 border border-bode-border/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-bode-forest text-white text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-medium text-bode-forest">{s.serviceName}</span>
                      <span className="text-bode-muted ml-1.5">({s.durationMinutes} min)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-bode-border font-medium">
                      {s.status}
                    </span>
                    <span className="font-semibold text-bode-charcoal">₹{s.finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              Select Additional Service
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-bode-border rounded-lg text-sm text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
            >
              {branchServices.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} — {srv.category}
                </option>
              ))}
            </select>
            {selectedService?.description && (
              <p className="text-[11px] text-bode-muted mt-1.5 leading-snug">
                {selectedService.description}
              </p>
            )}
          </div>

          {/* Duration & Price Tier */}
          {selectedService && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                Duration & Tariff
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {selectedService.durations.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDurationIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      selectedDurationIndex === idx
                        ? 'border-bode-forest bg-bode-forest/5 text-bode-forest ring-1 ring-bode-forest'
                        : 'border-bode-border hover:bg-bode-ivory/50 text-bode-charcoal'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <Clock className="w-3.5 h-3.5 text-bode-emerald" />
                        <span>{d.durationMinutes} Minutes</span>
                      </div>
                      <p className="text-sm font-bold text-bode-forest mt-0.5">
                        ₹{d.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {selectedDurationIndex === idx && (
                      <Check className="w-4 h-4 text-bode-emerald shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Staff Therapist Assignment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              Assign Therapist (Optional)
            </label>
            <select
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-bode-border rounded-lg text-sm text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
            >
              <option value="">-- Auto-assign or assign later --</option>
              {branchStaff.map((stf) => (
                <option key={stf.id} value={stf.id}>
                  {stf.name} ({stf.role}) — {stf.availability === 'AVAILABLE' ? 'Available Now' : stf.availability}
                </option>
              ))}
            </select>
          </div>

          {/* Start Immediately Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-bode-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={startImmediately}
                onChange={(e) => setStartImmediately(e.target.checked)}
                className="w-4 h-4 rounded border-bode-border text-bode-forest focus:ring-bode-forest"
              />
              <span className="font-medium">Start treatment immediately (mark as In Progress)</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              Treatment Notes / Guest Requests
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on neck knots, extra moisturizing serum"
              className="w-full px-3.5 py-2 bg-bode-ivory/30 border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
            />
          </div>

          {/* Confirmation Box (Section 9 Requirement) */}
          {selectedService && selectedDurationOption && (
            <div className="p-3.5 rounded-xl bg-bode-gold/10 border border-bode-gold/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-bode-forest mb-1">
                <ShieldCheck className="w-4 h-4 text-bode-gold" />
                <span>Confirmation Summary</span>
              </div>
              <div className="text-xs text-bode-charcoal/90 space-y-0.5">
                <p><strong>Treatment:</strong> {selectedService.name} ({selectedDurationOption.durationMinutes} min)</p>
                <p><strong>Tariff:</strong> ₹{selectedDurationOption.price.toLocaleString('en-IN')}</p>
                <p><strong>Customer Approval:</strong> Confirmed by manager prior to procedure</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-bode-ivory/50 px-6 py-4 border-t border-bode-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-bode-charcoal hover:bg-bode-border/50 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-bode-forest hover:bg-bode-forestLight rounded-lg shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Confirm & Add Treatment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

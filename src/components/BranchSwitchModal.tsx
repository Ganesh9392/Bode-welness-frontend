import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BranchId } from '../types';
import { Building2, CheckCircle2, MapPin, X, Loader2 } from 'lucide-react';

interface BranchSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BranchSwitchModal: React.FC<BranchSwitchModalProps> = ({ isOpen, onClose }) => {
  const { getAuthorizedBranches, currentBranch, switchBranch } = useApp();
  const [switchingTo, setSwitchingTo] = useState<BranchId | null>(null);

  if (!isOpen) return null;

  const authorizedBranches = getAuthorizedBranches();

  const handleSelectBranch = (branchId: BranchId) => {
    if (branchId === currentBranch?.id) {
      onClose();
      return;
    }
    setSwitchingTo(branchId);
    setTimeout(() => {
      switchBranch(branchId);
      setSwitchingTo(null);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-bode-border overflow-hidden">
        {/* Header */}
        <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-bode-gold" />
            <div>
              <h3 className="font-serif text-lg font-semibold leading-tight">Select Branch</h3>
              <p className="text-[11px] text-white/75">Switch active spa location</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition"
            aria-label="Close branch switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch List */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[70vh] overflow-y-auto bg-bode-ivory/40">
          {authorizedBranches.map((branch) => {
            const isSelected = branch.id === currentBranch?.id;
            const isLoading = switchingTo === branch.id;

            return (
              <button
                key={branch.id}
                type="button"
                disabled={switchingTo !== null}
                onClick={() => handleSelectBranch(branch.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-bode-gold bg-bode-gold/10 shadow-sm'
                    : 'border-bode-border bg-white hover:border-bode-emerald/60 hover:bg-bode-ivory/60'
                }`}
              >
                {branch.imageUrl ? (
                  <img
                    src={branch.imageUrl}
                    alt={branch.shortName}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-bode-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-bode-forest text-bode-gold flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif font-bold text-sm text-bode-forest truncate">
                      {branch.name}
                    </h4>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-bode-emerald animate-spin shrink-0" />
                    ) : isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bode-gold text-bode-forest shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-bode-muted flex items-start gap-1 mt-1 line-clamp-2">
                    <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-bode-emerald" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="text-[11px] text-bode-charcoal/70 mt-1">
                    {branch.phone} • GSTIN: {branch.gstin}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-bode-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-bode-border text-xs font-semibold text-bode-charcoal hover:bg-bode-ivory transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

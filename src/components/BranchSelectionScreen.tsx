import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BodeLogo } from './BodeLogo';
import { BranchId } from '../types';
import { CheckCircle2, MapPin, Leaf, ArrowRight, Phone } from 'lucide-react';

interface BranchSelectionScreenProps {
  onBranchSelected: () => void;
}

export const BranchSelectionScreen: React.FC<BranchSelectionScreenProps> = ({ onBranchSelected }) => {
  const { currentManager, getAuthorizedBranches, currentBranch, switchBranch } = useApp();
  const authorizedBranches = getAuthorizedBranches();
  const [selectedId, setSelectedId] = useState<BranchId | null>(
    currentBranch?.id || authorizedBranches[0]?.id || null
  );

  const handleContinue = () => {
    if (!selectedId) return;
    if (currentManager && selectedId !== currentManager.branchId) {
      switchBranch(selectedId);
    }
    sessionStorage.setItem('bode_branch_confirmed_v1', '1');
    onBranchSelected();
  };

  return (
    <div className="min-h-screen bg-bode-ivory flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-bode-emerald/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-bode-gold/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      <div className="w-full max-w-3xl z-10 space-y-6">
        {/* Top Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center bg-bode-forest px-5 py-3 rounded-2xl shadow-md">
            <BodeLogo variant="light" size="md" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bode-forest">
              Select Your Branch
            </h1>
            <p className="text-xs sm:text-sm text-bode-muted mt-1">
              Welcome back, <strong className="text-bode-forest">{currentManager?.name}</strong>. Choose the branch you are managing today.
            </p>
          </div>
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authorizedBranches.map((branch) => {
            const isSelected = selectedId === branch.id;

            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => setSelectedId(branch.id)}
                className={`text-left rounded-2xl border-2 overflow-hidden transition-all shadow-sm hover:shadow-md flex flex-col ${
                  isSelected
                    ? 'border-bode-gold bg-white ring-2 ring-bode-gold/30'
                    : 'border-bode-border bg-white/90 hover:border-bode-emerald/50'
                }`}
              >
                <div className="relative h-36 w-full bg-bode-forest overflow-hidden">
                  {branch.imageUrl ? (
                    <img
                      src={branch.imageUrl}
                      alt={branch.shortName}
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-bode-gold">
                      <Leaf className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bode-forest/85 via-bode-forest/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bode-gold text-bode-forest text-[11px] font-bold shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/40 text-white/90 text-[11px] font-medium backdrop-blur-sm">
                        Tap to select
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-[10px] uppercase tracking-widest text-bode-gold font-semibold">
                      {branch.tagline}
                    </p>
                    <h2 className="font-serif text-lg font-bold leading-snug">
                      {branch.shortName}
                    </h2>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-bode-forest">{branch.name}</p>
                    <p className="text-[11px] text-bode-muted flex items-start gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-bode-emerald shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-bode-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-bode-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-bode-emerald" />
                      {branch.phone}
                    </span>
                    <span>GSTIN: {branch.gstin}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue CTA */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={!selectedId}
            onClick={handleContinue}
            className="w-full sm:w-auto min-w-[280px] py-3.5 px-8 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white font-semibold text-sm tracking-wide shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>CONTINUE TO DASHBOARD</span>
            <ArrowRight className="w-4 h-4 text-bode-gold" />
          </button>
        </div>
      </div>
    </div>
  );
};

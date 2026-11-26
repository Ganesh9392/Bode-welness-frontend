import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BranchId } from '../types';
import { Building2, X } from 'lucide-react';
import { CompactBranchList } from './CompactBranchList';

interface BranchSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BranchSwitchModal: React.FC<BranchSwitchModalProps> = ({ isOpen, onClose }) => {
  const { getAuthorizedBranches, currentBranch, lastUsedBranchId, switchBranch } = useApp();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const authorizedBranches = getAuthorizedBranches();

  const handleSelectBranch = (branchId: BranchId) => {
    if (branchId !== currentBranch?.id) {
      switchBranch(branchId);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-bode-border overflow-hidden animate-slide-up sm:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-bode-forest text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Building2 className="w-4 h-4 text-bode-gold shrink-0" />
            <h3 className="font-serif text-base font-semibold leading-tight truncate">
              Select Branch
            </h3>
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

        {/* Compact Branch List */}
        <CompactBranchList
          branches={authorizedBranches}
          selectedBranchId={currentBranch?.id ?? null}
          lastUsedBranchId={lastUsedBranchId ?? currentBranch?.id ?? null}
          onSelectBranch={handleSelectBranch}
          maxListHeightClass="max-h-[65vh]"
        />
      </div>
    </div>
  );
};

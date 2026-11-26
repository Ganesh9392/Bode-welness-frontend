import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { CompactBranchList } from './CompactBranchList';
import { BranchId } from '../types';
import { LogOut, Building2, ChevronDown } from 'lucide-react';

interface BranchSelectionScreenProps {
  onBranchSelected: () => void;
}

export const BranchSelectionScreen: React.FC<BranchSelectionScreenProps> = ({ onBranchSelected }) => {
  const {
    currentManager,
    getAuthorizedBranches,
    currentBranch,
    lastUsedBranchId,
    isAuthLoading,
    switchBranch,
    logout,
  } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const authorizedBranches = getAuthorizedBranches();
  const branchCount = authorizedBranches.length;

  const managerInitials =
    currentManager?.name
      .split(' ')
      .map((n) => n[0])
      .join('') ?? '';

  const handleSelectBranch = (branchId: BranchId) => {
    switchBranch(branchId);
    onBranchSelected();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-bode-ivory flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-x-hidden">
      {/* Subtle background decorations matching login page */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-bode-emerald/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-bode-gold/8 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-bode-border/70 overflow-hidden">

          {/* Header Banner — matches LoginScreen style */}
          <div className="bg-bode-forest px-5 sm:px-8 pt-6 pb-5">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Logo variant="compact" tone="light" showSubtitle={false} />

              {/* Manager info + logout */}
              <div className="flex items-center gap-2">
                {/* Avatar */}
                {currentManager?.avatarUrl ? (
                  <img
                    src={currentManager.avatarUrl}
                    alt={currentManager.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/30 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bode-gold text-bode-forest font-bold text-xs flex items-center justify-center shrink-0 border border-white/20">
                    {managerInitials}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-bode-ivory leading-tight truncate max-w-[120px]">
                    {currentManager?.name}
                  </p>
                  <p className="text-[10px] text-bode-gold uppercase tracking-wider">
                    {currentManager?.role}
                  </p>
                </div>
                {/* Logout button */}
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="ml-1 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title row */}
            <div className="mt-5 mb-1">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                Select Branch
              </h1>
              <p className="text-xs text-bode-ivory/70 mt-1">
                Choose a branch to continue.
                {branchCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center gap-1 text-bode-gold font-medium">
                    <Building2 className="w-3 h-3" />
                    {branchCount} {branchCount === 1 ? 'branch' : 'branches'} available
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Compact Branch List */}
          <CompactBranchList
            branches={authorizedBranches}
            selectedBranchId={currentBranch?.id ?? null}
            lastUsedBranchId={lastUsedBranchId}
            isLoading={isAuthLoading}
            onSelectBranch={handleSelectBranch}
            maxListHeightClass="max-h-[55vh]"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-bode-muted">
          © {new Date().getFullYear()} BODE Wellness Spa
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-bode-charcoal border border-bode-border">
            <h3 className="font-serif text-lg font-semibold text-bode-forest mb-2">
              Sign Out?
            </h3>
            <p className="text-xs text-bode-muted mb-5 leading-relaxed">
              You'll be returned to the login page and will need to sign in again to access
              the application.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-bode-charcoal bg-bode-ivory hover:bg-bode-border rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-medium text-white bg-bode-forest hover:bg-bode-emerald rounded-lg transition"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

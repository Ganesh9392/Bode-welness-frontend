import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BodeLogo } from './BodeLogo';
import {
  Bell,
  LogOut,
  Menu,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Sales Dashboard',
  appointments: 'Appointments',
  'active-services': 'Active Services',
  'create-service': 'Create New Service',
  pos: 'Quick Sale / POS',
  customers: 'CRM & Customers',
  backoffice: 'Backoffice',
  reports: 'Reports',
  expenses: 'Expenses',
  enquiries: 'Enquiries',
  campaign: 'Campaign',
  'master-bo': 'Master Backoffice',
  invoices: 'Invoices',
  payments: 'Payments',
  staff: 'Staff Therapists',
};

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string) => void;
  currentTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onNavigate,
  currentTab = 'dashboard',
}) => {
  const {
    currentManager,
    currentBranch,
    logout,
    notifications,
    markNotificationRead,
    resetToDefaultData,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES[currentTab] ?? 'BODE Portal';

  const managerInitials = currentManager?.name
    .split(' ')
    .map((n) => n[0])
    .join('') ?? '';

  const closeAll = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-bode-forest text-white border-b border-white/10 shadow-md">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BodeLogo variant="light" size="sm" showSubtitle={true} />
        </div>

        {/* Center: Dynamic page title */}
        <div className="flex-1 text-center hidden md:block">
          <p className="text-sm font-serif font-semibold text-bode-ivory/90 tracking-wide truncate">
            {pageTitle}
          </p>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-bode-gold text-bode-forest font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAll} />
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white rounded-xl shadow-2xl border border-bode-border overflow-hidden z-50 text-bode-charcoal">
                  <div className="bg-bode-forest px-4 py-3 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-bode-gold" />
                      <span className="font-medium text-xs tracking-wider uppercase">Notifications</span>
                    </div>
                    <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full text-bode-ivory">
                      {unreadCount} unread
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-bode-border/50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-bode-muted">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkAction) {
                              onNavigate(n.linkAction);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3.5 text-xs cursor-pointer hover:bg-bode-ivory/60 transition flex items-start gap-3 ${
                            !n.read ? 'bg-bode-ivory/40 font-medium' : 'text-bode-charcoal/80'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'appointment' ? (
                              <Calendar className="w-4 h-4 text-bode-emerald" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-bode-gold" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-bode-forest font-semibold truncate">{n.title}</span>
                              <span className="text-[10px] text-bode-muted shrink-0">{n.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-bode-charcoal/80 mt-1 leading-snug">{n.message}</p>
                          </div>
                          {!n.read && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-bode-gold shrink-0 mt-0.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2.5 bg-bode-ivory/50 border-t border-bode-border text-center">
                    <button
                      onClick={() => {
                        notifications.forEach((n) => markNotificationRead(n.id));
                        setShowNotifications(false);
                      }}
                      className="text-xs text-bode-emerald hover:text-bode-forest font-medium transition"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Manager Avatar / Profile */}
          {currentManager && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition"
                aria-label="Manager profile"
              >
                {currentManager.avatarUrl ? (
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
                  <p className="text-xs font-semibold text-bode-ivory leading-tight">{currentManager.name}</p>
                  <p className="text-[10px] text-bode-gold uppercase tracking-wider">{currentManager.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/60 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={closeAll} />
                  <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-2xl border border-bode-border overflow-hidden z-50 text-bode-charcoal">
                    <div className="p-4 bg-bode-forest text-white">
                      <p className="font-serif font-semibold text-sm">{currentManager.name}</p>
                      <p className="text-xs text-bode-gold mt-0.5">{currentManager.role}</p>
                      <div className="mt-2 pt-2 border-t border-white/15 text-[11px] text-white/80 space-y-0.5">
                        <p className="truncate">{currentManager.email}</p>
                        <p className="text-bode-ivory font-medium">{currentBranch?.shortName}</p>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          resetToDefaultData();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-bode-ivory text-bode-charcoal flex items-center gap-2 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-bode-emerald" />
                        <span>Reset Demo Mock Data</span>
                      </button>
                      <div className="border-t border-bode-border/70 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-red-50 text-red-700 flex items-center gap-2 transition font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-bode-charcoal border border-bode-border">
            <h3 className="font-serif text-lg font-semibold text-bode-forest mb-2">Confirm Logout</h3>
            <p className="text-xs text-bode-muted mb-5 leading-relaxed">
              Are you sure you want to end your session for{' '}
              <strong>{currentBranch?.name}</strong>?
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
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-bode-forest hover:bg-bode-emerald rounded-lg transition"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

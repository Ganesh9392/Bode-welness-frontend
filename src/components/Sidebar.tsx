import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Activity,
  ShoppingCart,
  Users,
  Settings2,
  BarChart3,
  Receipt,
  MessageSquare,
  Megaphone,
  Database,
  X,
  LogOut,
  Building2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenBranchSwitcher: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string | null;
  badgeColor?: string;
  isPrimaryAction?: boolean;
  isComingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenBranchSwitcher,
}) => {
  const { branchVisits, currentBranch, currentManager, logout } = useApp();

  const activeServicesCount = branchVisits.filter((v) => v.visitStatus === 'IN_PROGRESS').length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = branchVisits.filter(
    (v) =>
      v.appointmentDate === todayDate &&
      (v.visitStatus === 'SCHEDULED' || v.visitStatus === 'CHECKED_IN')
  ).length;

  const sections: NavSection[] = [
    {
      title: 'Operations',
      items: [
        {
          id: 'dashboard',
          label: 'Sales Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'appointments',
          label: 'Appointments',
          icon: CalendarDays,
          badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : null,
          badgeColor: 'bg-bode-emerald text-white',
        },
        {
          id: 'active-services',
          label: 'Active Services',
          icon: Activity,
          badge: activeServicesCount > 0 ? activeServicesCount : null,
          badgeColor: 'bg-emerald-600 text-white',
        },
        {
          id: 'create-service',
          label: 'Create New Service',
          icon: PlusCircle,
          isPrimaryAction: true,
        },
        {
          id: 'pos',
          label: 'Quick Sale / POS',
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          id: 'customers',
          label: 'CRM / Customers',
          icon: Users,
        },
        {
          id: 'backoffice',
          label: 'Backoffice',
          icon: Settings2,
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: BarChart3,
        },
        {
          id: 'expenses',
          label: 'Expenses',
          icon: Receipt,
        },
        {
          id: 'enquiries',
          label: 'Enquiries',
          icon: MessageSquare,
          isComingSoon: true,
        },
        {
          id: 'campaign',
          label: 'Campaign',
          icon: Megaphone,
        },
        {
          id: 'master-bo',
          label: 'Master BO',
          icon: Database,
          isComingSoon: true,
        },
      ],
    },
  ];

  const handleNavClick = (tabId: string, isComingSoon?: boolean) => {
    if (isComingSoon) return;
    onSelectTab(tabId);
    onCloseMobile();
  };

  const managerInitials = currentManager?.name
    .split(' ')
    .map((n) => n[0])
    .join('') ?? '';

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-bode-border">
      {/* Branch Sub-Header */}
      <div className="px-4 py-3.5 border-b border-bode-border bg-bode-ivory/60">
        <p className="text-[9px] uppercase font-bold tracking-widest text-bode-emerald mb-0.5">
          Assigned Facility
        </p>
        <p className="font-serif font-semibold text-bode-forest text-sm leading-snug truncate">
          {currentBranch?.name ?? 'BODE Spa'}
        </p>
        <p className="text-[10px] text-bode-muted mt-0.5 truncate">
          GSTIN: {currentBranch?.gstin ?? '—'}
        </p>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[9px] uppercase font-bold tracking-widest text-bode-muted px-2 mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const isSoon = item.isComingSoon;
                const isPrimary = item.isPrimaryAction;

                if (isPrimary) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full my-1.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between shadow-sm group ${
                        isActive
                          ? 'bg-bode-forest text-white ring-2 ring-bode-gold/60'
                          : 'bg-bode-emerald hover:bg-bode-forest text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-bode-gold group-hover:scale-110 transition-transform shrink-0" />
                        <span className="tracking-wide">{item.label}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bode-gold/20 text-bode-gold font-bold tracking-wider border border-bode-gold/30">
                        NEW
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id, isSoon)}
                    disabled={isSoon}
                    title={isSoon ? 'Coming soon' : item.label}
                    className={`w-full px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between group ${
                      isSoon
                        ? 'opacity-50 cursor-not-allowed text-bode-muted'
                        : isActive
                        ? 'bg-bode-forest text-white font-semibold shadow-sm'
                        : 'text-bode-charcoal hover:bg-bode-ivory hover:text-bode-forest'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isSoon
                            ? 'text-bode-muted'
                            : isActive
                            ? 'text-bode-gold'
                            : 'text-bode-muted group-hover:text-bode-forest'
                        }`}
                      />
                      <span className="tracking-wide truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSoon && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bode-muted/15 text-bode-muted font-semibold tracking-wide border border-bode-muted/20">
                          Soon
                        </span>
                      )}
                      {!isSoon && item.badge != null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                            item.badgeColor ?? 'bg-bode-emerald text-white'
                          } ${item.id === 'active-services' ? 'animate-pulse' : ''}`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!isSoon && isActive && (
                        <ChevronRight className="w-3 h-3 text-bode-gold" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-bode-border bg-bode-ivory/40 p-2.5 space-y-1.5">
        {/* Manager Info */}
        {currentManager && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-bode-gold text-bode-forest font-bold text-[11px] flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
              {managerInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-bode-forest truncate leading-tight">
                {currentManager.name}
              </p>
              <p className="text-[9px] text-bode-muted uppercase tracking-wide truncate">
                {currentManager.role}
              </p>
            </div>
          </div>
        )}

        {/* Branch Switcher */}
        <button
          type="button"
          onClick={() => {
            onOpenBranchSwitcher();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-bode-charcoal hover:bg-white hover:text-bode-forest transition-colors group border border-transparent hover:border-bode-border/60"
        >
          <Building2 className="w-3.5 h-3.5 text-bode-muted group-hover:text-bode-emerald shrink-0 transition-colors" />
          <span className="flex-1 text-left font-medium truncate text-[11px]">
            {currentBranch?.shortName ?? 'Switch Branch'}
          </span>
          <ChevronDown className="w-3 h-3 text-bode-muted shrink-0" />
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          {/* Drawer panel */}
          <div className="relative flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl h-full">
            {/* Mobile Drawer Header */}
            <div className="px-4 py-3 bg-bode-forest text-white flex items-center justify-between shrink-0">
              <Logo variant="compact" tone="light" showSubtitle={true} />
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

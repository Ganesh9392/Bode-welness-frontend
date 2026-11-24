import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  CalendarDays,
  Activity,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
}) => {
  const { branchVisits } = useApp();
  const activeCount = branchVisits.filter((v) => v.visitStatus === 'IN_PROGRESS').length;

  const navButtons = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'appointments', label: 'Calendar', icon: CalendarDays },
    { id: 'active-services', label: 'Active', icon: Activity, badge: activeCount },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-bode-border shadow-[0_-4px_12px_rgba(7,63,50,0.08)]">
      <div className="grid grid-cols-5 h-16">
        {navButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = currentTab === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => onSelectTab(btn.id)}
              className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${
                isActive ? 'text-bode-forest font-bold' : 'text-bode-muted hover:text-bode-forest'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-bode-gold rounded-full" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-bode-forest' : ''}`} />
                {btn.badge !== undefined && btn.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {btn.badge}
                  </span>
                )}
              </div>
              <span>{btn.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-bode-muted hover:text-bode-forest transition"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
};

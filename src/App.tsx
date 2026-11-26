import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from './context/AppContext';
import { CustomerVisit, VisitServiceEntry } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginScreen } from './components/LoginScreen';
import { BranchSelectionScreen } from './components/BranchSelectionScreen';
import { BranchSwitchModal } from './components/BranchSwitchModal';
import { ComingSoon } from './components/ComingSoon';
import { Logo } from './components/Logo';
import { MessageSquare, Database, Settings, Building2, MapPin, Phone, Mail } from 'lucide-react';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { QuickSalePage } from './pages/QuickSalePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CreateServicePage } from './pages/CreateServicePage';
import { ActiveServicesPage } from './pages/ActiveServicesPage';
import { VisitDetailPage } from './pages/VisitDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { BackofficePage } from './pages/BackofficePage';
import { StaffPage } from './pages/StaffPage';
import { ReportsPage } from './pages/ReportsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { ExpensesPage } from './pages/ExpensesPage';

// Modals
import { AddServiceModal } from './components/AddServiceModal';
import { ApplyDiscountModal } from './components/ApplyDiscountModal';
import { InvoiceModal } from './components/InvoiceModal';
import { WhatsAppSendModal } from './components/WhatsAppSendModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';

const TAB_PATHS: Record<string, string> = {
  dashboard: '/dashboard',
  pos: '/pos',
  appointments: '/appointments',
  'active-services': '/active-services',
  'create-service': '/create-service',
  customers: '/customers',
  backoffice: '/backoffice',
  reports: '/reports',
  expenses: '/expenses',
  enquiries: '/enquiries',
  campaign: '/campaign',
  'master-bo': '/master-bo',
  settings: '/settings',
  invoices: '/invoices',
  payments: '/payments',
  staff: '/staff',
};

const PATH_TO_TAB: Record<string, string> = Object.entries(TAB_PATHS).reduce(
  (acc, [tab, path]) => {
    acc[path] = tab;
    return acc;
  },
  {} as Record<string, string>
);

function parseProtectedRoute(pathname: string): { tab: string; visitId: string | null } | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') {
    return { tab: 'dashboard', visitId: null };
  }
  if (PATH_TO_TAB[clean]) {
    return { tab: PATH_TO_TAB[clean], visitId: null };
  }
  if (clean.startsWith('/visit/')) {
    const id = decodeURIComponent(clean.slice('/visit/'.length));
    if (id) return { tab: 'visit-detail', visitId: id };
  }
  return null;
}

export const AppContent: React.FC = () => {
  const { currentManager, currentBranch, isAuthLoading, getAuthorizedBranches, switchBranch } = useApp();

  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [autoAssignVisitId, setAutoAssignVisitId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showBranchSwitcher, setShowBranchSwitcher] = useState<boolean>(false);

  // Modals state
  const [addServiceVisit, setAddServiceVisit] = useState<CustomerVisit | null>(null);
  const [discountTarget, setDiscountTarget] = useState<{
    visit: CustomerVisit;
    service: VisitServiceEntry;
  } | null>(null);
  const [invoiceVisit, setInvoiceVisit] = useState<CustomerVisit | null>(null);
  const [whatsAppVisit, setWhatsAppVisit] = useState<CustomerVisit | null>(null);
  const [paymentVisit, setPaymentVisit] = useState<CustomerVisit | null>(null);

  const navigatePath = (path: string, replace = false) => {
    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
    }
    setCurrentPath(path);
  };

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route Guard: enforce Login -> Branch Selection -> Dashboard / Protected App
  useEffect(() => {
    if (isAuthLoading) return;

    const cleanPath = currentPath.replace(/\/+$/, '') || '/';

    if (!currentManager) {
      setIsMobileSidebarOpen(false);
      setShowBranchSwitcher(false);
      setAutoAssignVisitId(null);
      setAddServiceVisit(null);
      setDiscountTarget(null);
      setInvoiceVisit(null);
      setWhatsAppVisit(null);
      setPaymentVisit(null);
      // Replace the current history entry with /login so that browser back
      // navigation after logout cannot expose a protected page from cache.
      if (cleanPath !== '/login') {
        window.history.replaceState(null, '', '/login');
        setCurrentPath('/login');
      }
      return;
    }

    if (!currentBranch) {
      const authorized = getAuthorizedBranches();
      if (authorized.length === 1) {
        switchBranch(authorized[0].id);
        return;
      }
      if (cleanPath !== '/select-branch') {
        window.history.replaceState(null, '', '/select-branch');
        setCurrentPath('/select-branch');
      }
      return;
    }

    if (cleanPath === '/login' || cleanPath === '/select-branch' || cleanPath === '/') {
      navigatePath('/dashboard', true);
      return;
    }

    if (!parseProtectedRoute(cleanPath)) {
      navigatePath('/dashboard', true);
    }
  }, [isAuthLoading, currentManager, currentBranch, currentPath, getAuthorizedBranches, switchBranch]);

  const resolvedRoute = useMemo(() => {
    return parseProtectedRoute(currentPath) ?? { tab: 'dashboard', visitId: null };
  }, [currentPath]);

  const activeTab = resolvedRoute.tab;
  const selectedVisitId = resolvedRoute.visitId;

  // Splash screen while verifying session so Login/Branch Selection never flash
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-bode-ivory flex flex-col items-center justify-center p-6">
        <div className="bg-bode-forest p-2.5 rounded-2xl shadow-md mb-5">
          <Logo variant="full" size="md" />
        </div>
        <div className="w-6 h-6 border-2 border-bode-forest/20 border-t-bode-forest rounded-full animate-spin" />
      </div>
    );
  }

  // Step 1: Login Screen (all other routes protected)
  if (!currentManager) {
    return <LoginScreen />;
  }

  // Step 2: Dedicated Branch Selection Screen after login
  if (!currentBranch) {
    return <BranchSelectionScreen onBranchSelected={() => navigatePath('/dashboard', true)} />;
  }

  const handleNavigate = (tab: string, visitId?: string) => {
    if (tab === 'visit-detail' && visitId) {
      setAutoAssignVisitId(null);
      navigatePath(`/visit/${encodeURIComponent(visitId)}`);
    } else if (tab === 'appointments' && visitId) {
      setAutoAssignVisitId(visitId);
      navigatePath(TAB_PATHS[tab] || '/appointments');
    } else {
      setAutoAssignVisitId(null);
      navigatePath(TAB_PATHS[tab] || '/dashboard');
    }
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-bode-ivory text-bode-charcoal overflow-x-hidden w-full">
      {/* Top Navigation */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        onNavigate={handleNavigate}
        currentTab={activeTab}
      />

      {/* Main Body Shell */}
      <div className="flex-1 flex max-w-screen-2xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={handleNavigate}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenBranchSwitcher={() => setShowBranchSwitcher(true)}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onOpenInvoiceModal={(v) => setInvoiceVisit(v)}
              onOpenPaymentModal={(v) => setPaymentVisit(v)}
              onOpenAddServiceModal={(v) => setAddServiceVisit(v)}
            />
          )}

          {activeTab === 'pos' && <QuickSalePage onNavigate={handleNavigate} />}

          {activeTab === 'appointments' && (
            <AppointmentsPage
              onNavigate={handleNavigate}
              onOpenInvoiceModal={(v) => setInvoiceVisit(v)}
              autoAssignVisitId={autoAssignVisitId}
              onClearAutoAssign={() => setAutoAssignVisitId(null)}
            />
          )}

          {activeTab === 'create-service' && (
            <CreateServicePage onNavigate={handleNavigate} />
          )}

          {activeTab === 'active-services' && (
            <ActiveServicesPage
              onNavigate={handleNavigate}
              onOpenAddServiceModal={(v) => setAddServiceVisit(v)}
              onOpenDiscountModal={(v, s) => setDiscountTarget({ visit: v, service: s })}
              onOpenInvoiceModal={(v) => setInvoiceVisit(v)}
            />
          )}

          {activeTab === 'visit-detail' && selectedVisitId && (
            <VisitDetailPage
              visitId={selectedVisitId}
              onBack={() => handleNavigate('dashboard')}
              onOpenAddServiceModal={(v) => setAddServiceVisit(v)}
              onOpenDiscountModal={(v, s) => setDiscountTarget({ visit: v, service: s })}
              onOpenInvoiceModal={(v) => setInvoiceVisit(v)}
              onOpenWhatsAppModal={(v) => setWhatsAppVisit(v)}
              onOpenPaymentModal={(v) => setPaymentVisit(v)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              onNavigate={handleNavigate}
              onOpenInvoiceModal={(v) => setInvoiceVisit(v)}
            />
          )}

          {activeTab === 'backoffice' && <BackofficePage onNavigate={handleNavigate} />}

          {activeTab === 'staff' && <StaffPage />}

          {activeTab === 'reports' && <ReportsPage onNavigate={handleNavigate} />}

          {activeTab === 'invoices' && (
            <InvoicesPage
              onNavigate={handleNavigate}
              onOpenInvoiceModal={(v) => setInvoiceVisit(v)}
              onOpenWhatsAppModal={(v) => setWhatsAppVisit(v)}
              onOpenPaymentModal={(v) => setPaymentVisit(v)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsPage
              onNavigate={handleNavigate}
              onOpenPaymentModal={(v) => setPaymentVisit(v)}
            />
          )}

          {activeTab === 'expenses' && <ExpensesPage />}

          {activeTab === 'enquiries' && (
            <ComingSoon
              title="Enquiries"
              description="Manage customer enquiries, callback requests, follow-ups, and lead tracking."
              icon={<MessageSquare className="w-8 h-8" />}
              phase="Phase 2"
            />
          )}

          {activeTab === 'campaign' && <CampaignsPage />}

          {activeTab === 'master-bo' && (
            <ComingSoon
              title="Master Backoffice"
              description="Manage global configuration, multi-branch settings, tax rules, and system administration."
              icon={<Database className="w-8 h-8" />}
              phase="Phase 2"
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-bode-border shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bode-forest text-bode-gold flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg font-bold text-bode-forest truncate">
                      {currentBranch.shortName}
                    </h2>
                    <p className="text-xs text-bode-muted truncate">{currentBranch.name}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-bode-border/70 space-y-2.5 text-xs text-bode-charcoal">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-bode-emerald shrink-0 mt-0.5" />
                    <span>{currentBranch.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-bode-emerald shrink-0" />
                    <span>{currentBranch.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-bode-emerald shrink-0" />
                    <span>{currentBranch.email}</span>
                  </p>
                  <p className="text-bode-muted">
                    <strong className="text-bode-forest">GSTIN:</strong> {currentBranch.gstin}
                  </p>
                </div>
              </div>

              <ComingSoon
                title="Settings"
                description="Configure branch preferences, notification rules, and terminal settings."
                icon={<Settings className="w-8 h-8" />}
                phase="Phase 2"
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={handleNavigate}
        onOpenMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* Branch Switcher Modal */}
      <BranchSwitchModal
        isOpen={showBranchSwitcher}
        onClose={() => setShowBranchSwitcher(false)}
      />

      {/* Global Interactive Modals */}
      {addServiceVisit && (
        <AddServiceModal
          visit={addServiceVisit}
          onClose={() => setAddServiceVisit(null)}
          onSuccess={() => {}}
        />
      )}

      {discountTarget && (
        <ApplyDiscountModal
          visit={discountTarget.visit}
          serviceEntry={discountTarget.service}
          onClose={() => setDiscountTarget(null)}
          onSuccess={() => {}}
        />
      )}

      {invoiceVisit && (
        <InvoiceModal
          visit={invoiceVisit}
          onClose={() => setInvoiceVisit(null)}
          onOpenWhatsAppModal={() => {
            const v = invoiceVisit;
            setInvoiceVisit(null);
            setWhatsAppVisit(v);
          }}
          onOpenPaymentModal={() => {
            const v = invoiceVisit;
            setInvoiceVisit(null);
            setPaymentVisit(v);
          }}
        />
      )}

      {whatsAppVisit && (
        <WhatsAppSendModal
          visit={whatsAppVisit}
          onClose={() => setWhatsAppVisit(null)}
          onSuccess={() => {}}
        />
      )}

      {paymentVisit && (
        <RecordPaymentModal
          visit={paymentVisit}
          onClose={() => setPaymentVisit(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

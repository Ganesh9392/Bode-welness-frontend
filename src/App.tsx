import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { CustomerVisit, VisitServiceEntry } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginScreen } from './components/LoginScreen';
import { BranchSelectionScreen } from './components/BranchSelectionScreen';
import { BranchSwitchModal } from './components/BranchSwitchModal';
import { ComingSoon } from './components/ComingSoon';
import { Receipt, MessageSquare, Megaphone, Database, Settings } from 'lucide-react';

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

export const AppContent: React.FC = () => {
  const { currentManager } = useApp();

  const [branchConfirmed, setBranchConfirmed] = useState<boolean>(() => {
    return sessionStorage.getItem('bode_branch_confirmed_v1') === '1';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!currentManager) {
      sessionStorage.removeItem('bode_branch_confirmed_v1');
      setBranchConfirmed(false);
    }
  }, [currentManager]);

  // Step 1: Login Screen
  if (!currentManager) {
    return <LoginScreen />;
  }

  // Step 2: Dedicated Branch Selection Screen after login
  if (!branchConfirmed) {
    return <BranchSelectionScreen onBranchSelected={() => setBranchConfirmed(true)} />;
  }

  const handleNavigate = (tab: string, visitId?: string) => {
    setActiveTab(tab);
    if (visitId) {
      setSelectedVisitId(visitId);
      // When navigating to appointments with a visitId, treat it as "auto-assign" flow
      if (tab === 'appointments') {
        setAutoAssignVisitId(visitId);
      } else {
        setAutoAssignVisitId(null);
      }
    } else {
      setAutoAssignVisitId(null);
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
            <ComingSoon
              title="Settings"
              description="Configure branch preferences, notification rules, and terminal settings."
              icon={<Settings className="w-8 h-8" />}
              phase="Phase 2"
            />
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

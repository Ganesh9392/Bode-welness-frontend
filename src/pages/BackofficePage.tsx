import React, { useState, useCallback } from 'react';
import {
  Award,
  ChevronRight,
  Gift,
  Globe,
  Package,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  BackofficeCategory,
  BackofficeGiftCard,
  BackofficeHomepageConfig,
  BackofficeMembershipPlan,
  BackofficePackagePlan,
  BackofficeProductItem,
  BackofficeSection,
  BackofficeServiceItem,
  BackofficeStaffMember,
  BackofficeToast,
} from '../types/backoffice';
import { backofficeService, genId } from '../services/backofficeService';
import {
  BackofficeConfirmDialog,
  BackofficeToastContainer,
} from '../components/backoffice/BackofficeSharedUI';
import { HomepageView } from '../components/backoffice/HomepageView';
import { ServicesSection } from '../components/backoffice/ServicesSection';
import { ProductsSection } from '../components/backoffice/ProductsSection';
import { MembershipSection } from '../components/backoffice/MembershipSection';
import { PackagesSection } from '../components/backoffice/PackagesSection';
import { GiftCardSection } from '../components/backoffice/GiftCardSection';
import { StaffSection } from '../components/backoffice/StaffSection';

interface BackofficePageProps {
  onNavigate?: (tab: string, visitId?: string) => void;
}

const HUB_ITEMS: {
  id: Exclude<BackofficeSection, 'hub'>;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'homepage', label: 'Homepage', icon: Globe },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'membership', label: 'Membership', icon: Award },
  { id: 'packages', label: 'Packages', icon: Package },
  { id: 'giftcard', label: 'Gift Card', icon: Gift },
  { id: 'staff', label: 'Staff Management', icon: UserCheck },
];

export const BackofficePage: React.FC<BackofficePageProps> = () => {
  const [section, setSection] = useState<BackofficeSection>('hub');
  const [data, setData] = useState(() => backofficeService.loadAll());
  const [toasts, setToasts] = useState<BackofficeToast[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  const notify = useCallback((type: BackofficeToast['type'], message: string) => {
    const id = genId('toast');
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Homepage Handlers ──────────────────────────────────────────────────────
  const handleUpdateHomepage = (next: BackofficeHomepageConfig, msg: string) => {
    backofficeService.saveHomepage(next);
    setData((prev) => ({ ...prev, homepage: next }));
    notify('success', msg);
  };

  // ─── Service Category & Item Handlers ───────────────────────────────────────
  const handleSaveServiceCategory = (cat: BackofficeCategory, isNew: boolean) => {
    const nextCat: BackofficeCategory = {
      ...cat,
      id: isNew ? genId('srv-cat') : cat.id,
      kind: 'service',
    };
    const nextList = isNew
      ? [...data.serviceCategories, nextCat]
      : data.serviceCategories.map((c) => (c.id === nextCat.id ? nextCat : c));
    backofficeService.saveServiceCategories(nextList);
    setData((prev) => ({ ...prev, serviceCategories: nextList }));
    notify('success', isNew ? 'Service category created' : 'Service category updated');
  };

  const handleDeleteServiceCategory = (catId: string) => {
    const nextCats = data.serviceCategories.filter((c) => c.id !== catId);
    const nextServices = data.services.filter((s) => s.categoryId !== catId);
    backofficeService.saveServiceCategories(nextCats);
    backofficeService.saveServices(nextServices);
    setData((prev) => ({ ...prev, serviceCategories: nextCats, services: nextServices }));
    notify('success', 'Service category deleted');
  };

  const handleSaveService = (srv: BackofficeServiceItem, isNew: boolean) => {
    const nextList = isNew
      ? [...data.services, srv]
      : data.services.map((s) => (s.id === srv.id ? srv : s));
    backofficeService.saveServices(nextList);
    setData((prev) => ({ ...prev, services: nextList }));
    notify('success', isNew ? 'Service created' : 'Service updated');
  };

  const handleDeleteService = (srvId: string) => {
    const nextList = data.services.filter((s) => s.id !== srvId);
    backofficeService.saveServices(nextList);
    setData((prev) => ({ ...prev, services: nextList }));
    notify('success', 'Service deleted');
  };

  // ─── Product Category & Item Handlers ───────────────────────────────────────
  const handleSaveProductCategory = (cat: BackofficeCategory, isNew: boolean) => {
    const nextCat: BackofficeCategory = {
      ...cat,
      id: isNew ? genId('prd-cat') : cat.id,
      kind: 'product',
    };
    const nextList = isNew
      ? [...data.productCategories, nextCat]
      : data.productCategories.map((c) => (c.id === nextCat.id ? nextCat : c));
    backofficeService.saveProductCategories(nextList);
    setData((prev) => ({ ...prev, productCategories: nextList }));
    notify('success', isNew ? 'Product category created' : 'Product category updated');
  };

  const handleDeleteProductCategory = (catId: string) => {
    const nextCats = data.productCategories.filter((c) => c.id !== catId);
    const nextProds = data.products.filter((p) => p.categoryId !== catId);
    backofficeService.saveProductCategories(nextCats);
    backofficeService.saveProducts(nextProds);
    setData((prev) => ({ ...prev, productCategories: nextCats, products: nextProds }));
    notify('success', 'Product category deleted');
  };

  const handleSaveProduct = (prod: BackofficeProductItem, isNew: boolean) => {
    const nextList = isNew
      ? [...data.products, prod]
      : data.products.map((p) => (p.id === prod.id ? prod : p));
    backofficeService.saveProducts(nextList);
    setData((prev) => ({ ...prev, products: nextList }));
    notify('success', isNew ? 'Product created' : 'Product updated');
  };

  const handleDeleteProduct = (prodId: string) => {
    const nextList = data.products.filter((p) => p.id !== prodId);
    backofficeService.saveProducts(nextList);
    setData((prev) => ({ ...prev, products: nextList }));
    notify('success', 'Product deleted');
  };

  // ─── Membership Handlers ────────────────────────────────────────────────────
  const handleSaveMembership = (plan: BackofficeMembershipPlan, isNew: boolean) => {
    const nextList = isNew
      ? [plan, ...data.memberships]
      : data.memberships.map((m) => (m.id === plan.id ? plan : m));
    backofficeService.saveMemberships(nextList);
    setData((prev) => ({ ...prev, memberships: nextList }));
    notify('success', isNew ? 'Membership plan created' : 'Membership plan updated');
  };

  const handleDeleteMembership = (planId: string) => {
    const nextList = data.memberships.filter((m) => m.id !== planId);
    backofficeService.saveMemberships(nextList);
    setData((prev) => ({ ...prev, memberships: nextList }));
    notify('success', 'Membership plan deleted');
  };

  // ─── Package Handlers ───────────────────────────────────────────────────────
  const handleSavePackage = (pkg: BackofficePackagePlan, isNew: boolean) => {
    const nextList = isNew
      ? [pkg, ...data.packages]
      : data.packages.map((p) => (p.id === pkg.id ? pkg : p));
    backofficeService.savePackages(nextList);
    setData((prev) => ({ ...prev, packages: nextList }));
    notify('success', isNew ? 'Package created' : 'Package updated');
  };

  const handleDeletePackage = (pkgId: string) => {
    const nextList = data.packages.filter((p) => p.id !== pkgId);
    backofficeService.savePackages(nextList);
    setData((prev) => ({ ...prev, packages: nextList }));
    notify('success', 'Package deleted');
  };

  // ─── Gift Card Handlers ─────────────────────────────────────────────────────
  const handleSaveGiftCard = (card: BackofficeGiftCard, isNew: boolean) => {
    const nextList = isNew
      ? [card, ...data.giftCards]
      : data.giftCards.map((g) => (g.id === card.id ? card : g));
    backofficeService.saveGiftCards(nextList);
    setData((prev) => ({ ...prev, giftCards: nextList }));
    notify('success', isNew ? 'Gift card created' : 'Gift card updated');
  };

  const handleDeleteGiftCard = (cardId: string) => {
    const nextList = data.giftCards.filter((g) => g.id !== cardId);
    backofficeService.saveGiftCards(nextList);
    setData((prev) => ({ ...prev, giftCards: nextList }));
    notify('success', 'Gift card deleted');
  };

  // ─── Staff Handlers ─────────────────────────────────────────────────────────
  const handleSaveStaff = (member: BackofficeStaffMember, isNew: boolean) => {
    const nextList = isNew
      ? [member, ...data.staff]
      : data.staff.map((s) => (s.id === member.id ? member : s));
    backofficeService.saveStaff(nextList);
    setData((prev) => ({ ...prev, staff: nextList }));
    notify('success', isNew ? 'Staff member created' : 'Staff details updated');
  };

  const handleDeleteStaff = (staffId: string) => {
    const nextList = data.staff.filter((s) => s.id !== staffId);
    backofficeService.saveStaff(nextList);
    setData((prev) => ({ ...prev, staff: nextList }));
    notify('success', 'Staff member deleted');
  };

  const handleResetBackoffice = () => {
    const fresh = backofficeService.resetAll();
    setData(fresh);
    setConfirmReset(false);
    notify('info', 'Backoffice data reset to defaults');
  };

  return (
    <>
      <BackofficeToastContainer toasts={toasts} onDismiss={dismissToast} />

      {section === 'hub' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
              Backoffice
            </h1>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-[11px] font-semibold text-bode-muted hover:text-bode-forest flex items-center gap-1.5 transition"
              title="Reset Backoffice Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {HUB_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className="w-full bg-white rounded-2xl border border-bode-border px-4 py-4 shadow-sm flex items-center justify-between gap-3 hover:bg-bode-ivory/50 hover:border-bode-forest/30 transition text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-bode-ivory text-bode-forest group-hover:bg-bode-forest group-hover:text-bode-gold flex items-center justify-center shrink-0 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm sm:text-base text-bode-charcoal truncate">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-bode-muted shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })}
          </div>

          <BackofficeConfirmDialog
            open={confirmReset}
            title="Reset Backoffice Data?"
            message="This will restore all Backoffice catalogues, memberships, packages, gift cards, and staff to the default mock data."
            confirmLabel="Reset"
            danger
            onConfirm={handleResetBackoffice}
            onCancel={() => setConfirmReset(false)}
          />
        </div>
      )}

      {section === 'homepage' && (
        <HomepageView
          config={data.homepage}
          onUpdate={handleUpdateHomepage}
          onBack={() => setSection('hub')}
          onNotify={notify}
        />
      )}

      {section === 'services' && (
        <ServicesSection
          categories={data.serviceCategories}
          services={data.services}
          products={data.products}
          staffList={data.staff}
          onSaveCategory={handleSaveServiceCategory}
          onDeleteCategory={handleDeleteServiceCategory}
          onSaveService={handleSaveService}
          onDeleteService={handleDeleteService}
          onBackToHub={() => setSection('hub')}
        />
      )}

      {section === 'products' && (
        <ProductsSection
          categories={data.productCategories}
          products={data.products}
          onSaveCategory={handleSaveProductCategory}
          onDeleteCategory={handleDeleteProductCategory}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onNotify={notify}
          onBackToHub={() => setSection('hub')}
        />
      )}

      {section === 'membership' && (
        <MembershipSection
          plans={data.memberships}
          services={data.services}
          onSavePlan={handleSaveMembership}
          onDeletePlan={handleDeleteMembership}
          onBackToHub={() => setSection('hub')}
        />
      )}

      {section === 'packages' && (
        <PackagesSection
          packages={data.packages}
          services={data.services}
          products={data.products}
          onSavePackage={handleSavePackage}
          onDeletePackage={handleDeletePackage}
          onBackToHub={() => setSection('hub')}
        />
      )}

      {section === 'giftcard' && (
        <GiftCardSection
          giftCards={data.giftCards}
          onSaveGiftCard={handleSaveGiftCard}
          onDeleteGiftCard={handleDeleteGiftCard}
          onBackToHub={() => setSection('hub')}
        />
      )}

      {section === 'staff' && (
        <StaffSection
          staffList={data.staff}
          onSaveStaff={handleSaveStaff}
          onDeleteStaff={handleDeleteStaff}
          onBackToHub={() => setSection('hub')}
        />
      )}
    </>
  );
};

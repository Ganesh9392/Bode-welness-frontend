import React, { useState, useEffect, useMemo } from 'react';
import { Check, ChevronRight, Plus, Search, X } from 'lucide-react';
import {
  BackofficePackagePlan,
  BackofficePackageProductEntry,
  BackofficePackageServiceEntry,
  BackofficeProductItem,
  BackofficeServiceItem,
  PackageType,
} from '../../types/backoffice';
import { formatINR, genId } from '../../services/backofficeService';
import {
  BackofficeBottomBar,
  BackofficeCard,
  BackofficeConfirmDialog,
  BackofficeEmptyState,
  BackofficeField,
  BackofficeListSkeleton,
  BackofficeRadioGroup,
  BackofficeSearchBar,
  BackofficeSubHeader,
  BackofficeToggle,
  boInputCls,
} from './BackofficeSharedUI';

interface PackagesSectionProps {
  packages: BackofficePackagePlan[];
  services: BackofficeServiceItem[];
  products: BackofficeProductItem[];
  onSavePackage: (pkg: BackofficePackagePlan, isNew: boolean) => void;
  onDeletePackage: (pkgId: string) => void;
  onBackToHub: () => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  services,
  products,
  onSavePackage,
  onDeletePackage,
  onBackToHub,
}) => {
  const [editingPkg, setEditingPkg] = useState<BackofficePackagePlan | null | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(t);
  }, []);

  if (editingPkg !== undefined) {
    return (
      <PackageForm
        initialPkg={editingPkg}
        allServices={services}
        allProducts={products}
        onSave={(pkg, isNew) => {
          onSavePackage(pkg, isNew);
          setEditingPkg(undefined);
        }}
        onDelete={(pkgId) => {
          onDeletePackage(pkgId);
          setEditingPkg(undefined);
        }}
        onCancel={() => setEditingPkg(undefined)}
      />
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = packages
    .filter((p) => showInactive || p.isActive)
    .filter((p) => !q || p.name.toLowerCase().includes(q));

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title="Packages"
        onBack={onBackToHub}
        menuActions={[
          {
            label: showInactive ? 'Hide Inactive Packages' : 'Show All Packages',
            onClick: () => setShowInactive((v) => !v),
          },
          {
            label: 'Create New Package',
            onClick: () => setEditingPkg(null),
          },
        ]}
      />

      <div className="max-w-3xl mx-auto space-y-3">
        <BackofficeSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search packages..."
        />

        {loading ? (
          <BackofficeListSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <BackofficeEmptyState
            hasSearch={Boolean(q)}
            onClearSearch={() => setSearchQuery('')}
            message="No items yet, tap Create New Package to create one"
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setEditingPkg(pkg)}
                className={`w-full text-left bg-white rounded-2xl border border-bode-border px-4 py-4 shadow-sm flex items-center justify-between gap-3 hover:bg-bode-ivory/40 transition ${
                  !pkg.isActive ? 'opacity-55' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-bode-charcoal truncate">{pkg.name}</p>
                  <p className="text-[11px] text-bode-muted mt-0.5">
                    {formatINR(pkg.price)} • {pkg.validityDays} days •{' '}
                    {pkg.includeServices ? `${pkg.services.length} services` : 'No services'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-bode-muted shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <BackofficeBottomBar
        mode="list"
        primaryLabel="Create New Package"
        onPrimary={() => setEditingPkg(null)}
      />
    </div>
  );
};

// ─── Create / Update Package Form ────────────────────────────────────────────

interface PackageFormProps {
  initialPkg: BackofficePackagePlan | null;
  allServices: BackofficeServiceItem[];
  allProducts: BackofficeProductItem[];
  onSave: (pkg: BackofficePackagePlan, isNew: boolean) => void;
  onDelete: (pkgId: string) => void;
  onCancel: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({
  initialPkg,
  allServices,
  allProducts,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isNew = !initialPkg;
  const [form, setForm] = useState<BackofficePackagePlan>(() =>
    initialPkg
      ? {
          ...initialPkg,
          services: initialPkg.services.map((s) => ({ ...s })),
          products: initialPkg.products.map((p) => ({ ...p })),
        }
      : {
          id: '',
          type: 'BASE',
          name: '',
          isActive: true,
          price: 0,
          validityDays: 30,
          renewalReminderDays: 3,
          includeServices: true,
          services: [],
          includeProducts: false,
          products: [],
        }
  );

  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string; validityDays?: string }>({});
  const [confirmUnsaved, setConfirmUnsaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickerMode, setPickerMode] = useState<'service' | 'product' | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const patch = (updates: Partial<BackofficePackagePlan>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    setErrors((e) => ({
      ...e,
      ...(updates.name !== undefined ? { name: undefined } : {}),
      ...(updates.price !== undefined ? { price: undefined } : {}),
      ...(updates.validityDays !== undefined ? { validityDays: undefined } : {}),
    }));
  };

  const totalServiceAmount = useMemo(
    () =>
      form.includeServices
        ? form.services.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0)
        : 0,
    [form.includeServices, form.services]
  );

  const totalProductAmount = useMemo(
    () =>
      form.includeProducts
        ? form.products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0)
        : 0,
    [form.includeProducts, form.products]
  );

  const totalItemsAmount = totalServiceAmount + totalProductAmount;
  const totalToPay = form.price > 0 ? form.price : totalItemsAmount;

  const handleBackOrCancel = () => {
    if (isDirty) setConfirmUnsaved(true);
    else onCancel();
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Package name is required.';
    if (form.price < 0 || Number.isNaN(form.price)) nextErrors.price = 'Enter a valid price.';
    if (!form.validityDays || form.validityDays <= 0)
      nextErrors.validityDays = 'Validity must be at least 1 day.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(
      {
        ...form,
        id: isNew ? genId('pkg') : form.id,
        name: form.name.trim(),
      },
      isNew
    );
  };

  const toggleServiceSelection = (srv: BackofficeServiceItem) => {
    const exists = form.services.some((s) => s.serviceId === srv.id);
    if (exists) {
      patch({ services: form.services.filter((s) => s.serviceId !== srv.id) });
    } else {
      const entry: BackofficePackageServiceEntry = {
        serviceId: srv.id,
        serviceName: srv.name,
        unitPrice: srv.salePrice && srv.salePrice > 0 ? srv.salePrice : srv.price,
        quantity: 1,
      };
      patch({ services: [...form.services, entry] });
    }
  };

  const toggleProductSelection = (prd: BackofficeProductItem) => {
    const exists = form.products.some((p) => p.productId === prd.id);
    if (exists) {
      patch({ products: form.products.filter((p) => p.productId !== prd.id) });
    } else {
      const entry: BackofficePackageProductEntry = {
        productId: prd.id,
        productName: prd.name,
        unitPrice: prd.isRetail ? (prd.salePrice && prd.salePrice > 0 ? prd.salePrice : prd.price) : 0,
        quantity: 1,
      };
      patch({ products: [...form.products, entry] });
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={isNew ? 'Create Package' : 'Update Package'}
        onBack={handleBackOrCancel}
        onDelete={!isNew ? () => setConfirmDelete(true) : undefined}
        deleteLabel="Delete Package"
      />

      <div className="max-w-3xl mx-auto space-y-3.5">
        <BackofficeCard className="space-y-4">
          {/* Package Type */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-bode-muted">
              PACKAGE TYPE
            </p>
            <BackofficeRadioGroup<PackageType>
              columns={2}
              value={form.type}
              onChange={(t) => patch({ type: t })}
              options={[
                { value: 'BASE', label: 'BASE' },
                { value: 'CUSTOM', label: 'CUSTOM' },
              ]}
            />
          </div>

          {/* Package Name + Active */}
          <div className="flex items-start gap-3">
            <BackofficeField label="Package name" required error={errors.name} className="flex-1">
              <input
                type="text"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Vyoma Package"
                className={boInputCls(Boolean(errors.name))}
              />
            </BackofficeField>

            <button
              type="button"
              onClick={() => patch({ isActive: !form.isActive })}
              className="mt-7 flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-bode-ivory/60 shrink-0"
            >
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                  form.isActive
                    ? 'bg-bode-forest border-bode-forest text-white'
                    : 'bg-white border-bode-border'
                }`}
              >
                {form.isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </span>
              <span className="text-xs sm:text-sm font-medium text-bode-charcoal">Active</span>
            </button>
          </div>

          {/* Price, Validity, Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Price (₹)" required error={errors.price}>
              <input
                type="number"
                min={0}
                value={form.price || ''}
                onChange={(e) => patch({ price: Math.max(0, Number(e.target.value) || 0) })}
                className={boInputCls(Boolean(errors.price))}
              />
            </BackofficeField>

            <BackofficeField label="Validity (days)" required error={errors.validityDays}>
              <input
                type="number"
                min={1}
                value={form.validityDays || ''}
                onChange={(e) => patch({ validityDays: parseInt(e.target.value, 10) || 0 })}
                className={boInputCls(Boolean(errors.validityDays))}
              />
            </BackofficeField>
          </div>

          <BackofficeField label="Renewal reminder" className="w-1/2 min-w-[140px]">
            <input
              type="number"
              min={0}
              value={form.renewalReminderDays ?? ''}
              onChange={(e) =>
                patch({
                  renewalReminderDays:
                    e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0,
                })
              }
              className={boInputCls()}
            />
          </BackofficeField>

          {/* Auto-calculated Summary Card */}
          <div className="p-3.5 rounded-xl bg-bode-ivory/70 border border-bode-border space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-bode-muted">
              <span>Total Service Amount</span>
              <span className="font-semibold text-bode-charcoal">
                {formatINR(totalServiceAmount, 2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-bode-muted">
              <span>Total Product Amount</span>
              <span className="font-semibold text-bode-charcoal">
                {formatINR(totalProductAmount, 2)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-bode-border font-bold text-bode-forest">
              <span>Total Amount (Items Value)</span>
              <span>{formatINR(totalItemsAmount, 2)}</span>
            </div>
          </div>

          {/* INCLUDE SERVICES */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-bode-charcoal">
                INCLUDE SERVICES
              </span>
              <BackofficeToggle
                checked={form.includeServices}
                onChange={(v) => patch({ includeServices: v })}
                ariaLabel="Include Services"
              />
            </div>

            {form.includeServices && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold text-bode-muted">
                  Selected services ({form.services.length})
                </p>

                {form.services.map((srv, idx) => (
                  <div
                    key={srv.serviceId}
                    className="p-2.5 rounded-xl border border-bode-border bg-bode-ivory/30 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-bode-charcoal truncate">
                        {srv.serviceName}
                      </p>
                      <p className="text-[11px] text-bode-muted">
                        {formatINR(srv.unitPrice)} × {srv.quantity} ={' '}
                        <span className="font-semibold text-bode-forest">
                          {formatINR(srv.unitPrice * srv.quantity)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={1}
                        aria-label={`Quantity for ${srv.serviceName}`}
                        value={srv.quantity}
                        onChange={(e) => {
                          const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                          patch({
                            services: form.services.map((item, i) =>
                              i === idx ? { ...item, quantity: qty } : item
                            ),
                          });
                        }}
                        className="w-14 px-2 py-1.5 rounded-lg border border-bode-border bg-white text-xs text-center font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patch({
                            services: form.services.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        aria-label={`Remove ${srv.serviceName}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setPickerSearch('');
                    setPickerMode('service');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-bode-emerald text-bode-emerald hover:bg-bode-ivory/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add services</span>
                </button>
              </div>
            )}
          </div>

          {/* INCLUDE PRODUCTS */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-bode-charcoal">
                INCLUDE PRODUCTS
              </span>
              <BackofficeToggle
                checked={form.includeProducts}
                onChange={(v) => patch({ includeProducts: v })}
                ariaLabel="Include Products"
              />
            </div>

            {form.includeProducts && (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold text-bode-muted">
                  Selected products ({form.products.length})
                </p>

                {form.products.map((prd, idx) => (
                  <div
                    key={prd.productId}
                    className="p-2.5 rounded-xl border border-bode-border bg-bode-ivory/30 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-bode-charcoal truncate">
                        {prd.productName}
                      </p>
                      <p className="text-[11px] text-bode-muted">
                        {formatINR(prd.unitPrice)} × {prd.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={1}
                        aria-label={`Quantity for ${prd.productName}`}
                        value={prd.quantity}
                        onChange={(e) => {
                          const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                          patch({
                            products: form.products.map((item, i) =>
                              i === idx ? { ...item, quantity: qty } : item
                            ),
                          });
                        }}
                        className="w-14 px-2 py-1.5 rounded-lg border border-bode-border bg-white text-xs text-center font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patch({
                            products: form.products.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        aria-label={`Remove ${prd.productName}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setPickerSearch('');
                    setPickerMode('product');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-bode-emerald text-bode-emerald hover:bg-bode-ivory/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add products</span>
                </button>
              </div>
            )}
          </div>

          {/* TOTAL TO PAY Card */}
          <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-bode-charcoal">
              TOTAL TO PAY
            </span>
            <span className="text-base sm:text-lg font-bold text-bode-forest">
              {formatINR(totalToPay, 2)}
            </span>
          </div>
        </BackofficeCard>
      </div>

      <BackofficeBottomBar
        mode="form"
        primaryLabel={isNew ? 'Create' : 'Update'}
        onPrimary={handleSubmit}
        onCancel={handleBackOrCancel}
      />

      {/* Picker Sheet for Services / Products */}
      {pickerMode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-bode-border shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="bg-bode-forest text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold">
                {pickerMode === 'service' ? 'Select Services' : 'Select Products'}
              </h3>
              <button
                type="button"
                onClick={() => setPickerMode(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 border-b border-bode-border">
              <div className="relative">
                <Search className="w-4 h-4 text-bode-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder={`Search ${pickerMode}s...`}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-bode-border text-xs focus:outline-none focus:ring-2 focus:ring-bode-forest"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-bode-border/60">
              {pickerMode === 'service'
                ? allServices
                    .filter((s) =>
                      s.name.toLowerCase().includes(pickerSearch.trim().toLowerCase())
                    )
                    .map((srv) => {
                      const selected = form.services.some((x) => x.serviceId === srv.id);
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => toggleServiceSelection(srv)}
                          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-bode-ivory/50"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-bode-charcoal truncate">
                              {srv.name}
                            </p>
                            <p className="text-[11px] text-bode-muted">{formatINR(srv.price)}</p>
                          </div>
                          <span
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                              selected
                                ? 'bg-bode-forest border-bode-forest text-white'
                                : 'border-bode-border bg-white'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })
                : allProducts
                    .filter((p) =>
                      p.name.toLowerCase().includes(pickerSearch.trim().toLowerCase())
                    )
                    .map((prd) => {
                      const selected = form.products.some((x) => x.productId === prd.id);
                      return (
                        <button
                          key={prd.id}
                          type="button"
                          onClick={() => toggleProductSelection(prd)}
                          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-bode-ivory/50"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-bode-charcoal truncate">
                              {prd.name}
                            </p>
                            <p className="text-[11px] text-bode-muted">
                              {formatINR(prd.isRetail ? prd.price : 0)}
                            </p>
                          </div>
                          <span
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                              selected
                                ? 'bg-bode-forest border-bode-forest text-white'
                                : 'border-bode-border bg-white'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
            </div>
            <div className="p-3 border-t border-bode-border">
              <button
                type="button"
                onClick={() => setPickerMode(null)}
                className="w-full py-2.5 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <BackofficeConfirmDialog
        open={confirmUnsaved}
        title="Discard Unsaved Changes?"
        message="You have unsaved edits on this package."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        danger
        onConfirm={() => {
          setConfirmUnsaved(false);
          onCancel();
        }}
        onCancel={() => setConfirmUnsaved(false)}
      />

      <BackofficeConfirmDialog
        open={confirmDelete}
        title="Delete Package?"
        message={`Are you sure you want to delete "${form.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (initialPkg) onDelete(initialPkg.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

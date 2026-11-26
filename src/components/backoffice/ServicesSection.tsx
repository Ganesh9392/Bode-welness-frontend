import React, { useState, useEffect } from 'react';
import { Edit3, Plus, X } from 'lucide-react';
import {
  AudienceGroup,
  BackofficeCategory,
  BackofficeConsumableLink,
  BackofficeProductItem,
  BackofficeServiceItem,
  BackofficeStaffMember,
} from '../../types/backoffice';
import { RESOURCE_OPTIONS } from '../../data/backofficeMockData';
import { formatINR, genId } from '../../services/backofficeService';
import {
  BackofficeBottomBar,
  BackofficeCard,
  BackofficeConfirmDialog,
  BackofficeDescriptionPoints,
  BackofficeEmptyState,
  BackofficeField,
  BackofficeMultiSelect,
  BackofficeRadioGroup,
  BackofficeSearchBar,
  BackofficeSubHeader,
  BackofficeToggle,
  CategoryFormView,
  CategoryListView,
  boInputCls,
} from './BackofficeSharedUI';

interface ServicesSectionProps {
  categories: BackofficeCategory[];
  services: BackofficeServiceItem[];
  products: BackofficeProductItem[];
  staffList: BackofficeStaffMember[];
  onSaveCategory: (cat: BackofficeCategory, isNew: boolean) => void;
  onDeleteCategory: (catId: string) => void;
  onSaveService: (srv: BackofficeServiceItem, isNew: boolean) => void;
  onDeleteService: (srvId: string) => void;
  onBackToHub: () => void;
}

type ServiceView =
  | { mode: 'categories' }
  | { mode: 'edit-category'; category: BackofficeCategory | null }
  | { mode: 'items'; categoryId: string }
  | { mode: 'edit-item'; categoryId: string; item: BackofficeServiceItem | null };

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  categories,
  services,
  products,
  staffList,
  onSaveCategory,
  onDeleteCategory,
  onSaveService,
  onDeleteService,
  onBackToHub,
}) => {
  const [view, setView] = useState<ServiceView>({ mode: 'categories' });
  const [catSearch, setCatSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(t);
  }, []);

  if (view.mode === 'edit-category') {
    return (
      <CategoryFormView
        kind="service"
        initialCategory={view.category}
        nextPosition={categories.length + 1}
        staffList={staffList}
        onSave={(cat, isNew) => {
          onSaveCategory(cat, isNew);
          setView({ mode: 'categories' });
        }}
        onDelete={(catId) => {
          onDeleteCategory(catId);
          setView({ mode: 'categories' });
        }}
        onCancel={() => setView({ mode: 'categories' })}
      />
    );
  }

  if (view.mode === 'categories') {
    const visibleCategories = showInactive
      ? categories
      : categories.filter((c) => c.isActive);

    return (
      <CategoryListView
        title="Services"
        categories={visibleCategories}
        searchQuery={catSearch}
        onSearchChange={setCatSearch}
        loading={loading}
        onBack={onBackToHub}
        onSelectCategory={(cat) => {
          setItemSearch('');
          setView({ mode: 'items', categoryId: cat.id });
        }}
        onEditCategory={(cat) => setView({ mode: 'edit-category', category: cat })}
        onAddNew={() => setView({ mode: 'edit-category', category: null })}
        menuActions={[
          {
            label: showInactive ? 'Hide Inactive Categories' : 'Show All Categories',
            onClick: () => setShowInactive((v) => !v),
          },
          {
            label: 'Add New Category',
            onClick: () => setView({ mode: 'edit-category', category: null }),
          },
        ]}
      />
    );
  }

  const activeCategory = categories.find((c) => c.id === view.categoryId);

  if (view.mode === 'edit-item') {
    return (
      <ServiceItemForm
        category={activeCategory}
        initialItem={view.item}
        nextPosition={services.filter((s) => s.categoryId === view.categoryId).length + 1}
        products={products}
        onSave={(srv, isNew) => {
          onSaveService(srv, isNew);
          setView({ mode: 'items', categoryId: view.categoryId });
        }}
        onDelete={(srvId) => {
          onDeleteService(srvId);
          setView({ mode: 'items', categoryId: view.categoryId });
        }}
        onCancel={() => setView({ mode: 'items', categoryId: view.categoryId })}
      />
    );
  }

  // Service Items List inside Category
  const q = itemSearch.trim().toLowerCase();
  const categoryItems = services
    .filter((s) => s.categoryId === view.categoryId)
    .filter((s) => showInactive || s.isActive)
    .filter((s) => !q || s.name.toLowerCase().includes(q))
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={activeCategory?.name || 'Services'}
        onBack={() => setView({ mode: 'categories' })}
        menuActions={[
          {
            label: 'Edit Category',
            onClick: () => {
              if (activeCategory) setView({ mode: 'edit-category', category: activeCategory });
            },
          },
          {
            label: showInactive ? 'Hide Inactive Services' : 'Show All Services',
            onClick: () => setShowInactive((v) => !v),
          },
        ]}
      />

      <div className="max-w-3xl mx-auto space-y-3">
        <BackofficeSearchBar
          value={itemSearch}
          onChange={setItemSearch}
          placeholder="Search items..."
        />

        {categoryItems.length === 0 ? (
          <BackofficeEmptyState
            hasSearch={Boolean(q)}
            onClearSearch={() => setItemSearch('')}
            message="No items yet, tap Add Service to create one"
          />
        ) : (
          <div className="space-y-2.5">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setView({ mode: 'edit-item', categoryId: view.categoryId, item })
                }
                className={`bg-white rounded-2xl border border-bode-border px-4 py-3.5 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:bg-bode-ivory/40 transition ${
                  !item.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-bode-charcoal truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-bold text-bode-forest">
                      {formatINR(item.salePrice && item.salePrice > 0 ? item.salePrice : item.price)}
                    </span>
                    {item.salePrice && item.salePrice > 0 && item.salePrice < item.price && (
                      <span className="text-[11px] text-bode-muted line-through">
                        {formatINR(item.price)}
                      </span>
                    )}
                    {!item.isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                        Inactive
                      </span>
                    )}
                    {item.hideFromCatalogue && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setView({ mode: 'edit-item', categoryId: view.categoryId, item });
                  }}
                  className="w-9 h-9 rounded-xl bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest flex items-center justify-center shrink-0 transition"
                  aria-label={`Edit ${item.name}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BackofficeBottomBar
        mode="list"
        primaryLabel="Add Service"
        onPrimary={() =>
          setView({ mode: 'edit-item', categoryId: view.categoryId, item: null })
        }
      />
    </div>
  );
};

// ─── Edit / Create Service Form ──────────────────────────────────────────────

interface ServiceItemFormProps {
  category?: BackofficeCategory;
  initialItem: BackofficeServiceItem | null;
  nextPosition: number;
  products: BackofficeProductItem[];
  onSave: (item: BackofficeServiceItem, isNew: boolean) => void;
  onDelete: (itemId: string) => void;
  onCancel: () => void;
}

const ServiceItemForm: React.FC<ServiceItemFormProps> = ({
  category,
  initialItem,
  nextPosition,
  products,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isNew = !initialItem;
  const [form, setForm] = useState<BackofficeServiceItem>(() =>
    initialItem
      ? {
          ...initialItem,
          descriptionPoints: [...initialItem.descriptionPoints],
          consumables: initialItem.consumables.map((c) => ({ ...c })),
          resourceIds: [...initialItem.resourceIds],
        }
      : {
          id: '',
          categoryId: category?.id || '',
          name: '',
          isActive: true,
          position: nextPosition,
          serviceReminderDays: 15,
          durationHours: 1,
          durationMinutes: 0,
          group: 'BOTH',
          hideFromCatalogue: false,
          price: 0,
          salePrice: undefined,
          nonDiscountable: false,
          serviceTag: '',
          descriptionPoints: [''],
          consumables: [],
          resourceIds: [],
        }
  );

  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; position?: string; price?: string }>({});
  const [confirmUnsaved, setConfirmUnsaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (updates: Partial<BackofficeServiceItem>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    if (updates.name !== undefined && errors.name) setErrors((e) => ({ ...e, name: undefined }));
    if (updates.position !== undefined && errors.position) setErrors((e) => ({ ...e, position: undefined }));
    if (updates.price !== undefined && errors.price) setErrors((e) => ({ ...e, price: undefined }));
  };

  const handleBackOrCancel = () => {
    if (isDirty) setConfirmUnsaved(true);
    else onCancel();
  };

  const handleSubmit = () => {
    const nextErrors: { name?: string; position?: string; price?: string } = {};
    if (!form.name.trim()) nextErrors.name = 'Item name is required.';
    if (!form.position || form.position < 1) nextErrors.position = 'Position must be 1 or greater.';
    if (form.price < 0 || Number.isNaN(form.price)) nextErrors.price = 'Price must be 0 or greater.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(
      {
        ...form,
        id: isNew ? genId('bo-srv') : form.id,
        name: form.name.trim(),
        descriptionPoints: form.descriptionPoints.map((p) => p.trim()).filter(Boolean),
      },
      isNew
    );
  };

  const addConsumable = () => {
    const firstProd = products[0];
    if (!firstProd) return;
    const next: BackofficeConsumableLink = {
      productId: firstProd.id,
      productName: firstProd.name,
      quantity: 1,
      unit: 'ml / pcs',
    };
    patch({ consumables: [...form.consumables, next] });
  };

  const updateConsumable = (idx: number, updates: Partial<BackofficeConsumableLink>) => {
    const next = form.consumables.map((c, i) => (i === idx ? { ...c, ...updates } : c));
    patch({ consumables: next });
  };

  const removeConsumable = (idx: number) => {
    patch({ consumables: form.consumables.filter((_, i) => i !== idx) });
  };

  const breadcrumb = `${category?.name || 'Services'} / ${isNew ? 'New Service' : form.name || 'Edit Service'}`;

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={breadcrumb}
        onBack={handleBackOrCancel}
        onDelete={!isNew ? () => setConfirmDelete(true) : undefined}
        deleteLabel="Delete Service"
      />

      <div className="max-w-3xl mx-auto space-y-3.5">
        {/* 1. Basic */}
        <BackofficeCard className="space-y-4">
          <h3 className="font-serif text-sm font-bold text-bode-forest border-b border-bode-border pb-2">
            Basic
          </h3>

          <div className="flex items-start gap-3">
            <BackofficeField label="Item Name" required error={errors.name} className="flex-1">
              <input
                type="text"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Swedish Massage 60 Min"
                className={boInputCls(Boolean(errors.name))}
              />
            </BackofficeField>

            <div className="pt-1 flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-bode-charcoal">Active</span>
              <BackofficeToggle
                checked={form.isActive}
                onChange={(v) => patch({ isActive: v })}
                ariaLabel="Service active status"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Position" required error={errors.position}>
              <input
                type="number"
                min={1}
                value={form.position || ''}
                onChange={(e) => patch({ position: parseInt(e.target.value, 10) || 0 })}
                className={boInputCls(Boolean(errors.position))}
              />
            </BackofficeField>

            <BackofficeField label="Service Reminder (days)">
              <input
                type="number"
                min={0}
                value={form.serviceReminderDays ?? ''}
                onChange={(e) =>
                  patch({
                    serviceReminderDays: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="e.g. 15"
                className={boInputCls()}
              />
            </BackofficeField>
          </div>

          <div>
            <p className="text-xs font-semibold text-bode-charcoal mb-1.5">Duration</p>
            <div className="grid grid-cols-2 gap-3">
              <BackofficeField label="Hour">
                <select
                  value={form.durationHours}
                  onChange={(e) => patch({ durationHours: parseInt(e.target.value, 10) })}
                  className={boInputCls()}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                    <option key={h} value={h}>
                      {h} {h === 1 ? 'hr' : 'hrs'}
                    </option>
                  ))}
                </select>
              </BackofficeField>
              <BackofficeField label="Minute">
                <select
                  value={form.durationMinutes}
                  onChange={(e) => patch({ durationMinutes: parseInt(e.target.value, 10) })}
                  className={boInputCls()}
                >
                  {[0, 5, 10, 15, 20, 30, 40, 45, 50].map((m) => (
                    <option key={m} value={m}>
                      {m} min
                    </option>
                  ))}
                </select>
              </BackofficeField>
            </div>
          </div>
        </BackofficeCard>

        {/* 2. Group */}
        <BackofficeCard className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-sm font-bold text-bode-forest">Group</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-bode-charcoal">Hide from Catalogue</span>
              <BackofficeToggle
                checked={form.hideFromCatalogue}
                onChange={(v) => patch({ hideFromCatalogue: v })}
                ariaLabel="Hide from Catalogue"
              />
            </div>
          </div>

          <BackofficeRadioGroup<AudienceGroup>
            value={form.group}
            onChange={(g) => patch({ group: g })}
            options={[
              { value: 'BOTH', label: 'Both' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'MALE', label: 'Male' },
            ]}
          />
        </BackofficeCard>

        {/* 3. Pricing Details */}
        <BackofficeCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-bode-border pb-2">
            <h3 className="font-serif text-sm font-bold text-bode-forest">Pricing Details</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-bode-charcoal">Non-Discountable</span>
              <BackofficeToggle
                checked={form.nonDiscountable}
                onChange={(v) => patch({ nonDiscountable: v })}
                ariaLabel="Non-Discountable"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Price (₹)" error={errors.price}>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => patch({ price: Math.max(0, Number(e.target.value) || 0) })}
                className={boInputCls(Boolean(errors.price))}
              />
            </BackofficeField>

            <BackofficeField label="Sale Price (₹)">
              <input
                type="number"
                min={0}
                value={form.salePrice ?? ''}
                onChange={(e) =>
                  patch({
                    salePrice: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0),
                  })
                }
                placeholder="Optional"
                className={boInputCls()}
              />
            </BackofficeField>
          </div>
        </BackofficeCard>

        {/* 4. Additional Information */}
        <BackofficeCard className="space-y-4">
          <h3 className="font-serif text-sm font-bold text-bode-forest border-b border-bode-border pb-2">
            Additional Information
          </h3>

          <BackofficeField label="Service Tag">
            <input
              type="text"
              value={form.serviceTag || ''}
              onChange={(e) => patch({ serviceTag: e.target.value })}
              placeholder="e.g. Signature, Bestseller"
              className={boInputCls()}
            />
          </BackofficeField>

          <BackofficeDescriptionPoints
            points={form.descriptionPoints}
            onChange={(pts) => patch({ descriptionPoints: pts })}
          />
        </BackofficeCard>

        {/* 5. Consumables */}
        <BackofficeCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-bode-forest">Consumables</h3>
            <button
              type="button"
              onClick={addConsumable}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bode-ivory border border-bode-border text-xs font-semibold text-bode-forest hover:bg-bode-ivoryDark transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {form.consumables.length === 0 ? (
            <p className="text-[11px] text-bode-muted">
              No consumables linked. Tap + Add to link inventory products.
            </p>
          ) : (
            <div className="space-y-2.5">
              {form.consumables.map((cons, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-bode-ivory/40 border border-bode-border flex flex-col sm:flex-row sm:items-center gap-2"
                >
                  <select
                    value={cons.productId}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      updateConsumable(idx, {
                        productId: e.target.value,
                        productName: prod?.name || cons.productName,
                      });
                    }}
                    className={`${boInputCls()} sm:flex-1`}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={cons.quantity}
                      onChange={(e) =>
                        updateConsumable(idx, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                      }
                      className="w-20 px-2.5 py-2 rounded-xl border border-bode-border bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={cons.unit}
                      onChange={(e) => updateConsumable(idx, { unit: e.target.value })}
                      placeholder="Unit"
                      className="w-24 px-2.5 py-2 rounded-xl border border-bode-border bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeConsumable(idx)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-bode-border bg-white"
                      aria-label="Remove consumable"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BackofficeCard>

        {/* 6. Resources */}
        <BackofficeCard className="space-y-2.5">
          <h3 className="font-serif text-sm font-bold text-bode-forest">Resources</h3>
          <BackofficeMultiSelect
            options={RESOURCE_OPTIONS.map((r) => ({ id: r.id, label: r.name }))}
            selectedIds={form.resourceIds}
            onChange={(ids) => patch({ resourceIds: ids })}
            placeholder="Select resources..."
          />
        </BackofficeCard>
      </div>

      <BackofficeBottomBar
        mode="form"
        primaryLabel={isNew ? 'Create' : 'Update'}
        onPrimary={handleSubmit}
        onCancel={handleBackOrCancel}
      />

      <BackofficeConfirmDialog
        open={confirmUnsaved}
        title="Discard Unsaved Changes?"
        message="You have unsaved edits on this service. Leaving now will discard your changes."
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
        title="Delete Service?"
        message={`Are you sure you want to delete "${form.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (initialItem) onDelete(initialItem.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

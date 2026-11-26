import React, { useState, useEffect } from 'react';
import { Edit3, Plus, ShoppingCart, X } from 'lucide-react';
import {
  AudienceGroup,
  BackofficeCategory,
  BackofficeProductItem,
  BackofficeProductVariation,
} from '../../types/backoffice';
import { formatINR, genId } from '../../services/backofficeService';
import {
  BackofficeBottomBar,
  BackofficeCard,
  BackofficeConfirmDialog,
  BackofficeDescriptionPoints,
  BackofficeEmptyState,
  BackofficeField,
  BackofficeImageBox,
  BackofficeRadioGroup,
  BackofficeSearchBar,
  BackofficeSubHeader,
  BackofficeToggle,
  CategoryFormView,
  CategoryListView,
  boInputCls,
} from './BackofficeSharedUI';

interface ProductsSectionProps {
  categories: BackofficeCategory[];
  products: BackofficeProductItem[];
  onSaveCategory: (cat: BackofficeCategory, isNew: boolean) => void;
  onDeleteCategory: (catId: string) => void;
  onSaveProduct: (prod: BackofficeProductItem, isNew: boolean) => void;
  onDeleteProduct: (prodId: string) => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  onBackToHub: () => void;
}

type ProductView =
  | { mode: 'categories' }
  | { mode: 'edit-category'; category: BackofficeCategory | null }
  | { mode: 'items'; categoryId: string }
  | { mode: 'edit-item'; categoryId: string; item: BackofficeProductItem | null };

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  categories,
  products,
  onSaveCategory,
  onDeleteCategory,
  onSaveProduct,
  onDeleteProduct,
  onNotify,
  onBackToHub,
}) => {
  const [view, setView] = useState<ProductView>({ mode: 'categories' });
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
        kind="product"
        initialCategory={view.category}
        nextPosition={categories.length + 1}
        staffList={[]}
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
        title="Products"
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
      <ProductItemForm
        category={activeCategory}
        initialItem={view.item}
        nextPosition={products.filter((p) => p.categoryId === view.categoryId).length + 1}
        onSave={(prod, isNew) => {
          onSaveProduct(prod, isNew);
          setView({ mode: 'items', categoryId: view.categoryId });
        }}
        onDelete={(prodId) => {
          onDeleteProduct(prodId);
          setView({ mode: 'items', categoryId: view.categoryId });
        }}
        onCancel={() => setView({ mode: 'items', categoryId: view.categoryId })}
      />
    );
  }

  const q = itemSearch.trim().toLowerCase();
  const categoryItems = products
    .filter((p) => p.categoryId === view.categoryId)
    .filter((p) => showInactive || p.isActive)
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={activeCategory?.name || 'Products'}
        onBack={() => setView({ mode: 'categories' })}
        menuActions={[
          {
            label: 'Edit Category',
            onClick: () => {
              if (activeCategory) setView({ mode: 'edit-category', category: activeCategory });
            },
          },
          {
            label: showInactive ? 'Hide Inactive Products' : 'Show All Products',
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
            message="No items yet, tap Add Product to create one"
          />
        ) : (
          <div className="space-y-2.5">
            {categoryItems.map((item) => {
              const displayPrice = item.isRetail ? (item.salePrice && item.salePrice > 0 ? item.salePrice : item.price) : 0;
              return (
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
                        {formatINR(displayPrice)}
                      </span>
                      {item.isRetail && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          Retail
                        </span>
                      )}
                      {!item.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotify(
                          'info',
                          item.isRetail
                            ? `"${item.name}" marked for POS retail (${formatINR(displayPrice)})`
                            : `"${item.name}" is internal stock (₹0). Enable Retail to sell.`
                        );
                      }}
                      className="w-9 h-9 rounded-xl bg-bode-ivory hover:bg-bode-ivoryDark text-bode-emerald flex items-center justify-center transition"
                      aria-label={`Quick retail check for ${item.name}`}
                      title="Retail / Cart Status"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setView({ mode: 'edit-item', categoryId: view.categoryId, item });
                      }}
                      className="w-9 h-9 rounded-xl bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest flex items-center justify-center transition"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BackofficeBottomBar
        mode="list"
        primaryLabel="Add Product"
        onPrimary={() =>
          setView({ mode: 'edit-item', categoryId: view.categoryId, item: null })
        }
      />
    </div>
  );
};

// ─── Edit / Create Product Form ──────────────────────────────────────────────

interface ProductItemFormProps {
  category?: BackofficeCategory;
  initialItem: BackofficeProductItem | null;
  nextPosition: number;
  onSave: (item: BackofficeProductItem, isNew: boolean) => void;
  onDelete: (itemId: string) => void;
  onCancel: () => void;
}

const ProductItemForm: React.FC<ProductItemFormProps> = ({
  category,
  initialItem,
  nextPosition,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isNew = !initialItem;
  const [form, setForm] = useState<BackofficeProductItem>(() =>
    initialItem
      ? {
          ...initialItem,
          variations: initialItem.variations.map((v) => ({ ...v })),
          descriptionPoints: [...initialItem.descriptionPoints],
          displayImages: [...initialItem.displayImages],
        }
      : {
          id: '',
          categoryId: category?.id || '',
          name: '',
          isActive: true,
          position: nextPosition,
          group: 'BOTH',
          hideFromCatalogue: false,
          nonDiscountable: false,
          price: 0,
          salePrice: undefined,
          storeSku: '',
          isRetail: false,
          variations: [],
          productTag: '',
          videoLink: '',
          benefits: '',
          ingredients: '',
          usageInstructions: '',
          descriptionPoints: [],
          displayImages: [],
        }
  );

  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; position?: string; price?: string }>({});
  const [confirmUnsaved, setConfirmUnsaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (updates: Partial<BackofficeProductItem>) => {
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
        id: isNew ? genId('bo-prd') : form.id,
        name: form.name.trim(),
        price: form.isRetail ? form.price : 0,
        descriptionPoints: form.descriptionPoints.map((p) => p.trim()).filter(Boolean),
        displayImages: form.displayImages.filter(Boolean),
      },
      isNew
    );
  };

  const addVariation = () => {
    const next: BackofficeProductVariation = {
      id: genId('var'),
      name: '',
      price: form.price || 0,
      sku: '',
    };
    patch({ variations: [...form.variations, next] });
  };

  const updateVariation = (idx: number, updates: Partial<BackofficeProductVariation>) => {
    patch({
      variations: form.variations.map((v, i) => (i === idx ? { ...v, ...updates } : v)),
    });
  };

  const removeVariation = (idx: number) => {
    patch({ variations: form.variations.filter((_, i) => i !== idx) });
  };

  const breadcrumb = `${category?.name || 'Products'} / ${isNew ? 'New Product' : form.name || 'Edit Product'}`;

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={breadcrumb}
        onBack={handleBackOrCancel}
        onDelete={!isNew ? () => setConfirmDelete(true) : undefined}
        deleteLabel="Delete Product"
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
                placeholder="Enter product name"
                className={boInputCls(Boolean(errors.name))}
              />
            </BackofficeField>

            <div className="pt-1 flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-bode-charcoal">Active</span>
              <BackofficeToggle
                checked={form.isActive}
                onChange={(v) => patch({ isActive: v })}
                ariaLabel="Product active status"
              />
            </div>
          </div>

          <BackofficeField label="Position" required error={errors.position} className="w-1/2 min-w-[140px]">
            <input
              type="number"
              min={1}
              value={form.position || ''}
              onChange={(e) => patch({ position: parseInt(e.target.value, 10) || 0 })}
              className={boInputCls(Boolean(errors.position))}
            />
          </BackofficeField>
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

          <div className="flex items-center justify-between p-3 rounded-xl bg-bode-ivory/50 border border-bode-border">
            <div>
              <p className="text-xs font-semibold text-bode-forest">Retail</p>
              <p className="text-[11px] text-bode-muted">
                {form.isRetail ? 'Enabled for retail sale' : 'Internal consumable (₹0)'}
              </p>
            </div>
            <BackofficeToggle
              checked={form.isRetail}
              onChange={(v) => patch({ isRetail: v })}
              ariaLabel="Retail product toggle"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Price (₹)" error={errors.price}>
              <input
                type="number"
                min={0}
                disabled={!form.isRetail}
                value={form.isRetail ? form.price : 0}
                onChange={(e) => patch({ price: Math.max(0, Number(e.target.value) || 0) })}
                className={`${boInputCls(Boolean(errors.price))} ${!form.isRetail ? 'bg-bode-ivory/60 text-bode-muted' : ''}`}
              />
            </BackofficeField>

            <BackofficeField label="Sale Price (₹)">
              <input
                type="number"
                min={0}
                disabled={!form.isRetail}
                value={form.isRetail ? form.salePrice ?? '' : ''}
                onChange={(e) =>
                  patch({
                    salePrice: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0),
                  })
                }
                placeholder="Optional"
                className={`${boInputCls()} ${!form.isRetail ? 'bg-bode-ivory/60 text-bode-muted' : ''}`}
              />
            </BackofficeField>
          </div>

          <BackofficeField label="Store SKU">
            <input
              type="text"
              value={form.storeSku || ''}
              onChange={(e) => patch({ storeSku: e.target.value })}
              placeholder="e.g. KAMA-ALM-1000"
              className={boInputCls()}
            />
          </BackofficeField>
        </BackofficeCard>

        {/* 4. Variations */}
        <BackofficeCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-bode-forest">Variations</h3>
            <button
              type="button"
              onClick={addVariation}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bode-ivory border border-bode-border text-xs font-semibold text-bode-forest hover:bg-bode-ivoryDark transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {form.variations.length === 0 ? (
            <p className="text-[11px] text-bode-muted">No variations added yet.</p>
          ) : (
            <div className="space-y-2">
              {form.variations.map((v, idx) => (
                <div key={v.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariation(idx, { name: e.target.value })}
                    placeholder="Variant (e.g. 500 ml)"
                    className={`${boInputCls()} col-span-5`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={v.price}
                    onChange={(e) => updateVariation(idx, { price: Number(e.target.value) || 0 })}
                    placeholder="Price"
                    className={`${boInputCls()} col-span-3`}
                  />
                  <input
                    type="text"
                    value={v.sku || ''}
                    onChange={(e) => updateVariation(idx, { sku: e.target.value })}
                    placeholder="SKU"
                    className={`${boInputCls()} col-span-3`}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariation(idx)}
                    className="col-span-1 p-2 rounded-xl text-red-500 hover:bg-red-50 flex justify-center"
                    aria-label="Remove variation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </BackofficeCard>

        {/* 5. Additional Information */}
        <BackofficeCard className="space-y-3.5">
          <h3 className="font-serif text-sm font-bold text-bode-forest border-b border-bode-border pb-2">
            Additional Information
          </h3>

          <BackofficeField label="Product Tag">
            <input
              type="text"
              value={form.productTag || ''}
              onChange={(e) => patch({ productTag: e.target.value })}
              placeholder="e.g. Organic, Ayurvedic"
              className={boInputCls()}
            />
          </BackofficeField>

          <BackofficeField label="Video Link (YouTube/Vimeo URL)">
            <input
              type="url"
              value={form.videoLink || ''}
              onChange={(e) => patch({ videoLink: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className={boInputCls()}
            />
          </BackofficeField>

          <BackofficeField label="Benefits">
            <textarea
              rows={2}
              value={form.benefits || ''}
              onChange={(e) => patch({ benefits: e.target.value })}
              placeholder="Key benefits..."
              className={boInputCls()}
            />
          </BackofficeField>

          <BackofficeField label="Ingredients">
            <textarea
              rows={2}
              value={form.ingredients || ''}
              onChange={(e) => patch({ ingredients: e.target.value })}
              placeholder="List ingredients..."
              className={boInputCls()}
            />
          </BackofficeField>

          <BackofficeField label="Usage Instructions">
            <textarea
              rows={2}
              value={form.usageInstructions || ''}
              onChange={(e) => patch({ usageInstructions: e.target.value })}
              placeholder="How to apply or use..."
              className={boInputCls()}
            />
          </BackofficeField>
        </BackofficeCard>

        {/* 6. Descriptions */}
        <BackofficeCard>
          <BackofficeDescriptionPoints
            points={form.descriptionPoints}
            onChange={(pts) => patch({ descriptionPoints: pts })}
          />
        </BackofficeCard>

        {/* 7. Display Images */}
        <BackofficeCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-bode-forest">Display Images</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.displayImages.map((imgUrl, idx) => (
              <BackofficeImageBox
                key={idx}
                imageUrl={imgUrl}
                onChange={(url) => {
                  if (!url) {
                    patch({ displayImages: form.displayImages.filter((_, i) => i !== idx) });
                  } else {
                    patch({
                      displayImages: form.displayImages.map((u, i) => (i === idx ? url : u)),
                    });
                  }
                }}
                heightClass="h-28"
              />
            ))}
            <BackofficeImageBox
              imageUrl={undefined}
              onChange={(url) => {
                if (url) patch({ displayImages: [...form.displayImages, url] });
              }}
              heightClass="h-28"
            />
          </div>
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
        message="You have unsaved edits on this product. Leaving now will discard your changes."
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
        title="Delete Product?"
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

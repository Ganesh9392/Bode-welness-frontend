import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ComingSoon } from '../components/ComingSoon';
import { ServiceCategoryRecord, ServiceItem } from '../types';
import {
  Sparkles,
  UserCheck,
  ShoppingBag,
  Award,
  Package,
  Gift,
  Globe,
  Plus,
  Edit3,
  X,
  Check,
  Clock,
} from 'lucide-react';

interface BackofficePageProps {
  onNavigate: (tab: string, visitId?: string) => void;
}

type BackofficeTab =
  | 'services'
  | 'staff'
  | 'products'
  | 'membership'
  | 'packages'
  | 'giftcard'
  | 'homepage';

export const BackofficePage: React.FC<BackofficePageProps> = ({ onNavigate }) => {
  const {
    serviceCategories,
    createCategory,
    updateCategory,
    branchServices,
    branchStaff,
    currentBranch,
  } = useApp();

  const [activeTab, setActiveTab] = useState<BackofficeTab>('services');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryRecord | null>(
    serviceCategories[0] || null
  );
  const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategoryRecord> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const tabs: { id: BackofficeTab; label: string; icon: React.ElementType; soon?: boolean }[] = [
    { id: 'services', label: 'Services', icon: Sparkles },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'products', label: 'Products', icon: ShoppingBag, soon: true },
    { id: 'membership', label: 'Membership', icon: Award, soon: true },
    { id: 'packages', label: 'Packages', icon: Package, soon: true },
    { id: 'giftcard', label: 'Gift Card', icon: Gift, soon: true },
    { id: 'homepage', label: 'Homepage', icon: Globe, soon: true },
  ];

  const handleTabClick = (tabId: BackofficeTab) => {
    if (tabId === 'staff') {
      onNavigate('staff');
      return;
    }
    setActiveTab(tabId);
  };

  const openNewCategoryModal = () => {
    setIsNewCategory(true);
    setEditingCategory({
      name: '',
      position: serviceCategories.length + 1,
      isActive: true,
      group: 'BOTH',
      hideFromCatalogue: false,
      assignedStaffIds: [],
    });
  };

  const openEditCategoryModal = (cat: ServiceCategoryRecord) => {
    setIsNewCategory(false);
    setEditingCategory({ ...cat });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name?.trim()) return;

    if (isNewCategory) {
      const created = createCategory({
        name: editingCategory.name.trim(),
        position: editingCategory.position || serviceCategories.length + 1,
        isActive: editingCategory.isActive ?? true,
        group: editingCategory.group || 'BOTH',
        hideFromCatalogue: editingCategory.hideFromCatalogue ?? false,
        assignedStaffIds: editingCategory.assignedStaffIds || [],
      });
      setSelectedCategory(created);
    } else if (editingCategory.id) {
      updateCategory(editingCategory.id, editingCategory);
      if (selectedCategory?.id === editingCategory.id) {
        setSelectedCategory({ ...selectedCategory, ...editingCategory } as ServiceCategoryRecord);
      }
    }
    setEditingCategory(null);
  };

  const toggleStaffInCategory = (staffId: string) => {
    if (!editingCategory) return;
    const current = editingCategory.assignedStaffIds || [];
    const next = current.includes(staffId)
      ? current.filter((id) => id !== staffId)
      : [...current, staffId];
    setEditingCategory({ ...editingCategory, assignedStaffIds: next });
  };

  const matchingServices: ServiceItem[] = branchServices.filter((s) => {
    if (!selectedCategory) return true;
    const catName = selectedCategory.name.toLowerCase();
    const sCat = s.category.toLowerCase();
    if (catName.includes('best seller')) return true;
    if (catName.includes('massage') && sCat.includes('massage')) return true;
    if (catName.includes('facial') && sCat.includes('facial')) return true;
    if (catName.includes('head') && s.name.toLowerCase().includes('head')) return true;
    if (catName.includes('foot') && s.name.toLowerCase().includes('foot')) return true;
    if (catName.includes('scrub') && sCat.includes('scrub')) return true;
    if (catName.includes('exclusive') && sCat.includes('exclusive')) return true;
    return sCat.includes(catName);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">Backoffice</h1>
      </div>

      {/* Horizontal Sub-section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 border transition ${
                isActive
                  ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                  : 'bg-white text-bode-charcoal border-bode-border hover:bg-bode-ivory'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-bode-gold' : 'text-bode-emerald'}`} />
              <span>{tab.label}</span>
              {tab.soon && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bode-ivory text-bode-muted font-bold">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Categories List */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-bode-border p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-bode-border">
              <h2 className="font-serif font-bold text-base text-bode-forest">
                Service Categories ({serviceCategories.length})
              </h2>
              <button
                type="button"
                onClick={openNewCategoryModal}
                className="px-3 py-1.5 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-bode-gold" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-2">
              {serviceCategories
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-bode-gold bg-bode-gold/10'
                          : 'border-bode-border bg-bode-ivory/30 hover:bg-bode-ivory'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-bode-muted">#{cat.position}</span>
                          <p className="font-serif font-bold text-sm text-bode-forest truncate">
                            {cat.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              cat.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white border border-bode-border text-bode-muted">
                            {cat.group}
                          </span>
                          <span className="text-bode-muted">
                            {cat.assignedStaffIds.length} staff
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCategoryModal(cat);
                        }}
                        className="p-2 rounded-lg hover:bg-white text-bode-emerald"
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Individual Services Under Category */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-bode-border p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-bode-border">
              <div>
                <h2 className="font-serif font-bold text-base text-bode-forest">
                  {selectedCategory ? `${selectedCategory.name} — Treatments` : 'All Treatments'}
                </h2>
                <p className="text-[11px] text-bode-muted">
                  Branch-specific pricing &amp; duration matrix for {currentBranch?.shortName}
                </p>
              </div>
              <span className="text-xs font-semibold text-bode-emerald">
                {matchingServices.length} service(s)
              </span>
            </div>

            {matchingServices.length === 0 ? (
              <div className="py-10 text-center text-xs text-bode-muted">
                No treatments configured under this category for {currentBranch?.shortName}.
              </div>
            ) : (
              <div className="space-y-3">
                {matchingServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-xl border border-bode-border bg-bode-ivory/30 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-sm text-bode-forest">
                          {srv.name}
                        </h3>
                        <p className="text-[11px] text-bode-muted mt-0.5">{srv.description}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                        Active
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {srv.durations.map((d) => (
                        <span
                          key={d.durationMinutes}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-bode-border text-xs font-semibold text-bode-forest"
                        >
                          <Clock className="w-3 h-3 text-bode-emerald" />
                          {d.durationMinutes} min — ₹{d.price.toLocaleString('en-IN')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <ComingSoon
          title="Products & Retail Catalogue"
          description="Configure spa retail products, stock levels, and product categories."
          icon={<ShoppingBag className="w-8 h-8" />}
        />
      )}
      {activeTab === 'membership' && (
        <ComingSoon
          title="Membership Plans"
          description="Create and manage Fixed, Percentage, Hourly, and Hybrid spa membership plans."
          icon={<Award className="w-8 h-8" />}
        />
      )}
      {activeTab === 'packages' && (
        <ComingSoon
          title="Treatment Packages"
          description="Bundle multiple spa therapies into discounted multi-session wellness packages."
          icon={<Package className="w-8 h-8" />}
        />
      )}
      {activeTab === 'giftcard' && (
        <ComingSoon
          title="Gift Cards & Vouchers"
          description="Issue and track digital or physical BODE Wellness Spa gift cards."
          icon={<Gift className="w-8 h-8" />}
        />
      )}
      {activeTab === 'homepage' && (
        <ComingSoon
          title="Digital Catalogue & Homepage"
          description="Customize promotional banners, trending treatments, and branch QR code menus."
          icon={<Globe className="w-8 h-8" />}
        />
      )}

      {/* Category Create / Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-bode-border max-w-md w-full overflow-hidden">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold">
                {isNewCategory ? 'Add Service Category' : 'Edit Service Category'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-bode-muted mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-bode-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-bode-muted mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingCategory.position || 1}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        position: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-bode-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-bode-muted mb-1">
                    Group
                  </label>
                  <select
                    value={editingCategory.group || 'BOTH'}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        group: e.target.value as ServiceCategoryRecord['group'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-bode-border bg-white"
                  >
                    <option value="BOTH">Both</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bode-ivory/60 border border-bode-border">
                <span className="font-semibold text-bode-forest">Active Status</span>
                <input
                  type="checkbox"
                  checked={editingCategory.isActive ?? true}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, isActive: e.target.checked })
                  }
                  className="w-4 h-4 accent-bode-forest"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bode-ivory/60 border border-bode-border">
                <span className="font-semibold text-bode-forest">Hide from Catalogue</span>
                <input
                  type="checkbox"
                  checked={editingCategory.hideFromCatalogue ?? false}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      hideFromCatalogue: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-bode-forest"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-bode-muted mb-1.5">
                  Assigned Branch Staff
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {branchStaff.map((st) => {
                    const selected = (editingCategory.assignedStaffIds || []).includes(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleStaffInCategory(st.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 transition ${
                          selected
                            ? 'bg-bode-forest text-white border-bode-forest'
                            : 'bg-white text-bode-charcoal border-bode-border'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-bode-gold" />}
                        <span>{st.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bode-border">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-lg border border-bode-border font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-bode-forest text-white font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

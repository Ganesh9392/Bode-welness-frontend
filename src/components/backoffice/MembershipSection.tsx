import React, { useState, useEffect } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import {
  BackofficeMembershipPlan,
  BackofficeServiceItem,
  MembershipType,
} from '../../types/backoffice';
import { formatINR, genId } from '../../services/backofficeService';
import {
  BackofficeBottomBar,
  BackofficeCard,
  BackofficeConfirmDialog,
  BackofficeEmptyState,
  BackofficeField,
  BackofficeListSkeleton,
  BackofficeMultiSelect,
  BackofficeRadioGroup,
  BackofficeSearchBar,
  BackofficeSubHeader,
  BackofficeToggle,
  boInputCls,
} from './BackofficeSharedUI';

interface MembershipSectionProps {
  plans: BackofficeMembershipPlan[];
  services: BackofficeServiceItem[];
  onSavePlan: (plan: BackofficeMembershipPlan, isNew: boolean) => void;
  onDeletePlan: (planId: string) => void;
  onBackToHub: () => void;
}

const TYPE_SUFFIX: Record<MembershipType, string> = {
  HOURLY: 'Hou',
  FIXED: 'Fix',
  PERCENTAGE: 'Pct',
  HYBRID: 'Hyb',
};

export const MembershipSection: React.FC<MembershipSectionProps> = ({
  plans,
  services,
  onSavePlan,
  onDeletePlan,
  onBackToHub,
}) => {
  const [editingPlan, setEditingPlan] = useState<BackofficeMembershipPlan | null | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(t);
  }, []);

  if (editingPlan !== undefined) {
    return (
      <MembershipForm
        initialPlan={editingPlan}
        services={services}
        onSave={(plan, isNew) => {
          onSavePlan(plan, isNew);
          setEditingPlan(undefined);
        }}
        onDelete={(planId) => {
          onDeletePlan(planId);
          setEditingPlan(undefined);
        }}
        onCancel={() => setEditingPlan(undefined)}
      />
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = plans
    .filter((p) => showInactive || p.isActive)
    .filter((p) => !q || p.name.toLowerCase().includes(q));

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title="Memberships"
        onBack={onBackToHub}
        menuActions={[
          {
            label: showInactive ? 'Hide Inactive Plans' : 'Show All Plans',
            onClick: () => setShowInactive((v) => !v),
          },
          {
            label: 'Create New Plan',
            onClick: () => setEditingPlan(null),
          },
        ]}
      />

      <div className="max-w-3xl mx-auto space-y-3">
        <BackofficeSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search membership plans..."
        />

        {loading ? (
          <BackofficeListSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <BackofficeEmptyState
            hasSearch={Boolean(q)}
            onClearSearch={() => setSearchQuery('')}
            message="No items yet, tap Create New Plan to create one"
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setEditingPlan(plan)}
                className={`w-full text-left bg-white rounded-2xl border border-bode-border px-4 py-4 shadow-sm flex items-center justify-between gap-3 hover:bg-bode-ivory/40 transition ${
                  !plan.isActive ? 'opacity-55' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium text-sm truncate ${
                      plan.isActive ? 'text-bode-charcoal' : 'text-bode-muted'
                    }`}
                  >
                    {plan.name} ({TYPE_SUFFIX[plan.type]})
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
        primaryLabel="Create New Plan"
        onPrimary={() => setEditingPlan(null)}
      />
    </div>
  );
};

// ─── Create / Update Membership Form ─────────────────────────────────────────

interface MembershipFormProps {
  initialPlan: BackofficeMembershipPlan | null;
  services: BackofficeServiceItem[];
  onSave: (plan: BackofficeMembershipPlan, isNew: boolean) => void;
  onDelete: (planId: string) => void;
  onCancel: () => void;
}

const MembershipForm: React.FC<MembershipFormProps> = ({
  initialPlan,
  services,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isNew = !initialPlan;
  const [form, setForm] = useState<BackofficeMembershipPlan>(() =>
    initialPlan
      ? { ...initialPlan, specificServiceIds: [...initialPlan.specificServiceIds] }
      : {
          id: '',
          type: 'HOURLY',
          name: '',
          isActive: true,
          fees: 0,
          validityDays: 90,
          renewalReminderDays: 15,
          totalHours: 10,
          creditValue: 0,
          discountPercentage: 10,
          isShareable: false,
          maxShareCount: 2,
          hasSpecificServices: false,
          specificServiceIds: [],
        }
  );

  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    fees?: string;
    validityDays?: string;
    totalHours?: string;
    discountPercentage?: string;
  }>({});
  const [confirmUnsaved, setConfirmUnsaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (updates: Partial<BackofficeMembershipPlan>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    setErrors((e) => ({
      ...e,
      ...(updates.name !== undefined ? { name: undefined } : {}),
      ...(updates.fees !== undefined ? { fees: undefined } : {}),
      ...(updates.validityDays !== undefined ? { validityDays: undefined } : {}),
      ...(updates.totalHours !== undefined ? { totalHours: undefined } : {}),
      ...(updates.discountPercentage !== undefined ? { discountPercentage: undefined } : {}),
    }));
  };

  const handleBackOrCancel = () => {
    if (isDirty) setConfirmUnsaved(true);
    else onCancel();
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Plan name is required.';
    if (!form.fees || form.fees <= 0) nextErrors.fees = 'Fees must be greater than 0.';
    if (!form.validityDays || form.validityDays <= 0)
      nextErrors.validityDays = 'Validity must be at least 1 day.';
    if ((form.type === 'HOURLY' || form.type === 'HYBRID') && (!form.totalHours || form.totalHours <= 0)) {
      nextErrors.totalHours = 'Total hours must be greater than 0.';
    }
    if (
      (form.type === 'PERCENTAGE' || form.type === 'HYBRID') &&
      (form.discountPercentage === undefined || form.discountPercentage <= 0 || form.discountPercentage > 100)
    ) {
      nextErrors.discountPercentage = 'Enter a discount between 1% and 100%.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(
      {
        ...form,
        id: isNew ? genId('mem') : form.id,
        name: form.name.trim(),
      },
      isNew
    );
  };

  const totalToPay = Number(form.fees) || 0;

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={isNew ? 'Create Membership' : 'Update Membership'}
        onBack={handleBackOrCancel}
        onDelete={!isNew ? () => setConfirmDelete(true) : undefined}
        deleteLabel="Delete Membership"
      />

      <div className="max-w-3xl mx-auto">
        <BackofficeCard className="space-y-5">
          {/* Membership Type */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-bode-muted">
              MEMBERSHIP TYPE
            </p>
            <BackofficeRadioGroup<MembershipType>
              columns={4}
              value={form.type}
              onChange={(t) => patch({ type: t })}
              options={[
                { value: 'FIXED', label: 'Fixed' },
                { value: 'PERCENTAGE', label: 'Percentage' },
                { value: 'HOURLY', label: 'Hourly' },
                { value: 'HYBRID', label: 'Hybrid' },
              ]}
            />
          </div>

          {/* Plan Name + Active Checkbox */}
          <div className="flex items-start gap-3">
            <BackofficeField label="Plan name" required error={errors.name} className="flex-1">
              <input
                type="text"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Platinum"
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

          {/* Fees & Validity */}
          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Fees (₹)" required error={errors.fees}>
              <input
                type="number"
                min={0}
                value={form.fees || ''}
                onChange={(e) => patch({ fees: Math.max(0, Number(e.target.value) || 0) })}
                className={boInputCls(Boolean(errors.fees))}
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

          {/* Adaptive Fields per Membership Type */}
          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Renewal reminder">
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
                placeholder="Days"
                className={boInputCls()}
              />
            </BackofficeField>

            {(form.type === 'HOURLY' || form.type === 'HYBRID') && (
              <BackofficeField label="Total hours" error={errors.totalHours}>
                <input
                  type="number"
                  min={1}
                  value={form.totalHours ?? ''}
                  onChange={(e) => patch({ totalHours: Number(e.target.value) || 0 })}
                  className={boInputCls(Boolean(errors.totalHours))}
                />
              </BackofficeField>
            )}

            {(form.type === 'FIXED' || form.type === 'HYBRID') && (
              <BackofficeField label="Credit Value (₹)">
                <input
                  type="number"
                  min={0}
                  value={form.creditValue ?? ''}
                  onChange={(e) => patch({ creditValue: Math.max(0, Number(e.target.value) || 0) })}
                  placeholder="Wallet value"
                  className={boInputCls()}
                />
              </BackofficeField>
            )}

            {(form.type === 'PERCENTAGE' || form.type === 'HYBRID') && (
              <BackofficeField label="Discount (%)" error={errors.discountPercentage}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.discountPercentage ?? ''}
                  onChange={(e) => patch({ discountPercentage: Number(e.target.value) || 0 })}
                  className={boInputCls(Boolean(errors.discountPercentage))}
                />
              </BackofficeField>
            )}
          </div>

          {/* Membership Shareable */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-bode-charcoal">
                  Membership Shareable
                </p>
                <p className="text-[11px] text-bode-muted">Allow sharing with family</p>
              </div>
              <BackofficeToggle
                checked={form.isShareable}
                onChange={(v) => patch({ isShareable: v })}
                ariaLabel="Membership Shareable"
              />
            </div>

            {form.isShareable && (
              <BackofficeField label="Max share count">
                <input
                  type="number"
                  min={1}
                  value={form.maxShareCount ?? 1}
                  onChange={(e) => patch({ maxShareCount: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className={boInputCls()}
                />
              </BackofficeField>
            )}
          </div>

          {/* Specific Services */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs sm:text-sm font-semibold text-bode-charcoal">
                Specific services
              </p>
              <BackofficeToggle
                checked={form.hasSpecificServices}
                onChange={(v) => patch({ hasSpecificServices: v })}
                ariaLabel="Specific services"
              />
            </div>

            {form.hasSpecificServices && (
              <BackofficeMultiSelect
                options={services.map((s) => ({
                  id: s.id,
                  label: `${s.name} (${formatINR(s.price)})`,
                }))}
                selectedIds={form.specificServiceIds}
                onChange={(ids) => patch({ specificServiceIds: ids })}
                placeholder="Select eligible services..."
              />
            )}
          </div>

          {/* TOTAL TO PAY Summary Card */}
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

      <BackofficeConfirmDialog
        open={confirmUnsaved}
        title="Discard Unsaved Changes?"
        message="You have unsaved edits on this membership plan."
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
        title="Delete Membership Plan?"
        message={`Are you sure you want to delete "${form.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (initialPlan) onDelete(initialPlan.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

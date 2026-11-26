import React, { useState, useEffect } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { BackofficeGiftCard } from '../../types/backoffice';
import { formatINR, genId } from '../../services/backofficeService';
import {
  BackofficeBottomBar,
  BackofficeCard,
  BackofficeConfirmDialog,
  BackofficeEmptyState,
  BackofficeField,
  BackofficeListSkeleton,
  BackofficeSearchBar,
  BackofficeSubHeader,
  boInputCls,
} from './BackofficeSharedUI';

interface GiftCardSectionProps {
  giftCards: BackofficeGiftCard[];
  onSaveGiftCard: (card: BackofficeGiftCard, isNew: boolean) => void;
  onDeleteGiftCard: (cardId: string) => void;
  onBackToHub: () => void;
}

export const GiftCardSection: React.FC<GiftCardSectionProps> = ({
  giftCards,
  onSaveGiftCard,
  onDeleteGiftCard,
  onBackToHub,
}) => {
  const [editingCard, setEditingCard] = useState<BackofficeGiftCard | null | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(t);
  }, []);

  if (editingCard !== undefined) {
    return (
      <GiftCardForm
        initialCard={editingCard}
        onSave={(card, isNew) => {
          onSaveGiftCard(card, isNew);
          setEditingCard(undefined);
        }}
        onDelete={(cardId) => {
          onDeleteGiftCard(cardId);
          setEditingCard(undefined);
        }}
        onCancel={() => setEditingCard(undefined)}
      />
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = giftCards
    .filter((g) => showInactive || g.isActive)
    .filter((g) => !q || g.name.toLowerCase().includes(q));

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title="Gift Cards"
        onBack={onBackToHub}
        menuActions={[
          {
            label: showInactive ? 'Hide Inactive Gift Cards' : 'Show All Gift Cards',
            onClick: () => setShowInactive((v) => !v),
          },
          {
            label: 'Create New Gift Card',
            onClick: () => setEditingCard(null),
          },
        ]}
      />

      <div className="max-w-3xl mx-auto space-y-3">
        <BackofficeSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search gift cards..."
        />

        {loading ? (
          <BackofficeListSkeleton rows={3} />
        ) : filtered.length === 0 ? (
          <BackofficeEmptyState
            hasSearch={Boolean(q)}
            onClearSearch={() => setSearchQuery('')}
            message="No items yet, tap Create New Gift Card to create one"
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setEditingCard(card)}
                className={`w-full text-left bg-white rounded-2xl border border-bode-border px-4 py-4 shadow-sm flex items-center justify-between gap-3 hover:bg-bode-ivory/40 transition ${
                  !card.isActive ? 'opacity-55' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-bode-charcoal truncate">{card.name}</p>
                  <p className="text-[11px] text-bode-muted mt-0.5">
                    {formatINR(card.amount)} • {card.validityDays} days
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
        primaryLabel="Create New Gift Card"
        onPrimary={() => setEditingCard(null)}
      />
    </div>
  );
};

// ─── Create / Update Gift Card Form ──────────────────────────────────────────

interface GiftCardFormProps {
  initialCard: BackofficeGiftCard | null;
  onSave: (card: BackofficeGiftCard, isNew: boolean) => void;
  onDelete: (cardId: string) => void;
  onCancel: () => void;
}

const GiftCardForm: React.FC<GiftCardFormProps> = ({
  initialCard,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isNew = !initialCard;
  const [form, setForm] = useState<BackofficeGiftCard>(() =>
    initialCard
      ? { ...initialCard }
      : {
          id: '',
          name: '',
          isActive: true,
          description: '',
          amount: 0,
          validityDays: 30,
          renewalReminderDays: 3,
        }
  );

  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; amount?: string; validityDays?: string }>(
    {}
  );
  const [confirmUnsaved, setConfirmUnsaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (updates: Partial<BackofficeGiftCard>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    setErrors((e) => ({
      ...e,
      ...(updates.name !== undefined ? { name: undefined } : {}),
      ...(updates.amount !== undefined ? { amount: undefined } : {}),
      ...(updates.validityDays !== undefined ? { validityDays: undefined } : {}),
    }));
  };

  const handleBackOrCancel = () => {
    if (isDirty) setConfirmUnsaved(true);
    else onCancel();
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Gift card name is required.';
    if (!form.amount || form.amount <= 0) nextErrors.amount = 'Amount must be greater than 0.';
    if (!form.validityDays || form.validityDays <= 0)
      nextErrors.validityDays = 'Validity must be at least 1 day.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(
      {
        ...form,
        id: isNew ? genId('gc') : form.id,
        name: form.name.trim(),
        description: form.description?.trim() || '',
      },
      isNew
    );
  };

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={isNew ? 'Create Gift Card' : 'Update Gift Card'}
        onBack={handleBackOrCancel}
        onDelete={!isNew ? () => setConfirmDelete(true) : undefined}
        deleteLabel="Delete Gift Card"
      />

      <div className="max-w-3xl mx-auto">
        <BackofficeCard className="space-y-4">
          <div className="flex items-start gap-3">
            <BackofficeField label="Name" required error={errors.name} className="flex-1">
              <input
                type="text"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. First time use"
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

          <BackofficeField label="Description">
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Gift card usage details..."
              className={boInputCls()}
            />
          </BackofficeField>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Amount" required error={errors.amount}>
              <input
                type="number"
                min={0}
                value={form.amount || ''}
                onChange={(e) => patch({ amount: Math.max(0, Number(e.target.value) || 0) })}
                className={boInputCls(Boolean(errors.amount))}
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
        message="You have unsaved edits on this gift card."
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
        title="Delete Gift Card?"
        message={`Are you sure you want to delete "${form.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (initialCard) onDelete(initialCard.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

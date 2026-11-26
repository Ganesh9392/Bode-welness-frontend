import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  ImagePlus,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  AudienceGroup,
  BackofficeCategory,
  BackofficeStaffMember,
  BackofficeToast,
} from '../../types/backoffice';

// ─── Shared Header for Inner Screens ─────────────────────────────────────────

export interface MenuAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface BackofficeSubHeaderProps {
  title: string;
  onBack: () => void;
  menuActions?: MenuAction[];
  onDelete?: () => void;
  deleteLabel?: string;
}

export const BackofficeSubHeader: React.FC<BackofficeSubHeaderProps> = ({
  title,
  onBack,
  menuActions,
  onDelete,
  deleteLabel = 'Delete',
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-16 z-20 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-3 bg-bode-ivory/95 backdrop-blur-sm border-b border-bode-border flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-1 rounded-xl text-bode-forest hover:bg-white border border-transparent hover:border-bode-border transition shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-base sm:text-xl font-bold text-bode-forest truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
            aria-label={deleteLabel}
            title={deleteLabel}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {menuActions && menuActions.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-bode-forest hover:bg-white border border-transparent hover:border-bode-border transition"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-bode-border py-1 z-40 animate-fade-in">
                  {menuActions.map((act, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        act.onClick();
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition ${
                        act.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-bode-charcoal hover:bg-bode-ivory hover:text-bode-forest'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Fixed Bottom Action Bar ─────────────────────────────────────────────────

interface BackofficeBottomBarProps {
  mode: 'list' | 'form';
  primaryLabel: string;
  onPrimary: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const BackofficeBottomBar: React.FC<BackofficeBottomBarProps> = ({
  mode,
  primaryLabel,
  onPrimary,
  onCancel,
  disabled = false,
}) => {
  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-64 z-30 bg-white/95 backdrop-blur-sm border-t border-bode-border px-4 py-3 shadow-[0_-4px_16px_rgba(7,63,50,0.08)]">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        {mode === 'form' && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-bode-forest text-bode-forest bg-white hover:bg-bode-ivory text-xs sm:text-sm font-semibold transition"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onPrimary}
          disabled={disabled}
          className="flex-1 py-3 px-4 rounded-xl bg-bode-forest hover:bg-bode-forestLight disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
        >
          <span>{primaryLabel}</span>
        </button>
      </div>
    </div>
  );
};

// ─── Card & Form Primitives ──────────────────────────────────────────────────

export const BackofficeCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-bode-border p-4 shadow-sm ${className}`}>
    {children}
  </div>
);

export const BackofficeField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, required, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-bode-charcoal mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-600 mt-1 font-medium">{error}</p>}
  </div>
);

export const boInputCls = (hasError?: boolean) =>
  `w-full text-xs sm:text-sm text-bode-charcoal bg-white border ${
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-bode-border focus:ring-bode-forest'
  } rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition placeholder:text-bode-muted/60`;

// ─── Pill Toggle Switch ──────────────────────────────────────────────────────

export const BackofficeToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}> = ({ checked, onChange, ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-bode-forest/40 ${
      checked ? 'bg-bode-forest' : 'bg-bode-border'
    }`}
  >
    <span
      className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    >
      {checked && <Check className="w-3 h-3 text-bode-forest stroke-[3]" />}
    </span>
  </button>
);

// ─── Radio Group ─────────────────────────────────────────────────────────────

export function BackofficeRadioGroup<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  columns?: 2 | 3 | 4;
}) {
  const gridCls =
    columns === 2
      ? 'grid-cols-2'
      : columns === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-3';

  return (
    <div className={`grid ${gridCls} gap-2`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 py-2 px-1.5 rounded-xl text-left text-xs sm:text-sm font-medium text-bode-charcoal hover:bg-bode-ivory/50 transition"
          >
            <span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                selected ? 'border-bode-forest' : 'border-bode-border'
              }`}
            >
              {selected && <span className="w-2.5 h-2.5 rounded-full bg-bode-forest" />}
            </span>
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Search Bar ──────────────────────────────────────────────────────────────

export const BackofficeSearchBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search items...' }) => (
  <div className="relative">
    <Search className="w-4 h-4 text-bode-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-bode-border bg-white text-xs sm:text-sm text-bode-charcoal placeholder:text-bode-muted/70 focus:outline-none focus:ring-2 focus:ring-bode-forest shadow-sm"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-bode-muted hover:text-bode-forest"
        aria-label="Clear search"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

// ─── Image Upload Box (Add Image / Edit / Delete) ────────────────────────────

export const BackofficeImageBox: React.FC<{
  label?: string;
  imageUrl?: string;
  onChange: (url: string | undefined) => void;
  heightClass?: string;
}> = ({ label, imageUrl, onChange, heightClass = 'h-32' }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState(imageUrl || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      {label && <p className="text-xs font-medium text-bode-charcoal mb-1.5">{label}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {imageUrl ? (
        <div className={`relative ${heightClass} w-full rounded-xl overflow-hidden border border-bode-border bg-bode-ivory/40 group`}>
          <img src={imageUrl} alt={label || 'Uploaded'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-9 h-9 rounded-lg bg-white/95 text-bode-forest shadow flex items-center justify-center hover:bg-white transition"
              aria-label="Edit image"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="w-9 h-9 rounded-lg bg-white/95 text-red-600 shadow flex items-center justify-center hover:bg-white transition"
              aria-label="Delete image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${heightClass} w-full rounded-xl border border-dashed border-bode-border bg-bode-ivory/50 hover:bg-bode-ivory flex flex-col items-center justify-center gap-1.5 transition p-2`}
        >
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1 text-bode-emerald hover:text-bode-forest font-semibold text-xs"
          >
            <ImagePlus className="w-5 h-5" />
            <span>Add Image</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUrlInput('');
              setShowUrlModal(true);
            }}
            className="text-[10px] text-bode-muted hover:text-bode-forest underline"
          >
            or paste URL
          </button>
        </div>
      )}

      {showUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-bode-border shadow-2xl max-w-sm w-full p-5 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-bode-forest">Image URL</h3>
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="p-1 rounded-lg text-bode-muted hover:text-bode-forest"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={boInputCls()}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="px-3.5 py-2 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim()) onChange(urlInput.trim());
                  setShowUrlModal(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Multi-Select Dropdown with Removable Chips ──────────────────────────────

export const BackofficeMultiSelect: React.FC<{
  options: { id: string; label: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}> = ({ options, selectedIds, onChange, placeholder = 'Select items...' }) => {
  const [open, setOpen] = useState(false);

  const toggleId = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedItems = options.filter((o) => selectedIds.includes(o.id));

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-bode-border bg-white text-xs sm:text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-bode-forest"
        >
          <span className={selectedIds.length > 0 ? 'text-bode-charcoal font-medium' : 'text-bode-muted'}>
            {selectedIds.length > 0 ? `${selectedIds.length} Selected` : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-bode-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white rounded-xl border border-bode-border shadow-xl z-40 divide-y divide-bode-border/50">
              {options.length === 0 ? (
                <div className="p-3 text-xs text-bode-muted text-center">No options available</div>
              ) : (
                options.map((opt) => {
                  const checked = selectedIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleId(opt.id)}
                      className="w-full px-3.5 py-2.5 text-xs flex items-center justify-between gap-2 hover:bg-bode-ivory/60 transition text-left"
                    >
                      <span className="font-medium text-bode-charcoal truncate">{opt.label}</span>
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          checked
                            ? 'bg-bode-forest border-bode-forest text-white'
                            : 'border-bode-border bg-white'
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bode-ivory border border-bode-border text-xs font-medium text-bode-forest"
            >
              <span className="truncate max-w-[160px]">{item.label}</span>
              <button
                type="button"
                onClick={() => toggleId(item.id)}
                className="text-red-500 hover:text-red-700 p-0.5"
                aria-label={`Remove ${item.label}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Description Points Editor (Point 1...n) ─────────────────────────────────

export const BackofficeDescriptionPoints: React.FC<{
  points: string[];
  onChange: (points: string[]) => void;
}> = ({ points, onChange }) => {
  const updatePoint = (idx: number, val: string) => {
    const next = [...points];
    next[idx] = val;
    onChange(next);
  };

  const removePoint = (idx: number) => {
    onChange(points.filter((_, i) => i !== idx));
  };

  const addPoint = () => {
    onChange([...points, '']);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-bode-charcoal">Descriptions</span>
        <button
          type="button"
          onClick={addPoint}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bode-ivory border border-bode-border text-xs font-semibold text-bode-forest hover:bg-bode-ivoryDark transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {points.length === 0 ? (
        <p className="text-[11px] text-bode-muted py-1">No description points yet. Tap + Add to add one.</p>
      ) : (
        <div className="space-y-2">
          {points.map((pt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={pt}
                onChange={(e) => updatePoint(idx, e.target.value)}
                placeholder={`Point ${idx + 1}`}
                className={boInputCls()}
              />
              <button
                type="button"
                onClick={() => removePoint(idx)}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-bode-border shrink-0"
                aria-label={`Remove Point ${idx + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Confirmation Dialog ─────────────────────────────────────────────────────

export const BackofficeConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-bode-border shadow-2xl max-w-sm w-full p-5 space-y-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              danger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-base font-bold text-bode-forest">{title}</h3>
            <p className="text-xs text-bode-muted mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-xs font-semibold text-bode-charcoal transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-bode-forest hover:bg-bode-forestLight'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toast Container ─────────────────────────────────────────────────────────

export const BackofficeToastContainer: React.FC<{
  toasts: BackofficeToast[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-20 right-3 sm:right-6 z-50 space-y-2 max-w-xs w-[calc(100vw-1.5rem)] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-medium animate-fade-in ${
            t.type === 'success'
              ? 'bg-bode-forest text-white border-bode-emerald'
              : t.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-white text-bode-charcoal border-bode-border'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-bode-gold shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-white shrink-0" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-bode-emerald shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="opacity-75 hover:opacity-100"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Loading Skeleton & Empty State ──────────────────────────────────────────

export const BackofficeListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-bode-border p-4 flex items-center justify-between gap-3 animate-pulse"
      >
        <div className="space-y-2 flex-1">
          <div className="h-4 w-44 bg-bode-ivoryDark rounded-md" />
          <div className="h-3 w-24 bg-bode-ivory rounded-md" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-bode-ivoryDark shrink-0" />
      </div>
    ))}
  </div>
);

export const BackofficeEmptyState: React.FC<{
  message?: string;
  onClearSearch?: () => void;
  hasSearch?: boolean;
}> = ({
  message = 'No items yet, tap Add to create one',
  onClearSearch,
  hasSearch = false,
}) => (
  <div className="bg-white rounded-2xl border border-bode-border p-8 text-center space-y-2 shadow-sm">
    <p className="text-sm font-serif font-semibold text-bode-forest">
      {hasSearch ? 'No matching items found' : 'Nothing here yet'}
    </p>
    <p className="text-xs text-bode-muted">
      {hasSearch ? 'Try adjusting your search keywords.' : message}
    </p>
    {hasSearch && onClearSearch && (
      <button
        type="button"
        onClick={onClearSearch}
        className="mt-2 px-3.5 py-1.5 rounded-xl border border-bode-border text-xs font-semibold text-bode-forest hover:bg-bode-ivory transition"
      >
        Clear Search
      </button>
    )}
  </div>
);

// ─── Shared Category List View (Services & Products) ──────────────────────────

interface CategoryListViewProps {
  title: string;
  categories: BackofficeCategory[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
  onBack: () => void;
  onSelectCategory: (cat: BackofficeCategory) => void;
  onEditCategory: (cat: BackofficeCategory) => void;
  onAddNew: () => void;
  menuActions?: MenuAction[];
}

export const CategoryListView: React.FC<CategoryListViewProps> = ({
  title,
  categories,
  searchQuery,
  onSearchChange,
  loading,
  onBack,
  onSelectCategory,
  onEditCategory,
  onAddNew,
  menuActions,
}) => {
  const q = searchQuery.trim().toLowerCase();
  const filtered = categories
    .slice()
    .sort((a, b) => a.position - b.position)
    .filter((c) => !q || c.name.toLowerCase().includes(q));

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader title={title} onBack={onBack} menuActions={menuActions} />

      <div className="max-w-3xl mx-auto space-y-3">
        <BackofficeSearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search categories..."
        />

        <p className="text-xs sm:text-sm font-serif font-bold text-bode-forest pt-1">
          Categories
        </p>

        {loading ? (
          <BackofficeListSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <BackofficeEmptyState
            hasSearch={Boolean(q)}
            onClearSearch={() => onSearchChange('')}
            message="No categories yet, tap Add New to create one"
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className={`bg-white rounded-2xl border border-bode-border border-l-4 ${
                  cat.isActive ? 'border-l-bode-forest' : 'border-l-bode-border opacity-60'
                } px-4 py-3.5 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:bg-bode-ivory/40 transition`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-bode-charcoal truncate">
                    {cat.name}
                  </p>
                  {(!cat.isActive || cat.hideFromCatalogue) && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {!cat.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                          Inactive
                        </span>
                      )}
                      {cat.hideFromCatalogue && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold">
                          Hidden
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(cat);
                    }}
                    className="w-9 h-9 rounded-xl bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest flex items-center justify-center transition"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-bode-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BackofficeBottomBar mode="list" primaryLabel="Add New" onPrimary={onAddNew} />
    </div>
  );
};

// ─── Shared Category Edit / Create Form (Services & Products) ────────────────

interface CategoryFormViewProps {
  kind: 'service' | 'product';
  initialCategory: BackofficeCategory | null;
  nextPosition: number;
  staffList: BackofficeStaffMember[];
  onSave: (category: BackofficeCategory, isNew: boolean) => void;
  onDelete?: (categoryId: string) => void;
  onCancel: () => void;
}

export const CategoryFormView: React.FC<CategoryFormViewProps> = ({
  kind,
  initialCategory,
  nextPosition,
  staffList,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isNew = !initialCategory;
  const [form, setForm] = useState<BackofficeCategory>(() =>
    initialCategory
      ? { ...initialCategory, assignedStaffIds: [...initialCategory.assignedStaffIds] }
      : {
          id: '',
          kind,
          name: '',
          isActive: true,
          position: nextPosition,
          group: 'BOTH',
          hideFromCatalogue: false,
          assignedStaffIds: [],
        }
  );
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; position?: string }>({});
  const [confirmUnsaved, setConfirmUnsaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (updates: Partial<BackofficeCategory>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
    if (updates.name !== undefined && errors.name) setErrors((e) => ({ ...e, name: undefined }));
    if (updates.position !== undefined && errors.position) setErrors((e) => ({ ...e, position: undefined }));
  };

  const handleBackOrCancel = () => {
    if (isDirty) {
      setConfirmUnsaved(true);
    } else {
      onCancel();
    }
  };

  const handleSubmit = () => {
    const nextErrors: { name?: string; position?: string } = {};
    if (!form.name.trim()) nextErrors.name = 'Category name is required.';
    if (!form.position || form.position < 1) nextErrors.position = 'Position must be 1 or greater.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave({ ...form, name: form.name.trim() }, isNew);
  };

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title={isNew ? 'Add Category' : form.name || 'Edit Category'}
        onBack={handleBackOrCancel}
        onDelete={!isNew && onDelete ? () => setConfirmDelete(true) : undefined}
        deleteLabel="Delete Category"
      />

      <div className="max-w-3xl mx-auto space-y-3.5">
        {/* Card 1: Name, Active, Position */}
        <BackofficeCard className="space-y-4">
          <div className="flex items-start gap-3">
            <BackofficeField label="Category Name" required error={errors.name} className="flex-1">
              <input
                type="text"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Enter category name"
                className={boInputCls(Boolean(errors.name))}
              />
            </BackofficeField>

            <div className="pt-1 flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-bode-charcoal">Active</span>
              <BackofficeToggle
                checked={form.isActive}
                onChange={(val) => patch({ isActive: val })}
                ariaLabel="Category active status"
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

        {/* Card 2: Group & Hide from Catalogue */}
        <BackofficeCard className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-semibold text-bode-charcoal">Group</span>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-bode-charcoal">Hide from Catalogue</span>
              <BackofficeToggle
                checked={form.hideFromCatalogue}
                onChange={(val) => patch({ hideFromCatalogue: val })}
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

        {/* Card 3: Icons (Both OR Female + Male) */}
        <BackofficeCard className="space-y-4">
          <h3 className="text-xs sm:text-sm font-semibold text-bode-charcoal">Icons</h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
            <div className="sm:col-span-5">
              <BackofficeImageBox
                label="Both"
                imageUrl={form.imageBothUrl}
                onChange={(url) => patch({ imageBothUrl: url })}
                heightClass="h-36"
              />
            </div>
            <div className="sm:col-span-2 text-center text-xs font-semibold text-bode-muted py-1">
              OR
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeImageBox
              label="Female"
              imageUrl={form.imageFemaleUrl}
              onChange={(url) => patch({ imageFemaleUrl: url })}
              heightClass="h-32"
            />
            <BackofficeImageBox
              label="Male"
              imageUrl={form.imageMaleUrl}
              onChange={(url) => patch({ imageMaleUrl: url })}
              heightClass="h-32"
            />
          </div>
        </BackofficeCard>

        {/* Card 4: Assigned Staffs (for Services) */}
        {kind === 'service' && (
          <BackofficeCard className="space-y-2.5">
            <h3 className="text-xs sm:text-sm font-semibold text-bode-charcoal">Assigned Staffs</h3>
            <BackofficeMultiSelect
              options={staffList.map((s) => ({ id: s.id, label: s.displayName }))}
              selectedIds={form.assignedStaffIds}
              onChange={(ids) => patch({ assignedStaffIds: ids })}
              placeholder="Select staff members..."
            />
          </BackofficeCard>
        )}
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
        message="You have unsaved edits on this category. Leaving now will discard your changes."
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
        title="Delete Category?"
        message={`Are you sure you want to delete "${form.name}"? Items inside this category will also be removed.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (initialCategory && onDelete) onDelete(initialCategory.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

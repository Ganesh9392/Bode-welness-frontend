import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseReceiptAttachment,
  ExpenseRecord,
  ExpenseStatus,
} from '../types';
import {
  X,
  Receipt,
  Tag,
  IndianRupee,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Landmark,
  FileText,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Spa Consumables & Oils',
  'Linen & Laundry',
  'Utilities & Rent',
  'Facility Maintenance',
  'Staff Welfare & Pantry',
  'Marketing & Promotions',
  'Equipment & Supplies',
  'Miscellaneous',
];

export const EXPENSE_STATUSES: { value: ExpenseStatus; label: string }[] = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PAYMENT_METHODS: {
  id: ExpensePaymentMethod;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
  { id: 'CASH', label: 'Cash Desk', icon: Banknote },
  { id: 'CARD', label: 'Card POS', icon: CreditCard },
  { id: 'BANK_TRANSFER', label: 'Bank / NEFT', icon: Landmark },
];

const MAX_RECEIPT_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

interface ExpenseFormModalProps {
  existingExpense?: ExpenseRecord | null;
  onClose: () => void;
  onSaved: (expense: ExpenseRecord, isEdit: boolean) => void;
}

interface FormErrors {
  title?: string;
  amount?: string;
  expenseDate?: string;
  paymentReference?: string;
  receipt?: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  existingExpense,
  onClose,
  onSaved,
}) => {
  const { currentBranch, createExpense, updateExpense } = useApp();
  const isEdit = Boolean(existingExpense);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(existingExpense?.title || '');
  const [category, setCategory] = useState<ExpenseCategory>(
    existingExpense?.category || 'Spa Consumables & Oils'
  );
  const [vendorName, setVendorName] = useState(existingExpense?.vendorName || '');
  const [amountStr, setAmountStr] = useState(
    existingExpense ? String(existingExpense.amount) : ''
  );
  const [expenseDate, setExpenseDate] = useState(
    existingExpense?.expenseDate || todayStr
  );
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>(
    existingExpense?.paymentMethod || 'UPI'
  );
  const [paymentReference, setPaymentReference] = useState(
    existingExpense?.paymentReference || ''
  );
  const [status, setStatus] = useState<ExpenseStatus>(
    existingExpense?.status || 'PAID'
  );
  const [description, setDescription] = useState(existingExpense?.description || '');
  const [receipt, setReceipt] = useState<ExpenseReceiptAttachment | undefined>(
    existingExpense?.receipt
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const clearError = (key: keyof FormErrors) => {
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError('receipt');

    const isAllowed =
      file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isAllowed) {
      setErrors((prev) => ({
        ...prev,
        receipt: 'Only image files (JPG, PNG, WEBP) or PDF receipts are supported.',
      }));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        receipt: 'Receipt file size must be 2 MB or less.',
      }));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceipt({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result,
          uploadedAt: new Date().toISOString().split('T')[0],
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!title.trim()) {
      nextErrors.title = 'Expense title is required.';
    }
    const parsedAmount = Number(amountStr);
    if (!amountStr.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = 'Enter a valid expense amount greater than ₹0.';
    }
    if (!expenseDate) {
      nextErrors.expenseDate = 'Expense date is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        vendorName: vendorName.trim() || undefined,
        amount: Math.round(Number(amountStr) * 100) / 100,
        expenseDate,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        status,
        description: description.trim() || undefined,
        receipt,
      };

      if (isEdit && existingExpense) {
        const updated = updateExpense(existingExpense.id, payload);
        onSaved(updated || { ...existingExpense, ...payload }, true);
      } else {
        const created = createExpense(payload);
        onSaved(created, false);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (error?: string) =>
    `w-full text-xs text-bode-charcoal bg-white border ${
      error
        ? 'border-red-400 focus:ring-red-400'
        : 'border-bode-border focus:ring-bode-forest'
    } rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition placeholder:text-bode-muted/70`;

  const labelCls =
    'block text-[11px] font-semibold text-bode-muted uppercase tracking-wide mb-1';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-bode-border max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bode-gold text-bode-forest flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-base sm:text-lg font-semibold truncate">
                {isEdit ? 'Edit Expense' : 'Record New Expense'}
              </h3>
              <p className="text-[11px] text-bode-gold truncate">
                {isEdit
                  ? existingExpense?.expenseReference
                  : currentBranch?.shortName || 'Branch Expense'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section 1: Expense Details */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Expense Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className={labelCls}>Expense Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError('title');
                  }}
                  placeholder="e.g. Kama Ayurveda Massage Oils"
                  className={inputCls(errors.title)}
                />
                {errors.title && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className={inputCls()}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Vendor / Payee</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-bode-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Optional supplier name"
                    className={`${inputCls()} pl-8`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Amount, Date & Status */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted mb-3 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5" /> Amount, Date &amp; Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className={labelCls}>Amount (₹) *</label>
                <div className="relative">
                  <span className="text-xs font-bold text-bode-forest absolute left-3 top-1/2 -translate-y-1/2">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amountStr}
                    onChange={(e) => {
                      setAmountStr(e.target.value);
                      clearError('amount');
                    }}
                    placeholder="0"
                    className={`${inputCls(errors.amount)} pl-7 font-semibold text-bode-forest`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Expense Date *</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-bode-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => {
                      setExpenseDate(e.target.value);
                      clearError('expenseDate');
                    }}
                    className={`${inputCls(errors.expenseDate)} pl-8`}
                  />
                </div>
                {errors.expenseDate && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.expenseDate}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
                  className={inputCls()}
                >
                  {EXPENSE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Payment Method
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                        : 'bg-white border-bode-border text-bode-charcoal hover:bg-bode-ivory/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-bode-gold' : 'text-bode-muted'}`} />
                    <span className="text-[11px] font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <label className={labelCls}>
                {paymentMethod === 'CASH'
                  ? 'Voucher / Cash Memo Reference (Optional)'
                  : paymentMethod === 'UPI'
                  ? 'UPI UTR / Transaction Reference'
                  : paymentMethod === 'CARD'
                  ? 'Card POS Slip / Approval Code'
                  : 'NEFT / IMPS / Bank Reference'}
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={
                  paymentMethod === 'UPI'
                    ? 'e.g. UPI/HDFC/6192048112'
                    : paymentMethod === 'CARD'
                    ? 'e.g. POS-AXIS-31094'
                    : paymentMethod === 'BANK_TRANSFER'
                    ? 'e.g. NEFT/20261125/884120'
                    : 'e.g. VOUCH-0412'
                }
                className={`${inputCls()} font-mono`}
              />
            </div>
          </div>

          {/* Section 4: Description & Receipt Upload */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Notes &amp; Receipt Attachment
            </h4>

            <div>
              <label className={labelCls}>Description / Notes</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add invoice items, room/utility notes, or approval remarks..."
                className={inputCls()}
              />
            </div>

            <div>
              <label className={labelCls}>Upload Receipt / Bill (JPG, PNG, PDF — Max 2 MB)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptSelect}
                className="hidden"
              />

              {!receipt ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl border border-dashed border-bode-border bg-bode-ivory/40 hover:bg-bode-ivory hover:border-bode-emerald transition flex flex-col items-center justify-center gap-1.5 text-center"
                >
                  <Upload className="w-5 h-5 text-bode-emerald" />
                  <span className="text-xs font-semibold text-bode-forest">
                    Click to upload receipt or bill
                  </span>
                  <span className="text-[11px] text-bode-muted">
                    Supports PNG, JPG, WEBP, or PDF up to 2 MB
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-bode-border bg-bode-ivory/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {receipt.type.startsWith('image/') ? (
                      <img
                        src={receipt.dataUrl}
                        alt={receipt.name}
                        className="w-11 h-11 rounded-lg object-cover border border-bode-border shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-bode-forest text-bode-gold flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-bode-forest truncate">
                        {receipt.name}
                      </p>
                      <p className="text-[11px] text-bode-muted">
                        {formatFileSize(receipt.size)} • Uploaded {receipt.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-bode-border text-[11px] font-semibold text-bode-forest hover:bg-bode-ivory transition"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceipt(undefined)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                      title="Remove receipt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {errors.receipt && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.receipt}</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-bode-border sticky bottom-0 bg-white pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-bode-border text-bode-charcoal bg-white hover:bg-bode-ivory transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white transition disabled:opacity-60 flex items-center gap-2 shadow-sm"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-bode-gold" />
                  <span>{isEdit ? 'Update Expense' : 'Save Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

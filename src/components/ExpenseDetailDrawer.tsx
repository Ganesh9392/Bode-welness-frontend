import React, { useState } from 'react';
import { ExpenseRecord, ExpenseStatus } from '../types';
import {
  X,
  Edit3,
  Trash2,
  Receipt,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  ExternalLink,
} from 'lucide-react';

interface ExpenseDetailDrawerProps {
  expense: ExpenseRecord;
  branchName?: string;
  onClose: () => void;
  onEdit: (expense: ExpenseRecord) => void;
  onDelete: (expense: ExpenseRecord) => void;
  onStatusChange: (expenseId: string, status: ExpenseStatus) => void;
}

export function getExpenseStatusStyle(status: ExpenseStatus): string {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getPaymentMethodLabel(method: ExpenseRecord['paymentMethod']): string {
  switch (method) {
    case 'UPI':
      return 'UPI / QR';
    case 'CASH':
      return 'Cash Desk';
    case 'CARD':
      return 'Card POS';
    case 'BANK_TRANSFER':
      return 'Bank Transfer';
    default:
      return method;
  }
}

export const ExpenseDetailDrawer: React.FC<ExpenseDetailDrawerProps> = ({
  expense,
  branchName,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const handleDownloadReceipt = () => {
    if (!expense.receipt) return;
    const link = document.createElement('a');
    link.href = expense.receipt.dataUrl;
    link.download = expense.receipt.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusOptions: {
    value: ExpenseStatus;
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: 'PENDING', label: 'Pending', icon: Clock },
    { value: 'APPROVED', label: 'Approved', icon: ShieldCheck },
    { value: 'PAID', label: 'Paid', icon: CheckCircle2 },
    { value: 'CANCELLED', label: 'Cancelled', icon: XCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden z-10">
        {/* Drawer Header */}
        <div className="bg-bode-forest text-white p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-bode-gold text-bode-forest flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[11px] text-bode-gold font-semibold block">
                {expense.expenseReference}
              </span>
              <h3 className="font-serif text-lg font-bold leading-snug break-words">
                {expense.title}
              </h3>
              <p className="text-xs text-white/75 mt-0.5">{expense.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Edit expense"
              title="Edit Expense"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense)}
              className="p-1.5 rounded-lg text-white/80 hover:text-red-200 hover:bg-white/10 transition"
              aria-label="Delete expense"
              title="Delete Expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Amount & Status Summary Card */}
          <div className="rounded-xl bg-bode-ivory border border-bode-border p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted block">
                Expense Amount
              </span>
              <p className="font-serif text-2xl font-bold text-bode-forest mt-0.5">
                ₹{expense.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-bode-muted flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{expense.expenseDate}</span>
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${getExpenseStatusStyle(
                expense.status
              )}`}
            >
              {expense.status}
            </span>
          </div>

          {/* Quick Status Management */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-bode-muted">
              Update Expense Status
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const active = expense.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onStatusChange(expense.id, opt.value)}
                    className={`py-2 px-1.5 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition ${
                      active
                        ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                        : 'bg-white text-bode-charcoal border-bode-border hover:bg-bode-ivory'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-bode-gold' : 'text-bode-muted'}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Structured Info Grid */}
          <div className="bg-bode-ivory/50 rounded-xl p-4 border border-bode-border space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-bode-forest">
              Expense Record
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Vendor / Payee
                </span>
                <span className="font-semibold text-bode-charcoal flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-bode-muted shrink-0" />
                  <span className="truncate">{expense.vendorName || 'Not specified'}</span>
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Category
                </span>
                <span className="font-semibold text-bode-forest mt-0.5 block">
                  {expense.category}
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Payment Method
                </span>
                <span className="font-semibold text-bode-charcoal flex items-center gap-1 mt-0.5">
                  <CreditCard className="w-3 h-3 text-bode-muted shrink-0" />
                  <span>{getPaymentMethodLabel(expense.paymentMethod)}</span>
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Transaction Ref
                </span>
                <span className="font-mono text-[11px] text-bode-charcoal mt-0.5 block truncate">
                  {expense.paymentReference || '—'}
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Logged By
                </span>
                <span className="font-medium text-bode-charcoal mt-0.5 block">
                  {expense.createdByManager}
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Branch
                </span>
                <span className="font-medium text-bode-charcoal mt-0.5 block truncate">
                  {branchName || expense.branchId}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-bode-border/70">
              <span className="text-bode-muted block text-[10px] uppercase">
                Description &amp; Notes
              </span>
              <p className="text-bode-charcoal mt-1 leading-relaxed">
                {expense.description || 'No additional notes recorded.'}
              </p>
            </div>

            <div className="pt-2 border-t border-bode-border/70 flex items-center justify-between text-[11px] text-bode-muted">
              <span>Logged: {expense.createdAt}</span>
              {expense.updatedAt && <span>Updated: {expense.updatedAt}</span>}
            </div>
          </div>

          {/* Receipt Attachment Section */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-sm text-bode-forest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-bode-emerald" />
              <span>Receipt / Supporting Bill</span>
            </h4>

            {!expense.receipt ? (
              <div className="p-4 rounded-xl border border-bode-border bg-bode-ivory/30 text-center space-y-2">
                <p className="text-xs text-bode-muted">
                  No receipt image or PDF attached to this expense.
                </p>
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  className="text-xs font-semibold text-bode-emerald hover:text-bode-forest hover:underline"
                >
                  + Attach Receipt via Edit
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-bode-border bg-white overflow-hidden">
                {expense.receipt.type.startsWith('image/') && (
                  <div
                    onClick={() => setPreviewExpanded(!previewExpanded)}
                    className="bg-bode-ivory/40 border-b border-bode-border cursor-pointer group relative"
                  >
                    <img
                      src={expense.receipt.dataUrl}
                      alt={expense.receipt.name}
                      className={`w-full object-contain transition-all ${
                        previewExpanded ? 'max-h-96' : 'max-h-44'
                      }`}
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {previewExpanded ? 'Collapse' : 'Expand'}
                    </span>
                  </div>
                )}

                <div className="p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-bode-forest truncate">
                      {expense.receipt.name}
                    </p>
                    <p className="text-[11px] text-bode-muted">
                      Uploaded {expense.receipt.uploadedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="px-3 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark border border-bode-border text-bode-forest font-semibold flex items-center gap-1 shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-bode-border bg-bode-ivory/50 space-y-2 shrink-0">
          {expense.status !== 'PAID' && expense.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => onStatusChange(expense.id, 'PAID')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="py-2 px-3 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Expense</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense)}
              className="py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

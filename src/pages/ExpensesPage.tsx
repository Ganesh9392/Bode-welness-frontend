import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseRecord,
  ExpenseStatus,
} from '../types';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_STATUSES,
  ExpenseFormModal,
} from '../components/ExpenseFormModal';
import {
  ExpenseDetailDrawer,
  getExpenseStatusStyle,
  getPaymentMethodLabel,
} from '../components/ExpenseDetailDrawer';
import {
  Receipt,
  PlusCircle,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  IndianRupee,
  Tag,
  Paperclip,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react';

type DateRangePreset = 'all' | 'today' | 'week' | 'month' | 'custom';
type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'amount-desc'
  | 'amount-asc'
  | 'title-asc';

export const ExpensesPage: React.FC = () => {
  const {
    branchExpenses,
    currentBranch,
    updateExpenseStatus,
    deleteExpense,
  } = useApp();

  // Filters & controls
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRangePreset>('all');
  const [customFrom, setCustomFrom] = useState('2026-11-01');
  const [customTo, setCustomTo] = useState('2026-11-30');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [methodFilter, setMethodFilter] = useState<ExpensePaymentMethod | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals & drawers
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRecord | null>(null);

  // Feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const selectedExpense = useMemo(
    () => branchExpenses.find((e) => e.id === selectedExpenseId) || null,
    [branchExpenses, selectedExpenseId]
  );

  // Date + search + filter + sort pipeline
  const filteredExpenses = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const q = searchQuery.trim().toLowerCase();

    return branchExpenses
      .filter((exp) => {
        if (dateRange === 'today' && exp.expenseDate !== todayStr) return false;
        if (dateRange === 'week') {
          const d = new Date(exp.expenseDate + 'T00:00:00');
          const diffDays = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
          if (diffDays < -7 || diffDays > 7) return false;
        }
        if (dateRange === 'month' && exp.expenseDate.slice(0, 7) !== todayStr.slice(0, 7)) {
          return false;
        }
        if (
          dateRange === 'custom' &&
          (exp.expenseDate < customFrom || exp.expenseDate > customTo)
        ) {
          return false;
        }

        if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) return false;
        if (methodFilter !== 'ALL' && exp.paymentMethod !== methodFilter) return false;
        if (statusFilter !== 'ALL' && exp.status !== statusFilter) return false;

        if (q) {
          const matchesSearch =
            exp.title.toLowerCase().includes(q) ||
            exp.expenseReference.toLowerCase().includes(q) ||
            (exp.vendorName && exp.vendorName.toLowerCase().includes(q)) ||
            (exp.description && exp.description.toLowerCase().includes(q)) ||
            (exp.paymentReference && exp.paymentReference.toLowerCase().includes(q));
          if (!matchesSearch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          const cmp = b.expenseDate.localeCompare(a.expenseDate);
          return cmp !== 0 ? cmp : b.createdAt.localeCompare(a.createdAt);
        }
        if (sortBy === 'date-asc') {
          const cmp = a.expenseDate.localeCompare(b.expenseDate);
          return cmp !== 0 ? cmp : a.createdAt.localeCompare(b.createdAt);
        }
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return a.title.localeCompare(b.title);
      });
  }, [
    branchExpenses,
    dateRange,
    customFrom,
    customTo,
    categoryFilter,
    methodFilter,
    statusFilter,
    searchQuery,
    sortBy,
  ]);

  // Reset to page 1 when filters/branch change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    dateRange,
    customFrom,
    customTo,
    categoryFilter,
    methodFilter,
    statusFilter,
    sortBy,
    pageSize,
    currentBranch?.id,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedExpenses = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, safePage, pageSize]);

  // Metrics based on filtered records
  const metrics = useMemo(() => {
    const active = filteredExpenses.filter((e) => e.status !== 'CANCELLED');
    const paid = active.filter((e) => e.status === 'PAID');
    const pendingOrApproved = active.filter(
      (e) => e.status === 'PENDING' || e.status === 'APPROVED'
    );

    const totalAmount = active.reduce((sum, e) => sum + e.amount, 0);
    const paidAmount = paid.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = pendingOrApproved.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = new Map<ExpenseCategory, number>();
    active.forEach((e) => {
      byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
    });

    const sortedCategories = Array.from(byCategory.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const topCategory = sortedCategories[0] || null;

    return {
      totalAmount,
      activeCount: active.length,
      paidAmount,
      paidCount: paid.length,
      pendingAmount,
      pendingCount: pendingOrApproved.length,
      topCategory,
      categoryBreakdown: sortedCategories,
    };
  }, [filteredExpenses]);

  const activeFilterCount =
    (categoryFilter !== 'ALL' ? 1 : 0) +
    (methodFilter !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (dateRange !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setDateRange('all');
    setCategoryFilter('ALL');
    setMethodFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('date-desc');
  };

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setShowFormModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const deletedRef = deleteTarget.expenseReference;
    if (selectedExpenseId === deleteTarget.id) {
      setSelectedExpenseId(null);
    }
    deleteExpense(deleteTarget.id);
    setDeleteTarget(null);
    showFeedback(`Expense ${deletedRef} deleted.`);
  };

  const handleStatusUpdate = (expenseId: string, status: ExpenseStatus) => {
    updateExpenseStatus(expenseId, status);
    showFeedback(`Expense status updated to ${status}.`);
  };

  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) return;
    const escapeCsv = (val: string | number | undefined) => {
      const s = String(val ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };
    const headers = [
      'Reference',
      'Date',
      'Title',
      'Category',
      'Vendor',
      'Payment Method',
      'Payment Reference',
      'Status',
      'Amount (INR)',
      'Logged By',
      'Description',
    ];
    const rows = filteredExpenses.map((e) =>
      [
        e.expenseReference,
        e.expenseDate,
        e.title,
        e.category,
        e.vendorName || '',
        e.paymentMethod,
        e.paymentReference || '',
        e.status,
        e.amount,
        e.createdByManager,
        e.description || '',
      ]
        .map(escapeCsv)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bode-expenses-${currentBranch?.id || 'branch'}-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback(`Exported ${filteredExpenses.length} expense record(s) to CSV.`);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
              Expenses
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-bode-forest text-bode-gold text-xs font-bold">
              {branchExpenses.length}
            </span>
          </div>
          <p className="text-xs text-bode-muted mt-0.5">
            Track branch operational costs, vendor payouts, consumables, and receipts for{' '}
            <span className="font-semibold text-bode-forest">
              {currentBranch?.shortName || 'BODE Spa'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredExpenses.length === 0}
            className="px-3.5 py-2.5 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-bode-gold" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded hover:bg-emerald-100 text-emerald-700"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-bode-gold" /> Total Expenses
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-bode-forest mt-1">
            ₹{metrics.totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">
            {metrics.activeCount} active {metrics.activeCount === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid Outflow
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
            ₹{metrics.paidAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">
            {metrics.paidCount} settled {metrics.paidCount === 1 ? 'bill' : 'bills'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending / Approved
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-amber-800 mt-1">
            ₹{metrics.pendingAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">
            {metrics.pendingCount} awaiting payout
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-bode-emerald" /> Top Category
          </span>
          <p className="font-serif text-base sm:text-lg font-bold text-bode-forest mt-1 truncate">
            {metrics.topCategory ? metrics.topCategory[0] : '—'}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">
            {metrics.topCategory
              ? `₹${metrics.topCategory[1].toLocaleString('en-IN')} spent`
              : 'No active expenses'}
          </p>
        </div>
      </div>

      {/* Category Breakdown Bar */}
      {metrics.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-bode-border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-bold text-bode-forest">
              Spend by Category
            </h2>
            <span className="text-[11px] text-bode-muted">
              Click a category to filter
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {metrics.categoryBreakdown.map(([cat, amt]) => {
              const pct =
                metrics.totalAmount > 0
                  ? Math.round((amt / metrics.totalAmount) * 100)
                  : 0;
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(isSelected ? 'ALL' : cat)
                  }
                  className={`p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                      : 'bg-bode-ivory/40 border-bode-border/80 hover:border-bode-gold'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span
                      className={`font-semibold truncate ${
                        isSelected ? 'text-bode-ivory' : 'text-bode-charcoal'
                      }`}
                    >
                      {cat}
                    </span>
                    <span
                      className={`font-bold shrink-0 ${
                        isSelected ? 'text-bode-gold' : 'text-bode-muted'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <p
                    className={`font-serif text-sm font-bold mt-1 ${
                      isSelected ? 'text-white' : 'text-bode-forest'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </p>
                  <div
                    className={`w-full h-1.5 rounded-full mt-1.5 overflow-hidden ${
                      isSelected ? 'bg-white/20' : 'bg-bode-border/60'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${
                        isSelected ? 'bg-bode-gold' : 'bg-bode-emerald'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search, Date Range, Sort & Filter Bar */}
      <div className="bg-white rounded-2xl border border-bode-border p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-bode-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by expense title, vendor, ref #, or UTR..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-bode-border bg-bode-ivory/40 text-xs sm:text-sm text-bode-charcoal focus:outline-none focus:ring-2 focus:ring-bode-forest"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Tabs */}
            <div className="flex flex-wrap items-center bg-bode-ivory/60 rounded-xl border border-bode-border p-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'Week' },
                  { id: 'month', label: 'Month' },
                  { id: 'custom', label: 'Custom' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDateRange(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    dateRange === tab.id
                      ? 'bg-bode-forest text-white shadow-sm'
                      : 'text-bode-charcoal hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-bode-border bg-white text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-bode-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-bode-charcoal font-medium focus:outline-none"
                aria-label="Sort expenses"
              >
                <option value="date-desc">Date: Newest</option>
                <option value="date-asc">Date: Oldest</option>
                <option value="amount-desc">Amount: High–Low</option>
                <option value="amount-asc">Amount: Low–High</option>
                <option value="title-asc">Title: A–Z</option>
              </select>
            </div>

            {/* Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showFilters
                  ? 'bg-bode-forest text-white border-bode-forest'
                  : 'bg-white text-bode-charcoal border-bode-border hover:bg-bode-ivory'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(categoryFilter !== 'ALL' ||
                methodFilter !== 'ALL' ||
                statusFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-bode-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <div className="pt-2.5 border-t border-bode-border/70 flex flex-wrap items-center gap-3 text-xs">
            <Calendar className="w-4 h-4 text-bode-emerald" />
            <label className="font-semibold text-bode-muted">From:</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-bode-border bg-bode-ivory/30"
            />
            <label className="font-semibold text-bode-muted">To:</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-bode-border bg-bode-ivory/30"
            />
          </div>
        )}

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-bode-border/70 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as ExpenseCategory | 'ALL')
                }
                className="w-full px-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) =>
                  setMethodFilter(e.target.value as ExpensePaymentMethod | 'ALL')
                }
                className="w-full px-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="UPI">UPI / QR</option>
                <option value="CASH">Cash Desk</option>
                <option value="CARD">Card POS</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ExpenseStatus | 'ALL')
                }
                className="w-full px-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Statuses</option>
                {EXPENSE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-bode-muted">
          <span>
            Showing <strong>{filteredExpenses.length}</strong> of{' '}
            <strong>{branchExpenses.length}</strong> expenses
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-bode-emerald hover:text-bode-forest font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="py-14 px-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-bode-ivory flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6 text-bode-muted" />
            </div>
            <p className="font-serif text-base font-semibold text-bode-charcoal">
              No expenses found
            </p>
            <p className="text-xs text-bode-muted mt-1 max-w-sm mx-auto">
              {branchExpenses.length === 0
                ? 'Start recording branch expenses, vendor bills, and consumables to track operational spending.'
                : 'No expense records match your current search or filter criteria.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-xl border border-bode-border text-xs font-semibold text-bode-charcoal hover:bg-bode-ivory transition"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-bode-forest text-white text-xs font-semibold hover:bg-bode-forestLight transition inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-bode-gold" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-bode-ivory/80 border-b border-bode-border text-bode-forest font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Expense &amp; Vendor</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bode-border/50">
                  {paginatedExpenses.map((exp) => (
                    <tr
                      key={exp.id}
                      onClick={() => setSelectedExpenseId(exp.id)}
                      className="hover:bg-bode-ivory/35 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-bode-forest">
                            {exp.expenseReference}
                          </span>
                          {exp.receipt && (
                            <span
                              title={`Receipt attached: ${exp.receipt.name}`}
                              className="text-bode-emerald"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[260px]">
                        <p className="font-semibold text-bode-charcoal truncate">
                          {exp.title}
                        </p>
                        <p className="text-[11px] text-bode-muted truncate">
                          {exp.vendorName || 'Direct / Petty Cash'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-bode-ivory border border-bode-border text-bode-forest font-medium text-[11px]">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-bode-charcoal">
                        {exp.expenseDate}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-bode-forest">
                          {getPaymentMethodLabel(exp.paymentMethod)}
                        </span>
                        {exp.paymentReference && (
                          <p className="font-mono text-[10px] text-bode-muted truncate max-w-[130px]">
                            {exp.paymentReference}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getExpenseStatusStyle(
                            exp.status
                          )}`}
                        >
                          {exp.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-serif text-sm font-bold text-bode-forest">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedExpenseId(exp.id)}
                            className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest transition"
                            title="View Expense Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-emerald transition"
                            title="Edit Expense"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(exp)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (< md) */}
            <div className="md:hidden divide-y divide-bode-border/50">
              {paginatedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpenseId(exp.id)}
                  className="p-4 space-y-2.5 hover:bg-bode-ivory/25 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-bode-forest">
                          {exp.expenseReference}
                        </span>
                        {exp.receipt && (
                          <Paperclip className="w-3 h-3 text-bode-emerald" />
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getExpenseStatusStyle(
                            exp.status
                          )}`}
                        >
                          {exp.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-bode-forest mt-1">
                        {exp.title}
                      </h4>
                      <p className="text-[11px] text-bode-muted">
                        {exp.vendorName || 'Direct / Petty Cash'} • {exp.category}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-serif font-bold text-base text-bode-forest">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] font-semibold text-bode-emerald mt-0.5">
                        {getPaymentMethodLabel(exp.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-bode-muted bg-bode-ivory/50 px-2.5 py-2 rounded-lg border border-bode-border/50">
                    <span>{exp.expenseDate}</span>
                    <span>By: {exp.createdByManager}</span>
                  </div>

                  <div
                    className="flex items-center justify-end gap-2 pt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedExpenseId(exp.id)}
                      className="px-3 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(exp)}
                      className="px-3 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-emerald text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(exp)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 border-t border-bode-border bg-bode-ivory/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-bode-muted">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-bode-border bg-white text-bode-forest font-semibold focus:outline-none"
                >
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                </select>
                <span>
                  {(safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, filteredExpenses.length)} of{' '}
                  {filteredExpenses.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest disabled:opacity-40 transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition ${
                      page === safePage
                        ? 'bg-bode-forest text-white shadow-sm'
                        : 'bg-white border border-bode-border text-bode-charcoal hover:bg-bode-ivory'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest disabled:opacity-40 transition"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Expense Modal */}
      {showFormModal && (
        <ExpenseFormModal
          existingExpense={editingExpense}
          onClose={() => {
            setShowFormModal(false);
            setEditingExpense(null);
          }}
          onSaved={(saved, isEdit) => {
            setShowFormModal(false);
            setEditingExpense(null);
            setSelectedExpenseId(saved.id);
            showFeedback(
              isEdit
                ? `Expense ${saved.expenseReference} updated successfully.`
                : `Expense ${saved.expenseReference} recorded (₹${saved.amount.toLocaleString('en-IN')}).`
            );
          }}
        />
      )}

      {/* Expense Detail Drawer */}
      {selectedExpense && (
        <ExpenseDetailDrawer
          expense={selectedExpense}
          branchName={currentBranch?.shortName}
          onClose={() => setSelectedExpenseId(null)}
          onEdit={(exp) => {
            setEditingExpense(exp);
            setShowFormModal(true);
          }}
          onDelete={(exp) => setDeleteTarget(exp)}
          onStatusChange={handleStatusUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-bode-border space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-bode-forest">
                  Delete Expense?
                </h3>
                <p className="text-xs text-bode-muted mt-1 leading-relaxed">
                  Are you sure you want to permanently remove this expense record? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-bode-ivory rounded-xl border border-bode-border text-xs space-y-1">
              <p className="font-mono font-bold text-bode-forest">
                {deleteTarget.expenseReference}
              </p>
              <p className="font-semibold text-bode-charcoal">{deleteTarget.title}</p>
              <p className="text-bode-muted">
                Amount:{' '}
                <strong className="text-bode-forest">
                  ₹{deleteTarget.amount.toLocaleString('en-IN')}
                </strong>{' '}
                • {deleteTarget.expenseDate}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-bode-charcoal bg-bode-ivory hover:bg-bode-border/60 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Expense</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

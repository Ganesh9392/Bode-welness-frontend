import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit } from '../types';
import {
  PlusCircle,
  CalendarDays,
  Activity,
  CheckCircle2,
  IndianRupee,
  FileText,
  CreditCard,
  Eye,
  ChevronDown,
  Clock,
  User,
  Phone,
  Zap,
  Trash2,
  Plus,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, visitId?: string) => void;
  onOpenInvoiceModal: (visit: CustomerVisit) => void;
  onOpenPaymentModal: (visit: CustomerVisit) => void;
  onOpenAddServiceModal?: (visit: CustomerVisit) => void;
}

type StatusTab = 'Accepted' | 'Rejected' | 'Completed' | 'Total';
type DateRange = 'today' | 'week' | 'month' | 'custom';

function getDateRangeLabel(range: DateRange): string {
  switch (range) {
    case 'today': return 'Today';
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'custom': return 'Custom';
  }
}

function getStatusTab(visitStatus: CustomerVisit['visitStatus']): StatusTab {
  if (visitStatus === 'CANCELLED') return 'Rejected';
  if (visitStatus === 'COMPLETED') return 'Completed';
  return 'Accepted'; // SCHEDULED, CHECKED_IN, IN_PROGRESS
}

function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getPaymentStatusStyle(status: CustomerVisit['paymentStatus']): string {
  switch (status) {
    case 'FULLY_PAID': return 'bg-emerald-100 text-emerald-800';
    case 'PARTIALLY_PAID': return 'bg-amber-100 text-amber-800';
    case 'UNPAID': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getVisitStatusStyle(visitStatus: CustomerVisit['visitStatus']): string {
  switch (visitStatus) {
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
    case 'CHECKED_IN': return 'bg-indigo-100 text-indigo-800';
    case 'IN_PROGRESS': return 'bg-emerald-600 text-white';
    case 'COMPLETED': return 'bg-gray-100 text-gray-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getVisitStatusLabel(status: CustomerVisit['visitStatus']): string {
  switch (status) {
    case 'SCHEDULED': return 'Scheduled';
    case 'CHECKED_IN': return 'Checked In';
    case 'IN_PROGRESS': return 'In Progress';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

function getOrderTypeLabel(visit: CustomerVisit): string {
  if (visit.source === 'WEBSITE') return 'WEBSITE BOOKING';
  return 'SERVICE';
}

function getOrderTypeBadgeStyle(visit: CustomerVisit): string {
  if (visit.source === 'WEBSITE') return 'bg-violet-100 text-violet-800';
  return 'bg-bode-ivory text-bode-forest border border-bode-border';
}

function getOutstandingBalance(visit: CustomerVisit): number {
  if (visit.invoice) return visit.invoice.outstandingBalance;
  if (visit.visitStatus === 'COMPLETED') {
    const net = visit.services.reduce((acc, s) => acc + s.finalPrice, 0);
    const paid = visit.payments.reduce((acc, p) => acc + p.amount, 0) + (visit.source === 'WEBSITE' ? 99 : 0);
    return Math.max(0, net - paid);
  }
  return 0;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenInvoiceModal,
  onOpenPaymentModal,
  onOpenAddServiceModal,
}) => {
  const { branchVisits, cancelCustomerVisit } = useApp();

  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [customFrom, setCustomFrom] = useState<string>('2026-11-01');
  const [customTo, setCustomTo] = useState<string>('2026-11-30');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSalesTypeDropdown, setShowSalesTypeDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>('Total');

  const todayStr = new Date().toISOString().split('T')[0];

  // Date filtering
  const filteredByDate = useMemo(() => {
    if (dateRange === 'today') {
      return branchVisits.filter((v) => v.appointmentDate === todayStr);
    }
    if (dateRange === 'week') {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      return branchVisits.filter((v) => new Date(v.appointmentDate) >= monday);
    }
    if (dateRange === 'month') {
      const monthPrefix = todayStr.slice(0, 7);
      return branchVisits.filter((v) => v.appointmentDate.startsWith(monthPrefix));
    }
    return branchVisits.filter(
      (v) => v.appointmentDate >= customFrom && v.appointmentDate <= customTo
    );
  }, [branchVisits, dateRange, todayStr, customFrom, customTo]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<StatusTab, number> = { Accepted: 0, Rejected: 0, Completed: 0, Total: 0 };
    filteredByDate.forEach((v) => {
      counts.Total++;
      counts[getStatusTab(v.visitStatus)]++;
    });
    return counts;
  }, [filteredByDate]);

  // Filtered cards
  const displayedVisits = useMemo(() => {
    if (activeTab === 'Total') return filteredByDate;
    return filteredByDate.filter((v) => getStatusTab(v.visitStatus) === activeTab);
  }, [filteredByDate, activeTab]);

  // KPI metrics (always today)
  const todayVisits = branchVisits.filter((v) => v.appointmentDate === todayStr);
  const activeSessions = branchVisits.filter((v) => v.visitStatus === 'IN_PROGRESS');
  const completedToday = todayVisits.filter((v) => v.visitStatus === 'COMPLETED');
  const totalOutstanding = branchVisits.reduce((acc, v) => acc + getOutstandingBalance(v), 0);

  const TABS: StatusTab[] = ['Accepted', 'Rejected', 'Completed', 'Total'];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-bode-forest">Sales Dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => { setShowDateDropdown(!showDateDropdown); setShowSalesTypeDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-bode-border bg-white text-xs font-medium text-bode-charcoal hover:border-bode-emerald transition"
            >
              <CalendarDays className="w-3.5 h-3.5 text-bode-muted" />
              {getDateRangeLabel(dateRange)}
              <ChevronDown className="w-3 h-3 text-bode-muted" />
            </button>
            {showDateDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowDateDropdown(false)} />
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-44 bg-white border border-bode-border rounded-xl shadow-lg z-30 py-1">
                  {(['today', 'week', 'month', 'custom'] as DateRange[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setDateRange(r); setShowDateDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-bode-ivory transition ${dateRange === r ? 'text-bode-forest font-bold bg-bode-ivory/60' : 'text-bode-charcoal'}`}
                    >
                      {getDateRangeLabel(r)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sales Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowSalesTypeDropdown(!showSalesTypeDropdown); setShowDateDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-bode-border bg-white text-xs font-medium text-bode-charcoal hover:border-bode-emerald transition"
            >
              Orders
              <ChevronDown className="w-3 h-3 text-bode-muted" />
            </button>
            {showSalesTypeDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowSalesTypeDropdown(false)} />
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1 w-48 bg-white border border-bode-border rounded-xl shadow-lg z-30 py-1">
                  <button
                    onClick={() => setShowSalesTypeDropdown(false)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-bode-forest bg-bode-ivory"
                  >
                    Orders
                  </button>
                  {['Memberships', 'Packages', 'Gift Cards'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setShowSalesTypeDropdown(false)}
                      className="w-full text-left px-3 py-2 text-xs text-bode-muted hover:bg-bode-ivory transition flex items-center justify-between"
                    >
                      <span>{type}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">Soon</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* New Sale CTA */}
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bode-gold hover:bg-bode-goldLight text-bode-forest font-bold text-xs shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Sale
          </button>
        </div>
      </div>

      {/* Custom Date Range Bar */}
      {dateRange === 'custom' && (
        <div className="bg-white rounded-xl border border-bode-border p-3 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-semibold text-bode-muted">From:</span>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-bode-border"
          />
          <span className="font-semibold text-bode-muted">To:</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-bode-border"
          />
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today's Visits */}
        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-bode-ivory text-bode-forest shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-bode-muted">Today's Visits</p>
            <p className="font-serif text-xl font-bold text-bode-forest">{todayVisits.length}</p>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 relative">
            <Activity className="w-4 h-4" />
            {activeSessions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-bode-muted">Active Sessions</p>
            <p className="font-serif text-xl font-bold text-emerald-700">{activeSessions.length}</p>
          </div>
        </div>

        {/* Completed Today */}
        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-bode-ivory text-bode-forest shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-bode-muted">Completed Today</p>
            <p className="font-serif text-xl font-bold text-bode-forest">{completedToday.length}</p>
          </div>
        </div>

        {/* Outstanding */}
        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600 shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-bode-muted">Outstanding</p>
            <p className="font-serif text-xl font-bold text-red-600 truncate">{formatAmount(totalOutstanding)}</p>
          </div>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex gap-1 p-1 bg-bode-ivory rounded-xl border border-bode-border w-full sm:w-auto sm:inline-flex overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition flex-1 sm:flex-none justify-center whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-bode-forest shadow-sm border border-bode-border'
                : 'text-bode-muted hover:text-bode-forest'
            }`}
          >
            {tab}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-bode-forest text-white' : 'bg-bode-border/70 text-bode-muted'
            }`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Order Cards ── */}
      {displayedVisits.length === 0 ? (
        <div className="bg-white border border-bode-border rounded-2xl py-16 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-bode-ivory flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6 text-bode-muted" />
          </div>
          <p className="font-serif text-base font-semibold text-bode-charcoal">No orders found</p>
          <p className="text-xs text-bode-muted mt-1">Try a different date range or status filter.</p>
          <button
            onClick={() => onNavigate('pos')}
            className="mt-4 px-4 py-2 rounded-lg bg-bode-gold text-bode-forest font-bold text-xs hover:bg-bode-goldLight transition"
          >
            + New Sale
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedVisits.map((visit) => {
            const totalAmount = visit.services.reduce((acc, s) => acc + s.finalPrice, 0);
            const outstanding = getOutstandingBalance(visit);
            const isInProgress = visit.visitStatus === 'IN_PROGRESS';
            const tab = getStatusTab(visit.visitStatus);

            return (
              <div
                key={visit.id}
                className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition space-y-3 ${
                  tab === 'Rejected' ? 'border-red-200' :
                  isInProgress ? 'border-emerald-300' :
                  tab === 'Completed' ? 'border-bode-border' :
                  'border-bode-border hover:border-bode-emerald/50'
                }`}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-bode-muted tracking-wider">
                        {visit.visitReference}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getOrderTypeBadgeStyle(visit)}`}>
                        {getOrderTypeLabel(visit)}
                      </span>
                    </div>
                    <p className="font-serif font-bold text-sm text-bode-forest mt-1 truncate">{visit.customerName}</p>
                    <p className="text-[11px] text-bode-muted flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {visit.customerMobile}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 shrink-0">
                    <div className="text-right">
                      <p className="font-serif font-bold text-base text-bode-forest">{formatAmount(totalAmount)}</p>
                      <p className="text-[10px] text-bode-muted">total</p>
                    </div>
                    {visit.visitStatus !== 'CANCELLED' && visit.visitStatus !== 'COMPLETED' && (
                      <div className="flex items-center gap-1">
                        {onOpenAddServiceModal && (
                          <button
                            type="button"
                            onClick={() => onOpenAddServiceModal(visit)}
                            title="Add Service"
                            className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-emerald hover:text-white text-bode-forest border border-bode-border transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => cancelCustomerVisit(visit.id)}
                          title="Reject / Cancel Order"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div className="text-[11px] text-bode-charcoal bg-bode-ivory/60 rounded-lg px-2.5 py-1.5 leading-relaxed">
                  {visit.services.map((s) => s.serviceName).join(', ')}
                </div>

                {/* Date/Time & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-bode-muted">
                    <Clock className="w-3 h-3" />
                    <span>{visit.appointmentDate} · {visit.appointmentTime}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Visit Status */}
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${getVisitStatusStyle(visit.visitStatus)}`}>
                      {isInProgress && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                      )}
                      {getVisitStatusLabel(visit.visitStatus)}
                    </span>
                    {/* Payment Status */}
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getPaymentStatusStyle(visit.paymentStatus)}`}>
                      {visit.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-bode-border/60">
                  <button
                    onClick={() => onNavigate('visit-detail', visit.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest text-xs font-medium transition border border-bode-border"
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </button>

                  {visit.invoice && (
                    <button
                      onClick={() => onOpenInvoiceModal(visit)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-medium transition"
                    >
                      <FileText className="w-3 h-3" />
                      Invoice
                    </button>
                  )}

                  {outstanding > 0 && (
                    <button
                      onClick={() => onOpenPaymentModal(visit)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition ml-auto"
                    >
                      <CreditCard className="w-3 h-3" />
                      Collect {formatAmount(outstanding)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty new sale prompt ── */}
      {displayedVisits.length > 0 && (
        <div className="text-center py-2">
          <button
            onClick={() => onNavigate('pos')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick New Sale
          </button>
        </div>
      )}
    </div>
  );
};

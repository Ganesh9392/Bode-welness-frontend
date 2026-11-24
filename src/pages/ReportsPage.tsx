import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BranchId } from '../types';
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Package,
  Award,
  Gift,
  Calendar,
  Building2,
} from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (tab: string, visitId?: string) => void;
}

type DateRangePreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { visits, currentBranch, getAuthorizedBranches } = useApp();
  const authorizedBranches = getAuthorizedBranches();

  const [rangePreset, setRangePreset] = useState<DateRangePreset>('month');
  const [customFrom, setCustomFrom] = useState('2026-11-01');
  const [customTo, setCustomTo] = useState('2026-11-30');
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId | 'ALL'>(
    currentBranch?.id || 'branch-ecil'
  );

  const completedInvoicedVisits = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return visits.filter((v) => {
      if (selectedBranchId !== 'ALL' && v.branchId !== selectedBranchId) return false;
      if (v.visitStatus !== 'COMPLETED' || !v.invoice) return false;

      if (rangePreset === 'today') {
        return v.appointmentDate === todayStr;
      }
      if (rangePreset === 'week') {
        const d = new Date(v.appointmentDate);
        const diffDays = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -7 && diffDays <= 7;
      }
      if (rangePreset === 'month') {
        return v.appointmentDate.slice(0, 7) === todayStr.slice(0, 7);
      }
      if (rangePreset === 'year') {
        return v.appointmentDate.startsWith(todayStr.slice(0, 4));
      }
      return v.appointmentDate >= customFrom && v.appointmentDate <= customTo;
    });
  }, [visits, selectedBranchId, rangePreset, customFrom, customTo]);

  const metrics = useMemo(() => {
    let grossSale = 0;
    let serviceNetSale = 0;
    let serviceCount = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const collections = {
      CASH: { count: 0, total: 0 },
      UPI: { count: 0, total: 0 },
      CARD: { count: 0, total: 0 },
    };

    completedInvoicedVisits.forEach((v) => {
      if (!v.invoice) return;
      grossSale += v.invoice.finalAmount;
      serviceNetSale += Math.max(0, v.invoice.subtotal - v.invoice.totalDiscount);
      serviceCount += v.services.filter((s) => s.status !== 'CANCELLED').length;
      totalDiscount += v.invoice.totalDiscount;
      totalTax += v.invoice.taxAmount;

      v.payments.forEach((p) => {
        collections[p.method].count += 1;
        collections[p.method].total += p.amount;
      });
    });

    const totalCollected = collections.CASH.total + collections.UPI.total + collections.CARD.total;

    return {
      grossSale,
      serviceNetSale,
      serviceCount,
      totalDiscount,
      totalTax,
      collections,
      totalCollected,
    };
  }, [completedInvoicedVisits]);

  const kpiCards = [
    {
      label: 'Gross Sale',
      value: `₹${metrics.grossSale.toLocaleString('en-IN')}`,
      sub: `Count: ${completedInvoicedVisits.length}`,
      icon: IndianRupee,
      active: true,
    },
    {
      label: 'Service Net Sale',
      value: `₹${metrics.serviceNetSale.toLocaleString('en-IN')}`,
      sub: `Count: ${metrics.serviceCount}`,
      icon: TrendingUp,
      active: true,
    },
    {
      label: 'Product Net Sale',
      value: '₹0',
      sub: 'Phase 2 module',
      icon: ShoppingBag,
      active: false,
    },
    {
      label: 'Package Net Sale',
      value: 'Coming Soon',
      sub: 'Phase 2 module',
      icon: Package,
      active: false,
    },
    {
      label: 'Membership Net Sale',
      value: 'Coming Soon',
      sub: 'Phase 2 module',
      icon: Award,
      active: false,
    },
    {
      label: 'Gift Card Net Sale',
      value: 'Coming Soon',
      sub: 'Phase 2 module',
      icon: Gift,
      active: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
            Sales Summary &amp; Reports
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Tabs */}
          <div className="flex flex-wrap items-center bg-white rounded-xl border border-bode-border p-1 max-w-full">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
                { id: 'year', label: 'Year' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRangePreset(tab.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  rangePreset === tab.id
                    ? 'bg-bode-forest text-white shadow-sm'
                    : 'text-bode-charcoal hover:bg-bode-ivory'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-bode-border text-xs">
            <Building2 className="w-3.5 h-3.5 text-bode-emerald" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value as BranchId | 'ALL')}
              className="bg-transparent font-semibold text-bode-forest focus:outline-none"
            >
              {authorizedBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.shortName}
                </option>
              ))}
              {authorizedBranches.length > 1 && <option value="ALL">All Authorized Stores</option>}
            </select>
          </div>
        </div>
      </div>

      {rangePreset === 'custom' && (
        <div className="bg-white rounded-xl border border-bode-border p-3.5 flex flex-wrap items-center gap-3 text-xs">
          <Calendar className="w-4 h-4 text-bode-emerald" />
          <label className="font-semibold text-bode-muted">From:</label>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-bode-border"
          />
          <label className="font-semibold text-bode-muted">To:</label>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-bode-border"
          />
        </div>
      )}

      {/* Six KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-xl border shadow-sm ${
                card.active
                  ? 'bg-white border-bode-border'
                  : 'bg-bode-ivory/50 border-bode-border/70 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted">
                  {card.label}
                </span>
                <Icon className="w-4 h-4 text-bode-gold" />
              </div>
              <p className="font-serif text-lg sm:text-xl font-bold text-bode-forest mt-2 truncate">
                {card.value}
              </p>
              <p className="text-[11px] text-bode-muted mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Sources, Adjustments & Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Sources */}
        <div className="bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-bode-forest border-b border-bode-border pb-2.5">
            Revenue Sources
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-bode-muted">Service Sale (Net)</span>
              <span className="font-semibold text-bode-charcoal">
                ₹{metrics.serviceNetSale.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-bode-muted">Inclusive Taxes</span>
              <span className="font-semibold text-bode-charcoal">₹0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bode-muted">Exclusive Taxes (18% GST)</span>
              <span className="font-semibold text-bode-charcoal">
                ₹{metrics.totalTax.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-bode-border font-bold text-sm text-bode-forest">
              <span>Total Sale</span>
              <span>₹{metrics.grossSale.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Adjustments */}
        <div className="bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-bode-forest border-b border-bode-border pb-2.5">
            Adjustments
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-bode-muted">Discounts Applied</span>
              <span className="font-semibold text-amber-700">
                ₹{metrics.totalDiscount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-bode-muted">Membership Redemption</span>
              <span className="font-semibold text-bode-charcoal">₹0</span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-bode-border font-bold text-sm text-bode-forest">
              <span>Total Adjustments</span>
              <span>₹{metrics.totalDiscount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Collections by Payment Method */}
        <div className="bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-bode-forest border-b border-bode-border pb-2.5">
            Collections by Method
          </h3>
          <div className="space-y-3 text-xs">
            {(['CASH', 'UPI', 'CARD'] as const).map((method) => {
              const item = metrics.collections[method];
              const pct =
                metrics.totalCollected > 0
                  ? Math.round((item.total / metrics.totalCollected) * 100)
                  : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-bode-forest">
                      {method} ({item.count})
                    </span>
                    <span className="font-bold text-bode-charcoal">
                      ₹{item.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-bode-ivory overflow-hidden">
                    <div
                      className="h-full bg-bode-emerald rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Invoiced Transactions */}
      <div className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-bode-border">
          <h3 className="font-serif font-bold text-base text-bode-forest">
            Completed Invoiced Transactions ({completedInvoicedVisits.length})
          </h3>
        </div>
        {completedInvoicedVisits.length === 0 ? (
          <div className="p-8 text-center text-xs text-bode-muted">
            No completed invoiced transactions in the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bode-ivory/60 text-[10px] uppercase tracking-wider text-bode-muted">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice / Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Tax</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bode-border/60">
                {completedInvoicedVisits.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => onNavigate('visit-detail', v.id)}
                    className="hover:bg-bode-ivory/40 cursor-pointer"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">{v.appointmentDate}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-bode-forest">
                      {v.invoice?.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium">{v.customerName}</td>
                    <td className="py-3 px-4">₹{v.invoice?.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-amber-700">
                      -₹{v.invoice?.totalDiscount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">₹{v.invoice?.taxAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-bode-forest">
                      ₹{v.invoice?.finalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {v.paymentStatus.replace('
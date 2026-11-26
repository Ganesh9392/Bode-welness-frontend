import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CampaignRecord,
  CampaignStatus,
  CampaignType,
} from '../types';
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  CampaignFormModal,
} from '../components/CampaignFormModal';
import {
  CampaignDetailDrawer,
  getCampaignStatusLabel,
  getCampaignStatusStyle,
} from '../components/CampaignDetailDrawer';
import {
  Megaphone,
  PlusCircle,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Play,
  FileEdit,
  TrendingUp,
  Users,
  MousePointerClick,
  IndianRupee,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  BarChart3,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';

type CampaignSubView = 'overview' | 'list' | 'performance';
type DateRangePreset = 'all' | 'active-now' | 'month' | 'custom';
type SortOption =
  | 'start-desc'
  | 'start-asc'
  | 'budget-desc'
  | 'budget-asc'
  | 'name-asc';

export const CampaignsPage: React.FC = () => {
  const {
    branchCampaigns,
    currentBranch,
    updateCampaignStatus,
    duplicateCampaign,
    deleteCampaign,
  } = useApp();

  // Sub-view navigation
  const [subView, setSubView] = useState<CampaignSubView>('overview');

  // List filters & controls
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRangePreset>('all');
  const [customFrom, setCustomFrom] = useState('2026-11-01');
  const [customTo, setCustomTo] = useState('2026-12-31');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('start-desc');

  // Performance filter
  const [perfCampaignId, setPerfCampaignId] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals & Drawers
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignRecord | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignRecord | null>(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    campaign: CampaignRecord;
    nextStatus: CampaignStatus;
  } | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => setToastMessage(msg);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const selectedCampaign = useMemo(
    () => branchCampaigns.find((c) => c.id === selectedCampaignId) || null,
    [branchCampaigns, selectedCampaignId]
  );

  // Overview counts
  const overviewStats = useMemo(() => {
    const counts: Record<CampaignStatus, number> = {
      ACTIVE: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      DRAFT: 0,
      PAUSED: 0,
      CANCELLED: 0,
    };
    branchCampaigns.forEach((c) => {
      counts[c.status] += 1;
    });

    const launched = branchCampaigns.filter(
      (c) => c.status === 'ACTIVE' || c.status === 'PAUSED' || c.status === 'COMPLETED'
    );
    const totalReach = launched.reduce((s, c) => s + c.metrics.reach, 0);
    const totalClicks = launched.reduce((s, c) => s + c.metrics.clicks, 0);
    const totalLeads = launched.reduce((s, c) => s + c.metrics.leadsGenerated, 0);
    const totalSpent = launched.reduce((s, c) => s + c.metrics.amountSpent, 0);
    const totalBudget = branchCampaigns
      .filter((c) => c.status !== 'CANCELLED')
      .reduce((s, c) => s + c.budget, 0);
    const totalRevenue = launched.reduce((s, c) => s + c.metrics.revenueGenerated, 0);

    return {
      total: branchCampaigns.length,
      counts,
      totalReach,
      totalClicks,
      totalLeads,
      totalSpent,
      totalBudget,
      totalRevenue,
    };
  }, [branchCampaigns]);

  // Filtered & sorted campaigns for List view
  const filteredCampaigns = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = searchQuery.trim().toLowerCase();

    return branchCampaigns
      .filter((c) => {
        if (dateRange === 'active-now') {
          if (!(c.startDate <= todayStr && c.endDate >= todayStr)) return false;
        } else if (dateRange === 'month') {
          const monthPrefix = todayStr.slice(0, 7);
          if (
            !c.startDate.startsWith(monthPrefix) &&
            !c.endDate.startsWith(monthPrefix)
          ) {
            return false;
          }
        } else if (dateRange === 'custom') {
          if (c.endDate < customFrom || c.startDate > customTo) return false;
        }

        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;

        if (q) {
          const matches =
            c.name.toLowerCase().includes(q) ||
            c.campaignReference.toLowerCase().includes(q) ||
            c.targetAudience.toLowerCase().includes(q) ||
            c.objective.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            (c.promoCode && c.promoCode.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'start-desc') return b.startDate.localeCompare(a.startDate);
        if (sortBy === 'start-asc') return a.startDate.localeCompare(b.startDate);
        if (sortBy === 'budget-desc') return b.budget - a.budget;
        if (sortBy === 'budget-asc') return a.budget - b.budget;
        return a.name.localeCompare(b.name);
      });
  }, [
    branchCampaigns,
    dateRange,
    customFrom,
    customTo,
    statusFilter,
    typeFilter,
    searchQuery,
    sortBy,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    dateRange,
    customFrom,
    customTo,
    statusFilter,
    typeFilter,
    sortBy,
    pageSize,
    currentBranch?.id,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCampaigns = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredCampaigns.slice(start, start + pageSize);
  }, [filteredCampaigns, safePage, pageSize]);

  const activeFilterCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (typeFilter !== 'ALL' ? 1 : 0) +
    (dateRange !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setDateRange('all');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setSortBy('start-desc');
  };

  // Performance view dataset
  const performanceCampaigns = useMemo(() => {
    const launched = branchCampaigns.filter(
      (c) => c.status !== 'DRAFT' && c.status !== 'SCHEDULED'
    );
    if (perfCampaignId === 'ALL') return launched;
    return launched.filter((c) => c.id === perfCampaignId);
  }, [branchCampaigns, perfCampaignId]);

  const perfSummary = useMemo(() => {
    const selectedSingle =
      perfCampaignId !== 'ALL'
        ? branchCampaigns.find((c) => c.id === perfCampaignId) || null
        : null;

    const reach = performanceCampaigns.reduce((s, c) => s + c.metrics.reach, 0);
    const impressions = performanceCampaigns.reduce(
      (s, c) => s + c.metrics.impressions,
      0
    );
    const clicks = performanceCampaigns.reduce((s, c) => s + c.metrics.clicks, 0);
    const engagement = performanceCampaigns.reduce(
      (s, c) => s + c.metrics.engagement,
      0
    );
    const leads = performanceCampaigns.reduce(
      (s, c) => s + c.metrics.leadsGenerated,
      0
    );
    const bookings = performanceCampaigns.reduce(
      (s, c) => s + c.metrics.bookingsCount,
      0
    );
    const spent = performanceCampaigns.reduce(
      (s, c) => s + c.metrics.amountSpent,
      0
    );
    const budget = performanceCampaigns.reduce((s, c) => s + c.budget, 0);
    const revenue = performanceCampaigns.reduce(
      (s, c) => s + c.metrics.revenueGenerated,
      0
    );
    const conversionRate =
      clicks > 0 ? Number(((bookings / clicks) * 100).toFixed(1)) : 0;
    const roiPercent =
      spent > 0 ? Math.round(((revenue - spent) / spent) * 100) : 0;

    return {
      selectedSingle,
      reach,
      impressions,
      clicks,
      engagement,
      leads,
      bookings,
      spent,
      budget,
      revenue,
      conversionRate,
      roiPercent,
    };
  }, [performanceCampaigns, perfCampaignId, branchCampaigns]);

  // Actions
  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (campaign: CampaignRecord) => {
    setEditingCampaign(campaign);
    setShowFormModal(true);
  };

  const handleDuplicate = (campaign: CampaignRecord) => {
    const copy = duplicateCampaign(campaign.id);
    if (copy) {
      setSelectedCampaignId(copy.id);
      showFeedback(`Duplicated "${campaign.name}" as Draft (${copy.campaignReference}).`);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!statusConfirmTarget) return;
    const { campaign, nextStatus } = statusConfirmTarget;
    updateCampaignStatus(campaign.id, nextStatus);
    setStatusConfirmTarget(null);
    showFeedback(
      `Campaign ${campaign.campaignReference} updated to ${getCampaignStatusLabel(
        nextStatus
      )}.`
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const ref = deleteTarget.campaignReference;
    if (selectedCampaignId === deleteTarget.id) {
      setSelectedCampaignId(null);
    }
    deleteCampaign(deleteTarget.id);
    setDeleteTarget(null);
    showFeedback(`Campaign ${ref} permanently deleted.`);
  };

  const handleExportCsv = () => {
    if (filteredCampaigns.length === 0) return;
    const esc = (v: string | number | undefined) =>
      `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = [
      'Reference',
      'Name',
      'Type',
      'Objective',
      'Target Audience',
      'Start Date',
      'End Date',
      'Budget (INR)',
      'Spent (INR)',
      'Status',
      'Reach',
      'Clicks',
      'Leads',
      'ROI %',
    ];
    const rows = filteredCampaigns.map((c) =>
      [
        c.campaignReference,
        c.name,
        c.type,
        c.objective,
        c.targetAudience,
        c.startDate,
        c.endDate,
        c.budget,
        c.metrics.amountSpent,
        c.status,
        c.metrics.reach,
        c.metrics.clicks,
        c.metrics.leadsGenerated,
        c.metrics.roiPercent,
      ]
        .map(esc)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bode-campaigns-${currentBranch?.id || 'branch'}-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback(`Exported ${filteredCampaigns.length} campaign(s) to CSV.`);
  };

  const recentCampaigns = useMemo(() => {
    return [...branchCampaigns]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
  }, [branchCampaigns]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
              Campaigns
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-bode-forest text-bode-gold text-xs font-bold">
              {branchCampaigns.length}
            </span>
          </div>
          <p className="text-xs text-bode-muted mt-0.5">
            Promotional broadcasts, seasonal offers, and performance tracking for{' '}
            <span className="font-semibold text-bode-forest">
              {currentBranch?.shortName || 'BODE Spa'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredCampaigns.length === 0}
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
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="grid grid-cols-3 sm:inline-flex gap-1 p-1 bg-white rounded-xl border border-bode-border w-full sm:w-auto shadow-sm">
        {(
          [
            { id: 'overview', label: 'Overview', icon: LayoutGrid },
            { id: 'list', label: 'Campaign List', icon: List },
            { id: 'performance', label: 'Performance', icon: BarChart3 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = subView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubView(tab.id)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition justify-center whitespace-nowrap ${
                active
                  ? 'bg-bode-forest text-white shadow-sm'
                  : 'text-bode-muted hover:text-bode-forest hover:bg-bode-ivory/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-bode-gold' : ''}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
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
            aria-label="Dismiss feedback"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ══════════════════════ VIEW 1: CAMPAIGN OVERVIEW ══════════════════════ */}
      {subView === 'overview' && (
        <div className="space-y-5">
          {/* 5 KPI Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5 text-bode-gold" /> Total Campaigns
              </span>
              <p className="font-serif text-2xl font-bold text-bode-forest mt-1">
                {overviewStats.total}
              </p>
              <p className="text-[11px] text-bode-muted mt-0.5">
                Budget: ₹{overviewStats.totalBudget.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Play className="w-3.5 h-3.5" /> Active
              </span>
              <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">
                {overviewStats.counts.ACTIVE}
              </p>
              <p className="text-[11px] text-bode-muted mt-0.5">Currently running</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Scheduled
              </span>
              <p className="font-serif text-2xl font-bold text-blue-800 mt-1">
                {overviewStats.counts.SCHEDULED}
              </p>
              <p className="text-[11px] text-bode-muted mt-0.5">Queued for launch</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bode-forest flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-bode-emerald" /> Completed
              </span>
              <p className="font-serif text-2xl font-bold text-bode-forest mt-1">
                {overviewStats.counts.COMPLETED}
              </p>
              <p className="text-[11px] text-bode-muted mt-0.5">Finished runs</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
                <FileEdit className="w-3.5 h-3.5" /> Drafts
              </span>
              <p className="font-serif text-2xl font-bold text-bode-charcoal mt-1">
                {overviewStats.counts.DRAFT}
              </p>
              <p className="text-[11px] text-bode-muted mt-0.5">
                {overviewStats.counts.PAUSED} paused • {overviewStats.counts.CANCELLED} cancelled
              </p>
            </div>
          </div>

          {/* Performance Overview + Status Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Campaign Performance Overview */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-bode-border pb-3">
                <div>
                  <h2 className="font-serif text-base font-bold text-bode-forest">
                    Campaign Performance Overview
                  </h2>
                  <p className="text-[11px] text-bode-muted">
                    Cumulative reach, leads, and revenue across active &amp; completed campaigns
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubView('performance')}
                  className="text-xs font-semibold text-bode-emerald hover:text-bode-forest hover:underline"
                >
                  View Analytics →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-bode-ivory/60 border border-bode-border/80">
                  <span className="text-[10px] font-bold uppercase text-bode-muted">
                    Total Reach
                  </span>
                  <p className="font-serif text-lg font-bold text-bode-forest mt-0.5">
                    {overviewStats.totalReach.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-bode-ivory/60 border border-bode-border/80">
                  <span className="text-[10px] font-bold uppercase text-bode-muted">
                    Total Clicks
                  </span>
                  <p className="font-serif text-lg font-bold text-bode-forest mt-0.5">
                    {overviewStats.totalClicks.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-bode-ivory/60 border border-bode-border/80">
                  <span className="text-[10px] font-bold uppercase text-bode-muted">
                    Leads Generated
                  </span>
                  <p className="font-serif text-lg font-bold text-emerald-800 mt-0.5">
                    {overviewStats.totalLeads.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">
                    Attributed Revenue
                  </span>
                  <p className="font-serif text-lg font-bold text-emerald-800 mt-0.5">
                    ₹{overviewStats.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Active / Completed Campaign Bars */}
              <div className="space-y-2.5 pt-1">
                {branchCampaigns
                  .filter((c) => c.metrics.reach > 0)
                  .slice(0, 4)
                  .map((c) => {
                    const maxRev = Math.max(
                      1,
                      ...branchCampaigns.map((item) => item.metrics.revenueGenerated)
                    );
                    const widthPct = Math.max(
                      8,
                      Math.round((c.metrics.revenueGenerated / maxRev) * 100)
                    );
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCampaignId(c.id)}
                        className="cursor-pointer group space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-bode-forest group-hover:underline truncate pr-2">
                            {c.name}
                          </span>
                          <span className="text-[11px] font-bold text-bode-charcoal shrink-0">
                            ₹{c.metrics.revenueGenerated.toLocaleString('en-IN')} •{' '}
                            {c.metrics.bookingsCount} bookings
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-bode-ivory overflow-hidden">
                          <div
                            className="h-full rounded-full bg-bode-emerald group-hover:bg-bode-forest transition-all"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Campaign Status Summary */}
            <div className="bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-3.5">
              <h2 className="font-serif text-base font-bold text-bode-forest border-b border-bode-border pb-3">
                Campaign Status Summary
              </h2>
              <div className="space-y-2.5 text-xs">
                {CAMPAIGN_STATUSES.map((s) => {
                  const count = overviewStats.counts[s.value];
                  const pct =
                    overviewStats.total > 0
                      ? Math.round((count / overviewStats.total) * 100)
                      : 0;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(s.value);
                        setSubView('list');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-bode-ivory/60 transition space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCampaignStatusStyle(
                            s.value
                          )}`}
                        >
                          {s.label}
                        </span>
                        <span className="font-semibold text-bode-forest">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-bode-ivory overflow-hidden">
                        <div
                          className="h-full rounded-full bg-bode-gold"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-bold text-bode-forest">
                  Recent Campaigns
                </h2>
                <p className="text-[11px] text-bode-muted">
                  Click any campaign to inspect promotion preview, lifecycle actions, or metrics
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubView('list')}
                className="text-xs font-semibold text-bode-emerald hover:text-bode-forest hover:underline"
              >
                View All ({branchCampaigns.length}) →
              </button>
            </div>

            {recentCampaigns.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Megaphone className="w-8 h-8 text-bode-muted mx-auto" />
                <p className="font-serif font-semibold text-bode-forest">
                  No campaigns yet
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-bode-forest text-white text-xs font-semibold"
                >
                  + Create First Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {recentCampaigns.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCampaignId(c.id)}
                    className="rounded-xl border border-bode-border hover:border-bode-gold bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {c.imageUrl && (
                        <img
                          src={c.media?.dataUrl || c.imageUrl}
                          alt={c.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="w-16 h-16 rounded-xl object-cover border border-bode-border shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold text-bode-muted">
                            {c.campaignReference}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getCampaignStatusStyle(
                              c.status
                            )}`}
                          >
                            {getCampaignStatusLabel(c.status)}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-sm text-bode-forest mt-1 truncate">
                          {c.name}
                        </h3>
                        <p className="text-[11px] text-bode-muted truncate">
                          {c.type} • {c.targetAudience}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-bode-ivory/60 px-3 py-2 rounded-lg border border-bode-border/60">
                      <span className="text-bode-muted">
                        {c.startDate} → {c.endDate}
                      </span>
                      <span className="font-bold text-bode-forest">
                        Budget: ₹{c.budget.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════ VIEW 2: CAMPAIGN LIST ══════════════════════ */}
      {subView === 'list' && (
        <div className="space-y-5">
          {/* Search, Date, Sort & Filters Bar */}
          <div className="bg-white rounded-2xl border border-bode-border p-3.5 sm:p-4 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-bode-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by campaign name, ref #, promo code, or audience..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-bode-border bg-bode-ivory/40 text-xs sm:text-sm text-bode-charcoal focus:outline-none focus:ring-2 focus:ring-bode-forest"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Date Presets */}
                <div className="flex flex-wrap items-center bg-bode-ivory/60 rounded-xl border border-bode-border p-1">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'active-now', label: 'Running Now' },
                      { id: 'month', label: 'This Month' },
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
                    aria-label="Sort campaigns"
                  >
                    <option value="start-desc">Start Date: Newest</option>
                    <option value="start-asc">Start Date: Oldest</option>
                    <option value="budget-desc">Budget: High–Low</option>
                    <option value="budget-asc">Budget: Low–High</option>
                    <option value="name-asc">Name: A–Z</option>
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
                  {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                    <span className="w-2 h-2 rounded-full bg-bode-gold" />
                  )}
                </button>
              </div>
            </div>

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

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-bode-border/70 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as CampaignStatus | 'ALL')
                    }
                    className="w-full px-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
                  >
                    <option value="ALL">All Statuses</option>
                    {CAMPAIGN_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">
                    Campaign Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value as CampaignType | 'ALL')
                    }
                    className="w-full px-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
                  >
                    <option value="ALL">All Campaign Types</option>
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-bode-muted">
              <span>
                Showing <strong>{filteredCampaigns.length}</strong> of{' '}
                <strong>{branchCampaigns.length}</strong> campaigns
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

          {/* Campaigns Table & Mobile Card List */}
          <div className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-hidden">
            {filteredCampaigns.length === 0 ? (
              <div className="py-14 px-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-bode-ivory flex items-center justify-center mb-3">
                  <Megaphone className="w-6 h-6 text-bode-muted" />
                </div>
                <p className="font-serif text-base font-semibold text-bode-charcoal">
                  No campaigns found
                </p>
                <p className="text-xs text-bode-muted mt-1 max-w-sm mx-auto">
                  {branchCampaigns.length === 0
                    ? 'Create your first WhatsApp broadcast, seasonal promotion, or membership drive.'
                    : 'No campaigns match your current search or filter criteria.'}
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
                    <span>Create Campaign</span>
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
                        <th className="py-3 px-4">Campaign</th>
                        <th className="py-3 px-4">Type &amp; Objective</th>
                        <th className="py-3 px-4">Target Audience</th>
                        <th className="py-3 px-4">Schedule</th>
                        <th className="py-3 px-4 text-right">Budget</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4">Performance</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bode-border/50">
                      {paginatedCampaigns.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCampaignId(c.id)}
                          className="hover:bg-bode-ivory/35 transition cursor-pointer"
                        >
                          <td className="py-3.5 px-4 max-w-[230px]">
                            <span className="font-mono text-[10px] font-bold text-bode-muted block">
                              {c.campaignReference}
                            </span>
                            <p className="font-semibold text-bode-forest truncate">
                              {c.name}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-bode-ivory border border-bode-border text-bode-forest font-medium text-[10px] inline-block">
                              {c.type}
                            </span>
                            <p className="text-[11px] text-bode-muted mt-0.5">
                              {c.objective}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 max-w-[180px]">
                            <p className="text-bode-charcoal truncate">{c.targetAudience}</p>
                            <p className="text-[10px] text-bode-muted truncate">
                              {c.channels.join(', ')}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-bode-charcoal">
                            <p>{c.startDate}</p>
                            <p className="text-[10px] text-bode-muted">to {c.endDate}</p>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap font-serif font-bold text-sm text-bode-forest">
                            ₹{c.budget.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCampaignStatusStyle(
                                c.status
                              )}`}
                            >
                              {getCampaignStatusLabel(c.status)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {c.status === 'DRAFT' || c.status === 'SCHEDULED' ? (
                              <span className="text-[11px] text-bode-muted">Not launched</span>
                            ) : (
                              <div>
                                <p className="font-semibold text-bode-forest">
                                  {c.metrics.reach.toLocaleString('en-IN')} reach
                                </p>
                                <p className="text-[10px] text-emerald-700 font-semibold">
                                  {c.metrics.bookingsCount} bookings • {c.metrics.roiPercent}% ROI
                                </p>
                              </div>
                            )}
                          </td>

                          <td
                            className="py-3.5 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedCampaignId(c.id)}
                                className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest transition"
                                title="View Campaign"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(c)}
                                className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-emerald transition"
                                title="Edit Campaign"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicate(c)}
                                className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest transition"
                                title="Duplicate Campaign"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(c)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                                title="Delete Campaign"
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
                  {paginatedCampaigns.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCampaignId(c.id)}
                      className="p-4 space-y-2.5 hover:bg-bode-ivory/25 cursor-pointer transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-bode-muted">
                              {c.campaignReference}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getCampaignStatusStyle(
                                c.status
                              )}`}
                            >
                              {getCampaignStatusLabel(c.status)}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-bode-forest mt-1">
                            {c.name}
                          </h4>
                          <p className="text-[11px] text-bode-muted">
                            {c.type} • {c.objective}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-serif font-bold text-base text-bode-forest">
                            ₹{c.budget.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-bode-muted">Budget</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-bode-muted bg-bode-ivory/50 px-2.5 py-2 rounded-lg border border-bode-border/50">
                        <span>
                          {c.startDate} → {c.endDate}
                        </span>
                        <span className="font-semibold text-bode-forest">
                          {c.status === 'DRAFT' || c.status === 'SCHEDULED'
                            ? c.targetAudience
                            : `${c.metrics.reach.toLocaleString('en-IN')} reach • ${
                                c.metrics.bookingsCount
                              } bookings`}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-end gap-1.5 pt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedCampaignId(c.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-emerald text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(c)}
                          className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest"
                          title="Duplicate Campaign"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                          title="Delete Campaign"
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
                      {Math.min(safePage * pageSize, filteredCampaigns.length)} of{' '}
                      {filteredCampaigns.length}
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
        </div>
      )}

      {/* ══════════════════════ VIEW 3: CAMPAIGN PERFORMANCE ══════════════════════ */}
      {subView === 'performance' && (
        <div className="space-y-5">
          {/* Performance Selector */}
          <div className="bg-white rounded-2xl border border-bode-border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-base font-bold text-bode-forest">
                Campaign Performance Analytics
              </h2>
              <p className="text-[11px] text-bode-muted">
                Metrics tailored to active, paused, and completed campaigns
              </p>
            </div>
            <select
              value={perfCampaignId}
              onChange={(e) => setPerfCampaignId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-bode-border bg-bode-ivory/40 text-xs font-semibold text-bode-forest focus:outline-none focus:ring-2 focus:ring-bode-forest"
            >
              <option value="ALL">All Launched Campaigns</option>
              {branchCampaigns
                .filter((c) => c.status !== 'DRAFT' && c.status !== 'SCHEDULED')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({getCampaignStatusLabel(c.status)})
                  </option>
                ))}
            </select>
          </div>

          {performanceCampaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-bode-border p-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-bode-gold mx-auto" />
              <p className="font-serif text-base font-semibold text-bode-forest">
                No launched campaign metrics available
              </p>
              <p className="text-xs text-bode-muted">
                Activate a Draft or Scheduled campaign to begin tracking reach, clicks, leads, and ROI.
              </p>
            </div>
          ) : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-bode-gold" /> Reach
                  </span>
                  <p className="font-serif text-2xl font-bold text-bode-forest mt-1">
                    {perfSummary.reach.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-bode-muted mt-0.5">Unique guests reached</p>
                </div>

                {(!perfSummary.selectedSingle ||
                  perfSummary.selectedSingle.type === 'Social Media Ad' ||
                  perfSummary.selectedSingle.type === 'Seasonal Promotion') && (
                  <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-bode-emerald" /> Impressions
                    </span>
                    <p className="font-serif text-2xl font-bold text-bode-forest mt-1">
                      {perfSummary.impressions.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-bode-muted mt-0.5">Total ad/offer views</p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-bode-emerald" /> Clicks &amp; Engagement
                  </span>
                  <p className="font-serif text-2xl font-bold text-bode-forest mt-1">
                    {perfSummary.clicks.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-bode-muted mt-0.5">
                    {perfSummary.engagement.toLocaleString('en-IN')} engagements
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Leads &amp; Conversion
                  </span>
                  <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">
                    {perfSummary.leads.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-bode-muted mt-0.5">
                    {perfSummary.conversionRate}% click-to-booking ({perfSummary.bookings})
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-bode-gold" /> Amount Spent
                  </span>
                  <p className="font-serif text-2xl font-bold text-bode-forest mt-1">
                    ₹{perfSummary.spent.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-bode-muted mt-0.5">
                    of ₹{perfSummary.budget.toLocaleString('en-IN')} budget
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Return on Investment
                  </span>
                  <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">
                    {perfSummary.roiPercent.toLocaleString('en-IN')}%
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    ₹{perfSummary.revenue.toLocaleString('en-IN')} generated
                  </p>
                </div>
              </div>

              {/* Campaign Breakdown Comparison */}
              <div className="bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-bode-forest border-b border-bode-border pb-2.5">
                  Campaign-by-Campaign Comparison
                </h3>
                <div className="space-y-3">
                  {performanceCampaigns.map((c) => {
                    const spendPct =
                      c.budget > 0
                        ? Math.min(100, Math.round((c.metrics.amountSpent / c.budget) * 100))
                        : 0;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCampaignId(c.id)}
                        className="p-3.5 rounded-xl border border-bode-border bg-bode-ivory/35 hover:border-bode-gold transition cursor-pointer space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-bode-forest">
                                {c.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getCampaignStatusStyle(
                                  c.status
                                )}`}
                              >
                                {getCampaignStatusLabel(c.status)}
                              </span>
                            </div>
                            <p className="text-[11px] text-bode-muted">
                              {c.type} • {c.channels.join(', ')}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div>
                              <span className="text-[10px] uppercase text-bode-muted block">
                                Clicks / Leads
                              </span>
                              <span className="font-semibold text-bode-forest">
                                {c.metrics.clicks} / {c.metrics.leadsGenerated}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-bode-muted block">
                                Spent
                              </span>
                              <span className="font-semibold text-bode-charcoal">
                                ₹{c.metrics.amountSpent.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-bode-muted block">
                                ROI
                              </span>
                              <span className="font-bold text-emerald-700">
                                {c.metrics.roiPercent.toLocaleString('en-IN')}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-bode-border/60 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-bode-emerald"
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Campaign Detail Side Drawer */}
      {selectedCampaign && (
        <CampaignDetailDrawer
          campaign={selectedCampaign}
          branchName={currentBranch?.shortName}
          onClose={() => setSelectedCampaignId(null)}
          onEdit={(c) => {
            setEditingCampaign(c);
            setShowFormModal(true);
          }}
          onDuplicate={handleDuplicate}
          onRequestStatusChange={(c, nextStatus) =>
            setStatusConfirmTarget({ campaign: c, nextStatus })
          }
          onRequestDelete={(c) => setDeleteTarget(c)}
        />
      )}

      {/* Create / Edit Campaign Modal */}
      {showFormModal && (
        <CampaignFormModal
          existingCampaign={editingCampaign}
          onClose={() => {
            setShowFormModal(false);
            setEditingCampaign(null);
          }}
          onSaved={(saved, isEdit) => {
            setShowFormModal(false);
            setEditingCampaign(null);
            setSelectedCampaignId(saved.id);
            showFeedback(
              isEdit
                ? `Campaign ${saved.campaignReference} updated successfully.`
                : `Campaign "${saved.name}" (${saved.campaignReference}) created.`
            );
          }}
        />
      )}

      {/* Lifecycle Status Confirmation Modal */}
      {statusConfirmTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-bode-border space-y-4">
            <h3 className="font-serif font-bold text-lg text-bode-forest">
              Confirm Status Update
            </h3>
            <p className="text-xs text-bode-muted leading-relaxed">
              Are you sure you want to change{' '}
              <strong className="text-bode-forest">
                {statusConfirmTarget.campaign.name}
              </strong>{' '}
              to{' '}
              <strong className="text-bode-forest">
                {getCampaignStatusLabel(statusConfirmTarget.nextStatus)}
              </strong>
              ?
            </p>
            <div className="p-3 bg-bode-ivory rounded-xl border border-bode-border text-xs space-y-1">
              <p className="font-mono font-bold text-bode-forest">
                {statusConfirmTarget.campaign.campaignReference}
              </p>
              <p className="text-bode-muted">
                Channels: {statusConfirmTarget.campaign.channels.join(', ')}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStatusConfirmTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-bode-charcoal bg-bode-ivory hover:bg-bode-border/60 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition ${
                  statusConfirmTarget.nextStatus === 'CANCELLED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-bode-forest hover:bg-bode-forestLight'
                }`}
              >
                Confirm {getCampaignStatusLabel(statusConfirmTarget.nextStatus)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-bode-border space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-bode-forest">
                  Delete Campaign?
                </h3>
                <p className="text-xs text-bode-muted mt-1 leading-relaxed">
                  Are you sure you want to permanently delete this campaign and its performance history?
                </p>
              </div>
            </div>

            <div className="p-3 bg-bode-ivory rounded-xl border border-bode-border text-xs space-y-1">
              <p className="font-mono font-bold text-bode-forest">
                {deleteTarget.campaignReference}
              </p>
              <p className="font-semibold text-bode-charcoal">{deleteTarget.name}</p>
              <p className="text-bode-muted">
                {deleteTarget.type} • Budget: ₹{deleteTarget.budget.toLocaleString('en-IN')}
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
                <span>Delete Campaign</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { CampaignRecord, CampaignStatus } from '../types';
import {
  X,
  Edit3,
  Trash2,
  Copy,
  Megaphone,
  Calendar,
  Users,
  MapPin,
  IndianRupee,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Share2,
  Link2,
  Check,
  Clock,
  TrendingUp,
  History,
  Sparkles,
} from 'lucide-react';

interface CampaignDetailDrawerProps {
  campaign: CampaignRecord;
  branchName?: string;
  onClose: () => void;
  onEdit: (campaign: CampaignRecord) => void;
  onDuplicate: (campaign: CampaignRecord) => void;
  onRequestStatusChange: (campaign: CampaignRecord, nextStatus: CampaignStatus) => void;
  onRequestDelete: (campaign: CampaignRecord) => void;
}

export function getCampaignStatusStyle(status: CampaignStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PAUSED':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'COMPLETED':
      return 'bg-bode-ivory text-bode-forest border-bode-border';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getCampaignStatusLabel(status: CampaignStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'SCHEDULED':
      return 'Scheduled';
    case 'PAUSED':
      return 'Paused';
    case 'COMPLETED':
      return 'Completed';
    case 'DRAFT':
      return 'Draft';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export const CampaignDetailDrawer: React.FC<CampaignDetailDrawerProps> = ({
  campaign,
  branchName,
  onClose,
  onEdit,
  onDuplicate,
  onRequestStatusChange,
  onRequestDelete,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const link = campaign.promoLink || `https://bodewellnessspa.com/offers/${campaign.campaignReference.toLowerCase()}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🌿 *BODE WELLNESS SPA*\n*${campaign.contentHeadline || campaign.name}*\n\n${campaign.contentBody}${
      campaign.promoCode ? `\n\n🎟️ *Promo Code:* ${campaign.promoCode}` : ''
    }${campaign.promoLink ? `\n🔗 ${campaign.promoLink}` : ''}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const budgetUsagePct =
    campaign.budget > 0
      ? Math.min(100, Math.round((campaign.metrics.amountSpent / campaign.budget) * 100))
      : 0;

  const hasStarted =
    campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED';

  const timelineSteps = [
    {
      label: 'Created',
      date: campaign.createdAt.split(' ')[0],
      done: true,
    },
    {
      label: 'Start Date',
      date: campaign.startDate,
      done: hasStarted,
    },
    {
      label:
        campaign.status === 'PAUSED'
          ? 'Paused'
          : campaign.status === 'CANCELLED'
          ? 'Cancelled'
          : 'Live Execution',
      date: campaign.status === 'ACTIVE' ? 'In Progress' : getCampaignStatusLabel(campaign.status),
      done: campaign.status === 'ACTIVE' || campaign.status === 'COMPLETED',
    },
    {
      label: 'End Date',
      date: campaign.endDate,
      done: campaign.status === 'COMPLETED',
    },
  ];

  // Relevant performance metrics matched to campaign type
  const showImpressions =
    campaign.type === 'Social Media Ad' || campaign.type === 'Seasonal Promotion';
  const showLeads =
    campaign.type === 'Social Media Ad' ||
    campaign.type === 'Membership Drive' ||
    campaign.objective === 'Lead Generation';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden z-10">
        {/* Drawer Header */}
        <div className="bg-bode-forest text-white p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-bode-gold text-bode-forest flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[11px] text-bode-gold font-semibold block">
                {campaign.campaignReference}
              </span>
              <h3 className="font-serif text-lg font-bold leading-snug break-words">
                {campaign.name}
              </h3>
              <p className="text-xs text-white/75 mt-0.5">
                {campaign.type} • {campaign.objective}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(campaign)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Edit Campaign"
              aria-label="Edit campaign"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(campaign)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Duplicate Campaign"
              aria-label="Duplicate campaign"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(campaign)}
              className="p-1.5 rounded-lg text-white/80 hover:text-red-200 hover:bg-white/10 transition"
              title="Delete Campaign"
              aria-label="Delete campaign"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status & Lifecycle Controls */}
          <div className="rounded-xl bg-bode-ivory border border-bode-border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted block">
                  Current Status
                </span>
                <p className="text-xs text-bode-charcoal mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-bode-emerald" />
                  <span>
                    {campaign.startDate} → {campaign.endDate}
                  </span>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${getCampaignStatusStyle(
                  campaign.status
                )}`}
              >
                {getCampaignStatusLabel(campaign.status)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-bode-border/70">
              {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
                <button
                  type="button"
                  onClick={() => onRequestStatusChange(campaign, 'ACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Activate Campaign</span>
                </button>
              )}

              {campaign.status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => onRequestStatusChange(campaign, 'PAUSED')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Campaign</span>
                </button>
              )}

              {campaign.status === 'PAUSED' && (
                <button
                  type="button"
                  onClick={() => onRequestStatusChange(campaign, 'ACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Campaign</span>
                </button>
              )}

              {(campaign.status === 'ACTIVE' || campaign.status === 'PAUSED') && (
                <button
                  type="button"
                  onClick={() => onRequestStatusChange(campaign, 'COMPLETED')}
                  className="px-3 py-1.5 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-bode-gold" />
                  <span>Complete</span>
                </button>
              )}

              {campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => onRequestStatusChange(campaign, 'CANCELLED')}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition ml-auto"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>

          {/* Promotion Creative & Share Card (aligned with bode-photos Share Promotion) */}
          <div className="rounded-xl border border-bode-border bg-white overflow-hidden shadow-sm">
            {(campaign.media?.dataUrl || campaign.imageUrl) && (
              <img
                src={campaign.media?.dataUrl || campaign.imageUrl}
                alt={campaign.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-36 object-cover border-b border-bode-border"
              />
            )}
            <div className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-serif font-bold text-sm text-bode-forest">
                  {campaign.contentHeadline || campaign.name}
                </h4>
                {campaign.promoCode && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-bode-gold/20 text-bode-forest font-bold border border-bode-gold/40 shrink-0">
                    {campaign.promoCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-bode-charcoal/90 leading-relaxed">
                {campaign.contentBody}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {campaign.channels.map((ch) => (
                  <span
                    key={ch}
                    className="px-2 py-0.5 rounded-full bg-bode-ivory border border-bode-border text-[10px] font-semibold text-bode-forest"
                  >
                    {ch}
                  </span>
                ))}
                {campaign.showOnDigitalCatalogue && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-800">
                    On Digital Catalogue
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-bode-border/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-lg border border-bode-border bg-bode-ivory/50 hover:bg-bode-ivory text-bode-forest text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Copy Offer Link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Campaign Information */}
          <div className="bg-bode-ivory/50 rounded-xl p-4 border border-bode-border space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-bode-forest">
              Campaign Information
            </h4>
            <p className="text-bode-charcoal leading-relaxed">{campaign.description}</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Target Audience
                </span>
                <span className="font-semibold text-bode-charcoal flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-bode-muted shrink-0" />
                  <span>{campaign.targetAudience}</span>
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Segment
                </span>
                <span className="font-medium text-bode-charcoal mt-0.5 block">
                  {campaign.audienceSegment || 'General Audience'}
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Location Scope
                </span>
                <span className="font-medium text-bode-charcoal flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-bode-muted shrink-0" />
                  <span>{campaign.locationScope || branchName || 'Assigned Branch'}</span>
                </span>
              </div>
              <div>
                <span className="text-bode-muted block text-[10px] uppercase">
                  Budget &amp; Spend
                </span>
                <span className="font-semibold text-bode-forest flex items-center gap-1 mt-0.5">
                  <IndianRupee className="w-3 h-3 text-bode-gold shrink-0" />
                  <span>
                    ₹{campaign.metrics.amountSpent.toLocaleString('en-IN')} / ₹
                    {campaign.budget.toLocaleString('en-IN')}
                  </span>
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-bode-muted mb-1">
                <span>Budget Utilization</span>
                <span className="font-bold text-bode-forest">{budgetUsagePct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-bode-border/70 overflow-hidden">
                <div
                  className="h-full bg-bode-emerald rounded-full transition-all"
                  style={{ width: `${budgetUsagePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Campaign Timeline */}
          <div className="bg-white rounded-xl p-4 border border-bode-border space-y-3">
            <h4 className="font-serif font-bold text-sm text-bode-forest flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-bode-emerald" />
              <span>Campaign Timeline</span>
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {timelineSteps.map((stepItem) => (
                <div
                  key={stepItem.label}
                  className={`p-2 rounded-lg border text-center ${
                    stepItem.done
                      ? 'bg-bode-ivory border-bode-gold/50 text-bode-forest'
                      : 'bg-gray-50 border-bode-border/60 text-bode-muted'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider truncate">
                    {stepItem.label}
                  </p>
                  <p className="text-[11px] font-semibold mt-0.5 truncate">
                    {stepItem.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl p-4 border border-bode-border space-y-3">
            <h4 className="font-serif font-bold text-sm text-bode-forest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-bode-emerald" />
              <span>Campaign Performance</span>
            </h4>

            {!hasStarted ? (
              <div className="p-4 rounded-xl bg-bode-ivory/50 border border-bode-border text-center text-xs text-bode-muted space-y-1">
                <Sparkles className="w-5 h-5 text-bode-gold mx-auto" />
                <p className="font-semibold text-bode-forest">
                  Campaign has not launched yet
                </p>
                <p>
                  Reach, clicks, leads, and ROI metrics will appear once the campaign is activated.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-bode-ivory/50 border border-bode-border">
                  <span className="text-[10px] uppercase text-bode-muted font-bold">
                    Reach
                  </span>
                  <p className="font-serif text-base font-bold text-bode-forest mt-0.5">
                    {campaign.metrics.reach.toLocaleString('en-IN')}
                  </p>
                </div>
                {showImpressions && (
                  <div className="p-2.5 rounded-lg bg-bode-ivory/50 border border-bode-border">
                    <span className="text-[10px] uppercase text-bode-muted font-bold">
                      Impressions
                    </span>
                    <p className="font-serif text-base font-bold text-bode-forest mt-0.5">
                      {campaign.metrics.impressions.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-bode-ivory/50 border border-bode-border">
                  <span className="text-[10px] uppercase text-bode-muted font-bold">
                    Clicks
                  </span>
                  <p className="font-serif text-base font-bold text-bode-forest mt-0.5">
                    {campaign.metrics.clicks.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-bode-ivory/50 border border-bode-border">
                  <span className="text-[10px] uppercase text-bode-muted font-bold">
                    Engagement
                  </span>
                  <p className="font-serif text-base font-bold text-bode-forest mt-0.5">
                    {campaign.metrics.engagement.toLocaleString('en-IN')}
                  </p>
                </div>
                {showLeads && (
                  <div className="p-2.5 rounded-lg bg-bode-ivory/50 border border-bode-border">
                    <span className="text-[10px] uppercase text-bode-muted font-bold">
                      Leads
                    </span>
                    <p className="font-serif text-base font-bold text-emerald-800 mt-0.5">
                      {campaign.metrics.leadsGenerated.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-bode-ivory/50 border border-bode-border">
                  <span className="text-[10px] uppercase text-bode-muted font-bold">
                    Conversion
                  </span>
                  <p className="font-serif text-base font-bold text-emerald-800 mt-0.5">
                    {campaign.metrics.conversionRate}%
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase text-emerald-800 font-bold">
                    ROI
                  </span>
                  <p className="font-serif text-base font-bold text-emerald-800 mt-0.5">
                    {campaign.metrics.roiPercent.toLocaleString('en-IN')}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-xl p-4 border border-bode-border space-y-3">
            <h4 className="font-serif font-bold text-sm text-bode-forest flex items-center gap-1.5">
              <History className="w-4 h-4 text-bode-emerald" />
              <span>Activity History ({campaign.activityLog.length})</span>
            </h4>
            <div className="space-y-2.5">
              {campaign.activityLog.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-bode-ivory/40 border border-bode-border/70 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-bode-forest">{item.action}</span>
                    <span className="text-[10px] text-bode-muted">{item.timestamp}</span>
                  </div>
                  {item.detail && (
                    <p className="text-[11px] text-bode-charcoal/80">{item.detail}</p>
                  )}
                  <p className="text-[10px] text-bode-muted">By {item.performedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-bode-border bg-bode-ivory/50 grid grid-cols-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(campaign)}
            className="py-2 px-3 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(campaign)}
            className="py-2 px-3 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-bode-emerald text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>
          <button
            type="button"
            onClick={() => onRequestDelete(campaign)}
            className="py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

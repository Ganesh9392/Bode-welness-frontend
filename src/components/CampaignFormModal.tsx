import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  CampaignChannel,
  CampaignMediaAttachment,
  CampaignObjective,
  CampaignRecord,
  CampaignStatus,
  CampaignType,
} from '../types';
import {
  X,
  Megaphone,
  Target,
  Calendar,
  IndianRupee,
  FileText,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Users,
  Link2,
} from 'lucide-react';

export const CAMPAIGN_TYPES: CampaignType[] = [
  'WhatsApp Broadcast',
  'Seasonal Promotion',
  'Social Media Ad',
  'SMS Alert',
  'Membership Drive',
  'Loyalty & Referral',
];

export const CAMPAIGN_OBJECTIVES: CampaignObjective[] = [
  'Bookings & Appointments',
  'Lead Generation',
  'Brand Awareness',
  'Repeat Visits & Retention',
  'Membership Signups',
];

export const CAMPAIGN_CHANNELS: CampaignChannel[] = [
  'WhatsApp',
  'SMS',
  'Instagram',
  'Facebook',
  'Email',
  'Digital Catalogue',
];

export const CAMPAIGN_STATUSES: { value: CampaignStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const DEFAULT_SPA_BANNER =
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80';

const MAX_MEDIA_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

interface CampaignFormModalProps {
  existingCampaign?: CampaignRecord | null;
  onClose: () => void;
  onSaved: (campaign: CampaignRecord, isEdit: boolean) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  channels?: string;
  contentBody?: string;
  media?: string;
}

export const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
  existingCampaign,
  onClose,
  onSaved,
}) => {
  const { currentBranch, createCampaign, updateCampaign } = useApp();
  const isEdit = Boolean(existingCampaign);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 14);
  const defaultEndStr = nextWeekDate.toISOString().split('T')[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basics & Targeting
  const [name, setName] = useState(existingCampaign?.name || '');
  const [type, setType] = useState<CampaignType>(
    existingCampaign?.type || 'WhatsApp Broadcast'
  );
  const [objective, setObjective] = useState<CampaignObjective>(
    existingCampaign?.objective || 'Bookings & Appointments'
  );
  const [description, setDescription] = useState(existingCampaign?.description || '');
  const [targetAudience, setTargetAudience] = useState(
    existingCampaign?.targetAudience || ''
  );
  const [audienceSegment, setAudienceSegment] = useState(
    existingCampaign?.audienceSegment || ''
  );
  const [locationScope, setLocationScope] = useState(
    existingCampaign?.locationScope ||
      (currentBranch?.id === 'branch-nagole'
        ? 'Nagole & LB Nagar (6 km)'
        : 'ECIL & A.S. Rao Nagar (6 km)')
  );

  // Step 2: Schedule, Budget & Channels
  const [startDate, setStartDate] = useState(existingCampaign?.startDate || todayStr);
  const [endDate, setEndDate] = useState(existingCampaign?.endDate || defaultEndStr);
  const [budgetStr, setBudgetStr] = useState(
    existingCampaign ? String(existingCampaign.budget) : '5000'
  );
  const [status, setStatus] = useState<CampaignStatus>(
    existingCampaign?.status || 'DRAFT'
  );
  const [channels, setChannels] = useState<CampaignChannel[]>(
    existingCampaign?.channels || ['WhatsApp', 'Digital Catalogue']
  );

  // Step 3: Content & Media
  const [contentHeadline, setContentHeadline] = useState(
    existingCampaign?.contentHeadline || ''
  );
  const [contentBody, setContentBody] = useState(
    existingCampaign?.contentBody || ''
  );
  const [ctaText, setCtaText] = useState(existingCampaign?.ctaText || 'Book Now');
  const [promoCode, setPromoCode] = useState(existingCampaign?.promoCode || '');
  const [promoLink, setPromoLink] = useState(
    existingCampaign?.promoLink ||
      `https://bodewellnessspa.com/offers/${currentBranch?.id === 'branch-nagole' ? 'nagole' : 'ecil'}`
  );
  const [showOnDigitalCatalogue, setShowOnDigitalCatalogue] = useState(
    existingCampaign?.showOnDigitalCatalogue ?? true
  );
  const [media, setMedia] = useState<CampaignMediaAttachment | undefined>(
    existingCampaign?.media
  );
  const [imageUrl, setImageUrl] = useState(
    existingCampaign?.imageUrl || DEFAULT_SPA_BANNER
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const clearError = (key: keyof FormErrors) => {
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const toggleChannel = (ch: CampaignChannel) => {
    clearError('channels');
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]
    );
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearError('media');

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        media: 'Please upload an image file (JPG, PNG, or WEBP).',
      }));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_MEDIA_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        media: 'Banner image must be 2 MB or smaller.',
      }));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMedia({
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

  const validateStep1 = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Campaign name is required.';
    if (!description.trim()) next.description = 'Campaign description is required.';
    if (!targetAudience.trim()) next.targetAudience = 'Target audience is required.';
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: FormErrors = {};
    if (!startDate) next.startDate = 'Start date is required.';
    if (!endDate) next.endDate = 'End date is required.';
    if (startDate && endDate && endDate < startDate) {
      next.endDate = 'End date must be on or after the start date.';
    }
    const parsedBudget = Number(budgetStr);
    if (!budgetStr.trim() || isNaN(parsedBudget) || parsedBudget <= 0) {
      next.budget = 'Enter a valid budget greater than ₹0.';
    }
    if (channels.length === 0) {
      next.channels = 'Select at least one campaign channel.';
    }
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const validateStep3 = (): boolean => {
    const next: FormErrors = {};
    if (!contentBody.trim()) {
      next.contentBody = 'Campaign message / offer copy is required.';
    }
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleStepJump = (targetStep: 1 | 2 | 3) => {
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }
    if (step === 1 && !validateStep1()) return;
    if (targetStep === 3 && step <= 2 && !validateStep2()) return;
    setStep(targetStep);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }
    if (!validateStep3()) {
      setStep(3);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        type,
        objective,
        targetAudience: targetAudience.trim(),
        audienceSegment: audienceSegment.trim() || undefined,
        locationScope: locationScope.trim() || undefined,
        startDate,
        endDate,
        budget: Math.round(Number(budgetStr)),
        channels,
        contentHeadline: contentHeadline.trim() || name.trim().toUpperCase(),
        contentBody: contentBody.trim(),
        ctaText: ctaText.trim() || 'Book Now',
        promoCode: promoCode.trim().toUpperCase() || undefined,
        promoLink: promoLink.trim() || undefined,
        showOnDigitalCatalogue,
        media,
        imageUrl: media?.dataUrl || imageUrl || DEFAULT_SPA_BANNER,
        status,
      };

      if (isEdit && existingCampaign) {
        const updated = updateCampaign(existingCampaign.id, payload);
        onSaved(updated || { ...existingCampaign, ...payload }, true);
      } else {
        const created = createCampaign(payload);
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

  const previewImageSrc = media?.dataUrl || imageUrl || DEFAULT_SPA_BANNER;

  const stepsMeta = [
    { num: 1 as const, label: 'Basics & Audience' },
    { num: 2 as const, label: 'Schedule & Budget' },
    { num: 3 as const, label: 'Content & Media' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-bode-border max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bode-gold text-bode-forest flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-base sm:text-lg font-semibold truncate">
                {isEdit ? 'Edit Campaign' : 'Create New Campaign'}
              </h3>
              <p className="text-[11px] text-bode-gold truncate">
                {isEdit
                  ? existingCampaign?.campaignReference
                  : currentBranch?.shortName || 'Branch Promotion'}
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

        {/* Stepper Bar */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-bode-ivory/60 border-b border-bode-border grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {stepsMeta.map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleStepJump(s.num)}
                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition min-w-0 ${
                  isActive
                    ? 'bg-bode-forest text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-white text-bode-muted border border-bode-border hover:text-bode-forest'
                }`}
              >
                <span
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-bode-gold text-bode-forest'
                      : isDone
                      ? 'bg-emerald-700 text-white'
                      : 'bg-bode-ivory text-bode-muted'
                  }`}
                >
                  {s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Campaign Basics &amp; Targeting
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Campaign Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError('name');
                    }}
                    placeholder="e.g. Winter Ayurvedic Potli Revival"
                    className={inputCls(errors.name)}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Campaign Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CampaignType)}
                    className={inputCls()}
                  >
                    {CAMPAIGN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Campaign Objective *</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value as CampaignObjective)}
                    className={inputCls()}
                  >
                    {CAMPAIGN_OBJECTIVES.map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Campaign Description *</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearError('description');
                    }}
                    placeholder="Summarize the promotional goal, eligible treatments, and key terms..."
                    className={inputCls(errors.description)}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Target Audience *</label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-bode-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => {
                        setTargetAudience(e.target.value);
                        clearError('targetAudience');
                      }}
                      placeholder="e.g. Returning Guests (Last 90 Days)"
                      className={`${inputCls(errors.targetAudience)} pl-8`}
                    />
                  </div>
                  {errors.targetAudience && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {errors.targetAudience}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Audience Segment</label>
                  <input
                    type="text"
                    value={audienceSegment}
                    onChange={(e) => setAudienceSegment(e.target.value)}
                    placeholder="e.g. VIP & Membership Holders"
                    className={inputCls()}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Branch / Location Scope</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-bode-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={locationScope}
                      onChange={(e) => setLocationScope(e.target.value)}
                      placeholder="e.g. ECIL, A.S. Rao Nagar & Sainikpuri (6 km)"
                      className={`${inputCls()} pl-8`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Schedule, Budget &amp; Channels
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      clearError('startDate');
                      clearError('endDate');
                    }}
                    className={inputCls(errors.startDate)}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      clearError('endDate');
                    }}
                    className={inputCls(errors.endDate)}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.endDate}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Campaign Budget (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-bode-forest absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={budgetStr}
                      onChange={(e) => {
                        setBudgetStr(e.target.value);
                        clearError('budget');
                      }}
                      placeholder="5000"
                      className={`${inputCls(errors.budget)} pl-8 font-semibold text-bode-forest`}
                    />
                  </div>
                  {errors.budget && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.budget}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Campaign Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                    className={inputCls()}
                  >
                    {(isEdit
                      ? CAMPAIGN_STATUSES
                      : CAMPAIGN_STATUSES.filter((s) =>
                          ['DRAFT', 'SCHEDULED', 'ACTIVE'].includes(s.value)
                        )
                    ).map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Distribution Channels *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CAMPAIGN_CHANNELS.map((ch) => {
                    const selected = channels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                          selected
                            ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                            : 'bg-white text-bode-charcoal border-bode-border hover:bg-bode-ivory'
                        }`}
                      >
                        <span>{ch}</span>
                        {selected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-bode-gold shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.channels && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.channels}</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Campaign Content &amp; Creative
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Promotional Headline</label>
                  <input
                    type="text"
                    value={contentHeadline}
                    onChange={(e) => setContentHeadline(e.target.value)}
                    placeholder="e.g. WINTER WELLNESS — 20% OFF POTLI & HOT STONE"
                    className={inputCls()}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Campaign Message / Copy *</label>
                  <textarea
                    rows={3}
                    value={contentBody}
                    onChange={(e) => {
                      setContentBody(e.target.value);
                      clearError('contentBody');
                    }}
                    placeholder="Write the offer message guests will see on WhatsApp, SMS, or Digital Catalogue..."
                    className={inputCls(errors.contentBody)}
                  />
                  {errors.contentBody && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.contentBody}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Promo Code</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WINTER20"
                    className={`${inputCls()} font-mono uppercase`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Call-to-Action Label</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Book Ritual Now"
                    className={inputCls()}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Shareable Offer Link</label>
                  <div className="relative">
                    <Link2 className="w-3.5 h-3.5 text-bode-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoLink}
                      onChange={(e) => setPromoLink(e.target.value)}
                      placeholder="https://bodewellnessspa.com/offers/..."
                      className={`${inputCls()} pl-8 font-mono`}
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-bode-ivory/50 border border-bode-border cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={showOnDigitalCatalogue}
                  onChange={(e) => setShowOnDigitalCatalogue(e.target.checked)}
                  className="w-4 h-4 rounded accent-bode-forest"
                />
                <span className="font-semibold text-bode-forest">
                  Show on Digital Catalogue
                </span>
                <span className="text-bode-muted text-[11px] ml-auto">
                  Feature offer card for guests
                </span>
              </label>

              {/* Media Upload */}
              <div>
                <label className={labelCls}>
                  Campaign Banner Image (JPG, PNG, WEBP — Max 2 MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 p-3.5 rounded-xl border border-dashed border-bode-border bg-bode-ivory/40 hover:bg-bode-ivory hover:border-bode-emerald transition flex items-center justify-center gap-2 text-xs font-semibold text-bode-forest"
                  >
                    <Upload className="w-4 h-4 text-bode-emerald" />
                    <span>{media ? 'Replace Banner Image' : 'Upload Banner Image'}</span>
                  </button>

                  {media && (
                    <button
                      type="button"
                      onClick={() => {
                        setMedia(undefined);
                        setImageUrl(DEFAULT_SPA_BANNER);
                      }}
                      className="px-3.5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Upload</span>
                    </button>
                  )}
                </div>

                {errors.media && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.media}</span>
                  </p>
                )}
              </div>

              {/* Live Promotion Card Preview */}
              <div className="rounded-xl border border-bode-border bg-bode-ivory/40 p-3.5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-bode-gold" /> Live Promotion Preview
                </span>
                <div className="bg-white rounded-xl border border-bode-border overflow-hidden shadow-sm">
                  <img
                    src={previewImageSrc}
                    alt="Campaign banner preview"
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_SPA_BANNER) {
                        e.currentTarget.src = DEFAULT_SPA_BANNER;
                      }
                    }}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-serif font-bold text-sm text-bode-forest">
                        {contentHeadline || name || 'CAMPAIGN HEADLINE'}
                      </p>
                      {promoCode && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-bode-gold/20 text-bode-forest font-bold border border-bode-gold/40">
                          {promoCode}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-bode-muted leading-relaxed">
                      {contentBody || 'Your promotional message preview will appear here.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-bode-border sticky bottom-0 bg-white pb-1">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as 1 | 2)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-bode-border text-bode-charcoal bg-white hover:bg-bode-ivory transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-bode-border text-bode-charcoal bg-white hover:bg-bode-ivory transition"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step < 3 ? (
                <button
                  key="btn-next-step"
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 text-bode-gold" />
                </button>
              ) : (
                <button
                  key="btn-submit-campaign"
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
                      <span>{isEdit ? 'Update Campaign' : 'Save Campaign'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

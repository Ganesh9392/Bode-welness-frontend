import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { User, Phone, Mail, Calendar, Tag, X } from 'lucide-react';

interface AddGuestFormProps {
  initialMobile?: string;
  existingCustomer?: Customer;
  onSave: (customer: Customer) => void;
  onCancel?: () => void;
  compact?: boolean;
}

interface FormErrors {
  mobileNumber?: string;
  name?: string;
}

const SOURCE_OPTIONS = ['Walk-in', 'Website', 'Referral', 'Social Media', 'Phone', 'Other'] as const;
const GENDER_OPTIONS = ['Female', 'Male', 'Other'] as const;

export const AddGuestForm: React.FC<AddGuestFormProps> = ({
  initialMobile = '',
  existingCustomer,
  onSave,
  onCancel,
}) => {
  const { createCustomer, updateCustomer } = useApp();

  const [form, setForm] = useState({
    mobileNumber: existingCustomer?.mobileNumber || initialMobile,
    alternateNumber: existingCustomer?.alternateNumber || '',
    name: existingCustomer?.name || '',
    email: existingCustomer?.email || '',
    dateOfBirth: existingCustomer?.dateOfBirth || '',
    anniversary: existingCustomer?.anniversary || '',
    gstNumber: existingCustomer?.gstNumber || '',
    source: existingCustomer?.source || 'Walk-in',
    gender: (existingCustomer?.gender || '') as 'Male' | 'Female' | 'Other' | '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const digits = form.mobileNumber.replace(/\D/g, '');
    if (!digits || digits.length !== 10) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits.';
    }
    if (!form.name.trim()) {
      newErrors.name = 'Guest name is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const digits = form.mobileNumber.replace(/\D/g, '');
      const altDigits = form.alternateNumber.replace(/\D/g, '');
      const payload = {
        name: form.name.trim(),
        mobileNumber: digits,
        alternateNumber: altDigits || undefined,
        whatsAppNumber: existingCustomer?.whatsAppNumber || digits,
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        anniversary: form.anniversary || undefined,
        gstNumber: form.gstNumber.trim() || undefined,
        source: form.source,
        gender: form.gender || undefined,
      };
      if (existingCustomer) {
        updateCustomer(existingCustomer.id, payload);
        onSave({ ...existingCustomer, ...payload });
      } else {
        const newCustomer = createCustomer(payload);
        onSave(newCustomer);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (error?: string) =>
    `w-full text-xs text-bode-charcoal bg-white border ${
      error ? 'border-red-400 focus:ring-red-400' : 'border-bode-border focus:ring-bode-forest'
    } rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition placeholder:text-bode-muted/70`;

  const labelCls = 'block text-[11px] font-semibold text-bode-muted uppercase tracking-wide mb-1';

  return (
    <div className="space-y-5">
      {/* Section: Contact */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted mb-3 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" /> Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mobile */}
          <div>
            <label className={labelCls}>Mobile Number *</label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-bode-charcoal bg-bode-ivory border border-bode-border rounded-lg px-2.5 py-2.5 shrink-0">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobileNumber}
                onChange={(e) => set('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
                className={inputCls(errors.mobileNumber)}
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-red-500 text-[11px] mt-1">{errors.mobileNumber}</p>
            )}
          </div>

          {/* Alternate */}
          <div>
            <label className={labelCls}>Alternate Number</label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-bode-charcoal bg-bode-ivory border border-bode-border rounded-lg px-2.5 py-2.5 shrink-0">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.alternateNumber}
                onChange={(e) => set('alternateNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Optional"
                className={inputCls()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Personal */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted mb-3 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" /> Personal Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className={labelCls}>Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Priya Sharma"
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="Optional"
              className={inputCls()}
            />
          </div>

          {/* Gender */}
          <div>
            <label className={labelCls}>Gender</label>
            <div className="flex gap-2 h-[38px]">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set('gender', form.gender === g ? '' : g)}
                  className={`flex-1 text-[11px] font-semibold rounded-lg border transition ${
                    form.gender === g
                      ? 'bg-bode-forest text-white border-bode-forest'
                      : 'bg-white text-bode-charcoal border-bode-border hover:border-bode-forest/50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className={labelCls}>Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              className={inputCls()}
            />
          </div>

          {/* Anniversary */}
          <div>
            <label className={labelCls}>Anniversary Date</label>
            <input
              type="date"
              value={form.anniversary}
              onChange={(e) => set('anniversary', e.target.value)}
              className={inputCls()}
            />
          </div>
        </div>
      </div>

      {/* Section: Business */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-bode-muted mb-3 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" /> Additional Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source */}
          <div>
            <label className={labelCls}>How did they hear about us?</label>
            <select
              value={form.source}
              onChange={(e) => set('source', e.target.value)}
              className={inputCls()}
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* GST */}
          <div>
            <label className={labelCls}>GST Number</label>
            <input
              type="text"
              value={form.gstNumber}
              onChange={(e) => set('gstNumber', e.target.value.toUpperCase())}
              placeholder="Optional — for business invoicing"
              maxLength={15}
              className={`${inputCls()} font-mono`}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2 border-t border-bode-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-bode-border text-bode-charcoal bg-white hover:bg-bode-ivory transition"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-bode-forest text-white hover:bg-bode-emerald transition disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : existingCustomer ? (
            'Update Guest'
          ) : (
            'Add Guest'
          )}
        </button>
      </div>
    </div>
  );
};

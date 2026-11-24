import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerVisit, ServiceItem } from '../types';
import {
  User,
  Phone,
  Mail,
  Search,
  Check,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';

interface CreateServicePageProps {
  onNavigate: (tab: string, visitId?: string) => void;
}

export const CreateServicePage: React.FC<CreateServicePageProps> = ({ onNavigate }) => {
  const {
    currentBranch,
    branchServices,
    branchStaff,
    branchCustomers,
    findCustomerByPhone,
    createServiceVisit,
  } = useApp();

  // Wizard Step: 1, 2, 3, 4, 5 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Customer State
  const [mobileSearch, setMobileSearch] = useState<string>('');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState<string>('');
  const [sameAsMobile, setSameAsMobile] = useState<boolean>(true);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Service Selection State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(branchServices[0]?.id || '');
  const [selectedDurationIndex, setSelectedDurationIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Step 3: Appointment Type State
  const [appointmentType, setAppointmentType] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('18:00');
  const [assignedStaffId, setAssignedStaffId] = useState<string>('');
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');
  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Success Created Visit
  const [createdVisit, setCreatedVisit] = useState<CustomerVisit | null>(null);

  // Search existing customer by phone
  const handlePhoneSearch = () => {
    if (!mobileSearch.trim()) return;
    const found = findCustomerByPhone(mobileSearch.trim());
    if (found) {
      setExistingCustomer(found);
      setCustomerName(found.name);
      setCustomerMobile(found.mobileNumber);
      setCustomerWhatsApp(found.whatsAppNumber);
      setCustomerEmail(found.email || '');
      setStep1Error(null);
    } else {
      setExistingCustomer(null);
      setCustomerMobile(mobileSearch);
      setCustomerWhatsApp(mobileSearch);
      setStep1Error('No existing customer found with this mobile. Please fill in details for a new guest.');
    }
  };

  const handleMobileChange = (val: string) => {
    setCustomerMobile(val);
    if (sameAsMobile) {
      setCustomerWhatsApp(val);
    }
  };

  // Step 1 validation
  const validateStep1 = () => {
    setStep1Error(null);
    if (!customerName.trim()) {
      setStep1Error('Guest full name is required.');
      return false;
    }
    if (!customerMobile.trim() || customerMobile.replace(/[^0-9]/g, '').length < 10) {
      setStep1Error('A valid 10-digit mobile number is required.');
      return false;
    }
    if (!customerWhatsApp.trim()) {
      setStep1Error('A valid WhatsApp contact number is required for digital receipts.');
      return false;
    }
    return true;
  };

  // Active service object
  const selectedService = branchServices.find((s) => s.id === selectedServiceId) || branchServices[0];
  const selectedDurationOption = selectedService?.durations[selectedDurationIndex] || selectedService?.durations[0];

  // Categories
  const categories = ['ALL', ...Array.from(new Set(branchServices.map((s) => s.category)))];
  const filteredServices =
    selectedCategory === 'ALL'
      ? branchServices
      : branchServices.filter((s) => s.category === selectedCategory);

  // Step 3 validation (prevent staff conflict)
  const validateStep3 = () => {
    setStep3Error(null);
    if (appointmentType === 'SCHEDULED' && !appointmentDate) {
      setStep3Error('Please pick an appointment date.');
      return false;
    }
    if (appointmentType === 'SCHEDULED' && !appointmentTime) {
      setStep3Error('Please pick an appointment time.');
      return false;
    }
    // Check if therapist is already IN_SERVICE for Walk-in
    if (appointmentType === 'WALK_IN' && assignedStaffId) {
      const stf = branchStaff.find((s) => s.id === assignedStaffId);
      if (stf && stf.availability !== 'AVAILABLE') {
        setStep3Error(`${stf.name} is currently ${stf.availability}. Please assign an available therapist or auto-assign.`);
        return false;
      }
    }
    return true;
  };

  // Step 4: Final Creation
  const handleCreateService = () => {
    if (!selectedService || !selectedDurationOption) return;

    try {
      const newVisit = createServiceVisit({
        customerId: existingCustomer?.id,
        customerData: !existingCustomer
          ? {
              name: customerName.trim(),
              mobileNumber: customerMobile.trim(),
              whatsAppNumber: customerWhatsApp.trim(),
              email: customerEmail.trim() || undefined,
            }
          : undefined,
        serviceId: selectedService.id,
        durationMinutes: selectedDurationOption.durationMinutes,
        price: selectedDurationOption.price,
        appointmentType,
        appointmentDate: appointmentType === 'SCHEDULED' ? appointmentDate : undefined,
        appointmentTime: appointmentType === 'SCHEDULED' ? appointmentTime : undefined,
        staffId: assignedStaffId || undefined,
        notes: treatmentNotes.trim() || undefined,
      });

      setCreatedVisit(newVisit);
      setCurrentStep(5); // Success state
    } catch (err: any) {
      alert(err.message || 'Failed to create service session.');
    }
  };

  const handleResetForAnother = () => {
    setCurrentStep(1);
    setMobileSearch('');
    setExistingCustomer(null);
    setCustomerName('');
    setCustomerMobile('');
    setCustomerWhatsApp('');
    setCustomerEmail('');
    setSelectedDurationIndex(0);
    setAssignedStaffId('');
    setTreatmentNotes('');
    setCreatedVisit(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
          Create New Service
        </h1>
      </div>

      {/* 4-Step Progress Indicator (Steps 1 to 4) */}
      {currentStep <= 4 && (
        <div className="bg-white rounded-2xl border border-bode-border p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { num: 1, label: 'Guest Details' },
              { num: 2, label: 'Select Service' },
              { num: 3, label: 'Schedule Type' },
              { num: 4, label: 'Review & Create' },
            ].map((step) => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div
                  key={step.num}
                  className={`flex flex-col items-center sm:items-start p-2 rounded-xl border transition ${
                    isCurrent
                      ? 'border-bode-forest bg-bode-forest/5 text-bode-forest'
                      : isPast
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-bode-border/60 bg-bode-ivory/30 text-bode-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-bode-forest text-white'
                          : isPast
                          ? 'bg-emerald-700 text-white'
                          : 'bg-bode-border text-bode-muted'
                      }`}
                    >
                      {isPast ? '✓' : step.num}
                    </span>
                    <span className="hidden sm:inline font-semibold text-xs tracking-wide">
                      {step.label}
                    </span>
                  </div>
                  <span className="sm:hidden text-[10px] font-medium mt-1">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: CUSTOMER DETAILS (Section 6 Requirement) */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-bode-border p-4 sm:p-8 shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg text-bode-forest">
              Step 1: Guest Details
            </h2>
          </div>

          {/* Search Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-bode-ivory border border-bode-border/80 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-forest">
              Search Existing Guest
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-bode-muted absolute left-3 top-3" />
                <input
                  type="text"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneSearch()}
                  placeholder="e.g. 98491 55670"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-bode-border rounded-lg text-xs font-mono text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handlePhoneSearch}
                className="px-4 py-2 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold rounded-lg transition"
              >
                Lookup Guest
              </button>
            </div>

            {/* Quick Demo Customer Buttons */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-bode-muted flex-wrap">
              <span>Quick demo lookup:</span>
              {branchCustomers.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setMobileSearch(c.mobileNumber);
                    setExistingCustomer(c);
                    setCustomerName(c.name);
                    setCustomerMobile(c.mobileNumber);
                    setCustomerWhatsApp(c.whatsAppNumber);
                    setCustomerEmail(c.email || '');
                    setStep1Error(null);
                  }}
                  className="text-bode-emerald hover:underline font-semibold bg-white px-2 py-0.5 rounded border border-bode-border"
                >
                  {c.name} ({c.mobileNumber})
                </button>
              ))}
            </div>
          </div>

          {/* Existing Customer Profile Card */}
          {existingCustomer && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Returning Guest Recognized: {existingCustomer.name}
                </span>
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold">
                  {existingCustomer.totalVisits} Prior Visits
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Last Visited: <strong>{existingCustomer.lastVisitDate || 'Recent'}</strong> • Service: <strong>{existingCustomer.lastService || 'Therapy'}</strong>
              </p>
              {existingCustomer.notes && (
                <p className="text-[11px] text-emerald-700 italic">
                  Guest Preferences: "{existingCustomer.notes}"
                </p>
              )}
            </div>
          )}

          {/* Customer Fields Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                Guest Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-bode-muted absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Anand Rathi"
                  className="w-full pl-9 pr-3 py-2.5 bg-bode-ivory/30 border border-bode-border rounded-lg text-sm text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                  Calling Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-bode-muted absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={customerMobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder="+91 98490 12345"
                    className="w-full pl-9 pr-3 py-2.5 bg-bode-ivory/30 border border-bode-border rounded-lg text-sm font-mono text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-bode-charcoal">
                    WhatsApp Number (for receipts) *
                  </label>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    disabled={sameAsMobile}
                    value={customerWhatsApp}
                    onChange={(e) => setCustomerWhatsApp(e.target.value)}
                    placeholder="+91 98490 12345"
                    className={`w-full pl-9 pr-3 py-2.5 border border-bode-border rounded-lg text-sm font-mono text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none ${
                      sameAsMobile ? 'bg-bode-ivory/60 text-bode-muted' : 'bg-bode-ivory/30'
                    }`}
                  />
                </div>
                {/* Same as mobile checkbox (Section 6 Requirement) */}
                <label className="flex items-center gap-2 text-xs text-bode-charcoal mt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={(e) => {
                      setSameAsMobile(e.target.checked);
                      if (e.target.checked) setCustomerWhatsApp(customerMobile);
                    }}
                    className="rounded border-bode-border text-bode-forest focus:ring-bode-forest w-3.5 h-3.5"
                  />
                  <span>Same number for Calling & WhatsApp</span>
                </label>
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-bode-muted absolute left-3 top-3" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-bode-ivory/30 border border-bode-border rounded-lg text-sm text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                />
              </div>
            </div>
          </div>

          {step1Error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{step1Error}</span>
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end pt-4 border-t border-bode-border">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className="px-6 py-2.5 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold rounded-xl shadow transition flex items-center gap-2"
            >
              <span>Continue to Select Service</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT SERVICE (Section 6 Requirement) */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-bode-border p-4 sm:p-8 shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg text-bode-forest">
              Step 2: Select Service ({currentBranch?.shortName})
            </h2>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-bode-forest text-white font-semibold'
                    : 'bg-bode-ivory text-bode-charcoal hover:bg-bode-ivoryDark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto p-1">
            {filteredServices.map((srv) => {
              const isSelected = selectedServiceId === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    setSelectedDurationIndex(0);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-bode-forest bg-bode-forest/5 ring-2 ring-bode-forest shadow-sm'
                      : 'border-bode-border bg-white hover:bg-bode-ivory/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                        {srv.category}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-bode-forest text-white text-[10px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-base text-bode-forest mt-1">
                      {srv.name}
                    </h3>
                    <p className="text-xs text-bode-muted mt-1 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-bode-border/60 flex items-center justify-between text-xs">
                    <span className="text-bode-muted">
                      Durations: {srv.durations.map((d) => `${d.durationMinutes}m`).join(' / ')}
                    </span>
                    <span className="font-bold text-bode-forest text-sm">
                      From ₹{srv.durations[0].price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Duration & Tariff Selector for Selected Service */}
          {selectedService && (
            <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-bode-forest">
                Select Duration & Tariff for {selectedService.name}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedService.durations.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDurationIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      selectedDurationIndex === idx
                        ? 'border-bode-forest bg-white text-bode-forest ring-1 ring-bode-forest shadow-sm'
                        : 'border-bode-border bg-white/70 hover:bg-white text-bode-charcoal'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-bode-emerald" />
                        {d.durationMinutes} Minutes Session
                      </span>
                      <p className="font-serif text-lg font-bold text-bode-forest mt-0.5">
                        ₹{d.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {selectedDurationIndex === idx && (
                      <Check className="w-4 h-4 text-bode-emerald shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-bode-border">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-bode-border hover:bg-bode-ivory text-bode-charcoal text-xs font-medium rounded-lg transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold rounded-xl shadow transition flex items-center gap-2"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: APPOINTMENT TYPE & THERAPIST (Section 6 Requirement) */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-bode-border p-4 sm:p-8 shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg text-bode-forest">
              Step 3: Schedule &amp; Therapist
            </h2>
          </div>

          {/* Appointment Type Radios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAppointmentType('WALK_IN')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                appointmentType === 'WALK_IN'
                  ? 'border-bode-forest bg-bode-forest/5 ring-2 ring-bode-forest shadow-sm'
                  : 'border-bode-border bg-white hover:bg-bode-ivory/50'
              }`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-bode-forest">Walk-in / Start Now</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                    Immediate
                  </span>
                </div>
                <p className="text-xs text-bode-muted mt-1 leading-relaxed">
                  Start treatment immediately (no booking fee).
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAppointmentType('SCHEDULED')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                appointmentType === 'SCHEDULED'
                  ? 'border-bode-forest bg-bode-forest/5 ring-2 ring-bode-forest shadow-sm'
                  : 'border-bode-border bg-white hover:bg-bode-ivory/50'
              }`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-bode-forest">Scheduled Appointment</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase">
                    Future Slot
                  </span>
                </div>
                <p className="text-xs text-bode-muted mt-1 leading-relaxed">
                  Reserve a date and time slot in advance.
                </p>
              </div>
            </button>
          </div>

          {/* Scheduled Date & Time Pickers */}
          {appointmentType === 'SCHEDULED' && (
            <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                    Time Slot *
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                  >
                    {[
                      '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
                      '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t} hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Staff Therapist Assignment (With availability verification) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              Assign Staff Therapist (Optional)
            </label>
            <select
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
            >
              <option value="">-- Auto-assign or assign on arrival --</option>
              {branchStaff.map((stf) => (
                <option key={stf.id} value={stf.id}>
                  {stf.name} ({stf.role}) — {stf.availability === 'AVAILABLE' ? 'Available' : stf.availability}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-bode-muted mt-1">
              Qualified therapists available on duty at {currentBranch?.shortName}.
            </p>
          </div>

          {/* Treatment Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
              Front Desk / Health Notes
            </label>
            <input
              type="text"
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="e.g. Guest requested medium pressure, no scented oils on scalp"
              className="w-full px-3.5 py-2.5 bg-bode-ivory/30 border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
            />
          </div>

          {step3Error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{step3Error}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-bode-border">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-bode-border hover:bg-bode-ivory text-bode-charcoal text-xs font-medium rounded-lg transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep3()) setCurrentStep(4);
              }}
              className="px-6 py-2.5 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold rounded-xl shadow transition flex items-center gap-2"
            >
              <span>Review Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CREATE (Section 6 Requirement) */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-bode-border p-4 sm:p-8 shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg text-bode-forest">
              Step 4: Review &amp; Create
            </h2>
          </div>

          {/* Consolidated Review Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-bode-ivory border border-bode-border space-y-4 text-xs">
            {/* Branch & Guest Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-bode-border/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                  Guest Information
                </span>
                <p className="font-serif text-base font-bold text-bode-forest mt-0.5">
                  {customerName}
                </p>
                <p className="text-bode-charcoal mt-0.5">Calling Phone: {customerMobile}</p>
                <p className="text-bode-charcoal">WhatsApp: {customerWhatsApp}</p>
                {customerEmail && <p className="text-bode-muted">{customerEmail}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                  Branch & Schedule
                </span>
                <p className="font-semibold text-bode-forest mt-0.5">{currentBranch?.name}</p>
                <p className="text-bode-charcoal mt-0.5">
                  Type: <strong>{appointmentType === 'WALK_IN' ? 'Walk-in / Start Now' : 'Scheduled Slot'}</strong>
                </p>
                {appointmentType === 'SCHEDULED' && (
                  <p className="text-bode-charcoal">
                    Date & Time: {appointmentDate} at {appointmentTime} hrs
                  </p>
                )}
                <p className="text-bode-muted">Source: Direct Manager Front Desk</p>
              </div>
            </div>

            {/* Treatment Breakdown */}
            <div className="py-2 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                Selected Treatment
              </span>
              <div className="p-3.5 rounded-xl bg-white border border-bode-border flex justify-between items-center">
                <div>
                  <p className="font-bold text-bode-forest text-sm">{selectedService?.name}</p>
                  <p className="text-[11px] text-bode-muted">
                    {selectedService?.category} • {selectedDurationOption?.durationMinutes} mins
                  </p>
                  {assignedStaffId && (
                    <p className="text-[11px] text-bode-forest mt-0.5">
                      Assigned Therapist: <strong>{branchStaff.find((s) => s.id === assignedStaffId)?.name}</strong>
                    </p>
                  )}
                  {treatmentNotes && (
                    <p className="text-[11px] text-bode-charcoal mt-0.5 italic">
                      Notes: {treatmentNotes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg font-bold text-bode-forest">
                    ₹{selectedDurationOption?.price.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-bode-ivory font-medium">
                    Initial Tariff
                  </span>
                </div>
              </div>
            </div>

            {/* No ₹99 fee clarification (Section 6 Requirement) */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
              No ₹99 booking fee applies for walk-in / manager bookings.
            </div>
          </div>

          {/* Primary Create Button (Section 6 Requirement) */}
          <div className="flex justify-between items-center pt-4 border-t border-bode-border">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-bode-border hover:bg-bode-ivory text-bode-charcoal text-xs font-medium rounded-lg transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleCreateService}
              className="px-8 py-3 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-bode-gold" />
              <span>CREATE SERVICE</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS CONFIRMATION SCREEN (Section 6 Requirement) */}
      {currentStep === 5 && createdVisit && (
        <div className="bg-white rounded-2xl border border-bode-border p-8 text-center space-y-6 shadow-sm animate-fade-in max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-2">
              Service Created Successfully
            </span>
            <h2 className="font-serif font-bold text-2xl text-bode-forest">
              {createdVisit.customerName}
            </h2>
            <p className="text-xs text-bode-muted mt-1">
              Visit Reference: <strong className="font-mono text-bode-forest">{createdVisit.visitReference}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-bode-muted">Initial Service:</span>
              <span className="font-semibold text-bode-forest">{createdVisit.services[0]?.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bode-muted">Duration & Price:</span>
              <span>{createdVisit.services[0]?.durationMinutes} min • ₹{createdVisit.services[0]?.finalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bode-muted">Session Status:</span>
              <span className="font-bold text-emerald-700 uppercase">{createdVisit.visitStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bode-muted">Branch:</span>
              <span>{currentBranch?.name}</span>
            </div>
          </div>

          {/* Quick Actions (Section 6 Requirement) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('visit-detail', createdVisit.id)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold shadow transition"
            >
              View Service Session
            </button>
            <button
              onClick={handleResetForAnother}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-bode-border bg-bode-ivory hover:bg-bode-ivoryDark text-bode-charcoal text-xs font-semibold transition"
            >
              Create Another Service
            </button>
            <button
              onClick={() => onNavigate('active-services')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow transition"
            >
              Go to Active Treatments
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

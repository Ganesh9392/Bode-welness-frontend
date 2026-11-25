import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  UserPlus,
  X,
  ChevronDown,
  Trash2,
} from 'lucide-react';

// ─── Time Slot Helpers ────────────────────────────────────────────────────────
const ALL_TIME_SLOTS_24: string[] = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30', '18:45',
  '19:00', '19:15', '19:30', '19:45',
  '20:00', '20:15', '20:30', '20:45',
  '21:00', '21:15', '21:30', '21:45',
  '22:00', '22:15', '22:30',
];

const formatTime12 = (time24: string): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const parseTimeToMinutes = (time24: string): number => {
  if (!time24) return 0;
  const [h, m] = time24.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesToTime24 = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const addMinutesToTime = (time24: string, minutesToAdd: number): string => {
  const total = parseTimeToMinutes(time24) + minutesToAdd;
  return minutesToTime24(total);
};

const getCurrentTimeSlot24 = (): string => {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();

  // If outside operating hours (before 09:00 or after 21:00), default to morning opening 10:00 AM
  if (h < 9 || h >= 21) {
    return '10:00';
  }

  const rem = m % 15;
  if (rem !== 0) {
    m += 15 - rem;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }

  // If rounded slot exceeds operating hours, default to 10:00 AM
  if (h >= 21) {
    return '10:00';
  }

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

interface AdditionalServiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  durationMinutes: number;
  price: number;
  staffId?: string;
  staffName?: string;
  timeFrom?: string;
  timeTo?: string;
  notes?: string;
}

type ActiveSlotPicker = 'from' | 'to' | 'addModalFrom' | 'addModalTo' | null;

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
    updateCustomer,
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
  const [customerGender, setCustomerGender] = useState<'Male' | 'Female' | ''>('');
  const [customerDob, setCustomerDob] = useState<string>('');
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
  const [appointmentTime, setAppointmentTime] = useState<string>(() => getCurrentTimeSlot24());
  const [appointmentTimeTo, setAppointmentTimeTo] = useState<string>(() =>
    addMinutesToTime(getCurrentTimeSlot24(), 60)
  );
  const [activeSlotPicker, setActiveSlotPicker] = useState<ActiveSlotPicker>(null);
  const [assignedStaffId, setAssignedStaffId] = useState<string>('');
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');
  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Step 4: Multi-Service State (Add More Services)
  const [additionalServices, setAdditionalServices] = useState<AdditionalServiceItem[]>([]);
  const [showAddMoreModal, setShowAddMoreModal] = useState<boolean>(false);
  const [addModalServiceId, setAddModalServiceId] = useState<string>('');
  const [addModalDurationIdx, setAddModalDurationIdx] = useState<number>(0);
  const [addModalStaffId, setAddModalStaffId] = useState<string>('');
  const [addModalTimeFrom, setAddModalTimeFrom] = useState<string>('');
  const [addModalTimeTo, setAddModalTimeTo] = useState<string>('');
  const [addModalNotes, setAddModalNotes] = useState<string>('');

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
      setCustomerGender((found.gender as 'Male' | 'Female') || '');
      setCustomerDob(found.dateOfBirth || '');
      setStep1Error(null);
    } else {
      setExistingCustomer(null);
      setCustomerMobile(mobileSearch);
      setCustomerWhatsApp(mobileSearch);
      setCustomerGender('');
      setCustomerDob('');
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

  // Synchronize appointmentTimeTo whenever duration changes
  useEffect(() => {
    if (selectedDurationOption && appointmentTime) {
      setAppointmentTimeTo(
        addMinutesToTime(appointmentTime, selectedDurationOption.durationMinutes)
      );
    }
  }, [selectedServiceId, selectedDurationIndex]);

  // Prevent background scroll and sidebar jump when modals are open
  useEffect(() => {
    if (activeSlotPicker || showAddMoreModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeSlotPicker, showAddMoreModal]);

  // Categories
  const categories = ['ALL', ...Array.from(new Set(branchServices.map((s) => s.category)))];
  const filteredServices =
    selectedCategory === 'ALL'
      ? branchServices
      : branchServices.filter((s) => s.category === selectedCategory);

  // Filter available slots for the bottom sheet picker
  const displayedSlots = React.useMemo(() => {
    if (activeSlotPicker === 'to') {
      const fromMinutes = parseTimeToMinutes(appointmentTime);
      const filtered = ALL_TIME_SLOTS_24.filter((slot) => parseTimeToMinutes(slot) > fromMinutes);
      if (filtered.length === 0) {
        return [
          addMinutesToTime(appointmentTime, 15),
          addMinutesToTime(appointmentTime, 30),
          addMinutesToTime(appointmentTime, 45),
          addMinutesToTime(appointmentTime, 60),
        ];
      }
      return filtered;
    }
    if (activeSlotPicker === 'addModalTo') {
      const fromMinutes = parseTimeToMinutes(addModalTimeFrom);
      const filtered = ALL_TIME_SLOTS_24.filter((slot) => parseTimeToMinutes(slot) > fromMinutes);
      if (filtered.length === 0) {
        return [
          addMinutesToTime(addModalTimeFrom, 30),
          addMinutesToTime(addModalTimeFrom, 60),
          addMinutesToTime(addModalTimeFrom, 90),
        ];
      }
      return filtered;
    }
    return ALL_TIME_SLOTS_24;
  }, [activeSlotPicker, appointmentTime, addModalTimeFrom]);

  // Step 4 Helper Functions: Multi-Service Management
  const openAddMoreModal = () => {
    const defaultSvc = branchServices[0];
    const defaultSvcId = defaultSvc?.id || '';
    const defaultDur = defaultSvc?.durations[0]?.durationMinutes || 45;

    // Consecutive scheduling: follow after the last service end time
    let lastEndTime = appointmentTimeTo || appointmentTime;
    if (additionalServices.length > 0) {
      const lastItem = additionalServices[additionalServices.length - 1];
      if (lastItem.timeTo) {
        lastEndTime = lastItem.timeTo;
      }
    }
    const defaultFrom = lastEndTime || getCurrentTimeSlot24();
    const defaultTo = addMinutesToTime(defaultFrom, defaultDur);

    setAddModalServiceId(defaultSvcId);
    setAddModalDurationIdx(0);
    setAddModalStaffId(assignedStaffId || '');
    setAddModalTimeFrom(defaultFrom);
    setAddModalTimeTo(defaultTo);
    setAddModalNotes('');
    setShowAddMoreModal(true);
  };

  const handleAddModalServiceChange = (svcId: string) => {
    setAddModalServiceId(svcId);
    setAddModalDurationIdx(0);
    const svc = branchServices.find((s) => s.id === svcId);
    const dur = svc?.durations[0]?.durationMinutes || 45;
    if (addModalTimeFrom) {
      setAddModalTimeTo(addMinutesToTime(addModalTimeFrom, dur));
    }
  };

  const handleAddModalDurationChange = (idx: number) => {
    setAddModalDurationIdx(idx);
    const svc = branchServices.find((s) => s.id === addModalServiceId);
    const dur = svc?.durations[idx]?.durationMinutes || 45;
    if (addModalTimeFrom) {
      setAddModalTimeTo(addMinutesToTime(addModalTimeFrom, dur));
    }
  };

  const handleConfirmAddMoreService = () => {
    const svc = branchServices.find((s) => s.id === addModalServiceId);
    if (!svc) return;
    const durOpt = svc.durations[addModalDurationIdx] || svc.durations[0];
    if (!durOpt) return;

    const staffMember = addModalStaffId ? branchStaff.find((s) => s.id === addModalStaffId) : undefined;

    const newItem: AdditionalServiceItem = {
      id: `add-svc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      serviceId: svc.id,
      serviceName: svc.name,
      category: svc.category,
      durationMinutes: durOpt.durationMinutes,
      price: durOpt.price,
      staffId: staffMember?.id,
      staffName: staffMember?.name,
      timeFrom: addModalTimeFrom,
      timeTo: addModalTimeTo,
      notes: addModalNotes.trim() || undefined,
    };

    setAdditionalServices((prev) => [...prev, newItem]);
    setShowAddMoreModal(false);
  };

  const handleRemoveAdditionalService = (id: string) => {
    setAdditionalServices((prev) => prev.filter((item) => item.id !== id));
  };

  // Aggregated Bill & Duration Totals
  const primaryPrice = selectedDurationOption?.price || 0;
  const additionalPrice = additionalServices.reduce((sum, s) => sum + s.price, 0);
  const totalPrice = primaryPrice + additionalPrice;

  const primaryDuration = selectedDurationOption?.durationMinutes || 0;
  const additionalDuration = additionalServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalDuration = primaryDuration + additionalDuration;

  // Step 3 validation (prevent staff conflict and validate time slot)
  const validateStep3 = () => {
    setStep3Error(null);
    if (appointmentType === 'SCHEDULED' && !appointmentDate) {
      setStep3Error('Please pick an appointment date.');
      return false;
    }
    if (!appointmentTime) {
      setStep3Error('Please pick a start time (From).');
      return false;
    }
    if (!appointmentTimeTo) {
      setStep3Error('Please pick an end time (To).');
      return false;
    }
    if (parseTimeToMinutes(appointmentTimeTo) <= parseTimeToMinutes(appointmentTime)) {
      setStep3Error('End time (To) must be after start time (From).');
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
      if (existingCustomer && (customerGender || customerDob)) {
        updateCustomer(existingCustomer.id, {
          ...(customerGender ? { gender: customerGender } : {}),
          ...(customerDob ? { dateOfBirth: customerDob } : {}),
        });
      }

      const newVisit = createServiceVisit({
        customerId: existingCustomer?.id,
        customerData: !existingCustomer
          ? {
              name: customerName.trim(),
              mobileNumber: customerMobile.trim(),
              whatsAppNumber: customerWhatsApp.trim(),
              email: customerEmail.trim() || undefined,
              gender: customerGender || undefined,
              dateOfBirth: customerDob || undefined,
            }
          : undefined,
        serviceId: selectedService.id,
        durationMinutes: selectedDurationOption.durationMinutes,
        price: selectedDurationOption.price,
        appointmentType,
        appointmentDate: appointmentType === 'SCHEDULED' ? appointmentDate : undefined,
        appointmentTime: appointmentTime,
        appointmentTimeTo: appointmentTimeTo,
        staffId: assignedStaffId || undefined,
        notes: treatmentNotes.trim() || undefined,
        additionalServices: additionalServices.map((extra) => ({
          serviceId: extra.serviceId,
          serviceName: extra.serviceName,
          category: extra.category,
          durationMinutes: extra.durationMinutes,
          price: extra.price,
          staffId: extra.staffId,
          staffName: extra.staffName,
          startTime: extra.timeFrom,
          notes: extra.notes,
        })),
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
    setCustomerGender('');
    setCustomerDob('');
    setSelectedDurationIndex(0);
    setAppointmentTime(getCurrentTimeSlot24());
    setAppointmentTimeTo(addMinutesToTime(getCurrentTimeSlot24(), 60));
    setActiveSlotPicker(null);
    setAssignedStaffId('');
    setTreatmentNotes('');
    setAdditionalServices([]);
    setShowAddMoreModal(false);
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
                    setCustomerGender((c.gender as 'Male' | 'Female') || '');
                    setCustomerDob(c.dateOfBirth || '');
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
                {existingCustomer.gender && <> • Gender: <strong>{existingCustomer.gender}</strong></>}
                {existingCustomer.dateOfBirth && <> • DOB: <strong>{existingCustomer.dateOfBirth}</strong></>}
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

            {/* Gender and Date of Birth (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2 h-[42px]">
                  {(['Male', 'Female'] as const).map((g) => {
                    const isSelected = customerGender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setCustomerGender(customerGender === g ? '' : g)}
                        className={`flex items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-bode-forest text-white border-bode-forest shadow-xs'
                            : 'bg-bode-ivory/30 text-bode-charcoal border-bode-border hover:border-bode-forest/50 hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full border transition-all ${
                            isSelected
                              ? 'bg-bode-gold border-bode-gold scale-110'
                              : 'border-bode-muted/60 bg-white'
                          }`}
                        />
                        <span>{g}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DOB */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-bode-charcoal">
                    Date of Birth (DOB)
                  </label>
                  {customerDob && (
                    <button
                      type="button"
                      onClick={() => setCustomerDob('')}
                      className="text-[11px] text-bode-muted hover:text-red-600 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-bode-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    value={customerDob}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCustomerDob(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-bode-ivory/30 border border-bode-border rounded-lg text-sm text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none cursor-pointer"
                  />
                </div>
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
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-bode-forest text-white font-semibold shadow-xs'
                    : 'bg-bode-ivory text-bode-charcoal hover:bg-bode-ivoryDark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid (Responsive without descriptions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 max-h-[440px] overflow-y-auto p-1 scrollbar-none">
            {filteredServices.map((srv) => {
              const isSelected = selectedServiceId === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    setSelectedDurationIndex(0);
                  }}
                  className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-bode-forest bg-bode-forest/5 ring-2 ring-bode-forest shadow-sm'
                      : 'border-bode-border bg-white hover:bg-bode-ivory/40 hover:border-bode-forest/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald truncate">
                        {srv.category}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-bode-forest text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-bode-forest mt-1 leading-snug">
                      {srv.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-bode-border/60 flex items-center justify-between text-xs gap-2">
                    <span className="text-bode-muted text-[11px] sm:text-xs">
                      Durations: {srv.durations.map((d) => `${d.durationMinutes}m`).join(' / ')}
                    </span>
                    <span className="font-bold text-bode-forest text-xs sm:text-sm shrink-0">
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

          {/* Walk-in Time Slot (From & To) */}
          {appointmentType === 'WALK_IN' && (
            <div className="p-4 rounded-xl bg-bode-ivory/60 border border-bode-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-bode-forest flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-bode-emerald" />
                  Service Time Slot
                </span>
                <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                  {selectedDurationOption?.durationMinutes || 60} Min Session
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* From Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5 flex items-center gap-1">
                    <span>From</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveSlotPicker('from')}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-bode-border hover:border-bode-forest rounded-xl text-left transition shadow-xs cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <Clock className="w-4 h-4 text-bode-emerald shrink-0" />
                      <span className="font-semibold text-bode-forest text-xs sm:text-sm truncate">
                        {formatTime12(appointmentTime)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-bode-muted group-hover:text-bode-forest transition shrink-0 ml-1" />
                  </button>
                </div>

                {/* To Field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5 flex items-center gap-1">
                    <span>To</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveSlotPicker('to')}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-bode-border hover:border-bode-forest rounded-xl text-left transition shadow-xs cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <Clock className="w-4 h-4 text-bode-emerald shrink-0" />
                      <span className="font-semibold text-bode-forest text-xs sm:text-sm truncate">
                        {formatTime12(appointmentTimeTo)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-bode-muted group-hover:text-bode-forest transition shrink-0 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Date & Time Pickers */}
          {appointmentType === 'SCHEDULED' && (
            <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                  Appointment Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-bode-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.target as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-bode-border rounded-lg text-sm text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-bode-charcoal">
                    Time Slot *
                  </label>
                  <span className="text-[11px] text-bode-muted">
                    Session: {selectedDurationOption?.durationMinutes || 60} mins
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* From Field */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-bode-muted mb-1 flex items-center gap-1">
                      <span>From</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveSlotPicker('from')}
                      className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-bode-border hover:border-bode-forest rounded-xl text-left transition shadow-xs cursor-pointer group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <Clock className="w-4 h-4 text-bode-emerald shrink-0" />
                        <span className="font-semibold text-bode-forest text-xs sm:text-sm truncate">
                          {formatTime12(appointmentTime)}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-bode-muted group-hover:text-bode-forest transition shrink-0 ml-1" />
                    </button>
                  </div>

                  {/* To Field */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-bode-muted mb-1 flex items-center gap-1">
                      <span>To</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveSlotPicker('to')}
                      className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-bode-border hover:border-bode-forest rounded-xl text-left transition shadow-xs cursor-pointer group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <Clock className="w-4 h-4 text-bode-emerald shrink-0" />
                        <span className="font-semibold text-bode-forest text-xs sm:text-sm truncate">
                          {formatTime12(appointmentTimeTo)}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-bode-muted group-hover:text-bode-forest transition shrink-0 ml-1" />
                    </button>
                  </div>
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
                {(customerGender || customerDob) && (
                  <p className="text-bode-charcoal">
                    {customerGender && <span>Gender: <strong>{customerGender}</strong></span>}
                    {customerGender && customerDob && <span> • </span>}
                    {customerDob && <span>DOB: <strong>{customerDob}</strong></span>}
                  </p>
                )}
                {customerEmail && <p className="text-bode-muted">{customerEmail}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                  Branch & Schedule
                </span>
                <p className="font-semibold text-bode-forest mt-0.5">{currentBranch?.name}</p>
                <p className="text-bode-charcoal mt-0.5">
                  Type: <strong>{appointmentType === 'WALK_IN' ? 'Walk-in / Start Now' : 'Scheduled Appointment'}</strong>
                </p>
                <p className="text-bode-charcoal">
                  {appointmentType === 'SCHEDULED' ? `Date: ${appointmentDate} • ` : 'Session: '}
                  Time: <strong>{formatTime12(appointmentTime)} – {formatTime12(appointmentTimeTo)}</strong>
                </p>
                <p className="text-bode-muted">Source: Direct Manager Front Desk</p>
              </div>
            </div>

            {/* Treatment Breakdown & Multi-Service List */}
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                    Services ({1 + additionalServices.length})
                  </span>
                  <p className="text-[11px] text-bode-muted">
                    Treatments included in this visit session
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddMoreModal}
                  className="px-3.5 py-1.5 rounded-full border border-bode-emerald text-bode-emerald hover:bg-bode-emerald hover:text-white transition text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add (+)</span>
                </button>
              </div>

              {/* Service #1: Primary Treatment */}
              <div className="p-3.5 rounded-xl bg-white border border-bode-border hover:border-bode-forest/40 transition shadow-2xs">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-bode-ivoryDark text-bode-forest border border-bode-border shrink-0">
                        #1 Primary
                      </span>
                      <p className="font-bold text-bode-forest text-sm truncate">
                        {selectedService?.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-bode-muted mt-0.5">
                      {selectedService?.category} • {selectedDurationOption?.durationMinutes} mins
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-bode-charcoal">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-bode-emerald shrink-0" />
                        {formatTime12(appointmentTime)} – {formatTime12(appointmentTimeTo)}
                      </span>
                      {assignedStaffId ? (
                        <span className="flex items-center gap-1 font-semibold text-bode-forest">
                          <User className="w-3 h-3 text-bode-emerald shrink-0" />
                          {branchStaff.find((s) => s.id === assignedStaffId)?.name}
                        </span>
                      ) : (
                        <span className="text-bode-muted italic">Unassigned therapist</span>
                      )}
                    </div>
                    {treatmentNotes && (
                      <p className="text-[11px] text-bode-charcoal mt-1 italic">
                        Notes: {treatmentNotes}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-base sm:text-lg font-bold text-bode-forest">
                      ₹{selectedDurationOption?.price.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-bode-ivory text-bode-charcoal font-medium inline-block mt-0.5">
                      Base Tariff
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              {additionalServices.map((extra, idx) => (
                <div
                  key={extra.id}
                  className="p-3.5 rounded-xl bg-white border border-bode-border hover:border-bode-forest/40 transition shadow-2xs animate-fade-in"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          #{idx + 2} Add-on
                        </span>
                        <p className="font-bold text-bode-forest text-sm truncate">
                          {extra.serviceName}
                        </p>
                      </div>
                      <p className="text-[11px] text-bode-muted mt-0.5">
                        {extra.category} • {extra.durationMinutes} mins
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-bode-charcoal">
                        {extra.timeFrom && (
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-bode-emerald shrink-0" />
                            {formatTime12(extra.timeFrom)} {extra.timeTo ? `– ${formatTime12(extra.timeTo)}` : ''}
                          </span>
                        )}
                        {extra.staffName ? (
                          <span className="flex items-center gap-1 font-semibold text-bode-forest">
                            <User className="w-3 h-3 text-bode-emerald shrink-0" />
                            {extra.staffName}
                          </span>
                        ) : (
                          <span className="text-bode-muted italic">Unassigned therapist</span>
                        )}
                      </div>
                      {extra.notes && (
                        <p className="text-[11px] text-bode-charcoal mt-1 italic">
                          Notes: {extra.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <p className="font-serif text-base sm:text-lg font-bold text-bode-forest">
                        ₹{extra.price.toLocaleString('en-IN')}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalService(extra.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition active:scale-90 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Remove add-on service"
                        aria-label="Remove add-on service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Summary Banner (Like Reference Mockup) */}
              <div className="p-3.5 rounded-xl bg-bode-forest text-white flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-bode-gold block">
                    Total Estimated Bill
                  </span>
                  <p className="text-xs text-bode-ivory/80 mt-0.5">
                    {1 + additionalServices.length} Treatment{additionalServices.length > 0 ? 's' : ''} • {totalDuration} Mins Combined
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl sm:text-2xl font-bold text-white">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* No ₹99 fee clarification (Section 6 Requirement) */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
              No ₹99 booking fee applies for walk-in / manager bookings.
            </div>
          </div>

          {/* Primary Create Button (Section 6 Requirement) */}
          <div className="flex justify-between items-center pt-4 border-t border-bode-border gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 border border-bode-border hover:bg-bode-ivory text-bode-charcoal text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleCreateService}
              className="px-6 sm:px-8 py-3 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-bode-gold" />
              <span>CREATE SERVICE (₹{totalPrice.toLocaleString('en-IN')})</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS CONFIRMATION SCREEN (Section 6 Requirement) */}
      {currentStep === 5 && createdVisit && (
        <div className="bg-white rounded-2xl border border-bode-border p-6 sm:p-8 text-center space-y-6 shadow-sm animate-fade-in max-w-xl mx-auto">
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
            {/* Next-step hint */}
            {!createdVisit.services[0]?.staffId && (
              <p className="mt-2 text-xs text-amber-700 font-semibold flex items-center justify-center gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                No therapist assigned yet — tap below to assign from the calendar
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border text-xs text-left space-y-2">
            <div className="flex justify-between items-center border-b border-bode-border/60 pb-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-bode-emerald">
                Services Booked ({createdVisit.services.length})
              </span>
              <span className="font-serif font-bold text-sm text-bode-forest">
                Total ₹{createdVisit.services.reduce((acc, s) => acc + s.finalPrice, 0).toLocaleString('en-IN')}
              </span>
            </div>
            {createdVisit.services.map((svc, idx) => (
              <div key={svc.id || idx} className="flex justify-between items-center py-1 border-b border-bode-border/30 last:border-b-0">
                <div>
                  <span className="font-semibold text-bode-forest">
                    {idx === 0 ? '1. ' : `${idx + 1}. `}{svc.serviceName}
                  </span>
                  <p className="text-[10px] text-bode-muted">
                    {svc.durationMinutes} min {svc.staffName ? `• ${svc.staffName}` : ''}
                  </p>
                </div>
                <span className="font-semibold text-bode-charcoal">₹{svc.finalPrice.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 text-[11px]">
              <span className="text-bode-muted">Session Status:</span>
              <span className="font-bold text-emerald-700 uppercase">{createdVisit.visitStatus}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-bode-muted">Branch:</span>
              <span>{currentBranch?.name}</span>
            </div>
          </div>

          {/* Quick Actions (Section 6 Requirement) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* PRIMARY: Go to Calendar & assign staff — the main CTA after creation */}
            <button
              onClick={() => onNavigate('appointments', createdVisit.id)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-bode-emerald hover:bg-bode-forest text-white text-sm font-bold shadow-lg transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Staff on Calendar
            </button>
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
          </div>
        </div>
      )}

      {/* Add Another Service Modal / Bottom Sheet (Mobile Handy & Desktop Centered) */}
      {showAddMoreModal && typeof document !== 'undefined' && createPortal(
        (() => {
          const modalService = branchServices.find((s) => s.id === addModalServiceId) || branchServices[0];
          const modalDurationOpt = modalService?.durations[addModalDurationIdx] || modalService?.durations[0];

          return (
            <div
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
              onClick={() => setShowAddMoreModal(false)}
            >
              <div
                className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-bode-border max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile Drag Indicator */}
                <div className="w-12 h-1.5 bg-bode-border rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-bode-border flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-bode-forest text-white flex items-center justify-center shadow-xs shrink-0">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-bode-forest leading-tight">
                        Add Another Service
                      </h3>
                      <p className="text-[11px] text-bode-muted">
                        Add an additional treatment to this guest session
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMoreModal(false)}
                    className="w-8 h-8 rounded-full bg-bode-ivory hover:bg-bode-ivoryDark text-bode-charcoal flex items-center justify-center transition cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-none">
                  {/* 1. Select Treatment */}
                  <div>
                    <label className="block text-[11px] font-bold text-bode-forest uppercase tracking-wider mb-1.5">
                      Select Treatment <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={addModalServiceId}
                        onChange={(e) => handleAddModalServiceChange(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-bode-border bg-bode-ivory/50 text-bode-forest font-semibold text-xs focus:ring-2 focus:ring-bode-forest/20 focus:border-bode-forest outline-none transition cursor-pointer min-h-[42px]"
                      >
                        {branchServices.map((svc) => (
                          <option key={svc.id} value={svc.id}>
                            [{svc.category}] {svc.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-bode-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* 2. Duration & Tariff */}
                  {modalService && (
                    <div>
                      <label className="block text-[11px] font-bold text-bode-forest uppercase tracking-wider mb-1.5">
                        Select Duration &amp; Tariff <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {modalService.durations.map((opt, idx) => {
                          const isSelected = addModalDurationIdx === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddModalDurationChange(idx)}
                              className={`p-2.5 rounded-xl border text-center transition cursor-pointer active:scale-95 ${
                                isSelected
                                  ? 'bg-bode-forest text-white border-bode-forest shadow-sm ring-1 ring-bode-forest'
                                  : 'bg-white border-bode-border text-bode-charcoal hover:border-bode-forest hover:bg-bode-ivory/40'
                              }`}
                            >
                              <div className="font-bold text-xs">{opt.durationMinutes} Mins</div>
                              <div
                                className={`text-xs mt-0.5 font-semibold ${
                                  isSelected ? 'text-bode-gold' : 'text-bode-forest'
                                }`}
                              >
                                ₹{opt.price.toLocaleString('en-IN')}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Assign Therapist (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-bode-forest uppercase tracking-wider mb-1.5">
                      Assign Therapist (Optional)
                    </label>
                    <div className="relative">
                      <select
                        value={addModalStaffId}
                        onChange={(e) => setAddModalStaffId(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border border-bode-border bg-bode-ivory/50 text-bode-forest text-xs focus:ring-2 focus:ring-bode-forest/20 focus:border-bode-forest outline-none transition cursor-pointer min-h-[42px]"
                      >
                        <option value="">-- Auto-Assign / Any Available Therapist --</option>
                        {branchStaff.map((stf) => (
                          <option key={stf.id} value={stf.id}>
                            {stf.name} ({stf.role}) {stf.availability === 'AVAILABLE' ? '— Available' : `— [${stf.availability}]`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-bode-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* 4. Time Window (From & To) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-bode-forest uppercase tracking-wider">
                        Scheduled Time Window
                      </label>
                      <span className="text-[10px] text-bode-muted">Consecutive schedule</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <span className="block text-[10px] text-bode-muted font-medium mb-1">
                          From (Start Time)
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveSlotPicker('addModalFrom')}
                          className="w-full p-2.5 rounded-xl border border-bode-border bg-bode-ivory/40 hover:border-bode-forest hover:bg-bode-ivory text-left flex items-center justify-between transition cursor-pointer min-h-[42px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-bode-emerald shrink-0" />
                            <span className="font-semibold text-xs text-bode-forest">
                              {formatTime12(addModalTimeFrom) || 'Select Time'}
                            </span>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-bode-muted" />
                        </button>
                      </div>

                      <div>
                        <span className="block text-[10px] text-bode-muted font-medium mb-1">
                          To (End Time)
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveSlotPicker('addModalTo')}
                          className="w-full p-2.5 rounded-xl border border-bode-border bg-bode-ivory/40 hover:border-bode-forest hover:bg-bode-ivory text-left flex items-center justify-between transition cursor-pointer min-h-[42px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-bode-emerald shrink-0" />
                            <span className="font-semibold text-xs text-bode-forest">
                              {formatTime12(addModalTimeTo) || 'Select Time'}
                            </span>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-bode-muted" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 5. Special Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-bode-forest uppercase tracking-wider mb-1.5">
                      Treatment Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={addModalNotes}
                      onChange={(e) => setAddModalNotes(e.target.value)}
                      placeholder="e.g. Focus on shoulders, extra pressure"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bode-border bg-white text-xs placeholder:text-bode-muted focus:ring-2 focus:ring-bode-forest/20 focus:border-bode-forest outline-none transition min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-bode-ivory/60 border-t border-bode-border flex items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddMoreModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-bode-border text-xs font-semibold text-bode-charcoal hover:bg-bode-ivory transition cursor-pointer active:scale-95 min-h-[42px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddMoreService}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[42px]"
                  >
                    <Plus className="w-4 h-4 text-bode-gold stroke-[2.5]" />
                    <span>
                      Add Treatment {modalDurationOpt ? `(₹${modalDurationOpt.price.toLocaleString('en-IN')})` : ''}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {/* Time Slot Picker Modal / Bottom Sheet (Mobile Optimized & Desktop Centered) */}
      {activeSlotPicker && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={() => setActiveSlotPicker(null)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-bode-border max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-bode-border rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-5 py-4 border-b border-bode-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-lg text-bode-forest">
                  Select slot
                </h3>
                <p className="text-xs text-bode-muted mt-0.5">
                  {activeSlotPicker === 'to'
                    ? `Select time after ${formatTime12(appointmentTime)}`
                    : activeSlotPicker === 'addModalTo'
                    ? `Select time after ${formatTime12(addModalTimeFrom)}`
                    : activeSlotPicker === 'addModalFrom'
                    ? 'Select start time for add-on treatment'
                    : `Select start time (${selectedDurationOption?.durationMinutes || 60}m session)`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlotPicker(null)}
                className="w-8 h-8 rounded-full bg-bode-ivory hover:bg-bode-ivoryDark text-bode-charcoal flex items-center justify-center transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slots Grid */}
            <div className="p-4 overflow-y-auto max-h-[60vh] scrollbar-none space-y-2">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {displayedSlots.map((slot) => {
                  const isCurrent =
                    activeSlotPicker === 'from'
                      ? appointmentTime === slot
                      : activeSlotPicker === 'to'
                      ? appointmentTimeTo === slot
                      : activeSlotPicker === 'addModalFrom'
                      ? addModalTimeFrom === slot
                      : addModalTimeTo === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        if (activeSlotPicker === 'from') {
                          setAppointmentTime(slot);
                          if (selectedDurationOption) {
                            setAppointmentTimeTo(
                              addMinutesToTime(slot, selectedDurationOption.durationMinutes)
                            );
                          }
                        } else if (activeSlotPicker === 'to') {
                          setAppointmentTimeTo(slot);
                        } else if (activeSlotPicker === 'addModalFrom') {
                          setAddModalTimeFrom(slot);
                          const currentAddSvc = branchServices.find((s) => s.id === addModalServiceId);
                          const dur = currentAddSvc?.durations[addModalDurationIdx]?.durationMinutes || 45;
                          setAddModalTimeTo(addMinutesToTime(slot, dur));
                        } else if (activeSlotPicker === 'addModalTo') {
                          setAddModalTimeTo(slot);
                        }
                        setActiveSlotPicker(null);
                      }}
                      className={`py-3 px-3 rounded-xl border text-center text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer ${
                        isCurrent
                          ? 'border-bode-forest bg-bode-forest text-white ring-2 ring-bode-forest shadow-sm'
                          : 'border-bode-border bg-white text-bode-charcoal hover:border-bode-forest hover:bg-bode-ivory/40'
                      }`}
                    >
                      {formatTime12(slot)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-bode-ivory/50 border-t border-bode-border text-center">
              <p className="text-[11px] text-bode-muted">
                Operating hours & sessions: 09:00 AM – 10:30 PM (15-min intervals)
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

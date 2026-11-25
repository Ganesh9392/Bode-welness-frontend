import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit, VisitServiceEntry } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutGrid,
  List,
  Filter,
  Clock,
  PlusCircle,
  Play,
  CheckCircle2,
  UserCheck,
  X,
  FileText,
  Search,
  UserPlus,
  Plus,
} from 'lucide-react';
import { AddGuestForm } from '../components/AddGuestForm';

interface AppointmentsPageProps {
  onNavigate: (tab: string, visitId?: string) => void;
  onOpenInvoiceModal: (visit: CustomerVisit) => void;
  autoAssignVisitId?: string | null;
  onClearAutoAssign?: () => void;
}

const START_HOUR = 9;
const END_HOUR = 22;
const SCALE_PX_PER_MIN = 1.4;

function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 10 * 60;
  const [h, m] = timeStr.split(':').map(Number);
  return (isNaN(h) ? 10 : h) * 60 + (isNaN(m) ? 0 : m);
}

function formatHour12(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, '0')}:00 ${suffix}`;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  onNavigate,
  onOpenInvoiceModal,
  autoAssignVisitId,
  onClearAutoAssign,
}) => {
  const {
    branchVisits,
    branchStaff,
    branchServices,
    branchCustomers,
    createServiceVisit,
    assignStaffToService,
    startServiceSession,
    completeIndividualService,
    completeCustomerVisit,
  } = useApp();

  // Default to today; seeded demo data is on 2026-11-22 — user can navigate back
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('ALL');

  const [quickPanelTarget, setQuickPanelTarget] = useState<{
    visit: CustomerVisit;
    service: VisitServiceEntry;
  } | null>(null);

  // Slot-based direct employee assignment modal
  const [slotAssignTarget, setSlotAssignTarget] = useState<{
    staffId: string;
    staffName: string;
    timeSlot: string;
  } | null>(null);
  const [slotGuestQuery, setSlotGuestQuery] = useState('');
  const [slotGuestId, setSlotGuestId] = useState<string>(branchCustomers[0]?.id || '');
  const [slotServiceId, setSlotServiceId] = useState<string>(branchServices[0]?.id || '');
  const [slotDurationIdx, setSlotDurationIdx] = useState<number>(0);
  const [showSlotNewGuest, setShowSlotNewGuest] = useState(false);

  // Auto-open staff assignment modal when arriving from "Create Service" flow
  useEffect(() => {
    if (!autoAssignVisitId) return;
    const targetVisit = branchVisits.find((v) => v.id === autoAssignVisitId);
    if (!targetVisit) return;
    // Switch the calendar to show the new appointment's date
    if (targetVisit.appointmentDate) {
      setSelectedDate(targetVisit.appointmentDate);
    }
    // Auto-open the quick-panel for staff assignment
    const firstService = targetVisit.services[0];
    if (firstService) {
      setQuickPanelTarget({ visit: targetVisit, service: firstService });
    }
    if (onClearAutoAssign) onClearAutoAssign();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAssignVisitId]);

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formattedDate = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [selectedDate]);

  const activeStaffColumns = useMemo(() => {
    return branchStaff.filter(
      (s) =>
        s.isActive &&
        (selectedStaffFilter === 'ALL' || s.id === selectedStaffFilter)
    );
  }, [branchStaff, selectedStaffFilter]);

  const dayVisits = useMemo(() => {
    return branchVisits.filter((v) => {
      if (v.appointmentDate !== selectedDate) return false;
      if (statusFilter !== 'ALL' && v.visitStatus !== statusFilter) return false;
      return true;
    });
  }, [branchVisits, selectedDate, statusFilter]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  const getStatusBlockClasses = (visitStatus: CustomerVisit['visitStatus'], serviceStatus: VisitServiceEntry['status']) => {
    if (serviceStatus === 'COMPLETED' || visitStatus === 'COMPLETED') {
      return 'bg-emerald-50 border-emerald-400 text-emerald-900';
    }
    if (serviceStatus === 'IN_PROGRESS' || visitStatus === 'IN_PROGRESS') {
      return 'bg-bode-emerald text-white border-bode-forest shadow-sm';
    }
    if (visitStatus === 'CHECKED_IN') {
      return 'bg-bode-gold/25 border-bode-gold text-bode-forest';
    }
    if (visitStatus === 'CANCELLED') {
      return 'bg-red-50 border-red-300 text-red-800';
    }
    return 'bg-blue-50 border-blue-300 text-blue-900';
  };

  const unassignedEntries = useMemo(() => {
    const list: { visit: CustomerVisit; service: VisitServiceEntry }[] = [];
    dayVisits.forEach((v) => {
      v.services.forEach((s) => {
        if (!s.staffId && v.visitStatus !== 'CANCELLED' && s.status !== 'CANCELLED') {
          list.push({ visit: v, service: s });
        }
      });
    });
    return list;
  }, [dayVisits]);

  const filteredSlotGuests = useMemo(() => {
    const q = slotGuestQuery.trim().toLowerCase();
    if (!q) return branchCustomers.slice(0, 6);
    return branchCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mobileNumber.includes(q)
    );
  }, [branchCustomers, slotGuestQuery]);

  const slotSelectedService =
    branchServices.find((s) => s.id === slotServiceId) || branchServices[0];
  const slotSelectedDuration =
    slotSelectedService?.durations[slotDurationIdx] || slotSelectedService?.durations[0];

  const handleAssignSlotBooking = () => {
    if (!slotAssignTarget || !slotGuestId || !slotSelectedService || !slotSelectedDuration) return;
    createServiceVisit({
      customerId: slotGuestId,
      serviceId: slotSelectedService.id,
      durationMinutes: slotSelectedDuration.durationMinutes,
      price: slotSelectedDuration.price,
      appointmentType: 'SCHEDULED',
      appointmentDate: selectedDate,
      appointmentTime: slotAssignTarget.timeSlot,
      staffId: slotAssignTarget.staffId,
    });
    setSlotAssignTarget(null);
    setShowSlotNewGuest(false);
  };

  const totalGridHeight = (END_HOUR - START_HOUR + 1) * 60 * SCALE_PX_PER_MIN;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl border border-bode-border p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
              Appointment Calendar
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Navigator */}
            <div className="flex items-center bg-bode-ivory rounded-xl border border-bode-border p-1">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="p-1.5 rounded-lg hover:bg-white text-bode-forest transition"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="relative flex items-center gap-1.5 px-2.5 text-xs font-semibold text-bode-forest">
                <Calendar className="w-3.5 h-3.5 text-bode-emerald" />
                <span>{formattedDate}</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Select date"
                />
              </div>
              <button
                type="button"
                onClick={() => shiftDate(1)}
                className="p-1.5 rounded-lg hover:bg-white text-bode-forest transition"
                aria-label="Next day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-2 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-xs font-semibold text-bode-forest"
            >
              Today
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-bode-ivory rounded-xl border border-bode-border p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'grid' ? 'bg-bode-forest text-white shadow-sm' : 'text-bode-charcoal'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'list' ? 'bg-bode-forest text-white shadow-sm' : 'text-bode-charcoal'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                showFilters
                  ? 'bg-bode-forest text-white border-bode-forest'
                  : 'bg-white text-bode-charcoal border-bode-border'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('create-service')}
              className="px-3.5 py-2 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-bode-gold" />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-bode-border/70 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">
                Filter by Therapist
              </label>
              <select
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Branch Staff</option>
                {branchStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Unassigned Services Alert Strip */}
      {unassignedEntries.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
          <p className="text-xs font-bold text-amber-900">
            Unassigned Services ({unassignedEntries.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unassignedEntries.map(({ visit, service }) => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-amber-200 p-2.5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-bode-forest truncate">
                    {visit.customerName} • {visit.appointmentTime}
                  </p>
                  <p className="text-[11px] text-bode-muted truncate">
                    {service.serviceName} ({service.durationMinutes}m)
                  </p>
                </div>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      assignStaffToService(visit.id, service.id, e.target.value);
                    }
                  }}
                  className="px-2 py-1.5 rounded-lg border border-bode-border bg-bode-ivory/40 text-[11px] font-semibold text-bode-forest shrink-0"
                >
                  <option value="">Assign Staff…</option>
                  {branchStaff
                    .filter((s) => s.isActive)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Grid View (Mobile + Desktop) */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-x-auto">
          {activeStaffColumns.length === 0 ? (
            <div className="p-10 text-center text-sm text-bode-muted space-y-2">
              <p className="font-semibold text-bode-forest">No active staff found for this branch.</p>
              <p className="text-xs">Go to Staff Management to add or activate therapists.</p>
              <button
                type="button"
                onClick={() => onNavigate('staff')}
                className="mt-2 px-4 py-2 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                Go to Staff
              </button>
            </div>
          ) : (
          <div
            style={{
              minWidth: `${68 + Math.max(1, activeStaffColumns.length) * 130}px`,
            }}
          >
            {/* Staff Header Row */}
            <div
              className="grid border-b border-bode-border bg-bode-ivory/70 sticky top-0 z-10"
              style={{
                gridTemplateColumns: `68px repeat(${Math.max(1, activeStaffColumns.length)}, minmax(130px, 1fr))`,
              }}
            >
              <div className="p-2.5 text-[10px] font-bold uppercase text-bode-muted border-r border-bode-border flex items-center justify-center">
                Time
              </div>
              {activeStaffColumns.map((st) => (
                <div
                  key={st.id}
                  className="p-2.5 border-r last:border-r-0 border-bode-border flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-bode-forest text-bode-gold font-bold text-xs flex items-center justify-center shrink-0">
                    {st.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 max-w-full">
                    <p className="font-serif font-bold text-xs text-bode-forest truncate">
                      {st.name}
                    </p>
                    <span
                      className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        st.availability === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.availability === 'IN_SERVICE'
                          ? 'bg-bode-emerald text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {st.availability.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div
              className="grid relative"
              style={{
                gridTemplateColumns: `68px repeat(${Math.max(1, activeStaffColumns.length)}, minmax(130px, 1fr))`,
                height: `${totalGridHeight}px`,
              }}
            >
              {/* Time Labels Column */}
              <div className="border-r border-bode-border relative bg-bode-ivory/30">
                {timeSlots.map((slot, idx) => (
                  <div
                    key={slot}
                    className="absolute left-0 right-0 border-t border-bode-border/50 px-1.5 pt-1 text-[10px] font-mono text-bode-muted leading-tight"
                    style={{ top: `${idx * 60 * SCALE_PX_PER_MIN}px` }}
                  >
                    {formatHour12(START_HOUR + idx)}
                  </div>
                ))}
              </div>

              {/* Employee Columns */}
              {activeStaffColumns.map((st) => {
                const staffEntries: { visit: CustomerVisit; service: VisitServiceEntry }[] = [];
                dayVisits.forEach((v) => {
                  v.services.forEach((s) => {
                    if (s.staffId === st.id) {
                      staffEntries.push({ visit: v, service: s });
                    }
                  });
                });

                return (
                  <div
                    key={st.id}
                    className="border-r last:border-r-0 border-bode-border relative"
                  >
                    {/* Clickable Hour Slots for Direct Assignment */}
                    {timeSlots.map((slot, idx) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          setSlotAssignTarget({
                            staffId: st.id,
                            staffName: st.name,
                            timeSlot: slot,
                          })
                        }
                        title={`Assign service to ${st.name} at ${formatHour12(START_HOUR + idx)}`}
                        className="absolute left-0 right-0 border-t border-bode-border/40 hover:bg-bode-emerald/5 transition text-left group"
                        style={{
                          top: `${idx * 60 * SCALE_PX_PER_MIN}px`,
                          height: `${60 * SCALE_PX_PER_MIN}px`,
                        }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-bode-emerald px-2 py-1 inline-flex items-center gap-0.5 transition">
                          <Plus className="w-3 h-3" />
                          Assign
                        </span>
                      </button>
                    ))}

                    {/* Appointment Blocks */}
                    {staffEntries.map(({ visit, service }) => {
                      const startMin = timeToMinutes(service.startTime || visit.appointmentTime);
                      const topPx = Math.max(0, (startMin - START_HOUR * 60) * SCALE_PX_PER_MIN);
                      const heightPx = Math.max(44, service.durationMinutes * SCALE_PX_PER_MIN);

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setQuickPanelTarget({ visit, service })}
                          style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                          className={`absolute left-1 right-1 z-10 rounded-lg border p-1.5 sm:p-2 text-left transition hover:shadow-md overflow-hidden flex flex-col justify-between ${getStatusBlockClasses(
                            visit.visitStatus,
                            service.status
                          )}`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[11px] truncate">
                                {visit.customerName}
                              </span>
                              <span className="text-[9px] font-mono shrink-0">
                                {service.startTime || visit.appointmentTime}
                              </span>
                            </div>
                            <p className="text-[10px] truncate opacity-90">
                              {service.serviceName} ({service.durationMinutes}m)
                            </p>
                          </div>
                          <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                            {service.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-bode-border shadow-sm divide-y divide-bode-border">
          {dayVisits.length === 0 ? (
            <div className="p-10 text-center text-xs text-bode-muted">
              No appointments scheduled for {formattedDate}.
            </div>
          ) : (
            dayVisits.map((v) => (
              <div
                key={v.id}
                onClick={() => onNavigate('visit-detail', v.id)}
                className="p-4 hover:bg-bode-ivory/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="px-3 py-2 rounded-xl bg-bode-ivory border border-bode-border text-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-bode-emerald mx-auto mb-0.5" />
                    <span className="font-mono text-xs font-bold text-bode-forest">
                      {v.appointmentTime}
                    </span>
                  </div>
                  <div>
                    <p className="font-serif font-bold text-sm text-bode-forest">{v.customerName}</p>
                    <p className="text-xs text-bode-charcoal">
                      {v.services.map((s) => `${s.serviceName} (${s.durationMinutes}m)`).join(', ')}
                    </p>
                    <p className="text-[11px] text-bode-muted flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3 h-3 text-bode-emerald" />
                      {v.services.map((s) => s.staffName || 'Unassigned').join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-bode-ivory border border-bode-border text-bode-forest">
                    {v.visitStatus}
                  </span>
                  {v.invoice && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInvoiceModal(v);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-bode-forest text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      Invoice
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Action Modal for Selected Appointment */}
      {quickPanelTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-bode-border overflow-hidden">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-bode-gold font-semibold">
                  {quickPanelTarget.visit.visitReference}
                </span>
                <h3 className="font-serif text-lg font-bold">
                  {quickPanelTarget.visit.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickPanelTarget(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-bode-ivory/60 rounded-xl p-3.5 border border-bode-border space-y-1.5">
                <p className="font-serif font-bold text-sm text-bode-forest">
                  {quickPanelTarget.service.serviceName} ({quickPanelTarget.service.durationMinutes} min)
                </p>
                <p className="text-bode-muted">
                  Therapist: <strong className="text-bode-charcoal">{quickPanelTarget.service.staffName || 'Unassigned'}</strong>
                </p>
                <p className="text-bode-muted">
                  Time: <strong className="text-bode-charcoal">{quickPanelTarget.service.startTime || quickPanelTarget.visit.appointmentTime}</strong> • Status: <strong className="text-bode-emerald">{quickPanelTarget.service.status}</strong>
                </p>
              </div>

              {/* Therapist Assignment / Reassignment — card-based picker */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-bode-muted mb-2">
                  {quickPanelTarget.service.staffId ? 'Reassign Therapist' : 'Assign Therapist'}
                </label>
                {/* Available staff shown as tap-to-select cards */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {branchStaff
                    .filter((s) => s.isActive)
                    .map((s) => {
                      const isSelected = quickPanelTarget.service.staffId === s.id;
                      const isAvailable = s.availability === 'AVAILABLE';
                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={!isAvailable && !isSelected}
                          onClick={() => {
                            if (!isAvailable && !isSelected) return;
                            assignStaffToService(
                              quickPanelTarget.visit.id,
                              quickPanelTarget.service.id,
                              s.id
                            );
                            setQuickPanelTarget({
                              ...quickPanelTarget,
                              service: {
                                ...quickPanelTarget.service,
                                staffId: s.id,
                                staffName: s.name,
                              },
                            });
                          }}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition ${
                            isSelected
                              ? 'border-bode-forest bg-bode-forest/10 ring-2 ring-bode-forest'
                              : isAvailable
                              ? 'border-bode-border bg-white hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer'
                              : 'border-bode-border/40 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-bode-forest text-bode-gold'
                                : isAvailable
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {s.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <span className="text-[10px] font-semibold text-bode-forest leading-tight truncate max-w-full">
                            {s.name.split(' ')[0]}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none ${
                              isSelected
                                ? 'bg-bode-forest text-white'
                                : isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isSelected ? 'Assigned' : isAvailable ? 'Available' : s.availability.replace('_', ' ')}
                          </span>
                        </button>
                      );
                    })}
                </div>
                {/* Fallback: unassign option */}
                {quickPanelTarget.service.staffId && (
                  <button
                    type="button"
                    onClick={() => {
                      assignStaffToService(
                        quickPanelTarget.visit.id,
                        quickPanelTarget.service.id,
                        ''
                      );
                      setQuickPanelTarget({
                        ...quickPanelTarget,
                        service: {
                          ...quickPanelTarget.service,
                          staffId: undefined,
                          staffName: undefined,
                        },
                      });
                    }}
                    className="text-[11px] text-red-500 hover:underline flex items-center gap-1 mt-1"
                  >
                    <X className="w-3 h-3" /> Remove assignment
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {quickPanelTarget.service.status === 'ADDED' && (
                  <button
                    type="button"
                    onClick={() => {
                      startServiceSession(quickPanelTarget.visit.id, quickPanelTarget.service.id);
                      setQuickPanelTarget(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-bode-emerald hover:bg-bode-forest text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Service
                  </button>
                )}

                {quickPanelTarget.service.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => {
                      completeIndividualService(quickPanelTarget.visit.id, quickPanelTarget.service.id);
                      completeCustomerVisit(quickPanelTarget.visit.id);
                      setQuickPanelTarget(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const id = quickPanelTarget.visit.id;
                    setQuickPanelTarget(null);
                    onNavigate('visit-detail', id);
                  }}
                  className="col-span-2 py-2.5 px-3 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white font-semibold"
                >
                  Open Full Visit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Slot Assignment Modal */}
      {slotAssignTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-bode-border overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-bode-gold font-semibold">
                  {formattedDate} • {slotAssignTarget.timeSlot}
                </span>
                <h3 className="font-serif text-lg font-bold">
                  Assign to {slotAssignTarget.staffName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSlotAssignTarget(null);
                  setShowSlotNewGuest(false);
                }}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {showSlotNewGuest ? (
                <AddGuestForm
                  onSave={(cust) => {
                    setSlotGuestId(cust.id);
                    setShowSlotNewGuest(false);
                  }}
                  onCancel={() => setShowSlotNewGuest(false)}
                />
              ) : (
                <>
                  {/* Guest Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold uppercase tracking-wider text-bode-muted text-[11px]">
                        Select Guest
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSlotNewGuest(true)}
                        className="text-bode-emerald font-semibold flex items-center gap-1 hover:underline"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add New Guest
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-bode-muted absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={slotGuestQuery}
                        onChange={(e) => setSlotGuestQuery(e.target.value)}
                        placeholder="Search guest by name or mobile..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-bode-border bg-bode-ivory/30"
                      />
                    </div>
                    <select
                      value={slotGuestId}
                      onChange={(e) => setSlotGuestId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-bode-border bg-white font-medium text-bode-forest"
                    >
                      {filteredSlotGuests.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.mobileNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-2">
                    <label className="block font-bold uppercase tracking-wider text-bode-muted text-[11px]">
                      Select Service
                    </label>
                    <select
                      value={slotServiceId}
                      onChange={(e) => {
                        setSlotServiceId(e.target.value);
                        setSlotDurationIdx(0);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-bode-border bg-white font-medium text-bode-forest"
                    >
                      {branchServices.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  {slotSelectedService && (
                    <div className="space-y-2">
                      <label className="block font-bold uppercase tracking-wider text-bode-muted text-[11px]">
                        Duration &amp; Price
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {slotSelectedService.durations.map((d, idx) => (
                          <button
                            key={d.durationMinutes}
                            type="button"
                            onClick={() => setSlotDurationIdx(idx)}
                            className={`p-2.5 rounded-xl border text-left transition ${
                              slotDurationIdx === idx
                                ? 'border-bode-forest bg-bode-forest/5 ring-1 ring-bode-forest font-bold text-bode-forest'
                                : 'border-bode-border bg-white text-bode-charcoal'
                            }`}
                          >
                            <div>{d.durationMinutes} min</div>
                            <div className="text-sm font-serif">
                              ₹{d.price.toLocaleString('en-IN')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAssignSlotBooking}
                    className="w-full py-3 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white font-semibold shadow transition"
                  >
                    Assign &amp; Book Slot
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

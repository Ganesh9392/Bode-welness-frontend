import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES } from '../data/mockData';
import { StaffMember, StaffRole, StaffShiftDay } from '../types';
import {
  UserPlus,
  Edit3,
  Phone,
  Clock,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FileText,
  Landmark,
  Shield,
  User,
  Calendar,
} from 'lucide-react';

const DAYS_OF_WEEK: StaffShiftDay['day'][] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DEFAULT_SHIFTS: StaffShiftDay[] = DAYS_OF_WEEK.map((day) => ({
  day,
  isOff: day === 'Sunday',
  startTime: day === 'Sunday' ? undefined : '10:00',
  endTime: day === 'Sunday' ? undefined : '19:00',
}));

export const StaffPage: React.FC = () => {
  const { branchStaff, currentBranch, createStaff, updateStaff } = useApp();

  const [viewMode, setViewMode] = useState<'directory' | 'availability'>('directory');
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [openSection, setOpenSection] = useState<number>(1);

  const openCreateForm = () => {
    setIsNew(true);
    setOpenSection(1);
    setEditingStaff({
      firstName: '',
      lastName: '',
      name: '',
      phone: '',
      email: '',
      role: 'Massage Therapist',
      position: 'Therapist',
      branchId: currentBranch?.id || 'branch-ecil',
      gender: 'Female',
      joiningDate: new Date().toISOString().split('T')[0],
      username: '',
      isActive: true,
      showAllAppointments: true,
      enableAppointments: false,
      onlineNotifications: false,
      teamNotifications: false,
      specializations: [],
      availability: 'AVAILABLE',
      shifts: DEFAULT_SHIFTS,
      experience: [],
      documents: [],
    });
  };

  const openEditForm = (st: StaffMember) => {
    setIsNew(false);
    setOpenSection(2);
    setEditingStaff({
      ...st,
      shifts: st.shifts && st.shifts.length === 7 ? st.shifts : DEFAULT_SHIFTS,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    const fullName = `${editingStaff.firstName || ''} ${editingStaff.lastName || ''}`.trim();
    if (!fullName || !editingStaff.phone) return;

    const payload: Omit<StaffMember, 'id'> = {
      firstName: editingStaff.firstName || '',
      lastName: editingStaff.lastName || '',
      name: fullName,
      phone: editingStaff.phone,
      email: editingStaff.email,
      dateOfBirth: editingStaff.dateOfBirth,
      role: (editingStaff.role as StaffRole) || 'Massage Therapist',
      position: editingStaff.position,
      designation: editingStaff.designation,
      branchId: editingStaff.branchId || currentBranch?.id || 'branch-ecil',
      gender: editingStaff.gender || 'Female',
      joiningDate: editingStaff.joiningDate,
      reportingTo: editingStaff.reportingTo,
      uanNumber: editingStaff.uanNumber,
      workingHours: editingStaff.workingHours,
      username: editingStaff.username || fullName.toLowerCase().replace(/\s+/g, '.'),
      bankName: editingStaff.bankName,
      bankBranch: editingStaff.bankBranch,
      accountNumber: editingStaff.accountNumber,
      ifscCode: editingStaff.ifscCode,
      isActive: editingStaff.isActive ?? true,
      showAllAppointments: editingStaff.showAllAppointments ?? true,
      enableAppointments: editingStaff.enableAppointments ?? false,
      onlineNotifications: editingStaff.onlineNotifications ?? false,
      teamNotifications: editingStaff.teamNotifications ?? false,
      specializations: editingStaff.specializations || [],
      availability: editingStaff.availability || 'AVAILABLE',
      shifts: editingStaff.shifts || DEFAULT_SHIFTS,
      experience: editingStaff.experience || [],
      documents: editingStaff.documents || [],
    };

    if (isNew) {
      createStaff(payload);
    } else if (editingStaff.id) {
      updateStaff(editingStaff.id, payload);
    }
    setEditingStaff(null);
  };

  const updateShiftDay = (day: StaffShiftDay['day'], patch: Partial<StaffShiftDay>) => {
    if (!editingStaff) return;
    const currentShifts = editingStaff.shifts || DEFAULT_SHIFTS;
    const nextShifts = currentShifts.map((s) => (s.day === day ? { ...s, ...patch } : s));
    setEditingStaff({ ...editingStaff, shifts: nextShifts });
  };

  const getAvailabilityBadge = (avail: StaffMember['availability']) => {
    if (avail === 'AVAILABLE') return 'bg-emerald-100 text-emerald-800';
    if (avail === 'IN_SERVICE') return 'bg-bode-emerald text-white';
    if (avail === 'ON_BREAK') return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">Staff Management</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white rounded-xl border border-bode-border p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('directory')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                viewMode === 'directory' ? 'bg-bode-forest text-white' : 'text-bode-charcoal'
              }`}
            >
              Directory
            </button>
            <button
              type="button"
              onClick={() => setViewMode('availability')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                viewMode === 'availability' ? 'bg-bode-forest text-white' : 'text-bode-charcoal'
              }`}
            >
              Availability
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="px-4 py-2.5 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold shadow-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-bode-gold" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Staff Cards */}
      {viewMode === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchStaff.map((st) => {
            const initials = st.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={st.id}
                className="bg-white rounded-2xl border border-bode-border p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-bode-forest text-bode-gold font-bold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-base text-bode-forest truncate">
                          {st.name}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            st.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-bode-emerald font-medium">
                        {st.role} {st.position ? `• ${st.position}` : ''}
                      </p>
                      <p className="text-[11px] text-bode-muted flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {st.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditForm(st)}
                    className="px-3 py-1.5 rounded-lg border border-bode-border hover:bg-bode-ivory text-xs font-semibold text-bode-forest flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {st.currentAssignedService && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <strong>In Session:</strong> {st.currentAssignedService}
                    {st.currentCustomerName ? ` — ${st.currentCustomerName}` : ''}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-bode-border/60 text-[11px]">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${getAvailabilityBadge(
                      st.availability
                    )}`}
                  >
                    {st.availability.replace('_', ' ')}
                  </span>
                  <span className="text-bode-muted">
                    {st.enableAppointments ? 'Appointments Enabled' : 'Appointments Off'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-bode-border divide-y divide-bode-border shadow-sm">
          {branchStaff.map((st) => (
            <div key={st.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    st.availability === 'AVAILABLE'
                      ? 'bg-emerald-500'
                      : st.availability === 'IN_SERVICE'
                      ? 'bg-bode-emerald animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <div>
                  <p className="font-serif font-bold text-sm text-bode-forest">{st.name}</p>
                  <p className="text-xs text-bode-muted">
                    {st.currentAssignedService || 'Ready for assignment'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${getAvailabilityBadge(
                  st.availability
                )}`}
              >
                {st.availability.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 7-Section Staff Form Modal/Drawer */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold">
                  {isNew ? 'Create New Staff Member' : `Edit: ${editingStaff.name}`}
                </h3>
                <p className="text-[11px] text-white/75">
                  Complete 7-section operational &amp; shift configuration
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs">
              {/* Section 1: Operational Toggles */}
              <div className="border border-bode-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 1 ? 0 : 1)}
                  className="w-full px-4 py-3 bg-bode-ivory/60 flex items-center justify-between font-serif font-bold text-sm text-bode-forest"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-bode-emerald" />
                    1. Operational Toggles
                  </span>
                  {openSection === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === 1 && (
                  <div className="p-4 space-y-2.5">
                    {(
                      [
                        { key: 'isActive', label: 'Active' },
                        { key: 'showAllAppointments', label: 'Show All Staff Appointments' },
                        { key: 'enableAppointments', label: 'Enable Appointments' },
                        { key: 'onlineNotifications', label: 'Online Notifications' },
                        { key: 'teamNotifications', label: 'Team Notifications' },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-bode-ivory/30 border border-bode-border/70 cursor-pointer"
                      >
                        <span className="font-medium text-bode-charcoal">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(editingStaff[item.key])}
                          onChange={(e) =>
                            setEditingStaff({ ...editingStaff, [item.key]: e.target.checked })
                          }
                          className="w-4 h-4 accent-bode-forest"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Personal Information */}
              <div className="border border-bode-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 2 ? 0 : 2)}
                  className="w-full px-4 py-3 bg-bode-ivory/60 flex items-center justify-between font-serif font-bold text-sm text-bode-forest"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-bode-emerald" />
                    2. Personal Information
                  </span>
                  {openSection === 2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === 2 && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={editingStaff.firstName || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, firstName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={editingStaff.lastName || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, lastName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={editingStaff.phone || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Email</label>
                      <input
                        type="email"
                        value={editingStaff.email || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Role *</label>
                      <select
                        value={editingStaff.role || 'Massage Therapist'}
                        onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as StaffRole })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border bg-white"
                      >
                        <option value="Senior Spa Therapist">Senior Spa Therapist</option>
                        <option value="Massage Therapist">Massage Therapist</option>
                        <option value="Aesthetician">Aesthetician</option>
                        <option value="Ayurvedic Specialist">Ayurvedic Specialist</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Position</label>
                      <input
                        type="text"
                        value={editingStaff.position || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, position: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Store *</label>
                      <select
                        value={editingStaff.branchId || currentBranch?.id}
                        onChange={(e) => setEditingStaff({ ...editingStaff, branchId: e.target.value as StaffMember['branchId'] })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border bg-white"
                      >
                        {BRANCHES.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.shortName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Gender *</label>
                      <select
                        value={editingStaff.gender || 'Female'}
                        onChange={(e) => setEditingStaff({ ...editingStaff, gender: e.target.value as StaffMember['gender'] })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border bg-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Username *</label>
                      <input
                        type="text"
                        value={editingStaff.username || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editingStaff.dateOfBirth || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Joining Details */}
              <div className="border border-bode-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 3 ? 0 : 3)}
                  className="w-full px-4 py-3 bg-bode-ivory/60 flex items-center justify-between font-serif font-bold text-sm text-bode-forest"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-bode-emerald" />
                    3. Joining Details
                  </span>
                  {openSection === 3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === 3 && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Joining Date</label>
                      <input
                        type="date"
                        value={editingStaff.joiningDate || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, joiningDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Reporting To</label>
                      <input
                        type="text"
                        value={editingStaff.reportingTo || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, reportingTo: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">UAN Number</label>
                      <input
                        type="text"
                        value={editingStaff.uanNumber || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, uanNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Working Hours</label>
                      <input
                        type="text"
                        placeholder="e.g. 9 hrs/day"
                        value={editingStaff.workingHours || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, workingHours: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-bode-muted mb-1">Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Therapist"
                        value={editingStaff.designation || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Bank Details */}
              <div className="border border-bode-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 4 ? 0 : 4)}
                  className="w-full px-4 py-3 bg-bode-ivory/60 flex items-center justify-between font-serif font-bold text-sm text-bode-forest"
                >
                  <span className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-bode-emerald" />
                    4. Bank Details
                  </span>
                  {openSection === 4 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === 4 && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={editingStaff.bankName || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, bankName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Branch</label>
                      <input
                        type="text"
                        value={editingStaff.bankBranch || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, bankBranch: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">Account Number</label>
                      <input
                        type="text"
                        value={editingStaff.accountNumber || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-bode-muted mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={editingStaff.ifscCode || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, ifscCode: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-bode-border"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Stylist Shifts */}
              <div className="border border-bode-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 5 ? 0 : 5)}
                  className="w-full px-4 py-3 bg-bode-ivory/60 flex items-center justify-between font-serif font-bold text-sm text-bode-forest"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-bode-emerald" />
                    5. Stylist Shifts (7-Day Schedule)
                  </span>
                  {openSection === 5 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === 5 && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(editingStaff.shifts || DEFAULT_SHIFTS).map((shift) => (
                      <div
                        key={shift.day}
                        className={`p-3 rounded-xl border ${
                          shift.isOff
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-bode-ivory/40 border-bode-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-bode-forest">{shift.day}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateShiftDay(shift.day, {
                                isOff: !shift.isOff,
                                startTime: shift.isOff ? '10:00' : undefined,
                                endTime: shift.isOff ? '19:00' : undefined,
                              })
                            }
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              shift.isOff
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {shift.isOff ? 'Weekly Off' : 'Working'}
                          </button>
                        </div>
                        {!shift.isOff && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={shift.startTime || '10:00'}
                              onChange={(e) =>
                                updateShiftDay(shift.day, { startTime: e.target.value })
                              }
                              className="flex-1 px-2 py-1 rounded border border-bode-border bg-white text-[11px]"
                            />
                            <span className="text-bode-muted">to</span>
                            <input
                              type="time"
                              value={shift.endTime || '19:00'}
                              onChange={(e) =>
                                updateShiftDay(shift.day, { endTime: e.target.value })
                              }
                              className="flex-1 px-2 py-1 rounded border border-bode-border bg-white text-[11px]"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 6: Work Experience */}
              <div className="border border-bode-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 6 ? 0 : 6)}
                  className="w-full px-4 py-3 bg-bode-ivory/60 flex items-center justify-between font-serif font-bold text-sm text-bode-forest"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-bode-emerald" />
                    6. Work Experience ({editingStaff.experience?.length || 0})
                  </span>
                  {openSection === 6 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === 6 && (
                  <div className="p-4 space-y-2">
                    {(editingStaff.experience || []).map((exp) => (
                      <div key={exp.id} className="p-2.5 rounded-lg border border-bode-border bg-bode-ivory/30">
                        <p className="font-semibold text-bode-forest">{exp.role} at {exp.company}</p>
                        <p className="text-[11px] text-bode-muted">{exp.fromDate} — {exp.toDate || 'Present'}</p>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStaff({
                          ...editingStaff,
                          experience: [
                            ...(editingStaff.experience || []),
                            {
                              id: `exp-${Date.now()}`,
                              company: 'Wellness Spa Studio',
                              role: editingStaff.role || 'Therapist',
                              fromDate: '2022-01-01',
                              toDate: '2024-01-01',
                            },
                          ],
                        })
                      }
                      className="px-3 py-1.5 rounded-lg border border-bode-border hover:bg-bode-ivory font-semibold text-bode-forest"
                    >
                      + Add Experience
                    </button>
                  </div>
                )}
              </div>

              {/* Section 7: Documents */}
              <div className="border border-bode-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 7 ? 0 : 7)}
                  className="w-full px-4 py-3 bg-bode-ivory/60 flex items-center justify-between font-serif font-bold text-sm text-bode-forest"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-bode-emerald" />
                    7. Documents ({editingStaff.documents?.length || 0})
                  </span>
                  {openSection === 7 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === 7 && (
                  <div className="p-4 space-y-2">
                    {(editingStaff.documents || []).map((doc) => (
                      <div key={doc.id} className="p-2.5 rounded-lg border border-bode-border flex justify-between">
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-bode-muted">{doc.type}</span>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStaff({
                          ...editingStaff,
                          documents: [
                            ...(editingStaff.documents || []),
                            {
                              id: `doc-${Date.now()}`,
                              name: 'ID Proof / Spa Certification',
                              type: 'PDF',
                              uploadedAt: new Date().toISOString().split('T')[0],
                            },
                          ],
                        })
                      }
                      className="px-3 py-1.5 rounded-lg border border-bode-border hover:bg-bode-ivory font-semibold text-bode-forest"
                    >
                      + Add Document
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-bode-border sticky bottom-0 bg-white py-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
        
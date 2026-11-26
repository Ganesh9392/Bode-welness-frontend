import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronRight, FileText, Plus, Trash2, Upload, X } from 'lucide-react';
import {
  BackofficeStaffDocument,
  BackofficeStaffMember,
  BackofficeWorkExperience,
} from '../../types/backoffice';
import {
  createDefaultShifts,
  DESIGNATION_OPTIONS,
  STAFF_ROLE_OPTIONS,
  STORE_OPTIONS,
} from '../../data/backofficeMockData';
import { genId } from '../../services/backofficeService';
import {
  BackofficeBottomBar,
  BackofficeCard,
  BackofficeConfirmDialog,
  BackofficeEmptyState,
  BackofficeField,
  BackofficeListSkeleton,
  BackofficeRadioGroup,
  BackofficeSearchBar,
  BackofficeSubHeader,
  BackofficeToggle,
  boInputCls,
} from './BackofficeSharedUI';
import { StylistShiftSection } from './StylistShiftSection';

interface StaffSectionProps {
  staffList: BackofficeStaffMember[];
  onSaveStaff: (member: BackofficeStaffMember, isNew: boolean) => void;
  onDeleteStaff: (staffId: string) => void;
  onBackToHub: () => void;
}

export const StaffSection: React.FC<StaffSectionProps> = ({
  staffList,
  onSaveStaff,
  onDeleteStaff,
  onBackToHub,
}) => {
  const [editingStaff, setEditingStaff] = useState<BackofficeStaffMember | null | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(t);
  }, []);

  if (editingStaff !== undefined) {
    return (
      <StaffDetailsForm
        initialStaff={editingStaff}
        allStaff={staffList}
        onSave={(member, isNew) => {
          onSaveStaff(member, isNew);
          setEditingStaff(undefined);
        }}
        onDelete={(staffId) => {
          onDeleteStaff(staffId);
          setEditingStaff(undefined);
        }}
        onCancel={() => setEditingStaff(undefined)}
      />
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = staffList
    .filter((s) => showInactive || s.isActive)
    .filter(
      (s) =>
        !q ||
        s.displayName.toLowerCase().includes(q) ||
        s.mobileNumber.includes(q) ||
        s.role.toLowerCase().includes(q)
    );

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title="Staff Management"
        onBack={onBackToHub}
        menuActions={[
          {
            label: showInactive ? 'Hide Inactive Staff' : 'Show All Staff',
            onClick: () => setShowInactive((v) => !v),
          },
          {
            label: 'Create New Staff',
            onClick: () => setEditingStaff(null),
          },
        ]}
      />

      <div className="max-w-3xl mx-auto space-y-3">
        <BackofficeSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search staff..."
        />

        {loading ? (
          <BackofficeListSkeleton rows={7} />
        ) : filtered.length === 0 ? (
          <BackofficeEmptyState
            hasSearch={Boolean(q)}
            onClearSearch={() => setSearchQuery('')}
            message="No staff members yet, tap Create New to add one"
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setEditingStaff(member)}
                className={`w-full text-left bg-white rounded-2xl border border-bode-border px-4 py-4 shadow-sm flex items-center justify-between gap-3 hover:bg-bode-ivory/40 transition ${
                  !member.isActive ? 'opacity-55' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-bode-charcoal truncate">
                    {member.displayName}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-bode-muted shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <BackofficeBottomBar
        mode="list"
        primaryLabel="Create New"
        onPrimary={() => setEditingStaff(null)}
      />
    </div>
  );
};

// ─── Staff Details Form (Single Scrollable Page, 7 Grouped Cards) ────────────

interface StaffDetailsFormProps {
  initialStaff: BackofficeStaffMember | null;
  allStaff: BackofficeStaffMember[];
  onSave: (member: BackofficeStaffMember, isNew: boolean) => void;
  onDelete: (staffId: string) => void;
  onCancel: () => void;
}

interface StaffErrors {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  role?: string;
  store?: string;
  username?: string;
  joiningDate?: string;
  uanNumber?: string;
}

const StaffDetailsForm: React.FC<StaffDetailsFormProps> = ({
  initialStaff,
  allStaff,
  onSave,
  onDelete,
  onCancel,
}) => {
  const isNew = !initialStaff;
  const docFileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<BackofficeStaffMember>(() =>
    initialStaff
      ? {
          ...initialStaff,
          shifts:
            initialStaff.shifts && initialStaff.shifts.length === 7
              ? initialStaff.shifts.map((s) => ({ ...s }))
              : createDefaultShifts(),
          experiences: initialStaff.experiences.map((e) => ({ ...e })),
          documents: initialStaff.documents.map((d) => ({ ...d })),
        }
      : {
          id: '',
          isActive: true,
          showAllAppointments: true,
          enableAppointments: false,
          onlineNotifications: false,
          teamNotifications: false,
          firstName: '',
          lastName: '',
          displayName: '',
          mobileNumber: '',
          email: '',
          dateOfBirth: '',
          position: '',
          role: 'Massage Therapist',
          store: 'Secunderabad',
          username: '',
          useMobileAsUsername: true,
          gender: 'Male',
          shifts: createDefaultShifts(),
          experiences: [],
          documents: [],
          joiningDate: new Date().toISOString().split('T')[0],
          reportingTo: '',
          uanNumber: '',
          workingHours: '',
          designation: '',
          bankName: '',
          bankBranch: '',
          accountNumber: '',
          ifscCode: '',
        }
  );

  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<StaffErrors>({});
  const [confirmUnsaved, setConfirmUnsaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Experience Modal
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [newExp, setNewExp] = useState<Omit<BackofficeWorkExperience, 'id'>>({
    company: '',
    role: '',
    fromDate: '',
    toDate: '',
    isCurrent: false,
  });

  // Document Modal
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<{ name: string; type: string; fileUrl?: string }>({
    name: '',
    type: 'ID Proof',
    fileUrl: undefined,
  });

  const patch = (updates: Partial<BackofficeStaffMember>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (updates.mobileNumber !== undefined && next.useMobileAsUsername) {
        next.username = updates.mobileNumber;
      }
      if (updates.useMobileAsUsername) {
        next.username = next.mobileNumber;
      }
      return next;
    });
    setIsDirty(true);
    setErrors((prev) => {
      const copy = { ...prev };
      (Object.keys(updates) as (keyof StaffErrors)[]).forEach((k) => {
        if (k in copy) delete copy[k];
      });
      return copy;
    });
  };

  const handleBackOrCancel = () => {
    if (isDirty) setConfirmUnsaved(true);
    else onCancel();
  };

  const handleSubmit = () => {
    const nextErrors: StaffErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    const digits = form.mobileNumber.replace(/\D/g, '');
    if (!digits || digits.length !== 10) {
      nextErrors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    }
    if (!form.role.trim()) nextErrors.role = 'Role is required.';
    if (!form.store.trim()) nextErrors.store = 'Store is required.';
    if (!form.username.trim()) nextErrors.username = 'Username is required.';
    if (!form.joiningDate) nextErrors.joiningDate = 'Joining date is required.';
    if (form.uanNumber && !/^\d{12}$/.test(form.uanNumber.trim())) {
      nextErrors.uanNumber = 'UAN must be 12 digits.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const combinedName =
      form.lastName.trim() === '-' || !form.lastName.trim()
        ? form.firstName.trim()
        : `${form.firstName.trim()} ${form.lastName.trim()}`;

    onSave(
      {
        ...form,
        id: isNew ? genId('bo-stf') : form.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        displayName: combinedName,
        mobileNumber: digits,
        username: form.username.trim(),
      },
      isNew
    );
  };

  const handleAddExperience = () => {
    if (!newExp.company.trim() || !newExp.role.trim()) return;
    const item: BackofficeWorkExperience = {
      id: genId('exp'),
      company: newExp.company.trim(),
      role: newExp.role.trim(),
      fromDate: newExp.fromDate || '2023-01-01',
      toDate: newExp.isCurrent ? undefined : newExp.toDate || undefined,
      isCurrent: newExp.isCurrent,
    };
    patch({ experiences: [...form.experiences, item] });
    setNewExp({ company: '', role: '', fromDate: '', toDate: '', isCurrent: false });
    setExpModalOpen(false);
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewDoc((prev) => ({
        ...prev,
        name: prev.name || file.name.replace(/\.[^.]+$/, ''),
        fileUrl: typeof reader.result === 'string' ? reader.result : undefined,
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddDocument = () => {
    if (!newDoc.name.trim()) return;
    const doc: BackofficeStaffDocument = {
      id: genId('doc'),
      name: newDoc.name.trim(),
      type: newDoc.type,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileUrl: newDoc.fileUrl,
    };
    patch({ documents: [...form.documents, doc] });
    setNewDoc({ name: '', type: 'ID Proof', fileUrl: undefined });
    setDocModalOpen(false);
  };

  const reportingManagers = allStaff
    .filter((s) => s.id !== form.id)
    .map((s) => s.displayName);

  return (
    <div className="space-y-4 pb-24">
      <BackofficeSubHeader
        title="Staff Details"
        onBack={handleBackOrCancel}
        onDelete={!isNew ? () => setConfirmDelete(true) : undefined}
        deleteLabel="Delete Staff"
      />

      <div className="max-w-3xl mx-auto space-y-3.5">
        {/* 1. Toggles Card */}
        <BackofficeCard>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
            {(
              [
                { key: 'isActive', label: 'Active' },
                { key: 'showAllAppointments', label: 'Show all staff appointments' },
                { key: 'enableAppointments', label: 'Enable appointments' },
                { key: 'onlineNotifications', label: 'Online notifications' },
                { key: 'teamNotifications', label: 'Team notifications' },
              ] as const
            ).map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-bode-charcoal leading-snug">
                  {item.label}
                </span>
                <BackofficeToggle
                  checked={Boolean(form[item.key])}
                  onChange={(val) => patch({ [item.key]: val })}
                  ariaLabel={item.label}
                />
              </div>
            ))}
          </div>
        </BackofficeCard>

        {/* 2. Personal Information */}
        <BackofficeCard className="space-y-4">
          <h3 className="font-serif text-sm sm:text-base font-bold text-bode-forest">
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="First Name" required error={errors.firstName}>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => patch({ firstName: e.target.value })}
                placeholder="First name"
                className={boInputCls(Boolean(errors.firstName))}
              />
            </BackofficeField>

            <BackofficeField label="Last Name" required error={errors.lastName}>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => patch({ lastName: e.target.value })}
                placeholder="Last name"
                className={boInputCls(Boolean(errors.lastName))}
              />
            </BackofficeField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Mobile Number" required error={errors.mobileNumber}>
              <input
                type="tel"
                value={form.mobileNumber}
                onChange={(e) => patch({ mobileNumber: e.target.value })}
                placeholder="10-digit mobile"
                className={boInputCls(Boolean(errors.mobileNumber))}
              />
            </BackofficeField>

            <BackofficeField label="Email">
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => patch({ email: e.target.value })}
                placeholder="Email address"
                className={boInputCls()}
              />
            </BackofficeField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth || ''}
                onChange={(e) => patch({ dateOfBirth: e.target.value })}
                className={boInputCls()}
              />
            </BackofficeField>

            <BackofficeField label="Position">
              <input
                type="text"
                value={form.position || ''}
                onChange={(e) => patch({ position: e.target.value })}
                placeholder="Enter position"
                className={boInputCls()}
              />
            </BackofficeField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Role" required error={errors.role}>
              <select
                value={form.role}
                onChange={(e) => patch({ role: e.target.value })}
                className={boInputCls(Boolean(errors.role))}
              >
                {STAFF_ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </BackofficeField>

            <BackofficeField label="Stores" required error={errors.store}>
              <select
                value={form.store}
                onChange={(e) => patch({ store: e.target.value })}
                className={boInputCls(Boolean(errors.store))}
              >
                {STORE_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </BackofficeField>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <BackofficeField label="Username" required error={errors.username}>
                <input
                  type="text"
                  disabled={form.useMobileAsUsername}
                  value={form.username}
                  onChange={(e) => patch({ username: e.target.value })}
                  placeholder="Username"
                  className={`${boInputCls(Boolean(errors.username))} ${
                    form.useMobileAsUsername ? 'bg-bode-ivory/60 text-bode-muted' : ''
                  }`}
                />
              </BackofficeField>

              <button
                type="button"
                onClick={() => patch({ useMobileAsUsername: !form.useMobileAsUsername })}
                className="flex items-center gap-2 py-2.5 px-1 text-xs font-medium text-bode-charcoal"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                    form.useMobileAsUsername
                      ? 'bg-bode-forest border-bode-forest text-white'
                      : 'bg-white border-bode-border'
                  }`}
                >
                  {form.useMobileAsUsername && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
                <span>Use Mobile as Username</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-bode-charcoal">
              Gender <span className="text-red-500">*</span>
            </label>
            <BackofficeRadioGroup<'Male' | 'Female' | 'Other'>
              value={form.gender}
              onChange={(g) => patch({ gender: g })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>
        </BackofficeCard>

        {/* 3. Stylist Shifts For Current Week */}
        <StylistShiftSection
          shifts={form.shifts}
          onChange={(nextShifts) => patch({ shifts: nextShifts })}
        />

        {/* 4. Work Experience */}
        <BackofficeCard className="space-y-3">
          <h3 className="font-serif text-sm sm:text-base font-bold text-bode-forest">
            Work Experience
          </h3>

          {form.experiences.length > 0 && (
            <div className="space-y-2">
              {form.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-bode-ivory/40 border border-bode-border flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-bode-forest truncate">
                      {exp.role} — {exp.company}
                    </p>
                    <p className="text-[11px] text-bode-muted">
                      {exp.fromDate} to {exp.isCurrent ? 'Present' : exp.toDate || '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        experiences: form.experiences.filter((x) => x.id !== exp.id),
                      })
                    }
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 shrink-0"
                    aria-label="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-dashed border-bode-emerald text-bode-emerald hover:bg-bode-ivory/50 text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </button>
        </BackofficeCard>

        {/* 5. Documents */}
        <BackofficeCard className="space-y-3">
          <h3 className="font-serif text-sm sm:text-base font-bold text-bode-forest">Documents</h3>

          {form.documents.length > 0 && (
            <div className="space-y-2">
              {form.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-bode-ivory/40 border border-bode-border flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-bode-emerald shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-bode-forest truncate">{doc.name}</p>
                      <p className="text-[11px] text-bode-muted">
                        {doc.type} • {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        documents: form.documents.filter((d) => d.id !== doc.id),
                      })
                    }
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 shrink-0"
                    aria-label="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setDocModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-dashed border-bode-emerald text-bode-emerald hover:bg-bode-ivory/50 text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </button>
        </BackofficeCard>

        {/* 6. Joining Details */}
        <BackofficeCard className="space-y-4">
          <h3 className="font-serif text-sm sm:text-base font-bold text-bode-forest">
            Joining Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Joining Date" required error={errors.joiningDate}>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => patch({ joiningDate: e.target.value })}
                className={boInputCls(Boolean(errors.joiningDate))}
              />
            </BackofficeField>

            <BackofficeField label="Reporting to">
              <select
                value={form.reportingTo || ''}
                onChange={(e) => patch({ reportingTo: e.target.value })}
                className={boInputCls()}
              >
                <option value="">Select manager</option>
                {reportingManagers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </BackofficeField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="UAN Number" error={errors.uanNumber}>
              <input
                type="text"
                maxLength={12}
                value={form.uanNumber || ''}
                onChange={(e) => patch({ uanNumber: e.target.value })}
                placeholder="12-digit UAN"
                className={boInputCls(Boolean(errors.uanNumber))}
              />
            </BackofficeField>

            <BackofficeField label="Working Hours">
              <input
                type="text"
                value={form.workingHours || ''}
                onChange={(e) => patch({ workingHours: e.target.value })}
                placeholder="Daily hours"
                className={boInputCls()}
              />
            </BackofficeField>
          </div>

          <BackofficeField label="Designation" className="w-1/2 min-w-[160px]">
            <select
              value={form.designation || ''}
              onChange={(e) => patch({ designation: e.target.value })}
              className={boInputCls()}
            >
              <option value="">Designation</option>
              {DESIGNATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </BackofficeField>
        </BackofficeCard>

        {/* 7. Bank Details */}
        <BackofficeCard className="space-y-4">
          <h3 className="font-serif text-sm sm:text-base font-bold text-bode-forest">
            Bank Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Bank Name">
              <input
                type="text"
                value={form.bankName || ''}
                onChange={(e) => patch({ bankName: e.target.value })}
                placeholder="Bank name"
                className={boInputCls()}
              />
            </BackofficeField>

            <BackofficeField label="Branch">
              <input
                type="text"
                value={form.bankBranch || ''}
                onChange={(e) => patch({ bankBranch: e.target.value })}
                placeholder="Branch name"
                className={boInputCls()}
              />
            </BackofficeField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <BackofficeField label="Account Number">
              <input
                type="text"
                value={form.accountNumber || ''}
                onChange={(e) => patch({ accountNumber: e.target.value })}
                placeholder="Number"
                className={boInputCls()}
              />
            </BackofficeField>

            <BackofficeField label="IFSC Code">
              <input
                type="text"
                value={form.ifscCode || ''}
                onChange={(e) => patch({ ifscCode: e.target.value.toUpperCase() })}
                placeholder="Code"
                className={boInputCls()}
              />
            </BackofficeField>
          </div>
        </BackofficeCard>
      </div>

      <BackofficeBottomBar
        mode="form"
        primaryLabel={isNew ? 'Create' : 'Update'}
        onPrimary={handleSubmit}
        onCancel={handleBackOrCancel}
      />

      {/* Add Experience Modal */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-bode-border p-5 space-y-3.5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-bold text-bode-forest">Add Experience</h4>
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                className="p-1 rounded-lg text-bode-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <BackofficeField label="Company / Spa Name" required>
              <input
                type="text"
                value={newExp.company}
                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                placeholder="e.g. Bode Wellness Studio"
                className={boInputCls()}
              />
            </BackofficeField>
            <BackofficeField label="Role" required>
              <input
                type="text"
                value={newExp.role}
                onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                placeholder="e.g. Senior Therapist"
                className={boInputCls()}
              />
            </BackofficeField>
            <div className="grid grid-cols-2 gap-2.5">
              <BackofficeField label="From">
                <input
                  type="date"
                  value={newExp.fromDate}
                  onChange={(e) => setNewExp({ ...newExp, fromDate: e.target.value })}
                  className={boInputCls()}
                />
              </BackofficeField>
              <BackofficeField label="To">
                <input
                  type="date"
                  disabled={newExp.isCurrent}
                  value={newExp.toDate || ''}
                  onChange={(e) => setNewExp({ ...newExp, toDate: e.target.value })}
                  className={boInputCls()}
                />
              </BackofficeField>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex-1 py-2.5 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-bode-border p-5 space-y-3.5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-bold text-bode-forest">Add Document</h4>
              <button
                type="button"
                onClick={() => setDocModalOpen(false)}
                className="p-1 rounded-lg text-bode-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <BackofficeField label="Document Name" required>
              <input
                type="text"
                value={newDoc.name}
                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                placeholder="e.g. Aadhaar Card / Spa Certificate"
                className={boInputCls()}
              />
            </BackofficeField>
            <BackofficeField label="Document Type">
              <select
                value={newDoc.type}
                onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                className={boInputCls()}
              >
                <option value="ID Proof">ID Proof</option>
                <option value="Spa Certification">Spa Certification</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Other">Other</option>
              </select>
            </BackofficeField>
            <input
              ref={docFileRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleDocFileSelect}
            />
            <button
              type="button"
              onClick={() => docFileRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-bode-border bg-bode-ivory/50 text-xs font-semibold text-bode-forest flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{newDoc.fileUrl ? 'File Attached (Replace)' : 'Attach File (Optional)'}</span>
            </button>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDocModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDocument}
                className="flex-1 py-2.5 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <BackofficeConfirmDialog
        open={confirmUnsaved}
        title="Discard Unsaved Changes?"
        message="You have unsaved edits on this staff member."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        danger
        onConfirm={() => {
          setConfirmUnsaved(false);
          onCancel();
        }}
        onCancel={() => setConfirmUnsaved(false)}
      />

      <BackofficeConfirmDialog
        open={confirmDelete}
        title="Delete Staff Member?"
        message={`Are you sure you want to delete "${form.displayName}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (initialStaff) onDelete(initialStaff.id);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

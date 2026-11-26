import React, { useState } from 'react';
import { Calendar, Check, Clock, X } from 'lucide-react';
import { BackofficeShiftDay, ShiftDayKey } from '../../types/backoffice';
import { SHIFT_DAY_KEYS } from '../../data/backofficeMockData';
import { BackofficeCard, BackofficeToggle, boInputCls } from './BackofficeSharedUI';

interface StylistShiftSectionProps {
  shifts: BackofficeShiftDay[];
  onChange: (nextShifts: BackofficeShiftDay[]) => void;
}

function formatTime12Short(time24: string): string {
  if (!time24) return '09:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (Number.isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const StylistShiftSection: React.FC<StylistShiftSectionProps> = ({
  shifts,
  onChange,
}) => {
  const [editingDay, setEditingDay] = useState<BackofficeShiftDay | null>(null);
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [showWeeklyOffSheet, setShowWeeklyOffSheet] = useState(false);

  // Assign Shifts sheet state
  const [assignDays, setAssignDays] = useState<ShiftDayKey[]>(
    SHIFT_DAY_KEYS.filter((d) => d !== 'Sun')
  );
  const [assignStart, setAssignStart] = useState('09:00');
  const [assignEnd, setAssignEnd] = useState('21:00');

  // Weekly Off sheet state
  const [offDays, setOffDays] = useState<ShiftDayKey[]>(() =>
    shifts.filter((s) => s.isOff).map((s) => s.day)
  );

  const openWeeklyOff = () => {
    setOffDays(shifts.filter((s) => s.isOff).map((s) => s.day));
    setShowWeeklyOffSheet(true);
  };

  const openAssignShifts = () => {
    setAssignDays(shifts.filter((s) => !s.isOff).map((s) => s.day));
    const firstActive = shifts.find((s) => !s.isOff);
    setAssignStart(firstActive?.startTime || '09:00');
    setAssignEnd(firstActive?.endTime || '21:00');
    setShowAssignSheet(true);
  };

  const handleSaveSingleDay = () => {
    if (!editingDay) return;
    onChange(shifts.map((s) => (s.day === editingDay.day ? editingDay : s)));
    setEditingDay(null);
  };

  const handleApplyBulkAssign = () => {
    onChange(
      shifts.map((s) =>
        assignDays.includes(s.day)
          ? { ...s, isOff: false, startTime: assignStart, endTime: assignEnd }
          : s
      )
    );
    setShowAssignSheet(false);
  };

  const handleApplyWeeklyOff = () => {
    onChange(
      shifts.map((s) => ({
        ...s,
        isOff: offDays.includes(s.day),
        startTime: s.startTime || '09:00',
        endTime: s.endTime || '21:00',
      }))
    );
    setShowWeeklyOffSheet(false);
  };

  return (
    <BackofficeCard className="space-y-4">
      <h3 className="font-serif text-sm sm:text-base font-bold text-bode-forest">
        Stylist Shifts For Current Week
      </h3>

      {/* Two outline buttons at the top */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={openAssignShifts}
          className="py-2.5 px-3 rounded-xl border border-bode-forest text-bode-forest hover:bg-bode-ivory text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Assign Shifts</span>
        </button>
        <button
          type="button"
          onClick={openWeeklyOff}
          className="py-2.5 px-3 rounded-xl border border-bode-forest text-bode-forest hover:bg-bode-ivory text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Weekly Off</span>
        </button>
      </div>

      {/* 3-column grid of day cards */}
      <div className="grid grid-cols-3 gap-2">
        {shifts.map((shift, idx) => {
          const isLastCentered = idx === 6;
          return (
            <button
              key={shift.day}
              type="button"
              onClick={() => setEditingDay({ ...shift })}
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition hover:border-bode-forest ${
                shift.isOff
                  ? 'border-red-200 bg-red-50/40'
                  : 'border-bode-border bg-white hover:bg-bode-ivory/40'
              } ${isLastCentered ? 'col-start-2' : ''}`}
            >
              <p className="text-xs sm:text-sm font-bold text-bode-charcoal">{shift.day}</p>
              {shift.isOff ? (
                <p className="text-[11px] font-semibold text-red-600 mt-1">Weekly Off</p>
              ) : (
                <p className="text-[10px] text-bode-muted mt-1 leading-tight">
                  {formatTime12Short(shift.startTime)} - {formatTime12Short(shift.endTime)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Single Day Bottom Sheet */}
      {editingDay && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-bode-border shadow-2xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-bold text-bode-forest">
                {editingDay.day} Shift Timing
              </h4>
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="p-1 rounded-lg text-bode-muted hover:text-bode-forest"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-bode-ivory/60 border border-bode-border">
              <span className="text-xs font-semibold text-bode-charcoal">Mark as Weekly Off</span>
              <BackofficeToggle
                checked={editingDay.isOff}
                onChange={(val) => setEditingDay({ ...editingDay, isOff: val })}
                ariaLabel="Mark as Weekly Off"
              />
            </div>

            {!editingDay.isOff && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-bode-charcoal mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingDay.startTime}
                    onChange={(e) => setEditingDay({ ...editingDay, startTime: e.target.value })}
                    className={boInputCls()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-bode-charcoal mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingDay.endTime}
                    onChange={(e) => setEditingDay({ ...editingDay, endTime: e.target.value })}
                    className={boInputCls()}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="flex-1 py-2.5 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSingleDay}
                className="flex-1 py-2.5 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Shifts (Multiple Days) Bottom Sheet */}
      {showAssignSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-bode-border shadow-2xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-bold text-bode-forest">Assign Shifts</h4>
              <button
                type="button"
                onClick={() => setShowAssignSheet(false)}
                className="p-1 rounded-lg text-bode-muted hover:text-bode-forest"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-bode-charcoal">Select Days</span>
                <button
                  type="button"
                  onClick={() =>
                    setAssignDays(
                      assignDays.length === SHIFT_DAY_KEYS.length ? [] : [...SHIFT_DAY_KEYS]
                    )
                  }
                  className="text-[11px] font-semibold text-bode-emerald hover:underline"
                >
                  {assignDays.length === SHIFT_DAY_KEYS.length ? 'Clear All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SHIFT_DAY_KEYS.map((day) => {
                  const selected = assignDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        setAssignDays((prev) =>
                          prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                        )
                      }
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold transition ${
                        selected
                          ? 'bg-bode-forest text-white border-bode-forest'
                          : 'bg-white text-bode-charcoal border-bode-border'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-bode-charcoal mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={assignStart}
                  onChange={(e) => setAssignStart(e.target.value)}
                  className={boInputCls()}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-bode-charcoal mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={assignEnd}
                  onChange={(e) => setAssignEnd(e.target.value)}
                  className={boInputCls()}
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAssignSheet(false)}
                className="flex-1 py-2.5 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assignDays.length === 0}
                onClick={handleApplyBulkAssign}
                className="flex-1 py-2.5 rounded-xl bg-bode-forest disabled:opacity-50 text-white text-xs font-semibold"
              >
                Apply to {assignDays.length} Day(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Off Bottom Sheet */}
      {showWeeklyOffSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-bode-border shadow-2xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-bold text-bode-forest">Select Weekly Off</h4>
              <button
                type="button"
                onClick={() => setShowWeeklyOffSheet(false)}
                className="p-1 rounded-lg text-bode-muted hover:text-bode-forest"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {SHIFT_DAY_KEYS.map((day) => {
                const isOff = offDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setOffDays((prev) =>
                        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                      )
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                      isOff
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-bode-border bg-white text-bode-charcoal hover:bg-bode-ivory/50'
                    }`}
                  >
                    <span>{day}</span>
                    <span
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isOff
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-white border-bode-border'
                      }`}
                    >
                      {isOff && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowWeeklyOffSheet(false)}
                className="flex-1 py-2.5 rounded-xl border border-bode-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyWeeklyOff}
                className="flex-1 py-2.5 rounded-xl bg-bode-forest text-white text-xs font-semibold"
              >
                Save Weekly Off
              </button>
            </div>
          </div>
        </div>
      )}
    </BackofficeCard>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit, VisitServiceEntry } from '../types';
import {
  Activity,
  Plus,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ActiveServicesPageProps {
  onNavigate: (tab: string, visitId?: string) => void;
  onOpenAddServiceModal: (visit: CustomerVisit) => void;
  onOpenDiscountModal: (visit: CustomerVisit, service: VisitServiceEntry) => void;
  onOpenInvoiceModal: (visit: CustomerVisit) => void;
}

export const ActiveServicesPage: React.FC<ActiveServicesPageProps> = ({
  onNavigate,
  onOpenAddServiceModal,
  onOpenDiscountModal,
  onOpenInvoiceModal,
}) => {
  const { branchVisits, completeIndividualService, completeCustomerVisit } = useApp();

  // Active in-progress or checked-in visits
  const activeVisits = branchVisits.filter(
    (v) => v.visitStatus === 'IN_PROGRESS' || v.visitStatus === 'CHECKED_IN'
  );

  const handleMarkComplete = (visitId: string, serviceEntryId: string) => {
    completeIndividualService(visitId, serviceEntryId, 'Marked complete by branch manager');
  };

  const handleCompleteFullVisit = (visitId: string) => {
    completeCustomerVisit(visitId);
    onNavigate('visit-detail', visitId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
              Active Services
            </h1>
          </div>
        </div>

        <button
          onClick={() => onNavigate('create-service')}
          className="px-4 py-2 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold shadow transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-bode-gold" />
          <span>New Walk-in Service</span>
        </button>
      </div>

      {activeVisits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-bode-border p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-bode-ivory text-bode-emerald flex items-center justify-center mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-bode-forest">
            No Active Sessions
          </h3>
          <p className="text-xs text-bode-muted max-w-sm mx-auto">
            No treatments currently in progress.
          </p>
          <button
            onClick={() => onNavigate('appointments')}
            className="px-4 py-2 bg-bode-emerald hover:bg-bode-forest text-white text-xs font-semibold rounded-lg transition"
          >
            View Appointments Schedule
          </button>
        </div>
      ) : (
        /* Active Sessions Grid (Section 8 Requirement) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeVisits.map((visit) => {
            const allServicesFinished = visit.services.every((s) => s.status === 'COMPLETED');
            const totalVisitTariff = visit.services.reduce((acc, s) => acc + s.finalPrice, 0);

            return (
              <div
                key={visit.id}
                className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-hidden flex flex-col justify-between hover:border-bode-emerald/40 transition"
              >
                {/* Session Card Header */}
                <div className="p-3.5 sm:p-5 bg-bode-forest text-white flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-bode-ivory truncate">
                        {visit.customerName}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-bold uppercase tracking-wide shrink-0">
                        {visit.visitStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-white/70 mt-1 flex-wrap">
                      <span className="font-mono text-bode-gold">{visit.visitReference}</span>
                      <span>•</span>
                      <span>{visit.customerMobile}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-bode-gold">
                      Total
                    </span>
                    <p className="font-serif text-base sm:text-lg font-bold text-white">
                      ₹{totalVisitTariff.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Multi-Treatment List (Independent statuses tracking - Section 8 Requirement) */}
                <div className="p-3.5 sm:p-5 space-y-3 flex-1 bg-bode-ivory/20">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-bode-muted">
                    <span>Treatments In Session ({visit.services.length})</span>
                    <span>Status & Actions</span>
                  </div>

                  <div className="space-y-2">
                    {visit.services.map((service, idx) => {
                      const isComplete = service.status === 'COMPLETED';
                      const isRunning = service.status === 'IN_PROGRESS';

                      return (
                        <div
                          key={service.id}
                          className={`p-3 rounded-xl border transition ${
                            isRunning
                              ? 'bg-white border-emerald-300 ring-1 ring-emerald-200'
                              : isComplete
                              ? 'bg-emerald-50/50 border-emerald-200 text-bode-charcoal'
                              : 'bg-white border-bode-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-bode-forest">
                                  {service.serviceName}
                                </span>
                                {service.isAdditionalService && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                                    Added Add-on
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-bode-muted mt-0.5">
                                {service.durationMinutes} min • Therapist:{' '}
                                <strong className="text-bode-forest">
                                  {service.staffName || 'Unassigned'}
                                </strong>
                                {service.startTime && ` • Started: ${service.startTime}`}
                              </p>
                              {service.discount && (
                                <p className="text-[10px] text-red-600 font-medium mt-0.5">
                                  Discount Applied: -₹{service.discount.discountAmount} ({service.discount.reason})
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase block w-fit ml-auto ${
                                  isComplete
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isRunning
                                    ? 'bg-emerald-600 text-white animate-pulse'
                                    : 'bg-bode-ivory text-bode-forest border border-bode-border'
                                }`}
                              >
                                {service.status}
                              </span>
                              <p className="font-serif font-bold text-xs text-bode-forest mt-1">
                                ₹{service.finalPrice.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          {/* Service-level action buttons */}
                          <div className="mt-2.5 pt-2 border-t border-bode-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <button
                              onClick={() => onOpenDiscountModal(visit, service)}
                              className="text-[11px] text-bode-emerald hover:underline font-medium"
                            >
                              {service.discount ? 'Edit Discount' : '+ Apply Discount'}
                            </button>

                            {isRunning && (
                              <button
                                onClick={() => handleMarkComplete(visit.id, service.id)}
                                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold transition flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Mark Treatment Complete</span>
                              </button>
                            )}

                            {isComplete && (
                              <span className="text-[10px] text-emerald-800 font-medium">
                                ✓ Finished at {service.completedTime || 'Recently'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Session Footer Quick Actions (Section 8 Requirement) */}
                <div className="p-4 bg-bode-ivory/80 border-t border-bode-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Add Another Service Button (Section 9 Requirement) */}
                    <button
                      onClick={() => onOpenAddServiceModal(visit)}
                      className="px-3 py-1.5 rounded-lg bg-bode-emerald hover:bg-bode-forest text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-bode-gold" />
                      <span>Add Another Service</span>
                    </button>

                    <button
                      onClick={() => onNavigate('visit-detail', visit.id)}
                      className="px-3 py-1.5 rounded-lg border border-bode-border hover:bg-white text-bode-charcoal text-xs font-medium transition"
                    >
                      View Details
                    </button>
                  </div>

                  <div>
                    {allServicesFinished ? (
                      <button
                        onClick={() => handleCompleteFullVisit(visit.id)}
                        className="px-4 py-1.5 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-bold transition shadow flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-bode-gold" />
                        <span>COMPLETE VISIT & BILL</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenInvoiceModal(visit)}
                        className="px-3 py-1.5 rounded-lg bg-bode-ivoryDark hover:bg-bode-border text-bode-forest text-xs font-semibold transition flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Preview Bill</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

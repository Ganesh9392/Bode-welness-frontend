import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit, VisitServiceEntry } from '../types';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Plus,
  Tag,
  CheckCircle2,
  FileText,
  Share2,
  CreditCard,
  ShieldCheck,
  Building,
  AlertCircle,
  Receipt,
  Play,
  RotateCcw,
} from 'lucide-react';

interface VisitDetailPageProps {
  visitId: string;
  onBack: () => void;
  onOpenAddServiceModal: (visit: CustomerVisit) => void;
  onOpenDiscountModal: (visit: CustomerVisit, service: VisitServiceEntry) => void;
  onOpenInvoiceModal: (visit: CustomerVisit) => void;
  onOpenWhatsAppModal: (visit: CustomerVisit) => void;
  onOpenPaymentModal: (visit: CustomerVisit) => void;
}

export const VisitDetailPage: React.FC<VisitDetailPageProps> = ({
  visitId,
  onBack,
  onOpenAddServiceModal,
  onOpenDiscountModal,
  onOpenInvoiceModal,
  onOpenWhatsAppModal,
  onOpenPaymentModal,
}) => {
  const {
    branchVisits,
    branchStaff,
    currentBranch,
    assignStaffToService,
    completeIndividualService,
    completeCustomerVisit,
    startServiceSession,
    generateInvoice,
  } = useApp();

  const visit = branchVisits.find((v) => v.id === visitId);

  const [confirmCompleteVisitModal, setConfirmCompleteVisitModal] = useState<boolean>(false);

  if (!visit) {
    return (
      <div className="bg-white rounded-2xl border border-bode-border p-12 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-8 h-8 text-bode-muted mx-auto" />
        <h3 className="font-serif font-bold text-lg text-bode-forest">
          Session Record Not Found
        </h3>
        <p className="text-xs text-bode-muted">
          This session either does not exist or belongs to another branch facility.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-bode-forest text-white text-xs font-semibold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const subtotal = visit.services.reduce((acc, s) => acc + s.originalPrice, 0);
  const totalDiscount = visit.services.reduce((acc, s) => acc + (s.discount?.discountAmount || 0), 0);
  const netAfterDiscount = Math.max(0, subtotal - totalDiscount);
  const gstTax = Math.round((netAfterDiscount * 18) / 100);
  const grossFinal = netAfterDiscount + gstTax;

  const onlineCredit = visit.source === 'WEBSITE' ? (visit.onlineAdvancePaid || 99) : 0;
  const recordedPayments = visit.payments.reduce((acc, p) => acc + p.amount, 0);
  const totalSettled = onlineCredit + recordedPayments;
  const outstandingBalance = Math.max(0, grossFinal - totalSettled);

  const allServicesCompleted = visit.services.every((s) => s.status === 'COMPLETED');
  const isVisitCompleted = visit.visitStatus === 'COMPLETED';

  const handleFinalizeVisit = () => {
    completeCustomerVisit(visit.id);
    generateInvoice(visit.id);
    setConfirmCompleteVisitModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-bode-border/70">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-bode-border hover:bg-bode-ivory text-bode-forest transition"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest truncate">
                {visit.customerName}
              </h1>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  visit.visitStatus === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : visit.visitStatus === 'IN_PROGRESS'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {visit.visitStatus}
              </span>
            </div>
            <p className="text-xs text-bode-muted font-mono mt-0.5">
              Ref: <strong className="text-bode-forest">{visit.visitReference}</strong>
              {visit.bookingReference && ` • Web Ref: ${visit.bookingReference}`}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Another Service (Section 9 Requirement) */}
          <button
            onClick={() => onOpenAddServiceModal(visit)}
            className="px-3.5 py-2 rounded-xl bg-bode-emerald hover:bg-bode-forest text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-bode-gold" />
            <span>Add Another Service</span>
          </button>

          {/* Complete Visit Button (Section 10 Requirement) */}
          {!isVisitCompleted && (
            <button
              onClick={() => setConfirmCompleteVisitModal(true)}
              className="px-4 py-2 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-bold uppercase tracking-wider shadow transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-bode-gold" />
              <span>Complete Customer Visit</span>
            </button>
          )}

          {/* Invoice Modal Trigger */}
          <button
            onClick={() => onOpenInvoiceModal(visit)}
            className="px-3.5 py-2 rounded-xl bg-bode-ivory border border-bode-border hover:bg-bode-ivoryDark text-bode-forest text-xs font-semibold transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Consolidated Invoice</span>
          </button>

          {/* Record Payment Trigger */}
          {outstandingBalance > 0 && (
            <button
              onClick={() => onOpenPaymentModal(visit)}
              className="px-3.5 py-2 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold transition flex items-center gap-1.5 shadow"
            >
              <CreditCard className="w-3.5 h-3.5 text-bode-gold" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Customer Information & Visit Metadata (Section 12 Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-2xl border border-bode-border p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-bode-border/70 text-xs font-bold uppercase tracking-wider text-bode-emerald">
            <User className="w-4 h-4" />
            <span>Customer Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">Guest Name</span>
              <p className="font-serif font-bold text-sm text-bode-forest mt-0.5">{visit.customerName}</p>
            </div>
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">Calling Phone</span>
              <p className="font-mono text-bode-charcoal mt-0.5">{visit.customerMobile}</p>
            </div>
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">WhatsApp Number</span>
              <p className="font-mono text-emerald-800 font-semibold mt-0.5">{visit.customerWhatsApp}</p>
            </div>
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">Email Contact</span>
              <p className="text-bode-charcoal mt-0.5 truncate">{visit.customerEmail || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Visit Information */}
        <div className="bg-white rounded-2xl border border-bode-border p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-bode-border/70 text-xs font-bold uppercase tracking-wider text-bode-emerald">
            <Building className="w-4 h-4" />
            <span>Visit Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">Assigned Branch</span>
              <p className="font-semibold text-bode-forest mt-0.5 truncate">{currentBranch?.shortName}</p>
            </div>
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">Booking Source</span>
              <p className="font-semibold text-bode-charcoal mt-0.5">
                {visit.source === 'WEBSITE' ? 'Online Website (₹99 Adv)' : 'Front Desk Walk-in'}
              </p>
            </div>
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">Appointment Slot</span>
              <p className="text-bode-charcoal mt-0.5">{visit.appointmentDate} at {visit.appointmentTime}</p>
            </div>
            <div>
              <span className="text-bode-muted block text-[10px] uppercase">Creation Timestamp</span>
              <p className="text-bode-muted mt-0.5">{visit.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Breakdown with Service-Wise Discounts (Section 11 & 12 Requirement) */}
      <div className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-hidden space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-bode-border">
          <div>
            <h3 className="font-serif font-bold text-base text-bode-forest">
              Treatments ({visit.services.length})
            </h3>
          </div>
          <button
            onClick={() => onOpenAddServiceModal(visit)}
            className="px-3 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest text-xs font-semibold transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-bode-emerald" />
            <span>Add Treatment</span>
          </button>
        </div>

        {/* Mobile Treatment Cards (< md) */}
        <div className="md:hidden space-y-2.5">
          {visit.services.map((service) => (
            <div
              key={service.id}
              className="p-3.5 rounded-xl border border-bode-border bg-bode-ivory/30 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-bode-forest">{service.serviceName}</p>
                  <p className="text-[11px] text-bode-muted">
                    {service.durationMinutes} min
                  </p>
                  <div className="mt-1">
                    <select
                      value={service.staffId || ''}
                      onChange={(e) => {
                        if (e.target.value) assignStaffToService(visit.id, service.id, e.target.value);
                      }}
                      className="text-[11px] px-2 py-1 rounded border border-bode-border bg-white text-bode-forest font-medium"
                    >
                      <option value="">Assign Therapist…</option>
                      {branchStaff
                        .filter((s) => s.isActive)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  {service.discount && (
                    <p className="text-[11px] text-red-600 font-medium mt-0.5">
                      Discount: -₹{service.discount.discountAmount.toLocaleString('en-IN')} ({service.discount.reason})
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-serif text-sm font-bold text-bode-forest">
                    ₹{service.finalPrice.toLocaleString('en-IN')}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      service.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : service.status === 'IN_PROGRESS'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-bode-charcoal border border-bode-border'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-bode-border/50 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDiscountModal(visit, service)}
                  className="text-xs text-bode-emerald font-medium flex items-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5 text-bode-gold" />
                  <span>{service.discount ? 'Edit Discount' : 'Discount'}</span>
                </button>
                <div className="flex items-center gap-2">
                  {service.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => completeIndividualService(visit.id, service.id)}
                      className="px-2.5 py-1 rounded bg-emerald-700 text-white text-[11px] font-semibold"
                    >
                      Complete
                    </button>
                  )}
                  {service.status === 'ADDED' && (
                    <button
                      onClick={() => startServiceSession(visit.id, service.id)}
                      className="px-2.5 py-1 rounded bg-bode-forest text-white text-[11px] font-semibold"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-bode-ivory/60 border-b border-bode-border text-bode-forest font-bold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Therapist</th>
                <th className="py-2.5 px-3 text-center">Duration</th>
                <th className="py-2.5 px-3 text-right">Tariff</th>
                <th className="py-2.5 px-3 text-right">Service Discount</th>
                <th className="py-2.5 px-3 text-right">Net Price</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bode-border/50">
              {visit.services.map((service, idx) => (
                <tr key={service.id} className="hover:bg-bode-ivory/30">
                  <td className="py-3 px-3 font-medium text-bode-muted">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-bode-forest text-sm">{service.serviceName}</p>
                    <p className="text-[10px] text-bode-muted">
                      {service.category} {service.isAdditionalService && '• (Add-on Treatment)'}
                    </p>
                    {service.notes && (
                      <p className="text-[10px] text-bode-charcoal mt-0.5 italic">{service.notes}</p>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={service.staffId || ''}
                      onChange={(e) => {
                        if (e.target.value) assignStaffToService(visit.id, service.id, e.target.value);
                      }}
                      className="text-xs px-2 py-1 rounded border border-bode-border bg-white text-bode-forest font-medium"
                    >
                      <option value="">Unassigned</option>
                      {branchStaff
                        .filter((s) => s.isActive)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">{service.durationMinutes} min</td>
                  <td className="py-3 px-3 text-right text-bode-charcoal font-medium">
                    ₹{service.originalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {service.discount ? (
                      <div>
                        <span className="text-red-600 font-bold">
                          -₹{service.discount.discountAmount.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[9px] text-bode-muted">
                          {service.discount.type === 'PERCENTAGE' ? `${service.discount.value}%` : 'Fixed'} • {service.discount.reason}
                        </p>
                      </div>
                    ) : (
                      <span className="text-bode-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-serif text-sm font-bold text-bode-forest">
                    ₹{service.finalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        service.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : service.status === 'IN_PROGRESS'
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-bode-ivory text-bode-charcoal border border-bode-border'
                      }`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenDiscountModal(visit, service)}
                        className="p-1 rounded hover:bg-bode-ivory text-bode-forest transition"
                        title="Service-wise Discount"
                      >
                        <Tag className="w-3.5 h-3.5 text-bode-gold" />
                      </button>

                      {service.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => completeIndividualService(visit.id, service.id)}
                          className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-semibold transition"
                          title="Complete this treatment"
                        >
                          Complete
                        </button>
                      )}

                      {service.status === 'ADDED' && (
                        <button
                          onClick={() => startServiceSession(visit.id, service.id)}
                          className="px-2 py-0.5 rounded bg-bode-forest text-white text-[10px] font-semibold transition"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Settlement & Payments Breakdown (Section 12 & 15 Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Payment History Card (7 Cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-bode-border">
            <h3 className="font-serif font-bold text-base text-bode-forest">
              Payment Transactions & Receipts ({visit.payments.length})
            </h3>
            {outstandingBalance > 0 && (
              <button
                onClick={() => onOpenPaymentModal(visit)}
                className="px-3 py-1 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-bode-gold" />
                <span>Add Payment</span>
              </button>
            )}
          </div>

          {/* Advance Credit Notice for Website Bookings */}
          {visit.source === 'WEBSITE' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-800">Online Booking Advance Deposited</span>
                <p className="text-[11px] text-emerald-700">Prepaid via Razorpay web portal during reservation</p>
              </div>
              <span className="font-bold text-emerald-800 text-sm">₹{onlineCredit} Credited</span>
            </div>
          )}

          {visit.payments.length === 0 && visit.source !== 'WEBSITE' ? (
            <div className="py-6 text-center text-xs text-bode-muted">
              No payments recorded yet for this session.
            </div>
          ) : (
            <div className="space-y-2">
              {visit.payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-bode-ivory/50 border border-bode-border/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-bode-forest">{p.method}</span>
                      <span className="font-mono text-[11px] text-bode-muted">({p.receiptNumber})</span>
                    </div>
                    <p className="text-[10px] text-bode-muted mt-0.5">
                      {p.timestamp} • Collected by: {p.recordedByManager}
                      {p.transactionReference && ` • Ref: ${p.transactionReference}`}
                    </p>
                  </div>
                  <span className="font-serif text-sm font-bold text-bode-forest">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consolidated Financial Totals (5 Cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-bode-border p-5 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-bode-forest pb-2 border-b border-bode-border">
            Settlement Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-bode-muted">
              <span>Gross Treatments Subtotal:</span>
              <span className="font-medium text-bode-charcoal">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Total Service Concessions:</span>
                <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-bode-charcoal">
              <span>Net Taxable Base:</span>
              <span>₹{netAfterDiscount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-bode-muted">
              <span>GST (18% standard):</span>
              <span>+₹{gstTax.toLocaleString('en-IN')}</span>
            </div>

            <div className="border-t border-bode-border pt-1.5 flex justify-between font-serif text-base font-bold text-bode-forest">
              <span>Final Invoice Total:</span>
              <span>₹{grossFinal.toLocaleString('en-IN')}</span>
            </div>

            {onlineCredit > 0 && (
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Prepaid Web Advance:</span>
                <span>-₹{onlineCredit}</span>
              </div>
            )}

            {recordedPayments > 0 && (
              <div className="flex justify-between text-bode-emerald font-medium">
                <span>Collected Spa Payments:</span>
                <span>-₹{recordedPayments.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Outstanding Badge */}
            <div
              className={`p-3.5 rounded-xl border flex justify-between items-center ${
                outstandingBalance <= 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-bode-forest text-white'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {outstandingBalance <= 0 ? 'Full Settlement' : 'Balance Remaining'}
                </span>
                <p className="text-xs font-semibold">
                  {outstandingBalance <= 0 ? 'All dues cleared' : 'Payable by guest'}
                </p>
              </div>
              <p className="font-serif text-xl font-bold">
                ₹{outstandingBalance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Complete Visit (Section 10 Requirement) */}
      {confirmCompleteVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-bode-border space-y-4">
            <h3 className="font-serif font-bold text-lg text-bode-forest">
              Complete Customer Visit Session?
            </h3>
            <p className="text-xs text-bode-charcoal leading-relaxed">
              Finish all treatments and generate the final invoice for <strong>{visit.customerName}</strong>?
            </p>
            <div className="p-3 bg-bode-ivory rounded-xl text-xs space-y-1">
              <p>• Total Services: <strong>{visit.services.length}</strong></p>
              <p>• Final Payable Amount: <strong>₹{grossFinal.toLocaleString('en-IN')}</strong></p>
              <p>• Remaining Outstanding: <strong>₹{outstandingBalance.toLocaleString('en-IN')}</strong></p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmCompleteVisitModal(false)}
                className="px-4 py-2 text-xs font-medium text-bode-charcoal hover:bg-bode-border/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalizeVisit}
                className="px-5 py-2.5 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-bold rounded-lg shadow"
              >
                Confirm & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

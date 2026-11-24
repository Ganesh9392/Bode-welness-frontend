import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit } from '../types';
import { BodeLogo } from './BodeLogo';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
  Phone,
  Mail,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface InvoiceModalProps {
  visit: CustomerVisit;
  onClose: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenPaymentModal: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visit,
  onClose,
  onOpenWhatsAppModal,
  onOpenPaymentModal,
}) => {
  const { currentBranch, generateInvoice } = useApp();
  const invoiceRef = useRef<HTMLDivElement>(null);

  // If invoice not generated yet, generate one on the fly
  const invoice = visit.invoice || generateInvoice(visit.id);

  const handlePrint = () => {
    window.print();
  };

  const isWebsiteBooking = visit.source === 'WEBSITE';
  const onlineCredit = invoice.onlineAdvanceCredit || 0;
  const isFullyPaid = invoice.outstandingBalance <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-auto max-h-[94vh] flex flex-col overflow-hidden border border-bode-border print:border-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-bode-forest px-4 py-3 sm:px-6 sm:py-4 text-white flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="w-5 h-5 text-bode-gold shrink-0" />
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-sm sm:text-base truncate">Spa Invoice</h3>
              <p className="text-[11px] sm:text-xs text-bode-gold truncate">
                {invoice.invoiceNumber} • {visit.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium flex items-center gap-1.5 transition"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onOpenWhatsAppModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold flex items-center gap-1.5 transition shadow"
              title="Send WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div ref={invoiceRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-bode-charcoal print:p-8">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-bode-border">
            <div>
              <BodeLogo variant="dark" size="lg" />
              <div className="mt-3 text-xs text-bode-muted space-y-0.5">
                <p className="font-semibold text-bode-forest">{currentBranch?.name}</p>
                <p>{currentBranch?.address}</p>
                <p>Phone: {currentBranch?.phone} | Email: {currentBranch?.email}</p>
                <p className="font-mono text-[11px] text-bode-forest">
                  GSTIN: {currentBranch?.gstin}
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block px-3 py-1 rounded bg-bode-ivory border border-bode-border text-[11px] font-bold uppercase tracking-widest text-bode-forest mb-2">
                Tax Invoice
              </span>
              <p className="font-serif text-xl font-bold text-bode-forest tracking-tight">
                {invoice.invoiceNumber}
              </p>
              <p className="text-xs text-bode-muted mt-1">Date: {invoice.generatedAt}</p>
              <p className="text-xs text-bode-muted">Visit Ref: {visit.visitReference}</p>
              {visit.bookingReference && (
                <p className="text-xs text-bode-emerald font-medium">
                  Web Booking Ref: {visit.bookingReference}
                </p>
              )}
            </div>
          </div>

          {/* Billed To & Visit Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-bode-ivory/60 border border-bode-border/70 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                Billed To (Guest Details)
              </span>
              <p className="font-serif text-sm font-bold text-bode-forest mt-1">
                {visit.customerName}
              </p>
              <p className="text-bode-charcoal mt-0.5">Phone: {visit.customerMobile}</p>
              <p className="text-bode-charcoal">WhatsApp: {visit.customerWhatsApp}</p>
              {visit.customerEmail && <p className="text-bode-muted">{visit.customerEmail}</p>}
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bode-emerald">
                Service Session Details
              </span>
              <p className="font-medium text-bode-charcoal mt-1">
                Appointment Date: {visit.appointmentDate}
              </p>
              <p className="text-bode-muted">Source: {visit.source === 'WEBSITE' ? 'Online Website Booking' : 'Front Desk Walk-in / Direct'}</p>
              <p className="text-bode-muted">Status: {visit.visitStatus}</p>
            </div>
          </div>

          {/* Service Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-bode-forest text-bode-forest uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Service Description</th>
                  <th className="py-2.5 px-2 text-center">Duration</th>
                  <th className="py-2.5 px-2 text-right">Tariff</th>
                  <th className="py-2.5 px-2 text-right">Discount</th>
                  <th className="py-2.5 px-2 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bode-border/60">
                {visit.services.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-bode-ivory/30">
                    <td className="py-3 px-2 font-medium text-bode-muted">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-semibold text-bode-forest">{s.serviceName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-bode-muted mt-0.5">
                        <span>{s.category}</span>
                        {s.staffName && <span>• Therapist: {s.staffName}</span>}
                        {s.isAdditionalService && (
                          <span className="text-bode-emerald font-medium">• Add-on</span>
                        )}
                      </div>
                      {s.discount?.reason && (
                        <p className="text-[10px] text-red-600 mt-0.5">
                          Discount Note: {s.discount.reason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-bode-charcoal">
                      {s.durationMinutes} min
                    </td>
                    <td className="py-3 px-2 text-right text-bode-charcoal font-medium">
                      ₹{s.originalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      {s.discount ? (
                        <span className="text-red-600 font-semibold">
                          -₹{s.discount.discountAmount.toLocaleString('en-IN')}
                          <span className="text-[10px] ml-1">
                            ({s.discount.type === 'PERCENTAGE' ? `${s.discount.value}%` : 'Fixed'})
                          </span>
                        </span>
                      ) : (
                        <span className="text-bode-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-bode-forest">
                      ₹{s.finalPrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Calculation & Financial Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-bode-border">
            {/* Payment & Terms Notes */}
            <div className="text-xs text-bode-muted max-w-sm space-y-2">
              <p className="font-semibold text-bode-forest uppercase tracking-wider text-[11px]">
                Terms & Spa Etiquette
              </p>
              <p className="leading-relaxed">
                Thank you for indulging in the BODE experience. All treatments are rendered by certified spa specialists. Gratuities are voluntary.
              </p>
              {/* Recorded Payment Summary */}
              {visit.payments.length > 0 && (
                <div className="p-2.5 rounded-lg bg-bode-ivory/60 border border-bode-border/60 text-[11px]">
                  <p className="font-semibold text-bode-forest mb-1">Receipt History:</p>
                  {visit.payments.map((p) => (
                    <div key={p.id} className="flex justify-between py-0.5">
                      <span>
                        {p.method} ({p.receiptNumber})
                      </span>
                      <span className="font-semibold">₹{p.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-bode-charcoal">
                <span>Original Subtotal:</span>
                <span className="font-medium">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {invoice.totalDiscount > 0 && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Service Discounts Total:</span>
                  <span>-₹{invoice.totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-bode-charcoal">
                <span>Net Taxable Base:</span>
                <span>₹{(invoice.subtotal - invoice.totalDiscount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-bode-charcoal">
                <span>GST (18% - 9% CGST + 9% SGST):</span>
                <span>+₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-bode-border pt-2 flex justify-between font-serif text-sm font-bold text-bode-forest">
                <span>Final Invoice Amount:</span>
                <span>₹{invoice.finalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Online Advance Credit (Section 13 requirement) */}
              {isWebsiteBooking && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex justify-between font-medium">
                  <span>Online Appointment Fee Paid:</span>
                  <span className="font-bold">-₹{onlineCredit}</span>
                </div>
              )}

              {/* Recorded In-Spa Payments */}
              {visit.payments.length > 0 && (
                <div className="flex justify-between text-bode-emerald font-medium">
                  <span>Spa Payments Recorded:</span>
                  <span>
                    -₹{visit.payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Outstanding Balance */}
              <div className={`p-3 rounded-xl border flex justify-between items-center ${
                isFullyPaid ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-bode-forest text-white'
              }`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    {isFullyPaid ? 'Settlement Status' : 'Outstanding Balance'}
                  </p>
                  <p className="text-xs font-medium">
                    {isFullyPaid ? 'Fully Paid & Cleared' : 'Amount Due Now'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg font-bold">
                    ₹{invoice.outstandingBalance.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Sharing Audit Footer */}
          <div className="pt-4 border-t border-bode-border text-[11px] text-bode-muted flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              <span>WhatsApp Sharing Status: </span>
              {invoice.whatsAppStatus === 'DELIVERED_CONFIRMED' ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Confirmed
                </span>
              ) : invoice.whatsAppStatus === 'LINK_OPENED' ? (
                <span className="text-amber-700 font-medium">Link Opened by Manager</span>
              ) : (
                <span className="text-bode-muted">Not shared yet</span>
              )}
            </div>
            <div>
              <span>Authorized Manager: </span>
              <strong className="text-bode-forest">{visit.services[0]?.staffName ? 'BODE Manager Terminal' : 'Front Desk Desk'}</strong>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden when printing) */}
        <div className="bg-bode-ivory px-6 py-4 border-t border-bode-border flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWhatsAppModal}
              className="px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Send Invoice via WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {!isFullyPaid && (
              <button
                onClick={onOpenPaymentModal}
                className="px-4 py-2.5 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold flex items-center gap-2 transition shadow"
              >
                <CreditCard className="w-4 h-4 text-bode-gold" />
                <span>Collect Payment</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-bode-charcoal hover:bg-bode-border/50 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

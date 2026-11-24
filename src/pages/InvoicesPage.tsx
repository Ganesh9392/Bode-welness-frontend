import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit } from '../types';
import {
  FileText,
  Search,
  Filter,
  Share2,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface InvoicesPageProps {
  onNavigate: (tab: string, visitId?: string) => void;
  onOpenInvoiceModal: (visit: CustomerVisit) => void;
  onOpenWhatsAppModal: (visit: CustomerVisit) => void;
  onOpenPaymentModal: (visit: CustomerVisit) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({
  onNavigate,
  onOpenInvoiceModal,
  onOpenWhatsAppModal,
  onOpenPaymentModal,
}) => {
  const { branchVisits, currentBranch, generateInvoice } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Visits with an invoice or eligible for one (completed or in progress)
  const visitsWithInvoices = branchVisits.filter(
    (v) => v.invoice || v.visitStatus === 'COMPLETED' || v.visitStatus === 'IN_PROGRESS'
  );

  const filteredVisits = visitsWithInvoices.filter((v) => {
    const inv = v.invoice;
    const invNum = inv?.invoiceNumber || '';
    const matchesSearch =
      v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.customerMobile.includes(searchTerm) ||
      invNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitReference.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'PAID') {
      matchesStatus = (inv && inv.outstandingBalance <= 0) || v.paymentStatus === 'FULLY_PAID';
    } else if (statusFilter === 'OUTSTANDING') {
      matchesStatus = (inv ? inv.outstandingBalance > 0 : true) && v.paymentStatus !== 'FULLY_PAID';
    } else if (statusFilter === 'WHATSAPP_SENT') {
      matchesStatus = inv?.whatsAppStatus === 'DELIVERED_CONFIRMED' || inv?.whatsAppStatus === 'LINK_OPENED';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
            Invoices
          </h1>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-bode-border p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-bode-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice #, guest name, phone, or visit ref..."
            className="w-full pl-9 pr-3 py-2 bg-bode-ivory/40 border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-bode-ivory/40 border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
        >
          <option value="ALL">All Invoices & Sessions</option>
          <option value="OUTSTANDING">Outstanding Balance Due</option>
          <option value="PAID">Fully Settled & Paid</option>
          <option value="WHATSAPP_SENT">WhatsApp Sent / Confirmed</option>
        </select>
      </div>

      {/* Invoices Table (Section 18 Requirement) */}
      <div className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-bode-ivory/80 border-b border-bode-border text-bode-forest font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Visit Ref</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">WhatsApp Status</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bode-border/50">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-bode-muted">
                    No invoices matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit) => {
                  const inv = visit.invoice;
                  const invoiceNumber = inv?.invoiceNumber || 'Draft Pending';
                  const total = inv
                    ? inv.finalAmount
                    : Math.round(visit.services.reduce((a, b) => a + b.finalPrice, 0) * 1.18);
                  const outstanding = inv
                    ? inv.outstandingBalance
                    : total - (visit.source === 'WEBSITE' ? 99 : 0);

                  const waStatus = inv?.whatsAppStatus || 'NOT_SENT';

                  return (
                    <tr key={visit.id} className="hover:bg-bode-ivory/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-bode-forest">
                        {invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-bode-charcoal text-sm">{visit.customerName}</p>
                        <p className="font-mono text-[11px] text-bode-muted">{visit.customerMobile}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-bode-muted text-xs">
                        {visit.visitReference}
                      </td>
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-sm text-bode-forest">
                        ₹{total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {outstanding <= 0 ? (
                          <span className="text-emerald-700 font-bold">Cleared (₹0)</span>
                        ) : (
                          <span className="text-red-700 font-bold">
                            ₹{outstanding.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {waStatus === 'DELIVERED_CONFIRMED' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                            Delivered
                          </span>
                        ) : waStatus === 'LINK_OPENED' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                            Link Opened
                          </span>
                        ) : (
                          <span className="text-bode-muted text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            visit.paymentStatus === 'FULLY_PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : visit.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {visit.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenInvoiceModal(visit)}
                            className="p-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest transition"
                            title="Preview / Print Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (!visit.invoice) generateInvoice(visit.id);
                              onOpenWhatsAppModal(visit);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                            title="Send on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {outstanding > 0 && (
                            <button
                              onClick={() => onOpenPaymentModal(visit)}
                              className="px-2.5 py-1 rounded bg-bode-forest hover:bg-bode-forestLight text-white text-[11px] font-semibold transition"
                            >
                              Collect
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Invoices Card List (< sm) */}
        <div className="sm:hidden divide-y divide-bode-border/50">
          {filteredVisits.length === 0 ? (
            <div className="p-8 text-center text-xs text-bode-muted">
              No matching invoices found.
            </div>
          ) : (
            filteredVisits.map((visit) => {
              const inv = visit.invoice;
              const invoiceNumber = inv?.invoiceNumber || 'Draft Pending';
              const total = inv
                ? inv.finalAmount
                : Math.round(visit.services.reduce((a, b) => a + b.finalPrice, 0) * 1.18);
              const outstanding = inv
                ? inv.outstandingBalance
                : total - (visit.source === 'WEBSITE' ? 99 : 0);

              const waStatus = inv?.whatsAppStatus || 'NOT_SENT';

              return (
                <div key={visit.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-bode-forest">{invoiceNumber}</span>
                      <h4 className="font-serif font-bold text-sm text-bode-charcoal mt-0.5">{visit.customerName}</h4>
                      <p className="font-mono text-[11px] text-bode-muted">{visit.customerMobile}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-serif font-bold text-base text-bode-forest">₹{total.toLocaleString('en-IN')}</p>
                      {outstanding <= 0 ? (
                        <span className="text-emerald-700 font-bold text-[11px]">Cleared (₹0)</span>
                      ) : (
                        <span className="text-red-700 font-bold text-[11px]">Due: ₹{outstanding.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-bode-ivory/50 p-2 rounded-lg border border-bode-border/50">
                    <div>
                      <span className="text-bode-muted">WhatsApp: </span>
                      {waStatus === 'DELIVERED_CONFIRMED' ? (
                        <span className="text-emerald-700 font-bold">Delivered</span>
                      ) : waStatus === 'LINK_OPENED' ? (
                        <span className="text-amber-700 font-bold">Link Opened</span>
                      ) : (
                        <span className="text-bode-muted">Pending</span>
                      )}
                    </div>
                    <div>
                      <span className="text-bode-muted">Payment: </span>
                      <span className="font-bold text-bode-forest uppercase">{visit.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onOpenInvoiceModal(visit)}
                      className="px-3 py-1.5 rounded-lg bg-bode-ivory hover:bg-bode-ivoryDark text-bode-forest text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!visit.invoice) generateInvoice(visit.id);
                        onOpenWhatsAppModal(visit);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    {outstanding > 0 && (
                      <button
                        onClick={() => onOpenPaymentModal(visit)}
                        className="px-3 py-1.5 rounded-lg bg-bode-forest text-white text-xs font-semibold"
                      >
                        Collect
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

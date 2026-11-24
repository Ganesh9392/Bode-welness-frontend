import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit, PaymentTransaction } from '../types';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Banknote,
  QrCode,
  Share2,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface PaymentsPageProps {
  onNavigate: (tab: string, visitId?: string) => void;
  onOpenPaymentModal: (visit: CustomerVisit) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onNavigate,
  onOpenPaymentModal,
}) => {
  const { branchVisits, currentBranch } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Flatten all transactions for this branch
  const allTransactions: {
    transaction: PaymentTransaction;
    visit: CustomerVisit;
  }[] = [];

  branchVisits.forEach((v) => {
    v.payments.forEach((p) => {
      allTransactions.push({
        transaction: p,
        visit: v,
      });
    });
  });

  // Sort newest first
  allTransactions.sort((a, b) => b.transaction.timestamp.localeCompare(a.transaction.timestamp));

  const filteredTx = allTransactions.filter(({ transaction: p, visit: v }) => {
    const matchesSearch =
      v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      v.customerMobile.includes(searchTerm);

    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Method breakdown totals
  const totalUPI = allTransactions
    .filter((t) => t.transaction.method === 'UPI')
    .reduce((a, b) => a + b.transaction.amount, 0);

  const totalCard = allTransactions
    .filter((t) => t.transaction.method === 'CARD')
    .reduce((a, b) => a + b.transaction.amount, 0);

  const totalCash = allTransactions
    .filter((t) => t.transaction.method === 'CASH')
    .reduce((a, b) => a + b.transaction.amount, 0);

  const totalCollected = totalUPI + totalCard + totalCash;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">
          Payments
        </h1>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bode-muted">Total Collections</span>
          <p className="font-serif text-2xl font-bold text-bode-forest mt-1">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">{allTransactions.length} receipts issued</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" /> UPI Receipts
          </span>
          <p className="font-serif text-2xl font-bold text-emerald-800 mt-1">
            ₹{totalUPI.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">QR & Online channels</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" /> Card POS
          </span>
          <p className="font-serif text-2xl font-bold text-blue-800 mt-1">
            ₹{totalCard.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">Debit & Credit terminals</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-bode-border shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5" /> Cash Desk
          </span>
          <p className="font-serif text-2xl font-bold text-amber-800 mt-1">
            ₹{totalCash.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-bode-muted mt-0.5">Physical currency collected</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-bode-border p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-bode-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by receipt #, customer, UTR ref..."
            className="w-full pl-9 pr-3 py-2 bg-bode-ivory/40 border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-bode-ivory/40 border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="UPI">UPI / QR Code</option>
          <option value="CARD">Card POS</option>
          <option value="CASH">Cash Desk</option>
        </select>
      </div>

      {/* Transactions Table (Section 18 Requirement) */}
      <div className="bg-white rounded-2xl border border-bode-border shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-bode-ivory/80 border-b border-bode-border text-bode-forest font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bode-border/50">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-bode-muted">
                    No payment transactions recorded matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTx.map(({ transaction: p, visit: v }) => (
                  <tr key={p.id} className="hover:bg-bode-ivory/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-bode-forest">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-bode-charcoal">{v.customerName}</p>
                      <p className="text-[11px] text-bode-muted font-mono">{v.customerMobile}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-bode-ivory border border-bode-border font-bold text-[10px] uppercase text-bode-forest">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-bode-muted">
                      {p.transactionReference || 'Front Desk Verified'}
                    </td>
                    <td className="py-3.5 px-4 text-bode-charcoal">{p.timestamp}</td>
                    <td className="py-3.5 px-4 text-bode-muted">{p.recordedByManager}</td>
                    <td className="py-3.5 px-4 text-right font-serif text-sm font-bold text-bode-forest">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (< sm) */}
        <div className="sm:hidden divide-y divide-bode-border/50">
          {filteredTx.length === 0 ? (
            <div className="p-8 text-center text-xs text-bode-muted">
              No payment transactions recorded.
            </div>
          ) : (
            filteredTx.map(({ transaction: p, visit: v }) => (
              <div key={p.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-bode-forest">{p.receiptNumber}</span>
                    <h4 className="font-serif font-bold text-sm text-bode-charcoal mt-0.5">{v.customerName}</h4>
                    <p className="font-mono text-[11px] text-bode-muted">{v.customerMobile}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-base text-bode-forest">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] font-bold uppercase text-bode-emerald mt-0.5">{p.method}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-bode-muted bg-bode-ivory/50 p-2 rounded-lg border border-bode-border/50">
                  <span>{p.timestamp}</span>
                  <span>By: {p.recordedByManager}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

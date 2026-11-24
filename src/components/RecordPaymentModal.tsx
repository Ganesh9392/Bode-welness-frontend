import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit, PaymentMethod, PaymentTransaction } from '../types';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Receipt,
  Share2,
  AlertCircle,
  Building,
} from 'lucide-react';

interface RecordPaymentModalProps {
  visit: CustomerVisit;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  visit,
  onClose,
  onSuccess,
}) => {
  const { currentBranch, currentManager, recordPayment, generateInvoice } = useApp();

  const invoice = visit.invoice || generateInvoice(visit.id);
  const outstanding = invoice.outstandingBalance;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [amount, setAmount] = useState<number>(outstanding);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('Front desk settlement');
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  const handleRecord = () => {
    setError(null);
    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (amount > outstanding) {
      setError(`Payment cannot exceed the outstanding balance of ₹${outstanding}.`);
      return;
    }

    if ((paymentMethod === 'UPI' || paymentMethod === 'CARD') && !transactionRef.trim()) {
      setError(`Please provide the ${paymentMethod} transaction reference / approval code.`);
      return;
    }

    const tx = recordPayment(visit.id, {
      amount: Number(amount),
      method: paymentMethod,
      transactionReference: transactionRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setCompletedTx(tx);
    if (onSuccess) onSuccess();
  };

  const handleShareReceiptWhatsApp = () => {
    if (!completedTx) return;
    const cleanPhone = (visit.customerWhatsApp || visit.customerMobile).replace(/[^0-9]/g, '');
    const num = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
    const text = `🌿 *BODE WELLNESS SPA — PAYMENT RECEIPT* 🌿
Dear *${visit.customerName}*,
We have successfully received your payment of *₹${completedTx.amount}* via *${completedTx.method}*.

🧾 *Receipt Reference:* ${completedTx.receiptNumber}
📄 *Invoice:* ${invoice.invoiceNumber}
📍 *Branch:* ${currentBranch?.name}
🕒 *Time:* ${completedTx.timestamp}

Thank you for choosing BODE Wellness Spa.`;

    const url = `https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[94vh] flex flex-col overflow-hidden border border-bode-border">
        {/* Header */}
        <div className="bg-bode-forest px-4 py-3.5 sm:px-6 sm:py-4 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bode-gold text-bode-forest flex items-center justify-center font-bold shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-base truncate">Record Payment</h3>
              <p className="text-xs text-bode-gold truncate">{visit.customerName} • {invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {!completedTx ? (
            <>
              {/* Financial Balance Overview */}
              <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border/80 space-y-2 text-xs">
                <div className="flex justify-between text-bode-muted">
                  <span>Gross Final Bill:</span>
                  <span className="font-semibold text-bode-charcoal">₹{invoice.finalAmount.toLocaleString('en-IN')}</span>
                </div>
                {invoice.onlineAdvanceCredit > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Website Advance Credited:</span>
                    <span>-₹{invoice.onlineAdvanceCredit}</span>
                  </div>
                )}
                {visit.payments.length > 0 && (
                  <div className="flex justify-between text-bode-emerald font-medium">
                    <span>Previously Collected:</span>
                    <span>-₹{visit.payments.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-bode-border pt-2 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-bode-forest">
                    Outstanding Balance:
                  </span>
                  <span className="font-serif text-lg font-bold text-red-700">
                    ₹{outstanding.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'CARD', label: 'Card POS', icon: CreditCard },
                    { id: 'CASH', label: 'Cash Desk', icon: Banknote },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-bode-forest text-white border-bode-forest shadow-sm'
                            : 'bg-white border-bode-border text-bode-charcoal hover:bg-bode-ivory/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-semibold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-bode-charcoal">
                    Amount Received (₹)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(outstanding)}
                    className="text-[11px] text-bode-emerald hover:text-bode-forest font-semibold"
                  >
                    Settle Full (₹{outstanding})
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={outstanding}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-bode-border rounded-lg text-base font-bold text-bode-forest focus:ring-2 focus:ring-bode-forest focus:outline-none"
                />
                {amount < outstanding && amount > 0 && (
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    Partial payment mode. Remaining ₹{outstanding - amount} will remain outstanding.
                  </p>
                )}
              </div>

              {/* Transaction Reference (For UPI / Card) */}
              {(paymentMethod === 'UPI' || paymentMethod === 'CARD') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                    {paymentMethod === 'UPI' ? 'UPI UTR / Transaction ID' : 'POS Slip / Card Approval Code'}
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder={paymentMethod === 'UPI' ? 'e.g. UPI/402819882100' : 'e.g. APPR-88219'}
                    className="w-full px-3.5 py-2 bg-white border border-bode-border rounded-lg text-xs font-mono text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                  Reception Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid at reception via front desk POS"
                  className="w-full px-3.5 py-2 bg-white border border-bode-border rounded-lg text-xs text-bode-charcoal focus:ring-2 focus:ring-bode-forest focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            /* Payment Success Screen with Receipt (Section 15 requirement) */
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-2">
                  Payment Recorded
                </span>
                <h4 className="font-serif font-bold text-lg text-bode-forest">
                  ₹{completedTx.amount.toLocaleString('en-IN')} Received
                </h4>
                <p className="text-xs text-bode-muted">Receipt Ref: {completedTx.receiptNumber}</p>
              </div>

              {/* Digital Receipt Card */}
              <div className="p-4 rounded-xl bg-bode-ivory border border-bode-border/80 text-xs text-left space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-bode-muted">Payment Mode:</span>
                  <span className="font-semibold text-bode-forest">{completedTx.method}</span>
                </div>
                {completedTx.transactionReference && (
                  <div className="flex justify-between">
                    <span className="text-bode-muted">Reference:</span>
                    <span className="font-mono text-[11px]">{completedTx.transactionReference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-bode-muted">Date & Time:</span>
                  <span>{completedTx.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bode-muted">Collected By:</span>
                  <span>{completedTx.recordedByManager}</span>
                </div>
                <div className="border-t border-bode-border pt-1.5 flex justify-between font-bold text-bode-forest">
                  <span>New Outstanding Balance:</span>
                  <span>₹{Math.max(0, outstanding - completedTx.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Share Receipt on WhatsApp Option (Section 15 requirement) */}
              <button
                type="button"
                onClick={handleShareReceiptWhatsApp}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Payment Receipt on WhatsApp</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-bode-ivory/50 px-6 py-4 border-t border-bode-border flex items-center justify-end gap-3">
          {!completedTx ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-bode-charcoal hover:bg-bode-border/50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecord}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-bode-forest hover:bg-bode-forestLight rounded-lg shadow transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Record Receipt</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-bode-forest hover:bg-bode-forestLight rounded-lg transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

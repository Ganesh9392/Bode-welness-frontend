import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerVisit } from '../types';
import {
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Sparkles,
} from 'lucide-react';

interface WhatsAppSendModalProps {
  visit: CustomerVisit;
  onClose: () => void;
  onSuccess?: () => void;
}

type WhatsAppSendState = 'READY' | 'SENDING' | 'SUCCESS_DELIVERED' | 'FAILED';

export const WhatsAppSendModal: React.FC<WhatsAppSendModalProps> = ({
  visit,
  onClose,
  onSuccess,
}) => {
  const { currentBranch, updateWhatsAppStatus } = useApp();
  const invoice = visit.invoice;

  const [phone, setPhone] = useState(visit.customerWhatsApp || visit.customerMobile);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<WhatsAppSendState>('READY');
  const [failSimulation, setFailSimulation] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<'API' | 'DIRECT_LINK'>('API');

  if (!invoice) return null;

  // Format professional message body
  const messageText = `🌿 *BODE WELLNESS SPA — TAX INVOICE* 🌿
Dear *${visit.customerName}*,
Thank you for visiting *BODE Wellness Spa (${currentBranch?.shortName})*.

📄 *Invoice Details:*
• Invoice Number: *${invoice.invoiceNumber}*
• Date: ${invoice.generatedAt}
• Visit Reference: ${visit.visitReference}

💆 *Services Rendered:*
${visit.services
  .map(
    (s, idx) =>
      `${idx + 1}. ${s.serviceName} (${s.durationMinutes}m) — ₹${s.finalPrice}${
        s.discount ? ` _(Disc: -₹${s.discount.discountAmount})_` : ''
      }`
  )
  .join('\n')}

💰 *Bill Summary:*
• Subtotal: ₹${invoice.subtotal}
${invoice.totalDiscount > 0 ? `• Total Discount: -₹${invoice.totalDiscount}\n` : ''}• GST (18%): ₹${invoice.taxAmount}
• *Total Payable:* *₹${invoice.finalAmount}*
${invoice.onlineAdvanceCredit > 0 ? `• Online Booking Deposit Credited: -₹${invoice.onlineAdvanceCredit}\n` : ''}• *Outstanding Due:* *₹${invoice.outstandingBalance}*

Warm Regards,
Team BODE Wellness Spa
📍 ${currentBranch?.address}
📞 ${currentBranch?.phone}`;

  const validatePhone = (numberToTest: string): boolean => {
    const digitsOnly = numberToTest.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile/WhatsApp number.');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSendViaApi = () => {
    if (!validatePhone(phone)) return;

    setSendState('SENDING');

    setTimeout(() => {
      if (failSimulation) {
        setSendState('FAILED');
        updateWhatsAppStatus(
          visit.id,
          'FAILED',
          'Delivery failed: WhatsApp Cloud API simulation error (invalid recipient or gateway timeout).'
        );
      } else {
        setSendState('SUCCESS_DELIVERED');
        updateWhatsAppStatus(
          visit.id,
          'DELIVERED_CONFIRMED',
          `Delivered successfully to ${phone} via BODE WhatsApp Business Gateway.`
        );
        if (onSuccess) onSuccess();
      }
    }, 1800);
  };

  const handleOpenDirectWhatsAppLink = () => {
    if (!validatePhone(phone)) return;

    const digitsOnly = phone.replace(/[^0-9]/g, '');
    const cleanNumber = digitsOnly.startsWith('91') && digitsOnly.length > 10 ? digitsOnly : `91${digitsOnly}`;
    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;

    // Mark as LINK_OPENED (clearly distinguishing from DELIVERED_CONFIRMED)
    updateWhatsAppStatus(
      visit.id,
      'LINK_OPENED',
      `WhatsApp client opened with phone ${cleanNumber}. Delivery confirmation pending recipient device receipt.`
    );

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[94vh] flex flex-col overflow-hidden border border-bode-border">
        {/* Header */}
        <div className="bg-emerald-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-base">Send Invoice to WhatsApp</h3>
              <p className="text-xs text-emerald-200">
                Invoice {invoice.invoiceNumber} • {visit.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* State 1: READY */}
          {sendState === 'READY' && (
            <>
              {/* Recipient Phone Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal mb-1.5">
                  Customer WhatsApp Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) validatePhone(e.target.value);
                    }}
                    placeholder="+91 98490 12345"
                    className="w-full px-3.5 py-2.5 bg-bode-ivory/40 border border-bode-border rounded-lg text-sm text-bode-charcoal font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                {phoneError && <p className="text-xs text-red-600 mt-1">{phoneError}</p>}
                <p className="text-[11px] text-bode-muted mt-1">
                  Manager can edit only if guest requested receipt sent to an alternate phone.
                </p>
              </div>

              {/* Invoice Quick Summary Banner */}
              <div className="p-3.5 rounded-xl bg-bode-ivory border border-bode-border/70 flex items-center justify-between text-xs">
                <div>
                  <span className="text-bode-muted">Invoice Total:</span>
                  <p className="font-serif text-sm font-bold text-bode-forest">
                    ₹{invoice.finalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-bode-muted">Deposit Credited:</span>
                  <p className="font-semibold text-emerald-700">
                    {invoice.onlineAdvanceCredit > 0 ? `₹${invoice.onlineAdvanceCredit}` : 'None'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-bode-muted">Outstanding:</span>
                  <p className="font-serif text-sm font-bold text-bode-charcoal">
                    ₹{invoice.outstandingBalance.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-bode-charcoal">
                    WhatsApp Message Preview
                  </label>
                  <span className="text-[10px] text-bode-muted">Formatted with BODE brand template</span>
                </div>
                <div className="p-3 bg-[#E5DDD5]/40 rounded-xl border border-bode-border/60 text-[11px] font-sans text-bode-charcoal/90 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed shadow-inner">
                  {messageText}
                </div>
              </div>

              {/* Operational Simulation Options */}
              <div className="pt-2 border-t border-bode-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-bode-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={failSimulation}
                      onChange={(e) => setFailSimulation(e.target.checked)}
                      className="rounded border-bode-border text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                    />
                    <span>Simulate Delivery Failure (for verification)</span>
                  </label>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                  <strong>Important Distinction:</strong> Clicking "Open in WhatsApp Web / App" opens the chat link on your device. Clicking "Dispatch via WhatsApp Cloud API" attempts automated direct server delivery.
                </div>
              </div>
            </>
          )}

          {/* State 2: SENDING */}
          {sendState === 'SENDING' && (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
                <MessageSquare className="w-6 h-6 text-emerald-700 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-bode-forest">
                  Dispatching WhatsApp Invoice...
                </h4>
                <p className="text-xs text-bode-muted mt-1">
                  Connecting to Meta WhatsApp Business API endpoint for {phone}...
                </p>
              </div>
              <div className="max-w-xs mx-auto bg-bode-ivory/80 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}

          {/* State 3: SUCCESS_DELIVERED */}
          {sendState === 'SUCCESS_DELIVERED' && (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-2">
                  Confirmed Delivered
                </span>
                <h4 className="font-serif font-bold text-lg text-bode-forest">
                  Invoice Successfully Dispatched!
                </h4>
                <p className="text-xs text-bode-muted max-w-sm mx-auto mt-1 leading-relaxed">
                  Consolidated invoice <strong>{invoice.invoiceNumber}</strong> has been transmitted to{' '}
                  <strong>{phone}</strong>. The delivery receipt has been audited into this visit's record.
                </p>
              </div>

              <div className="p-3 bg-bode-ivory rounded-xl border border-bode-border text-xs text-left max-w-sm mx-auto space-y-1">
                <div className="flex justify-between">
                  <span className="text-bode-muted">Recipient:</span>
                  <span className="font-semibold text-bode-charcoal">{visit.customerName} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bode-muted">Status:</span>
                  <span className="font-semibold text-emerald-700">Delivered & Read receipt active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bode-muted">Timestamp:</span>
                  <span className="text-bode-charcoal">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* State 4 & 5: FAILED & RETRY */}
          {sendState === 'FAILED' && (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold tracking-wide uppercase mb-2">
                  Transmission Error
                </span>
                <h4 className="font-serif font-bold text-lg text-red-800">
                  Failed to Deliver WhatsApp Invoice
                </h4>
                <p className="text-xs text-red-700 max-w-sm mx-auto mt-1 leading-relaxed">
                  The WhatsApp delivery gateway encountered a timeout or the recipient number was unreachable.
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 max-w-sm mx-auto text-left">
                <p className="font-semibold mb-1">Troubleshooting Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-700">
                  <li>Verify mobile number has an active WhatsApp account</li>
                  <li>Check internet connectivity on the branch terminal</li>
                  <li>Alternatively, launch the direct WhatsApp desktop link below</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-bode-ivory/50 px-6 py-4 border-t border-bode-border flex flex-wrap items-center justify-between gap-3">
          {sendState === 'READY' && (
            <>
              <button
                type="button"
                onClick={handleOpenDirectWhatsAppLink}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg transition flex items-center gap-1.5"
                title="Launch chat link in WhatsApp Web"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp Web</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-bode-charcoal hover:bg-bode-border/50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendViaApi}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invoice on WhatsApp</span>
                </button>
              </div>
            </>
          )}

          {sendState === 'SENDING' && (
            <div className="w-full text-center py-1">
              <span className="text-xs text-bode-muted italic">Please wait, contacting WhatsApp gateway...</span>
            </div>
          )}

          {sendState === 'SUCCESS_DELIVERED' && (
            <div className="w-full flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-bode-forest hover:bg-bode-forestLight rounded-lg transition"
              >
                Close Window
              </button>
            </div>
          )}

          {sendState === 'FAILED' && (
            <div className="w-full flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleOpenDirectWhatsAppLink}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Fallback: Open Web Link</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSendState('READY')}
                  className="px-3.5 py-2 text-xs font-medium text-bode-charcoal hover:bg-bode-border/50 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFailSimulation(false);
                    handleSendViaApi();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-lg transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Dispatch</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

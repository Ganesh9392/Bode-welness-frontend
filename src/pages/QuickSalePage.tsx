import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AddGuestForm } from '../components/AddGuestForm';
import { ComingSoon } from '../components/ComingSoon';
import { Customer, DiscountType, PaymentMethod, POSCartItem, ServiceItem } from '../types';
import {
  Search,
  UserPlus,
  CreditCard,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Sparkles,
  Clock,
  Tag,
  Banknote,
  Smartphone,
  ArrowLeft,
  UserCheck,
  Award,
  Plus,
} from 'lucide-react';

interface QuickSalePageProps {
  onNavigate: (tab: string, visitId?: string) => void;
}

type GuestTab = 'search' | 'new' | 'membership';

export const QuickSalePage: React.FC<QuickSalePageProps> = ({ onNavigate }) => {
  const {
    currentBranch,
    currentManager,
    branchCustomers,
    branchServices,
    branchStaff,
    createServiceVisit,
    createPosOrder,
    generateInvoice,
    recordPayment,
  } = useApp();

  const [guestTab, setGuestTab] = useState<GuestTab>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [saleMode, setSaleMode] = useState<'WALK_IN' | 'IMMEDIATE_BILL'>('WALK_IN');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');
  const [createdResult, setCreatedResult] = useState<{
    orderRef: string;
    visitId?: string;
    invoiceNumber?: string;
  } | null>(null);

  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 3) return [];
    return branchCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobileNumber.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''))
    );
  }, [branchCustomers, searchQuery]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(branchServices.map((s) => s.category)));
    return ['ALL', ...cats];
  }, [branchServices]);

  const filteredServices = useMemo(() => {
    return branchServices.filter((s) => selectedCategory === 'ALL' || s.category === selectedCategory);
  }, [branchServices, selectedCategory]);

  const addServiceToCart = (service: ServiceItem, durationMinutes: number, price: number) => {
    const eligibleStaff = branchStaff.filter(
      (st) =>
        st.isActive &&
        (st.availability === 'AVAILABLE' || st.enableAppointments) &&
        (st.specializations.includes(service.name) || st.specializations.length === 0)
    );
    const defaultStaff = eligibleStaff[0];

    const newItem: POSCartItem = {
      id: `cart-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'SERVICE',
      name: service.name,
      category: service.category,
      durationMinutes,
      quantity: 1,
      unitPrice: price,
      finalPrice: price,
      serviceId: service.id,
      staffId: defaultStaff?.id,
      staffName: defaultStaff?.name,
    };
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartItemStaff = (itemId: string, staffId: string) => {
    const member = branchStaff.find((s) => s.id === staffId);
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, staffId: member?.id, staffName: member?.name } : item
      )
    );
  };

  const updateCartItemDiscount = (itemId: string, type: DiscountType, value: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const cleanVal = Math.max(0, value);
        const amount =
          type === 'FIXED'
            ? Math.min(item.unitPrice, cleanVal)
            : Math.round((item.unitPrice * Math.min(100, cleanVal)) / 100);
        return {
          ...item,
          discount: cleanVal > 0 ? { type, value: cleanVal, amount } : undefined,
          finalPrice: Math.max(0, item.unitPrice - amount),
        };
      })
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalDiscount = cart.reduce((acc, item) => acc + (item.discount?.amount || 0), 0);
  const netSubtotal = Math.max(0, subtotal - totalDiscount);
  const taxAmount = Math.round(netSubtotal * 0.18);
  const finalTotal = netSubtotal + taxAmount;

  const handleCheckout = () => {
    if (!selectedCustomer || cart.length === 0 || !currentBranch || !currentManager) return;

    const firstItem = cart[0];
    const visit = createServiceVisit({
      customerId: selectedCustomer.id,
      serviceId: firstItem.serviceId || branchServices[0]?.id,
      durationMinutes: firstItem.durationMinutes || 60,
      price: firstItem.unitPrice,
      appointmentType: 'WALK_IN',
      appointmentDate: saleDate,
      staffId: firstItem.staffId,
      notes: notes || 'Created via Quick Sale / POS',
    });

    let invoiceNumber: string | undefined;
    if (saleMode === 'IMMEDIATE_BILL') {
      const inv = generateInvoice(visit.id);
      invoiceNumber = inv.invoiceNumber;
      recordPayment(visit.id, {
        amount: finalTotal,
        method: paymentMethod,
        transactionReference: paymentRef.trim() || undefined,
        notes: 'Quick Sale POS settlement',
      });
    }

    const posOrder = createPosOrder({
      branchId: currentBranch.id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobileNumber,
      orderType: 'SERVICE',
      orderStatus: saleMode === 'IMMEDIATE_BILL' ? 'COMPLETED' : 'IN_PROGRESS',
      items: cart,
      subtotal,
      totalDiscount,
      taxAmount,
      finalAmount: finalTotal,
      appointmentDate: saleDate,
      appointmentTime: new Date().toTimeString().slice(0, 5),
      invoiceNumber,
      payments: [],
      paymentStatus: saleMode === 'IMMEDIATE_BILL' ? 'FULLY_PAID' : 'UNPAID',
      source: 'WALK_IN',
      notes,
      visitId: visit.id,
    });

    setCreatedResult({
      orderRef: posOrder.orderReference,
      visitId: visit.id,
      invoiceNumber,
    });
  };

  if (createdResult) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-bode-border shadow-md p-6 sm:p-8 text-center space-y-5 my-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-bode-emerald">
            Quick Sale Recorded
          </span>
          <h2 className="font-serif text-2xl font-bold text-bode-forest mt-1">
            Order {createdResult.orderRef} Created
          </h2>
          {createdResult.invoiceNumber && (
            <p className="text-xs text-bode-muted mt-1">
              Invoice Generated: <strong className="text-bode-forest">{createdResult.invoiceNumber}</strong>
            </p>
          )}
        </div>

        <div className="bg-bode-ivory/60 rounded-xl p-4 text-xs text-left space-y-1.5 border border-bode-border">
          <div className="flex justify-between">
            <span className="text-bode-muted">Guest</span>
            <span className="font-semibold text-bode-forest">{selectedCustomer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bode-muted">Items</span>
            <span className="font-semibold text-bode-forest">{cart.length} treatment(s)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bode-muted">Total Amount</span>
            <span className="font-bold text-bode-forest">₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {createdResult.visitId && (
            <button
              type="button"
              onClick={() => onNavigate('visit-detail', createdResult.visitId)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold transition"
            >
              Open Visit Record
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setCreatedResult(null);
              setSelectedCustomer(null);
              setCart([]);
              setSearchQuery('');
              setNotes('');
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-bode-border hover:bg-bode-ivory text-bode-forest text-xs font-semibold transition"
          >
            New Sale
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-bode-gold/20 hover:bg-bode-gold/30 text-bode-forest text-xs font-semibold transition"
          >
            Sales Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1 text-xs text-bode-emerald hover:text-bode-forest font-medium mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sales Dashboard</span>
          </button>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">Quick Sale / POS</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-bode-muted mt-1">
            <span>Sale Date:</span>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => e.target.value && setSaleDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-bode-border bg-white text-bode-forest font-semibold text-xs"
            />
            <span>• Branch: <strong>{currentBranch?.shortName}</strong></span>
          </div>
        </div>
      </div>

      {/* Step 1: Guest Selection */}
      {!selectedCustomer ? (
        <div className="bg-white rounded-2xl border border-bode-border shadow-sm p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap gap-2 border-b border-bode-border pb-4">
            <button
              type="button"
              onClick={() => setGuestTab('search')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                guestTab === 'search'
                  ? 'bg-bode-forest text-white shadow-sm'
                  : 'bg-bode-ivory text-bode-charcoal hover:bg-bode-ivoryDark'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Existing Guest</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestTab('new')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                guestTab === 'new'
                  ? 'bg-bode-forest text-white shadow-sm'
                  : 'bg-bode-ivory text-bode-charcoal hover:bg-bode-ivoryDark'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Guest</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestTab('membership')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                guestTab === 'membership'
                  ? 'bg-bode-forest text-white shadow-sm'
                  : 'bg-bode-ivory text-bode-charcoal hover:bg-bode-ivoryDark'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Validate Membership</span>
            </button>
          </div>

          {guestTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-bode-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or number (enter at least 3 characters)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-bode-border bg-bode-ivory/40 text-sm text-bode-charcoal focus:outline-none focus:ring-2 focus:ring-bode-forest"
                />
              </div>

              {searchQuery.trim().length < 3 ? (
                <p className="text-xs text-bode-muted py-4 text-center">
                  Type at least 3 characters of the guest's name or mobile number to search.
                </p>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-bode-muted">No matching guest found in {currentBranch?.shortName}.</p>
                  <button
                    type="button"
                    onClick={() => setGuestTab('new')}
                    className="px-4 py-2 rounded-lg bg-bode-emerald text-white text-xs font-semibold"
                  >
                    + Add New Guest
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((c) => {
                    const initials = c.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl border border-bode-border hover:border-bode-gold bg-bode-ivory/30 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-bode-forest text-bode-gold font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif font-bold text-sm text-bode-forest truncate">{c.name}</p>
                            <p className="text-xs text-bode-muted">{c.mobileNumber}</p>
                            {c.lastVisitDate && (
                              <p className="text-[10px] text-bode-emerald mt-0.5">Last visit: {c.lastVisitDate}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="px-3 py-1.5 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold shrink-0"
                        >
                          Select
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {guestTab === 'new' && (
            <AddGuestForm
              compact
              onSave={(cust) => setSelectedCustomer(cust)}
              onCancel={() => setGuestTab('search')}
            />
          )}

          {guestTab === 'membership' && (
            <ComingSoon
              title="Membership Validation"
              description="Lookup and validate BODE Wellness Spa Fixed, Percentage, Hourly, and Hybrid membership plans during Quick Sale."
              icon={<Award className="w-8 h-8" />}
              phase="Phase 2"
            />
          )}
        </div>
      ) : (
        /* Step 2 & 3: Catalogue + Cart + Checkout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Service Browser */}
          <div className="lg:col-span-7 space-y-4">
            {/* Selected Guest Banner */}
            <div className="bg-white rounded-xl border border-bode-gold/60 p-3.5 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bode-forest text-bode-gold font-bold text-xs flex items-center justify-center">
                  {selectedCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-bode-forest">{selectedCustomer.name}</p>
                  <p className="text-xs text-bode-muted">{selectedCustomer.mobileNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-xs font-semibold text-bode-emerald hover:text-bode-forest underline"
              >
                Change Guest
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-bode-forest text-white'
                      : 'bg-white border border-bode-border text-bode-charcoal hover:bg-bode-ivory'
                  }`}
                >
                  {cat === 'ALL' ? 'All Treatments' : cat}
                </button>
              ))}
            </div>

            {/* Services List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white rounded-xl border border-bode-border p-4 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-bode-emerald">
                      {srv.category}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-bode-forest mt-0.5">{srv.name}</h3>
                    <p className="text-[11px] text-bode-muted line-clamp-2 mt-1">{srv.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-bode-border/60">
                    {srv.durations.map((dur) => (
                      <button
                        key={dur.durationMinutes}
                        type="button"
                        onClick={() => addServiceToCart(srv, dur.durationMinutes, dur.price)}
                        className="flex-1 min-w-[110px] px-2.5 py-2 rounded-lg bg-bode-ivory hover:bg-bode-forest hover:text-white text-bode-forest text-xs font-semibold border border-bode-border transition flex items-center justify-between gap-1"
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dur.durationMinutes}m
                        </span>
                        <span className="flex items-center gap-0.5">
                          ₹{dur.price.toLocaleString('en-IN')}
                          <Plus className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cart & Checkout */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-bode-border shadow-sm p-4 sm:p-5 space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-bode-border pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-bode-emerald" />
                  <h2 className="font-serif font-bold text-base text-bode-forest">
                    POS Cart ({cart.length})
                  </h2>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-[11px] text-red-600 hover:underline font-medium"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-bode-gold/60 mx-auto" />
                  <p className="text-xs font-medium text-bode-muted">
                    Your cart is empty. Tap any treatment duration on the left to add it.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-bode-ivory/50 border border-bode-border space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif font-bold text-xs text-bode-forest">
                              {item.name} ({item.durationMinutes} min)
                            </p>
                            <p className="text-[11px] text-bode-muted">
                              Unit Price: ₹{item.unitPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-bode-forest">
                              ₹{item.finalPrice.toLocaleString('en-IN')}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Staff Assignment */}
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-bode-emerald shrink-0" />
                          <select
                            value={item.staffId || ''}
                            onChange={(e) => updateCartItemStaff(item.id, e.target.value)}
                            className="flex-1 text-[11px] px-2 py-1 rounded border border-bode-border bg-white text-bode-charcoal"
                          >
                            <option value="">Assign Therapist...</option>
                            {branchStaff
                              .filter((s) => s.isActive)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.availability === 'AVAILABLE' ? 'Available' : s.availability})
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Quick Item Discount */}
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-bode-goldDark shrink-0" />
                          <input
                            type="number"
                            min={0}
                            placeholder="Discount ₹"
                            value={item.discount?.value || ''}
                            onChange={(e) =>
                              updateCartItemDiscount(item.id, 'FIXED', Number(e.target.value) || 0)
                            }
                            className="w-28 text-[11px] px-2 py-1 rounded border border-bode-border bg-white"
                          />
                          {item.discount && (
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              -₹{item.discount.amount} applied
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Workflow Mode */}
                  <div className="p-3 rounded-xl bg-bode-ivory border border-bode-border space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-bode-forest">
                      Service Execution Mode
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSaleMode('WALK_IN')}
                        className={`p-2 rounded-lg text-[11px] font-semibold border text-left transition ${
                          saleMode === 'WALK_IN'
                            ? 'bg-bode-forest text-white border-bode-forest'
                            : 'bg-white text-bode-charcoal border-bode-border'
                        }`}
                      >
                        Start Treatment Visit
                        <span className="block text-[9px] font-normal opacity-80">
                          Bill after service completion
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaleMode('IMMEDIATE_BILL')}
                        className={`p-2 rounded-lg text-[11px] font-semibold border text-left transition ${
                          saleMode === 'IMMEDIATE_BILL'
                            ? 'bg-bode-forest text-white border-bode-forest'
                            : 'bg-white text-bode-charcoal border-bode-border'
                        }`}
                      >
                        Pay &amp; Invoice Now
                        <span className="block text-[9px] font-normal opacity-80">
                          Immediate POS checkout
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method (if immediate billing) */}
                  {saleMode === 'IMMEDIATE_BILL' && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-bode-muted">
                        Payment Method
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { id: 'CASH', label: 'Cash', icon: Banknote },
                            { id: 'UPI', label: 'UPI', icon: Smartphone },
                            { id: 'CARD', label: 'Card', icon: CreditCard },
                          ] as const
                        ).map((pm) => {
                          const Icon = pm.icon;
                          return (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() => setPaymentMethod(pm.id)}
                              className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                                paymentMethod === pm.id
                                  ? 'bg-bode-emerald text-white border-bode-emerald'
                                  : 'bg-white text-bode-charcoal border-bode-border'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {pm.label}
                            </button>
                          );
                        })}
                      </div>
                      {paymentMethod !== 'CASH' && (
                        <input
                          type="text"
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder={`${paymentMethod} Transaction Reference (optional)`}
                          className="w-full px-3 py-2 rounded-lg border border-bode-border text-xs"
                        />
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Order notes (optional)..."
                    className="w-full px-3 py-2 rounded-lg border border-bode-border text-xs"
                  />

                  {/* Totals */}
                  <div className="pt-3 border-t border-bode-border space-y-1.5 text-xs">
                    <div className="flex justify-between text-bode-muted">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discounts</span>
                        <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-bode-muted">
                      <span>GST (18%)</span>
                      <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-serif font-bold text-base text-bode-forest pt-2 border-t border-bode-border/60">
                      <span>Final Total</span>
                      <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-3 px-4 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white font-semibold text-xs tracking-wide shadow-md transition"
                  >
                    {saleMode === 'IMMEDIATE_BILL'
                      ? 'Complete Sale & Generate Invoice'
                      : 'Start Treatment Visit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AddGuestForm } from '../components/AddGuestForm';
import { Customer, CustomerVisit } from '../types';
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  PlusCircle,
  FileText,
  Sparkles,
  ChevronRight,
  Edit3,
} from 'lucide-react';

interface CustomersPageProps {
  onNavigate: (tab: string, visitId?: string) => void;
  onOpenInvoiceModal: (visit: CustomerVisit) => void;
}

type SortOption = 'name' | 'registeredDate' | 'lastVisitDate';

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onNavigate,
  onOpenInvoiceModal,
}) => {
  const { branchCustomers, branchVisits, currentBranch } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [visitsFilter, setVisitsFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return branchCustomers
      .filter((c) => {
        const matchesQuery =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.mobileNumber.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
        const matchesSource = sourceFilter === 'ALL' || (c.source || 'Walk-in') === sourceFilter;
        const matchesGender = genderFilter === 'ALL' || c.gender === genderFilter;
        const matchesVisits =
          visitsFilter === 'ALL' ||
          (visitsFilter === 'WITH_VISITS' && c.totalVisits > 0) ||
          (visitsFilter === 'NO_VISITS' && c.totalVisits === 0);
        return matchesQuery && matchesSource && matchesGender && matchesVisits;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'registeredDate') return (b.registeredDate || '').localeCompare(a.registeredDate || '');
        return (b.lastVisitDate || '').localeCompare(a.lastVisitDate || '');
      });
  }, [branchCustomers, searchQuery, sourceFilter, genderFilter, visitsFilter, sortBy]);

  const customerVisits = useMemo(() => {
    if (!selectedCustomer) return [];
    return branchVisits.filter((v) => v.customerId === selectedCustomer.id);
  }, [branchVisits, selectedCustomer]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-bode-forest">CRM — Guests</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-bode-forest text-bode-gold text-xs font-bold">
              {branchCustomers.length}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-bode-gold" />
          <span>Add Guest</span>
        </button>
      </div>

      {/* Search, Sort & Filter Bar */}
      <div className="bg-white rounded-2xl border border-bode-border p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-bode-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guest by name or mobile number..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-bode-border bg-bode-ivory/40 text-sm focus:outline-none focus:ring-2 focus:ring-bode-forest"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-bode-border bg-white text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-bode-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-bode-charcoal font-medium focus:outline-none"
              >
                <option value="name">Sort: Name A–Z</option>
                <option value="registeredDate">Sort: Date Added</option>
                <option value="lastVisitDate">Sort: Last Visit</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showFilters
                  ? 'bg-bode-forest text-white border-bode-forest'
                  : 'bg-white text-bode-charcoal border-bode-border hover:bg-bode-ivory'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-bode-border/70 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Sources</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-bode-muted mb-1">Visit Activity</label>
              <select
                value={visitsFilter}
                onChange={(e) => setVisitsFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-bode-border bg-bode-ivory/30"
              >
                <option value="ALL">All Guests</option>
                <option value="WITH_VISITS">With Visits</option>
                <option value="NO_VISITS">No Visits Yet</option>
              </select>
            </div>
          </div>
        )}

        <div className="text-[11px] text-bode-muted">
          Showing <strong>{filteredCustomers.length}</strong> of <strong>{branchCustomers.length}</strong> customers
        </div>
      </div>

      {/* Customer List: Mobile Cards / Desktop Rows */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-bode-border p-10 text-center text-xs text-bode-muted">
          No customers match your current search or filter criteria.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="bg-white rounded-xl border border-bode-border hover:border-bode-gold p-3.5 sm:p-4 shadow-sm cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-bode-forest text-bode-gold font-bold text-sm flex items-center justify-center shrink-0">
                  {getInitials(cust.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-bold text-sm text-bode-forest">{cust.name}</h3>
                    {cust.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-bode-ivory border border-bode-border text-bode-emerald font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-bode-muted mt-0.5">{cust.mobileNumber}</p>
                  {cust.lastService && (
                    <p className="text-[11px] text-bode-charcoal/80 mt-0.5 truncate">
                      Last treatment: {cust.lastService}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-bode-border/60">
                <div className="text-left sm:text-right text-xs">
                  <p className="font-semibold text-bode-forest">
                    {cust.totalVisits} {cust.totalVisits === 1 ? 'Visit' : 'Visits'}
                  </p>
                  <p className="text-[11px] text-bode-muted">
                    {cust.lastVisitDate ? `Last: ${cust.lastVisitDate}` : 'New Customer'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-bode-muted shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-bode-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-serif text-lg font-semibold">Add New Guest</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <AddGuestForm
                onSave={(newCust) => {
                  setShowAddModal(false);
                  setSelectedCustomer(newCust);
                }}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Side Panel */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-bode-forest text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bode-gold text-bode-forest font-bold text-base flex items-center justify-center">
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">{selectedCustomer.name}</h3>
                  <p className="text-xs text-white/80">{selectedCustomer.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(selectedCustomer)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Edit guest"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Info Grid */}
              <div className="bg-bode-ivory/50 rounded-xl p-4 border border-bode-border space-y-2 text-xs">
                <h4 className="font-serif font-bold text-sm text-bode-forest mb-2">Guest Profile</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-bode-muted block text-[10px] uppercase">WhatsApp</span>
                    <span className="font-medium">{selectedCustomer.whatsAppNumber}</span>
                  </div>
                  {selectedCustomer.alternateNumber && (
                    <div>
                      <span className="text-bode-muted block text-[10px] uppercase">Alternate</span>
                      <span className="font-medium">{selectedCustomer.alternateNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-bode-muted block text-[10px] uppercase">Gender</span>
                    <span className="font-medium">{selectedCustomer.gender || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-bode-muted block text-[10px] uppercase">Email</span>
                    <span className="font-medium truncate block">{selectedCustomer.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-bode-muted block text-[10px] uppercase">Source</span>
                    <span className="font-medium">{selectedCustomer.source || 'Walk-in'}</span>
                  </div>
                  {selectedCustomer.gstNumber && (
                    <div>
                      <span className="text-bode-muted block text-[10px] uppercase">GST Number</span>
                      <span className="font-mono font-medium">{selectedCustomer.gstNumber}</span>
                    </div>
                  )}
                  {selectedCustomer.dateOfBirth && (
                    <div>
                      <span className="text-bode-muted block text-[10px] uppercase">Date of Birth</span>
                      <span className="font-medium">{selectedCustomer.dateOfBirth}</span>
                    </div>
                  )}
                  {selectedCustomer.anniversary && (
                    <div>
                      <span className="text-bode-muted block text-[10px] uppercase">Anniversary</span>
                      <span className="font-medium">{selectedCustomer.anniversary}</span>
                    </div>
                  )}
                </div>
                {selectedCustomer.notes && (
                  <div className="pt-2 border-t border-bode-border/60">
                    <span className="text-bode-muted block text-[10px] uppercase">Notes</span>
                    <p className="text-bode-charcoal mt-0.5">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>

              {/* Visit History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-bode-forest flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-bode-emerald" />
                    <span>Visit History ({customerVisits.length})</span>
                  </h4>
                </div>

                {customerVisits.length === 0 ? (
                  <p className="text-xs text-bode-muted py-4 text-center bg-bode-ivory/30 rounded-xl border border-bode-border">
                    No recorded visits yet for this guest.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {customerVisits.map((v) => {
                      const total = v.services.reduce((acc, s) => acc + s.finalPrice, 0);
                      return (
                        <div
                          key={v.id}
                          className="p-3 rounded-xl border border-bode-border bg-white space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-bode-forest">
                              {v.visitReference}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-bode-ivory font-bold text-bode-emerald">
                              {v.visitStatus}
                            </span>
                          </div>
                          <p className="text-bode-charcoal font-medium">
                            {v.services.map((s) => s.serviceName).join(', ')}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-bode-muted">
                            <span>{v.appointmentDate} • {v.appointmentTime}</span>
                            <span className="font-bold text-bode-forest">
                              ₹{total.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCustomer(null);
                                onNavigate('visit-detail', v.id);
                              }}
                              className="text-[11px] font-semibold text-bode-emerald hover:underline flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              View Details
                            </button>
                            {v.invoice && (
                              <button
                                type="button"
                                onClick={() => onOpenInvoiceModal(v)}
                                className="text-[11px] font-semibold text-bode-forest hover:underline flex items-center gap-1 ml-auto"
                              >
                                <FileText className="w-3 h-3" />
                                Invoice
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-bode-border bg-bode-ivory/50 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  onNavigate('create-service');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4 text-bode-gold" />
                <span>Create New Visit</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${selectedCustomer.mobileNumber.replace(/\s+/g, '')}`}
                  className="py-2 px-3 rounded-xl border border-bode-border bg-white hover:bg-bode-ivory text-bode-forest text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${selectedCustomer.whatsAppNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-bode-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-bode-forest text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-serif text-lg font-semibold">Edit Guest</h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <AddGuestForm
                existingCustomer={editingCustomer}
                onSave={(updatedCust) => {
                  setEditingCustomer(null);
                  setSelectedCustomer(updatedCust);
                }}
                onCancel={() => setEditingCustomer(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

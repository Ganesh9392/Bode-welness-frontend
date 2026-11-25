import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Branch,
  BranchId,
  Customer,
  CustomerVisit,
  DiscountType,
  InvoiceRecord,
  InvoiceStatus,
  ManagerUser,
  PaymentMethod,
  PaymentTransaction,
  ServiceDiscount,
  ServiceItem,
  ServiceCategoryRecord,
  StaffMember,
  NotificationItem,
  VisitServiceEntry,
  POSOrder,
  POSCartItem,
  OrderType,
} from '../types';
import {
  BRANCHES,
  MANAGERS,
  SERVICES_CATALOGUE,
  SERVICE_CATEGORIES,
  INITIAL_STAFF,
  INITIAL_CUSTOMERS,
  INITIAL_VISITS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POS_ORDERS,
} from '../data/mockData';

interface AppContextType {
  // Auth
  currentManager: ManagerUser | null;
  currentBranch: Branch | null;
  login: (username: string, password: string, remember?: boolean) => { success: boolean; message?: string };
  logout: () => void;
  switchDemoManager: (username: string) => void;

  // Branch management
  switchBranch: (branchId: BranchId) => void;
  getAuthorizedBranches: () => Branch[];

  // Data (scoped to branch via getters)
  visits: CustomerVisit[];
  branchVisits: CustomerVisit[];
  customers: Customer[];
  branchCustomers: Customer[];
  staff: StaffMember[];
  branchStaff: StaffMember[];
  services: ServiceItem[];
  branchServices: ServiceItem[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;

  // POS Orders
  posOrders: POSOrder[];
  branchPosOrders: POSOrder[];
  createPosOrder: (order: Omit<POSOrder, 'id' | 'orderReference' | 'createdAt'>) => POSOrder;
  updatePosOrderStatus: (orderId: string, status: POSOrder['orderStatus']) => void;

  // Service Categories & Treatments
  serviceCategories: ServiceCategoryRecord[];
  createCategory: (cat: Omit<ServiceCategoryRecord, 'id'>) => ServiceCategoryRecord;
  updateCategory: (catId: string, updates: Partial<ServiceCategoryRecord>) => void;
  createService: (srv: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (srvId: string, updates: Partial<ServiceItem>) => void;

  // Actions
  findCustomerByPhone: (phone: string) => Customer | undefined;
  createCustomer: (customerData: Omit<Customer, 'id' | 'branchId' | 'totalVisits' | 'registeredDate'>) => Customer;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  assignStaffToService: (visitId: string, serviceEntryId: string, staffId: string) => void;

  createServiceVisit: (params: {
    customerId?: string;
    customerData?: { name: string; mobileNumber: string; whatsAppNumber: string; email?: string };
    serviceId: string;
    durationMinutes: number;
    price: number;
    appointmentType: 'WALK_IN' | 'SCHEDULED';
    appointmentDate?: string;
    appointmentTime?: string;
    staffId?: string;
    notes?: string;
  }) => CustomerVisit;

  checkInCustomer: (visitId: string) => void;
  startServiceSession: (visitId: string, serviceEntryId: string) => void;

  addAdditionalService: (visitId: string, params: {
    serviceId: string;
    serviceName: string;
    category: string;
    durationMinutes: number;
    price: number;
    staffId?: string;
    notes?: string;
    startImmediately?: boolean;
  }) => void;

  completeIndividualService: (visitId: string, serviceEntryId: string, notes?: string) => void;

  applyServiceDiscount: (visitId: string, serviceEntryId: string, discount: {
    type: DiscountType;
    value: number;
    reason?: string;
  }) => void;

  removeServiceDiscount: (visitId: string, serviceEntryId: string) => void;

  completeCustomerVisit: (visitId: string) => void;
  cancelCustomerVisit: (visitId: string) => void;

  generateInvoice: (visitId: string) => InvoiceRecord;

  updateWhatsAppStatus: (visitId: string, status: 'LINK_OPENED' | 'DELIVERED_CONFIRMED' | 'FAILED', details?: string) => void;

  recordPayment: (visitId: string, payment: {
    amount: number;
    method: PaymentMethod;
    transactionReference?: string;
    notes?: string;
  }) => PaymentTransaction;

  // Staff management
  createStaff: (staffData: Omit<StaffMember, 'id'>) => StaffMember;
  updateStaff: (staffId: string, updates: Partial<StaffMember>) => void;

  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH_USER: 'bode_spa_auth_user_v1',
  VISITS: 'bode_spa_visits_v2',
  CUSTOMERS: 'bode_spa_customers_v2',
  STAFF: 'bode_spa_staff_v3',
  NOTIFICATIONS: 'bode_spa_notifications_v2',
  POS_ORDERS: 'bode_spa_pos_orders_v1',
  STAFF_CATEGORIES: 'bode_spa_service_categories_v1',
  SERVICES: 'bode_spa_services_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial Auth: load saved or default to Priya Sharma (ECIL branch)
  const [currentManager, setCurrentManager] = useState<ManagerUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved auth', e);
    }
    // Default logged in manager for instant testing convenience
    const defaultMgr = MANAGERS[0];
    const { passwordHash, ...user } = defaultMgr;
    return user;
  });

  // Load Data with LocalStorage Persistence
  const [visits, setVisits] = useState<CustomerVisit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_VISITS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CUSTOMERS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (saved) {
        const parsed: StaffMember[] = JSON.parse(saved);
        // Guard: if any staff member is missing branchId, the data is stale — reset
        if (parsed.length > 0 && parsed.every((s) => s.branchId)) {
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_STAFF;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });

  const [posOrders, setPosOrders] = useState<POSOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POS_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_POS_ORDERS;
  });

  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SERVICE_CATEGORIES;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SERVICES_CATALOGUE;
  });

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    } catch (e) {}
  }, [visits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {}
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch (e) {}
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POS_ORDERS, JSON.stringify(posOrders));
    } catch (e) {}
  }, [posOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_CATEGORIES, JSON.stringify(serviceCategories));
    } catch (e) {}
  }, [serviceCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (e) {}
  }, [services]);

  // Current branch determined strictly by the authenticated manager
  const currentBranch = useMemo<Branch | null>(() => {
    if (!currentManager) return null;
    return BRANCHES.find((b) => b.id === currentManager.branchId) || null;
  }, [currentManager]);

  // Filter all data strictly to the logged-in manager's assigned branch
  const branchVisits = useMemo(() => {
    if (!currentBranch) return [];
    return visits.filter((v) => v.branchId === currentBranch.id);
  }, [visits, currentBranch]);

  const branchCustomers = useMemo(() => {
    if (!currentBranch) return [];
    return customers.filter((c) => c.branchId === currentBranch.id);
  }, [customers, currentBranch]);

  const branchStaff = useMemo(() => {
    if (!currentBranch) return [];
    return staff.filter((s) => s.branchId === currentBranch.id);
  }, [staff, currentBranch]);

  const branchServices = useMemo(() => {
    if (!currentBranch) return services;
    return services.filter((s) => s.branchAvailability.includes(currentBranch.id));
  }, [currentBranch, services]);

  const branchPosOrders = useMemo(() => {
    if (!currentBranch) return [];
    return posOrders.filter((o) => o.branchId === currentBranch.id);
  }, [posOrders, currentBranch]);

  // ─── Authentication Handlers ────────────────────────────────────────────────

  const login = (username: string, password: string, remember: boolean = true) => {
    const trimmedUser = username.trim().toLowerCase();
    const found = MANAGERS.find(
      (m) => (m.username.toLowerCase() === trimmedUser || m.email.toLowerCase() === trimmedUser) && m.passwordHash === password
    );

    if (found) {
      const { passwordHash, ...user } = found;
      setCurrentManager(user);
      if (remember) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      }
      return { success: true };
    }
    return {
      success: false,
      message: 'Invalid credentials. Please verify your username and password.',
    };
  };

  const logout = () => {
    setCurrentManager(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  };

  const switchDemoManager = (username: string) => {
    const found = MANAGERS.find((m) => m.username === username);
    if (found) {
      const { passwordHash, ...user } = found;
      setCurrentManager(user);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    }
  };

  const switchBranch = (branchId: BranchId) => {
    if (!currentManager) return;
    const authorized = currentManager.authorizedBranchIds || [currentManager.branchId];
    if (!authorized.includes(branchId)) return;
    const branch = BRANCHES.find((b) => b.id === branchId);
    if (!branch) return;
    const updated = { ...currentManager, branchId, branchName: branch.name };
    setCurrentManager(updated);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
  };

  const getAuthorizedBranches = (): Branch[] => {
    if (!currentManager) return [];
    const ids = currentManager.authorizedBranchIds || [currentManager.branchId];
    return BRANCHES.filter((b) => ids.includes(b.id));
  };

  // ─── Notifications ──────────────────────────────────────────────────────────

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // ─── Customer helpers ───────────────────────────────────────────────────────

  const findCustomerByPhone = (phone: string): Customer | undefined => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return undefined;
    return customers.find((c) => {
      const cMobile = c.mobileNumber.replace(/[^0-9]/g, '');
      const cWa = c.whatsAppNumber.replace(/[^0-9]/g, '');
      return cMobile.endsWith(clean) || clean.endsWith(cMobile) || cWa.endsWith(clean) || clean.endsWith(cWa);
    });
  };

  const createCustomer = (customerData: Omit<Customer, 'id' | 'branchId' | 'totalVisits' | 'registeredDate'>): Customer => {
    if (!currentBranch) throw new Error('No branch assigned');
    const newCust: Customer = {
      id: `cust-${Date.now().toString(36)}`,
      branchId: currentBranch.id,
      totalVisits: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      ...customerData,
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updates } : c))
    );
  };

  const assignStaffToService = (visitId: string, serviceEntryId: string, staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    let assignedServiceName = '';
    let assignedCustomerName = '';

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        assignedCustomerName = v.customerName;
        const updatedServices = v.services.map((s) => {
          if (s.id !== serviceEntryId) return s;
          assignedServiceName = `${s.serviceName} (${s.durationMinutes} min)`;
          return {
            ...s,
            staffId: staffMember?.id,
            staffName: staffMember?.name,
          };
        });
        return { ...v, services: updatedServices };
      })
    );

    if (staffMember) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === staffMember.id && s.availability === 'AVAILABLE'
            ? {
                ...s,
                currentAssignedService: assignedServiceName || s.currentAssignedService,
                currentCustomerName: assignedCustomerName || s.currentCustomerName,
              }
            : s
        )
      );
    }
  };

  // ─── Visit Creation Workflow ────────────────────────────────────────────────

  const createServiceVisit = ({
    customerId,
    customerData,
    serviceId,
    durationMinutes,
    price,
    appointmentType,
    appointmentDate,
    appointmentTime,
    staffId,
    notes,
  }: {
    customerId?: string;
    customerData?: { name: string; mobileNumber: string; whatsAppNumber: string; email?: string };
    serviceId: string;
    durationMinutes: number;
    price: number;
    appointmentType: 'WALK_IN' | 'SCHEDULED';
    appointmentDate?: string;
    appointmentTime?: string;
    staffId?: string;
    notes?: string;
  }): CustomerVisit => {
    if (!currentBranch || !currentManager) throw new Error('Manager or branch not found');

    let targetCustomer: Customer;
    if (customerId) {
      const found = customers.find((c) => c.id === customerId);
      if (!found) throw new Error('Customer not found');
      targetCustomer = found;
    } else if (customerData) {
      targetCustomer = createCustomer({
        name: customerData.name,
        mobileNumber: customerData.mobileNumber,
        whatsAppNumber: customerData.whatsAppNumber,
        email: customerData.email,
      });
    } else {
      throw new Error('Customer details required');
    }

    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    const staffMember = staffId ? staff.find((s) => s.id === staffId) : undefined;

    const now = new Date();
    const currentDateStr = now.toISOString().split('T')[0];
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isWalkIn = appointmentType === 'WALK_IN';
    const finalDate = isWalkIn ? currentDateStr : (appointmentDate || currentDateStr);
    const finalTime = isWalkIn ? currentTimeStr : (appointmentTime || currentTimeStr);

    const branchPrefix = currentBranch.id === 'branch-ecil' ? 'ECIL' : 'NAG';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const visitReference = `BODE-${branchPrefix}-${now.getFullYear()}-${randNum}`;

    const initialServiceEntry: VisitServiceEntry = {
      id: `vs-${Date.now().toString(36)}`,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      durationMinutes,
      originalPrice: price,
      finalPrice: price,
      status: isWalkIn ? 'IN_PROGRESS' : 'ADDED',
      staffId: staffMember?.id,
      staffName: staffMember?.name,
      startTime: isWalkIn ? currentTimeStr : undefined,
      isAdditionalService: false,
      notes: notes,
    };

    const newVisit: CustomerVisit = {
      id: `vis-${Date.now().toString(36)}`,
      visitReference,
      branchId: currentBranch.id,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      customerMobile: targetCustomer.mobileNumber,
      customerWhatsApp: targetCustomer.whatsAppNumber,
      customerEmail: targetCustomer.email,
      source: 'MANAGER',
      visitStatus: isWalkIn ? 'IN_PROGRESS' : 'SCHEDULED',
      appointmentDate: finalDate,
      appointmentTime: finalTime,
      onlineAdvancePaid: 0, // Walk-ins and manager-created appointments do not have ₹99 online fee
      isOnlineAdvanceCredited: false,
      services: [initialServiceEntry],
      payments: [],
      paymentStatus: 'UNPAID',
      createdAt: `${currentDateStr} ${currentTimeStr}`,
      checkedInAt: isWalkIn ? `${currentDateStr} ${currentTimeStr}` : undefined,
      notes: notes,
    };

    // Update customer visit count
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === targetCustomer.id
          ? {
              ...c,
              totalVisits: c.totalVisits + 1,
              lastVisitDate: finalDate,
              lastService: service.name,
            }
          : c
      )
    );

    // Update staff availability if assigned and starting immediately
    if (staffMember && isWalkIn) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === staffMember.id
            ? {
                ...s,
                availability: 'IN_SERVICE',
                currentAssignedService: `${service.name} (${durationMinutes} min)`,
                currentCustomerName: targetCustomer.name,
              }
            : s
        )
      );
    }

    setVisits((prev) => [newVisit, ...prev]);
    return newVisit;
  };

  const checkInCustomer = (visitId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              visitStatus: 'CHECKED_IN',
              checkedInAt: `${v.appointmentDate} ${timeStr}`,
            }
          : v
      )
    );
  };

  const startServiceSession = (visitId: string, serviceEntryId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const updatedServices = v.services.map((s) =>
          s.id === serviceEntryId ? { ...s, status: 'IN_PROGRESS' as const, startTime: s.startTime || timeStr } : s
        );
        return {
          ...v,
          visitStatus: 'IN_PROGRESS',
          services: updatedServices,
        };
      })
    );
  };

  const addAdditionalService = (
    visitId: string,
    params: {
      serviceId: string;
      serviceName: string;
      category: string;
      durationMinutes: number;
      price: number;
      staffId?: string;
      notes?: string;
      startImmediately?: boolean;
    }
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const staffMember = params.staffId ? staff.find((s) => s.id === params.staffId) : undefined;

    const newServiceEntry: VisitServiceEntry = {
      id: `vs-add-${Date.now().toString(36)}`,
      serviceId: params.serviceId,
      serviceName: params.serviceName,
      category: params.category,
      durationMinutes: params.durationMinutes,
      originalPrice: params.price,
      finalPrice: params.price,
      status: params.startImmediately ? 'IN_PROGRESS' : 'ADDED',
      staffId: staffMember?.id,
      staffName: staffMember?.name,
      startTime: params.startImmediately ? timeStr : undefined,
      isAdditionalService: true,
      notes: params.notes,
    };

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        return {
          ...v,
          services: [...v.services, newServiceEntry],
        };
      })
    );

    if (staffMember && params.startImmediately) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === staffMember.id
            ? {
                ...s,
                availability: 'IN_SERVICE',
                currentAssignedService: `${params.serviceName} (${params.durationMinutes} min)`,
              }
            : s
        )
      );
    }
  };

  const completeIndividualService = (visitId: string, serviceEntryId: string, notes?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const targetService = v.services.find((s) => s.id === serviceEntryId);
        if (targetService?.staffId) {
          // Free up the staff therapist
          setStaff((sPrev) =>
            sPrev.map((stf) =>
              stf.id === targetService.staffId
                ? { ...stf, availability: 'AVAILABLE', currentAssignedService: undefined, currentCustomerName: undefined }
                : stf
            )
          );
        }

        const updatedServices = v.services.map((s) =>
          s.id === serviceEntryId
            ? {
                ...s,
                status: 'COMPLETED' as const,
                completedTime: timeStr,
                notes: notes ? (s.notes ? `${s.notes} | ${notes}` : notes) : s.notes,
              }
            : s
        );

        return {
          ...v,
          services: updatedServices,
        };
      })
    );
  };

  const applyServiceDiscount = (
    visitId: string,
    serviceEntryId: string,
    discount: { type: DiscountType; value: number; reason?: string }
  ) => {
    if (!currentManager) return;
    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const updatedServices = v.services.map((s) => {
          if (s.id !== serviceEntryId) return s;

          let discountAmount = 0;
          if (discount.type === 'FIXED') {
            discountAmount = Math.min(s.originalPrice, Math.max(0, discount.value));
          } else {
            // Percentage
            const pct = Math.min(100, Math.max(0, discount.value));
            discountAmount = Math.round((s.originalPrice * pct) / 100);
          }

          const finalPrice = Math.max(0, s.originalPrice - discountAmount);

          const discountRecord: ServiceDiscount = {
            type: discount.type,
            value: discount.value,
            discountAmount,
            reason: discount.reason || 'Manager Courtesy',
            appliedByManager: currentManager.name,
            appliedAt: timestampStr,
          };

          return {
            ...s,
            discount: discountRecord,
            finalPrice,
          };
        });

        return {
          ...v,
          services: updatedServices,
        };
      })
    );
  };

  const removeServiceDiscount = (visitId: string, serviceEntryId: string) => {
    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const updatedServices = v.services.map((s) => {
          if (s.id !== serviceEntryId) return s;
          return {
            ...s,
            discount: undefined,
            finalPrice: s.originalPrice,
          };
        });
        return {
          ...v,
          services: updatedServices,
        };
      })
    );
  };

  const completeCustomerVisit = (visitId: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        return {
          ...v,
          visitStatus: 'COMPLETED',
          completedAt: timeStr,
        };
      })
    );
  };

  const generateInvoice = (visitId: string): InvoiceRecord => {
    const visit = visits.find((v) => v.id === visitId);
    if (!visit || !currentBranch) throw new Error('Visit not found');

    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const subtotal = visit.services.reduce((acc, s) => acc + s.originalPrice, 0);
    const totalDiscount = visit.services.reduce((acc, s) => acc + (s.discount?.discountAmount || 0), 0);
    const discountedSubtotal = Math.max(0, subtotal - totalDiscount);

    // Standard 18% GST (9% CGST + 9% SGST)
    const taxRatePercent = 18;
    const taxAmount = Math.round((discountedSubtotal * taxRatePercent) / 100);
    const finalAmount = discountedSubtotal + taxAmount;

    // Credit online booking advance: exactly ₹99 for website bookings, 0 for walk-ins
    const onlineAdvanceCredit = visit.source === 'WEBSITE' ? (visit.onlineAdvancePaid || 99) : 0;

    const alreadyPaidThroughTransactions = visit.payments.reduce((acc, p) => acc + p.amount, 0);
    const totalRecordedCredit = onlineAdvanceCredit + alreadyPaidThroughTransactions;
    const outstandingBalance = Math.max(0, finalAmount - totalRecordedCredit);

    const branchPrefix = currentBranch.id === 'branch-ecil' ? 'ECIL' : 'NAG';
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = visit.invoice?.invoiceNumber || `INV-${branchPrefix}-${now.getFullYear()}-${randSeq}`;

    const newInvoice: InvoiceRecord = {
      invoiceNumber,
      generatedAt: timestampStr,
      subtotal,
      totalDiscount,
      taxRatePercent,
      taxAmount,
      finalAmount,
      onlineAdvanceCredit,
      paidAmount: totalRecordedCredit,
      outstandingBalance,
      status: 'GENERATED',
      whatsAppStatus: visit.invoice?.whatsAppStatus || 'NOT_SENT',
      whatsAppSentTimestamp: visit.invoice?.whatsAppSentTimestamp,
    };

    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              invoice: newInvoice,
              isOnlineAdvanceCredited: onlineAdvanceCredit > 0,
              paymentStatus: outstandingBalance <= 0 ? 'FULLY_PAID' : totalRecordedCredit > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
            }
          : v
      )
    );

    return newInvoice;
  };

  const createService = (srv: Omit<ServiceItem, 'id'>): ServiceItem => {
    const newSrv: ServiceItem = {
      ...srv,
      id: `srv-${Date.now().toString(36)}`,
    };
    setServices((prev) => [...prev, newSrv]);
    return newSrv;
  };

  const updateService = (srvId: string, updates: Partial<ServiceItem>) => {
    setServices((prev) => prev.map((s) => (s.id === srvId ? { ...s, ...updates } : s)));
  };

  const cancelCustomerVisit = (visitId: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              visitStatus: 'CANCELLED',
              services: v.services.map((s) =>
                s.status === 'COMPLETED' ? s : { ...s, status: 'CANCELLED' }
              ),
            }
          : v
      )
    );
  };

  const updateWhatsAppStatus = (
    visitId: string,
    status: 'LINK_OPENED' | 'DELIVERED_CONFIRMED' | 'FAILED',
    details?: string
  ) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId || !v.invoice) return v;

        const updatedInvoice: InvoiceRecord = {
          ...v.invoice,
          whatsAppStatus: status,
          whatsAppSentTimestamp: timeStr,
          whatsAppDeliveryDetails: details || (status === 'DELIVERED_CONFIRMED' ? 'Confirmed delivered to recipient WhatsApp via BODE Gateway' : 'WhatsApp sharing link opened on manager device'),
          status: status === 'DELIVERED_CONFIRMED' ? 'SENT_CONFIRMED' : 'WHATSAPP_SHARING_INITIATED',
        };

        return {
          ...v,
          invoice: updatedInvoice,
        };
      })
    );
  };

  const recordPayment = (
    visitId: string,
    payment: {
      amount: number;
      method: PaymentMethod;
      transactionReference?: string;
      notes?: string;
    }
  ): PaymentTransaction => {
    if (!currentManager) throw new Error('Not authenticated');
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const receiptNumber = `REC-${Date.now().toString(36).toUpperCase()}`;

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now().toString(36)}`,
      receiptNumber,
      amount: payment.amount,
      method: payment.method,
      transactionReference: payment.transactionReference,
      timestamp: timeStr,
      recordedByManager: currentManager.name,
      notes: payment.notes,
    };

    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        const allPayments = [...v.payments, newTx];
        const totalPaid = allPayments.reduce((acc, p) => acc + p.amount, 0) + (v.invoice?.onlineAdvanceCredit || 0);

        const invoiceTotal = v.invoice ? v.invoice.finalAmount : v.services.reduce((acc, s) => acc + s.finalPrice, 0);
        const outstanding = Math.max(0, invoiceTotal - totalPaid);

        let newPaymentStatus: CustomerVisit['paymentStatus'] = 'UNPAID';
        if (outstanding <= 0) {
          newPaymentStatus = 'FULLY_PAID';
        } else if (totalPaid > 0) {
          newPaymentStatus = 'PARTIALLY_PAID';
        }

        const updatedInvoice: InvoiceRecord | undefined = v.invoice
          ? {
              ...v.invoice,
              paidAmount: totalPaid,
              outstandingBalance: outstanding,
            }
          : undefined;

        return {
          ...v,
          payments: allPayments,
          paymentStatus: newPaymentStatus,
          invoice: updatedInvoice,
        };
      })
    );

    return newTx;
  };

  // ─── POS Order Actions ──────────────────────────────────────────────────────

  const createPosOrder = (orderData: Omit<POSOrder, 'id' | 'orderReference' | 'createdAt'>): POSOrder => {
    if (!currentBranch) throw new Error('No branch');
    const now = new Date();
    const branchPrefix = currentBranch.id === 'branch-ecil' ? 'ECIL' : 'NAG';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: POSOrder = {
      ...orderData,
      id: `pos-${Date.now().toString(36)}`,
      orderReference: `ORD-${branchPrefix}-${now.getFullYear()}-${randNum}`,
      createdAt: `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
    setPosOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updatePosOrderStatus = (orderId: string, status: POSOrder['orderStatus']) => {
    setPosOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
  };

  // ─── Service Category Actions ───────────────────────────────────────────────

  const createCategory = (cat: Omit<ServiceCategoryRecord, 'id'>): ServiceCategoryRecord => {
    const newCat: ServiceCategoryRecord = {
      id: `cat-${Date.now().toString(36)}`,
      ...cat,
    };
    setServiceCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (catId: string, updates: Partial<ServiceCategoryRecord>) => {
    setServiceCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updates } : c))
    );
  };

  // ─── Staff Management ───────────────────────────────────────────────────────

  const createStaff = (staffData: Omit<StaffMember, 'id'>): StaffMember => {
    const newMember: StaffMember = {
      id: `staff-${Date.now().toString(36)}`,
      ...staffData,
    };
    setStaff((prev) => [newMember, ...prev]);
    return newMember;
  };

  const updateStaff = (staffId: string, updates: Partial<StaffMember>) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, ...updates } : s))
    );
  };

  // ─── Reset ──────────────────────────────────────────────────────────────────

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEYS.VISITS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.POS_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.STAFF_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    setVisits(INITIAL_VISITS);
    setCustomers(INITIAL_CUSTOMERS);
    setStaff(INITIAL_STAFF);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPosOrders(INITIAL_POS_ORDERS);
    setServiceCategories(SERVICE_CATEGORIES);
    setServices(SERVICES_CATALOGUE);
  };

  return (
    <AppContext.Provider
      value={{
        currentManager,
        currentBranch,
        login,
        logout,
        switchDemoManager,
        switchBranch,
        getAuthorizedBranches,
        visits,
        branchVisits,
        customers,
        branchCustomers,
        staff,
        branchStaff,
        services,
        branchServices,
        notifications,
        markNotificationRead,
        posOrders,
        branchPosOrders,
        createPosOrder,
        updatePosOrderStatus,
        serviceCategories,
        createCategory,
        updateCategory,
        createService,
        updateService,
        findCustomerByPhone,
        createCustomer,
        updateCustomer,
        assignStaffToService,
        createServiceVisit,
        checkInCustomer,
        startServiceSession,
        addAdditionalService,
        completeIndividualService,
        applyServiceDiscount,
        removeServiceDiscount,
        completeCustomerVisit,
        cancelCustomerVisit,
        generateInvoice,
        updateWhatsAppStatus,
        recordPayment,
        createStaff,
        updateStaff,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export default AppContext;

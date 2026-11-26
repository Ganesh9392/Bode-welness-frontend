import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  CampaignRecord,
  CampaignStatus,
  CampaignType,
  CampaignMetrics,
  CampaignActivityItem,
  ExpenseRecord,
  ExpenseStatus,
  ExpenseCategory,
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
  INITIAL_CAMPAIGNS,
  INITIAL_EXPENSES,
} from '../data/mockData';

interface AppContextType {
  // Auth
  currentManager: ManagerUser | null;
  currentBranch: Branch | null;
  selectedBranchId: BranchId | null;
  lastUsedBranchId: BranchId | null;
  isAuthLoading: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;
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
    customerData?: {
      name: string;
      mobileNumber: string;
      whatsAppNumber: string;
      email?: string;
      gender?: 'Male' | 'Female' | 'Other';
      dateOfBirth?: string;
    };
    serviceId: string;
    durationMinutes: number;
    price: number;
    appointmentType: 'WALK_IN' | 'SCHEDULED';
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentTimeTo?: string;
    staffId?: string;
    notes?: string;
    additionalServices?: Array<{
      serviceId: string;
      serviceName?: string;
      category?: string;
      durationMinutes: number;
      price: number;
      staffId?: string;
      staffName?: string;
      startTime?: string;
      notes?: string;
    }>;
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
  // Campaigns
  campaigns: CampaignRecord[];
  branchCampaigns: CampaignRecord[];
  createCampaign: (campaignData: Omit<CampaignRecord, 'id' | 'campaignReference' | 'branchId' | 'createdAt' | 'metrics' | 'activityLog'> & {
    metrics?: Partial<CampaignMetrics>;
    activityLog?: CampaignActivityItem[];
    branchId?: BranchId;
  }) => CampaignRecord;
  updateCampaign: (campaignId: string, updates: Partial<CampaignRecord>) => CampaignRecord | undefined;
  updateCampaignStatus: (campaignId: string, status: CampaignStatus) => void;
  duplicateCampaign: (campaignId: string) => CampaignRecord | undefined;
  deleteCampaign: (campaignId: string) => void;

  // Expenses
  expenses: ExpenseRecord[];
  branchExpenses: ExpenseRecord[];
  createExpense: (expenseData: Omit<ExpenseRecord, 'id' | 'expenseReference' | 'branchId' | 'createdAt' | 'createdByManager'> & {
    branchId?: BranchId;
    createdByManager?: string;
  }) => ExpenseRecord;
  updateExpense: (expenseId: string, updates: Partial<ExpenseRecord>) => ExpenseRecord | undefined;
  updateExpenseStatus: (expenseId: string, status: ExpenseStatus) => void;
  deleteExpense: (expenseId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH_SESSION: 'bode_spa_session_v2',
  LEGACY_AUTH_USER: 'bode_spa_auth_user_v1',
  LEGACY_BRANCH_CONFIRMED: 'bode_branch_confirmed_v1',
  LAST_BRANCH_MAP: 'bode_spa_last_branch_by_user_v1',
  VISITS: 'bode_spa_visits_v2',
  CUSTOMERS: 'bode_spa_customers_v2',
  STAFF: 'bode_spa_staff_v3',
  NOTIFICATIONS: 'bode_spa_notifications_v2',
  POS_ORDERS: 'bode_spa_pos_orders_v1',
  STAFF_CATEGORIES: 'bode_spa_service_categories_v1',
  SERVICES: 'bode_spa_services_v1',
  CAMPAIGNS: 'bode_spa_campaigns_v1',
  EXPENSES: 'bode_spa_expenses_v1',
};

interface AuthSession {
  version: 2;
  token: string;
  userId: string;
  user: ManagerUser;
  selectedBranchId: BranchId | null;
  remember: boolean;
  issuedAt: number;
  expiresAt: number;
}

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const SESSION_REMEMBER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function createSessionToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `bode_sess_${crypto.randomUUID()}`;
  }
  return `bode_sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function clearStoredSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_AUTH_USER);
  } catch {}
  try {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.LEGACY_AUTH_USER);
    sessionStorage.removeItem(STORAGE_KEYS.LEGACY_BRANCH_CONFIRMED);
  } catch {}
}

function persistSession(session: AuthSession): void {
  clearStoredSession();
  const serialized = JSON.stringify(session);
  try {
    if (session.remember) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, serialized);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, serialized);
    }
  } catch {}
}

function readStoredSession(): { session: AuthSession | null; expiredOrInvalid: boolean } {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) || localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  } catch {
    return { session: null, expiredOrInvalid: false };
  }

  // Clean up legacy unvalidated auth keys from prior deployments
  if (!raw) {
    let hadLegacy = false;
    try {
      hadLegacy = Boolean(
        localStorage.getItem(STORAGE_KEYS.LEGACY_AUTH_USER) ||
          sessionStorage.getItem(STORAGE_KEYS.LEGACY_AUTH_USER) ||
          sessionStorage.getItem(STORAGE_KEYS.LEGACY_BRANCH_CONFIRMED)
      );
    } catch {}
    if (hadLegacy) {
      clearStoredSession();
    }
    return { session: null, expiredOrInvalid: false };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      !parsed ||
      parsed.version !== 2 ||
      typeof parsed.token !== 'string' ||
      !parsed.token.startsWith('bode_sess_') ||
      typeof parsed.userId !== 'string' ||
      !parsed.user ||
      typeof parsed.expiresAt !== 'number'
    ) {
      clearStoredSession();
      return { session: null, expiredOrInvalid: true };
    }

    if (Date.now() > parsed.expiresAt) {
      clearStoredSession();
      return { session: null, expiredOrInvalid: true };
    }

    const matchedManager = MANAGERS.find((m) => m.id === parsed.userId);
    if (!matchedManager) {
      clearStoredSession();
      return { session: null, expiredOrInvalid: true };
    }

    const { passwordHash: _, ...cleanUser } = matchedManager;
    const authorizedIds = cleanUser.authorizedBranchIds || [cleanUser.branchId];
    const explicitBranchId =
      parsed.selectedBranchId &&
      authorizedIds.includes(parsed.selectedBranchId) &&
      BRANCHES.some((b) => b.id === parsed.selectedBranchId)
        ? parsed.selectedBranchId
        : null;
    const validBranchId =
      explicitBranchId ??
      (authorizedIds.length === 1 && BRANCHES.some((b) => b.id === authorizedIds[0])
        ? authorizedIds[0]
        : null);

    const syncedUser: ManagerUser = validBranchId
      ? {
          ...cleanUser,
          branchId: validBranchId,
          branchName: BRANCHES.find((b) => b.id === validBranchId)?.name || cleanUser.branchName,
        }
      : cleanUser;

    return {
      session: {
        version: 2,
        token: parsed.token,
        userId: cleanUser.id,
        user: syncedUser,
        selectedBranchId: validBranchId,
        remember: Boolean(parsed.remember),
        issuedAt: typeof parsed.issuedAt === 'number' ? parsed.issuedAt : Date.now(),
        expiresAt: parsed.expiresAt,
      },
      expiredOrInvalid: false,
    };
  } catch {
    clearStoredSession();
    return { session: null, expiredOrInvalid: true };
  }
}

function readLastUsedBranchMap(): Record<string, BranchId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_BRANCH_MAP);
    if (raw) return JSON.parse(raw) as Record<string, BranchId>;
  } catch {}
  return {};
}

function saveLastUsedBranch(userId: string, branchId: BranchId): void {
  try {
    const current = readLastUsedBranchMap();
    current[userId] = branchId;
    localStorage.setItem(STORAGE_KEYS.LAST_BRANCH_MAP, JSON.stringify(current));
  } catch {}
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentManager, setCurrentManager] = useState<ManagerUser | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionRemember, setSessionRemember] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [lastBranchMap, setLastBranchMap] = useState<Record<string, BranchId>>(() =>
    readLastUsedBranchMap()
  );

  // Validate persisted session on mount before showing any protected or login screen
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const { session, expiredOrInvalid } = readStoredSession();
      if (session) {
        setCurrentManager(session.user);
        setSelectedBranchId(session.selectedBranchId);
        setSessionExpiresAt(session.expiresAt);
        setSessionRemember(session.remember);
        setSessionToken(session.token);
        setAuthNotice(null);
      } else {
        setCurrentManager(null);
        setSelectedBranchId(null);
        setSessionExpiresAt(null);
        setSessionToken(null);
        if (expiredOrInvalid) {
          setAuthNotice('Session expired, please log in again');
        }
      }
      setIsAuthLoading(false);
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  // Monitor runtime session expiry
  useEffect(() => {
    if (!currentManager || !sessionExpiresAt) return;

    const checkExpiry = () => {
      if (Date.now() > sessionExpiresAt) {
        clearStoredSession();
        setCurrentManager(null);
        setSelectedBranchId(null);
        setSessionExpiresAt(null);
        setSessionToken(null);
        setAuthNotice('Session expired, please log in again');
      }
    };

    const interval = window.setInterval(checkExpiry, 15000);
    window.addEventListener('focus', checkExpiry);
    document.addEventListener('visibilitychange', checkExpiry);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkExpiry);
      document.removeEventListener('visibilitychange', checkExpiry);
    };
  }, [currentManager, sessionExpiresAt]);

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


  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CAMPAIGNS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_EXPENSES;
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


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {}
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {}
  }, [expenses]);
  // Current branch determined strictly by the authenticated manager + selected branch
  const currentBranch = useMemo<Branch | null>(() => {
    if (!currentManager || !selectedBranchId) return null;
    const authorized = currentManager.authorizedBranchIds || [currentManager.branchId];
    if (!authorized.includes(selectedBranchId)) return null;
    return BRANCHES.find((b) => b.id === selectedBranchId) || null;
  }, [currentManager, selectedBranchId]);

  const lastUsedBranchId = useMemo<BranchId | null>(() => {
    if (!currentManager) return null;
    const candidate = lastBranchMap[currentManager.id];
    if (!candidate) return null;
    const authorized = currentManager.authorizedBranchIds || [currentManager.branchId];
    return authorized.includes(candidate) && BRANCHES.some((b) => b.id === candidate)
      ? candidate
      : null;
  }, [currentManager, lastBranchMap]);

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


  const branchCampaigns = useMemo(() => {
    if (!currentBranch) return [];
    return campaigns.filter((c) => c.branchId === currentBranch.id);
  }, [campaigns, currentBranch]);

  const branchExpenses = useMemo(() => {
    if (!currentBranch) return [];
    return expenses.filter((e) => e.branchId === currentBranch.id);
  }, [expenses, currentBranch]);
  // ─── Authentication Handlers ────────────────────────────────────────────────

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  const login = (username: string, password: string, remember: boolean = true) => {
    const trimmedUser = username.trim().toLowerCase();
    const found = MANAGERS.find(
      (m) => (m.username.toLowerCase() === trimmedUser || m.email.toLowerCase() === trimmedUser) && m.passwordHash === password
    );

    if (found) {
      const { passwordHash, ...baseUser } = found;
      const authorizedIds = baseUser.authorizedBranchIds || [baseUser.branchId];
      const authorizedBranches = BRANCHES.filter((b) => authorizedIds.includes(b.id));
      const autoBranch = authorizedBranches.length === 1 ? authorizedBranches[0] : null;

      const user: ManagerUser = autoBranch
        ? { ...baseUser, branchId: autoBranch.id, branchName: autoBranch.name }
        : baseUser;

      const now = Date.now();
      const expiresAt = now + (remember ? SESSION_REMEMBER_TTL_MS : SESSION_TTL_MS);
      const token = createSessionToken();
      const nextSelectedBranchId = autoBranch ? autoBranch.id : null;

      const session: AuthSession = {
        version: 2,
        token,
        userId: user.id,
        user,
        selectedBranchId: nextSelectedBranchId,
        remember,
        issuedAt: now,
        expiresAt,
      };

      persistSession(session);
      setCurrentManager(user);
      setSelectedBranchId(nextSelectedBranchId);
      setSessionExpiresAt(expiresAt);
      setSessionRemember(remember);
      setSessionToken(token);
      setAuthNotice(null);

      if (autoBranch) {
        saveLastUsedBranch(user.id, autoBranch.id);
        setLastBranchMap((prev) => ({ ...prev, [user.id]: autoBranch.id }));
      }

      return { success: true };
    }
    return {
      success: false,
      message: 'Invalid credentials. Please verify your username and password.',
    };
  };

  const logout = () => {
    clearStoredSession();
    setCurrentManager(null);
    setSelectedBranchId(null);
    setSessionExpiresAt(null);
    setSessionRemember(false);
    setSessionToken(null);
    setAuthNotice(null);
  };

  const switchDemoManager = (username: string) => {
    const found = MANAGERS.find((m) => m.username === username);
    if (found) {
      const { passwordHash, ...user } = found;
      const authorizedIds = user.authorizedBranchIds || [user.branchId];
      const authorizedBranches = BRANCHES.filter((b) => authorizedIds.includes(b.id));
      const autoBranch = authorizedBranches.length === 1 ? authorizedBranches[0] : null;
      const now = Date.now();
      const expiresAt = now + SESSION_TTL_MS;
      const token = createSessionToken();
      const nextSelectedBranchId = autoBranch ? autoBranch.id : null;
      const nextUser = autoBranch
        ? { ...user, branchId: autoBranch.id, branchName: autoBranch.name }
        : user;

      persistSession({
        version: 2,
        token,
        userId: nextUser.id,
        user: nextUser,
        selectedBranchId: nextSelectedBranchId,
        remember: true,
        issuedAt: now,
        expiresAt,
      });

      setCurrentManager(nextUser);
      setSelectedBranchId(nextSelectedBranchId);
      setSessionExpiresAt(expiresAt);
      setSessionRemember(true);
      setSessionToken(token);
      setAuthNotice(null);
    }
  };

  const switchBranch = useCallback((branchId: BranchId) => {
    if (!currentManager) return;
    const authorized = currentManager.authorizedBranchIds || [currentManager.branchId];
    if (!authorized.includes(branchId)) return;
    const branch = BRANCHES.find((b) => b.id === branchId);
    if (!branch) return;
    const updated = { ...currentManager, branchId, branchName: branch.name };
    setCurrentManager(updated);
    setSelectedBranchId(branchId);

    saveLastUsedBranch(updated.id, branchId);
    setLastBranchMap((prev) => ({ ...prev, [updated.id]: branchId }));

    if (sessionToken && sessionExpiresAt) {
      persistSession({
        version: 2,
        token: sessionToken,
        userId: updated.id,
        user: updated,
        selectedBranchId: branchId,
        remember: sessionRemember,
        issuedAt: Date.now(),
        expiresAt: sessionExpiresAt,
      });
    }
  }, [currentManager, sessionToken, sessionExpiresAt, sessionRemember]);

  const getAuthorizedBranches = useCallback((): Branch[] => {
    if (!currentManager) return [];
    const ids = currentManager.authorizedBranchIds || [currentManager.branchId];
    return BRANCHES.filter((b) => ids.includes(b.id));
  }, [currentManager]);

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
    appointmentTimeTo,
    staffId,
    notes,
    additionalServices,
  }: {
    customerId?: string;
    customerData?: {
      name: string;
      mobileNumber: string;
      whatsAppNumber: string;
      email?: string;
      gender?: 'Male' | 'Female' | 'Other';
      dateOfBirth?: string;
    };
    serviceId: string;
    durationMinutes: number;
    price: number;
    appointmentType: 'WALK_IN' | 'SCHEDULED';
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentTimeTo?: string;
    staffId?: string;
    notes?: string;
    additionalServices?: Array<{
      serviceId: string;
      serviceName?: string;
      category?: string;
      durationMinutes: number;
      price: number;
      staffId?: string;
      staffName?: string;
      startTime?: string;
      notes?: string;
    }>;
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
        gender: customerData.gender,
        dateOfBirth: customerData.dateOfBirth,
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
    const finalTime = isWalkIn ? (appointmentTime || currentTimeStr) : (appointmentTime || currentTimeStr);
    const finalTimeTo = appointmentTimeTo;

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
      startTime: isWalkIn ? finalTime : undefined,
      isAdditionalService: false,
      notes: notes,
    };

    const additionalEntries: VisitServiceEntry[] = (additionalServices || []).map((extra, idx) => {
      const extraService = services.find((s) => s.id === extra.serviceId);
      const extraStaff = extra.staffId ? staff.find((s) => s.id === extra.staffId) : undefined;
      return {
        id: `vs-add-${Date.now().toString(36)}-${idx}`,
        serviceId: extra.serviceId,
        serviceName: extra.serviceName || extraService?.name || 'Additional Service',
        category: extra.category || extraService?.category || 'Treatment',
        durationMinutes: extra.durationMinutes,
        originalPrice: extra.price,
        finalPrice: extra.price,
        status: isWalkIn ? 'IN_PROGRESS' : 'ADDED',
        staffId: extraStaff?.id,
        staffName: extraStaff?.name,
        startTime: extra.startTime || (isWalkIn ? finalTime : undefined),
        isAdditionalService: true,
        notes: extra.notes,
      };
    });

    const newVisit: CustomerVisit = {
      id: `vis-${Date.now().toString(36)}`,
      visitReference,
      branchId: currentBranch.id,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      customerMobile: targetCustomer.mobileNumber,
      customerWhatsApp: targetCustomer.whatsAppNumber,
      customerEmail: targetCustomer.email,
      customerGender: targetCustomer.gender,
      customerDob: targetCustomer.dateOfBirth,
      source: 'MANAGER',
      visitStatus: isWalkIn ? 'IN_PROGRESS' : 'SCHEDULED',
      appointmentDate: finalDate,
      appointmentTime: finalTime,
      appointmentTimeTo: finalTimeTo,
      onlineAdvancePaid: 0, // Walk-ins and manager-created appointments do not have ₹99 online fee
      isOnlineAdvanceCredited: false,
      services: [initialServiceEntry, ...additionalEntries],
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


  // ─── Campaigns Management ───────────────────────────────────────────────────

  const createCampaign = (
    campaignData: Omit<CampaignRecord, 'id' | 'campaignReference' | 'branchId' | 'createdAt' | 'metrics' | 'activityLog'> & {
      metrics?: Partial<CampaignMetrics>;
      activityLog?: CampaignActivityItem[];
      branchId?: BranchId;
    }
  ): CampaignRecord => {
    const branch = campaignData.branchId || currentBranch?.id || 'branch-ecil';
    const serial = String(campaigns.length + 101).padStart(3, '0');
    const branchPrefix = branch === 'branch-nagole' ? 'NAG' : 'ECIL';
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const defaultMetrics: CampaignMetrics = {
      reach: 0,
      impressions: 0,
      clicks: 0,
      engagement: 0,
      leadsGenerated: 0,
      bookingsCount: 0,
      conversions: 0,
      conversionRate: 0,
      amountSpent: 0,
      revenueGenerated: 0,
      roiPercent: 0,
      ...campaignData.metrics,
    };

    const initialActivity: CampaignActivityItem[] = campaignData.activityLog || [
      {
        id: `act-${Date.now().toString(36)}`,
        action: 'Campaign Created',
        timestamp: `${dateStr} ${timeStr}`,
        detail: `Created as ${campaignData.status || 'DRAFT'}`,
        performedBy: currentManager?.name || 'Manager',
      },
    ];

    const newCampaign: CampaignRecord = {
      ...campaignData,
      id: `cmp-${Date.now().toString(36)}`,
      campaignReference: `CMP-${branchPrefix}-${now.getFullYear()}-${serial}`,
      branchId: branch,
      status: campaignData.status || 'DRAFT',
      metrics: defaultMetrics,
      activityLog: initialActivity,
      createdAt: `${dateStr} ${timeStr}`,
      createdByManager: currentManager?.name || 'Manager',
    };

    setCampaigns((prev) => [newCampaign, ...prev]);
    return newCampaign;
  };

  const updateCampaign = (campaignId: string, updates: Partial<CampaignRecord>): CampaignRecord | undefined => {
    let updatedRecord: CampaignRecord | undefined;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          updatedRecord = {
            ...c,
            ...updates,
            updatedAt: `${dateStr} ${timeStr}`,
          };
          return updatedRecord;
        }
        return c;
      })
    );
    return updatedRecord;
  };

  const updateCampaignStatus = (campaignId: string, status: CampaignStatus) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const newAct: CampaignActivityItem = {
            id: `act-${Date.now().toString(36)}`,
            action: `Status changed to ${status}`,
            timestamp: `${dateStr} ${timeStr}`,
            performedBy: currentManager?.name || 'Manager',
          };
          return {
            ...c,
            status,
            updatedAt: `${dateStr} ${timeStr}`,
            activityLog: [newAct, ...(c.activityLog || [])],
          };
        }
        return c;
      })
    );
  };

  const duplicateCampaign = (campaignId: string): CampaignRecord | undefined => {
    const target = campaigns.find((c) => c.id === campaignId);
    if (!target) return undefined;

    const branchPrefix = target.branchId === 'branch-nagole' ? 'NAG' : 'ECIL';
    const serial = String(campaigns.length + 101).padStart(3, '0');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const duplicate: CampaignRecord = {
      ...target,
      id: `cmp-${Date.now().toString(36)}`,
      campaignReference: `CMP-${branchPrefix}-${now.getFullYear()}-${serial}`,
      name: `${target.name} (Copy)`,
      status: 'DRAFT',
      metrics: {
        reach: 0,
        impressions: 0,
        clicks: 0,
        engagement: 0,
        leadsGenerated: 0,
        bookingsCount: 0,
        conversions: 0,
        conversionRate: 0,
        amountSpent: 0,
        revenueGenerated: 0,
        roiPercent: 0,
      },
      activityLog: [
        {
          id: `act-${Date.now().toString(36)}`,
          action: 'Campaign Duplicated',
          timestamp: `${dateStr} ${timeStr}`,
          detail: `Duplicated from ${target.campaignReference}`,
          performedBy: currentManager?.name || 'Manager',
        },
      ],
      createdAt: `${dateStr} ${timeStr}`,
      updatedAt: undefined,
    };

    setCampaigns((prev) => [duplicate, ...prev]);
    return duplicate;
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  };

  // ─── Expenses Management ────────────────────────────────────────────────────

  const createExpense = (
    expenseData: Omit<ExpenseRecord, 'id' | 'expenseReference' | 'branchId' | 'createdAt' | 'createdByManager'> & {
      branchId?: BranchId;
      createdByManager?: string;
    }
  ): ExpenseRecord => {
    const branch = expenseData.branchId || currentBranch?.id || 'branch-ecil';
    const serial = String(expenses.length + 101).padStart(3, '0');
    const branchPrefix = branch === 'branch-nagole' ? 'NAG' : 'ECIL';
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now().toString(36)}`,
      expenseReference: `EXP-${branchPrefix}-${now.getFullYear()}-${serial}`,
      branchId: branch,
      status: expenseData.status || 'PENDING',
      createdByManager: expenseData.createdByManager || currentManager?.name || 'Manager',
      createdAt: `${dateStr} ${timeStr}`,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = (expenseId: string, updates: Partial<ExpenseRecord>): ExpenseRecord | undefined => {
    let updatedRecord: ExpenseRecord | undefined;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === expenseId) {
          updatedRecord = {
            ...e,
            ...updates,
            updatedAt: `${dateStr} ${timeStr}`,
          };
          return updatedRecord;
        }
        return e;
      })
    );
    return updatedRecord;
  };

  const updateExpenseStatus = (expenseId: string, status: ExpenseStatus) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? { ...e, status, updatedAt: `${dateStr} ${timeStr}` }
          : e
      )
    );
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
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
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    setCampaigns(INITIAL_CAMPAIGNS);
    setExpenses(INITIAL_EXPENSES);
  };

  return (
    <AppContext.Provider
      value={{
        currentManager,
        currentBranch,
        selectedBranchId,
        lastUsedBranchId,
        isAuthLoading,
        authNotice,
        clearAuthNotice,
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
        campaigns,
        branchCampaigns,
        createCampaign,
        updateCampaign,
        updateCampaignStatus,
        duplicateCampaign,
        deleteCampaign,
        expenses,
        branchExpenses,
        createExpense,
        updateExpense,
        updateExpenseStatus,
        deleteExpense,
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

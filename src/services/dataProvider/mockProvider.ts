import { IDataProvider, LoginResponse } from './types';
import {
  Branch,
  BranchId,
  Customer,
  CustomerVisit,
  DiscountType,
  InvoiceRecord,
  ManagerUser,
  PaymentMethod,
  PaymentTransaction,
  POSOrder,
  ServiceCategoryRecord,
  ServiceItem,
  StaffMember,
  StaffShiftDay,
} from '../../types';
import {
  BRANCHES,
  MANAGERS,
  SERVICES_CATALOGUE,
  SERVICE_CATEGORIES,
  INITIAL_STAFF,
  INITIAL_CUSTOMERS,
  INITIAL_VISITS,
  INITIAL_POS_ORDERS,
} from '../../data/mockData';

const STORAGE_KEYS = {
  AUTH_USER: 'bode_spa_auth_user_v1',
  VISITS: 'bode_spa_visits_v2',
  CUSTOMERS: 'bode_spa_customers_v2',
  STAFF: 'bode_spa_staff_v2',
  POS_ORDERS: 'bode_spa_pos_orders_v1',
  CATEGORIES: 'bode_spa_service_categories_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore storage parse error
  }
  return fallback;
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage write error
  }
}

export class MockDataProvider implements IDataProvider {
  async login(username: string, password: string): Promise<LoginResponse> {
    const trimmed = username.trim().toLowerCase();
    const found = MANAGERS.find(
      (m) =>
        (m.username.toLowerCase() === trimmed || m.email.toLowerCase() === trimmed) &&
        m.passwordHash === password
    );
    if (!found) {
      return { success: false, message: 'Invalid username or password.' };
    }
    const { passwordHash: _, ...user } = found;
    writeStorage(STORAGE_KEYS.AUTH_USER, user);
    return { success: true, user };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  async getCurrentUser(): Promise<ManagerUser | null> {
    return readStorage<ManagerUser | null>(STORAGE_KEYS.AUTH_USER, null);
  }

  async getAuthorizedBranches(user: ManagerUser): Promise<Branch[]> {
    const ids = user.authorizedBranchIds || [user.branchId];
    return BRANCHES.filter((b) => ids.includes(b.id));
  }

  async getActiveBranch(branchId: BranchId): Promise<Branch | null> {
    return BRANCHES.find((b) => b.id === branchId) || null;
  }

  async switchBranch(user: ManagerUser, branchId: BranchId): Promise<{ user: ManagerUser; branch: Branch }> {
    const branch = BRANCHES.find((b) => b.id === branchId);
    if (!branch) throw new Error('Branch not found');
    const updatedUser: ManagerUser = { ...user, branchId, branchName: branch.name };
    writeStorage(STORAGE_KEYS.AUTH_USER, updatedUser);
    return { user: updatedUser, branch };
  }

  async getCustomers(branchId: BranchId): Promise<Customer[]> {
    const all = readStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return all.filter((c) => c.branchId === branchId);
  }

  async searchCustomers(branchId: BranchId, query: string): Promise<Customer[]> {
    const customers = await this.getCustomers(branchId);
    const q = query.trim().toLowerCase();
    if (q.length < 3) return [];
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobileNumber.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''))
    );
  }

  async createCustomer(
    branchId: BranchId,
    data: Omit<Customer, 'id' | 'branchId' | 'totalVisits' | 'registeredDate'>
  ): Promise<Customer> {
    const all = readStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const created: Customer = {
      id: `cust-${Date.now().toString(36)}`,
      branchId,
      totalVisits: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      ...data,
    };
    writeStorage(STORAGE_KEYS.CUSTOMERS, [created, ...all]);
    return created;
  }

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    const all = readStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    let updatedItem: Customer | undefined;
    const next = all.map((c) => {
      if (c.id === customerId) {
        updatedItem = { ...c, ...updates };
        return updatedItem;
      }
      return c;
    });
    if (!updatedItem) throw new Error('Customer not found');
    writeStorage(STORAGE_KEYS.CUSTOMERS, next);
    return updatedItem;
  }

  async getCategories(): Promise<ServiceCategoryRecord[]> {
    return readStorage<ServiceCategoryRecord[]>(STORAGE_KEYS.CATEGORIES, SERVICE_CATEGORIES);
  }

  async getServices(): Promise<ServiceItem[]> {
    return SERVICES_CATALOGUE;
  }

  async getBranchServices(branchId: BranchId): Promise<ServiceItem[]> {
    return SERVICES_CATALOGUE.filter((s) => s.branchAvailability.includes(branchId));
  }

  async getStaff(branchId: BranchId): Promise<StaffMember[]> {
    const all = readStorage<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    return all.filter((s) => s.branchId === branchId);
  }

  async getStaffShifts(staffId: string): Promise<StaffShiftDay[]> {
    const all = readStorage<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    return all.find((s) => s.id === staffId)?.shifts || [];
  }

  async updateStaff(staffId: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    const all = readStorage<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    let updatedStaff: StaffMember | undefined;
    const next = all.map((s) => {
      if (s.id === staffId) {
        updatedStaff = { ...s, ...updates };
        return updatedStaff;
      }
      return s;
    });
    if (!updatedStaff) throw new Error('Staff not found');
    writeStorage(STORAGE_KEYS.STAFF, next);
    return updatedStaff;
  }

  async updateShift(staffId: string, shifts: StaffShiftDay[]): Promise<StaffMember> {
    return this.updateStaff(staffId, { shifts });
  }

  async getVisits(branchId: BranchId): Promise<CustomerVisit[]> {
    const all = readStorage<CustomerVisit[]>(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    return all.filter((v) => v.branchId === branchId);
  }

  async createVisit(params: {
    branchId: BranchId;
    customerId: string;
    serviceId: string;
    durationMinutes: number;
    price: number;
    appointmentType: 'WALK_IN' | 'SCHEDULED';
    appointmentDate?: string;
    appointmentTime?: string;
    staffId?: string;
    notes?: string;
  }): Promise<CustomerVisit> {
    const allVisits = readStorage<CustomerVisit[]>(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    const allCustomers = readStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const customer = allCustomers.find((c) => c.id === params.customerId);
    const service = SERVICES_CATALOGUE.find((s) => s.id === params.serviceId);
    if (!customer || !service) throw new Error('Customer or service not found');

    const now = new Date();
    const dateStr = params.appointmentDate || now.toISOString().split('T')[0];
    const timeStr = params.appointmentTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const prefix = params.branchId === 'branch-ecil' ? 'ECIL' : 'NAG';

    const visit: CustomerVisit = {
      id: `vis-${Date.now().toString(36)}`,
      visitReference: `BODE-${prefix}-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      branchId: params.branchId,
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobileNumber,
      customerWhatsApp: customer.whatsAppNumber,
      customerEmail: customer.email,
      source: params.appointmentType === 'WALK_IN' ? 'WALK_IN' : 'MANAGER',
      visitStatus: params.appointmentType === 'WALK_IN' ? 'IN_PROGRESS' : 'SCHEDULED',
      appointmentDate: dateStr,
      appointmentTime: timeStr,
      onlineAdvancePaid: 0,
      isOnlineAdvanceCredited: false,
      services: [
        {
          id: `vs-${Date.now().toString(36)}`,
          serviceId: service.id,
          serviceName: service.name,
          category: service.category,
          durationMinutes: params.durationMinutes,
          originalPrice: params.price,
          finalPrice: params.price,
          status: params.appointmentType === 'WALK_IN' ? 'IN_PROGRESS' : 'ADDED',
          staffId: params.staffId,
          isAdditionalService: false,
          notes: params.notes,
        },
      ],
      payments: [],
      paymentStatus: 'UNPAID',
      createdAt: `${dateStr} ${timeStr}`,
      notes: params.notes,
    };

    writeStorage(STORAGE_KEYS.VISITS, [visit, ...allVisits]);
    return visit;
  }

  async assignStaff(visitId: string, serviceEntryId: string, staffId: string): Promise<void> {
    const allVisits = readStorage<CustomerVisit[]>(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    const allStaff = readStorage<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    const member = allStaff.find((s) => s.id === staffId);
    const next = allVisits.map((v) =>
      v.id === visitId
        ? {
            ...v,
            services: v.services.map((s) =>
              s.id === serviceEntryId ? { ...s, staffId, staffName: member?.name } : s
            ),
          }
        : v
    );
    writeStorage(STORAGE_KEYS.VISITS, next);
  }

  async rescheduleAppointment(visitId: string, date: string, time: string): Promise<void> {
    const allVisits = readStorage<CustomerVisit[]>(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    const next = allVisits.map((v) =>
      v.id === visitId ? { ...v, appointmentDate: date, appointmentTime: time } : v
    );
    writeStorage(STORAGE_KEYS.VISITS, next);
  }

  async cancelAppointment(visitId: string): Promise<void> {
    const allVisits = readStorage<CustomerVisit[]>(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    const next = allVisits.map((v) =>
      v.id === visitId ? { ...v, visitStatus: 'CANCELLED' as const } : v
    );
    writeStorage(STORAGE_KEYS.VISITS, next);
  }

  async getSales(branchId: BranchId): Promise<POSOrder[]> {
    const all = readStorage<POSOrder[]>(STORAGE_KEYS.POS_ORDERS, INITIAL_POS_ORDERS);
    return all.filter((o) => o.branchId === branchId);
  }

  async createSale(order: Omit<POSOrder, 'id' | 'orderReference' | 'createdAt'>): Promise<POSOrder> {
    const all = readStorage<POSOrder[]>(STORAGE_KEYS.POS_ORDERS, INITIAL_POS_ORDERS);
    const now = new Date();
    const prefix = order.branchId === 'branch-ecil' ? 'ECIL' : 'NAG';
    const created: POSOrder = {
      ...order,
      id: `pos-${Date.now().toString(36)}`,
      orderReference: `ORD-${prefix}-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
    writeStorage(STORAGE_KEYS.POS_ORDERS, [created, ...all]);
    return created;
  }

  async applyServiceDiscount(
    _visitId: string,
    _serviceEntryId: string,
    _discount: { type: DiscountType; value: number; reason?: string }
  ): Promise<void> {
    // Handled synchronously via AppContext state
  }

  async generateInvoice(_visitId: string): Promise<InvoiceRecord> {
    throw new Error('Use AppContext.generateInvoice in mock mode');
  }

  async recordPayment(
    _visitId: string,
    _payment: { amount: number; method: PaymentMethod; transactionReference?: string; notes?: string }
  ): Promise<PaymentTransaction> {
    throw new Error('Use AppContext.recordPayment in mock mode');
  }
}

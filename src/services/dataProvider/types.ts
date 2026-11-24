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

export interface LoginResponse {
  success: boolean;
  user?: ManagerUser;
  message?: string;
}

export interface IDataProvider {
  // Authentication
  login(username: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<ManagerUser | null>;

  // Branches
  getAuthorizedBranches(user: ManagerUser): Promise<Branch[]>;
  getActiveBranch(branchId: BranchId): Promise<Branch | null>;
  switchBranch(user: ManagerUser, branchId: BranchId): Promise<{ user: ManagerUser; branch: Branch }>;

  // Customers
  getCustomers(branchId: BranchId): Promise<Customer[]>;
  searchCustomers(branchId: BranchId, query: string): Promise<Customer[]>;
  createCustomer(branchId: BranchId, data: Omit<Customer, 'id' | 'branchId' | 'totalVisits' | 'registeredDate'>): Promise<Customer>;
  updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer>;

  // Services
  getCategories(): Promise<ServiceCategoryRecord[]>;
  getServices(): Promise<ServiceItem[]>;
  getBranchServices(branchId: BranchId): Promise<ServiceItem[]>;

  // Staff
  getStaff(branchId: BranchId): Promise<StaffMember[]>;
  getStaffShifts(staffId: string): Promise<StaffShiftDay[]>;
  updateStaff(staffId: string, updates: Partial<StaffMember>): Promise<StaffMember>;
  updateShift(staffId: string, shifts: StaffShiftDay[]): Promise<StaffMember>;

  // Appointments & Visits
  getVisits(branchId: BranchId): Promise<CustomerVisit[]>;
  createVisit(params: {
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
  }): Promise<CustomerVisit>;
  assignStaff(visitId: string, serviceEntryId: string, staffId: string): Promise<void>;
  rescheduleAppointment(visitId: string, date: string, time: string): Promise<void>;
  cancelAppointment(visitId: string): Promise<void>;

  // Sales / POS
  getSales(branchId: BranchId): Promise<POSOrder[]>;
  createSale(order: Omit<POSOrder, 'id' | 'orderReference' | 'createdAt'>): Promise<POSOrder>;

  // Service Execution & Billing
  applyServiceDiscount(visitId: string, serviceEntryId: string, discount: { type: DiscountType; value: number; reason?: string }): Promise<void>;
  generateInvoice(visitId: string): Promise<InvoiceRecord>;
  recordPayment(visitId: string, payment: { amount: number; method: PaymentMethod; transactionReference?: string; notes?: string }): Promise<PaymentTransaction>;
}

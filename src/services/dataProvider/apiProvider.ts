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
import { DATA_CONFIG } from '../../config/dataConfig';

/**
 * Future API Provider for BODE Wellness Spa Portal.
 * Enabled when VITE_DATA_SOURCE=api and VITE_API_BASE_URL is configured.
 * Does NOT silently fall back to mock data on failure.
 */
export class ApiDataProvider implements IDataProvider {
  private baseUrl: string;

  constructor(baseUrl: string = DATA_CONFIG.apiBaseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async request<T>(path: string, options: RequestInit = {}, branchId?: BranchId): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('VITE_API_BASE_URL is not configured for API mode.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(branchId ? { 'X-Branch-Id': branchId } : {}),
      ...(options.headers as Record<string, string> | undefined),
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  // POST /auth/login
  login(username: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // POST /auth/logout
  logout(): Promise<void> {
    return this.request<void>('/auth/logout', { method: 'POST' });
  }

  // GET /auth/me
  getCurrentUser(): Promise<ManagerUser | null> {
    return this.request<ManagerUser | null>('/auth/me');
  }

  // GET /branches/authorized
  getAuthorizedBranches(_user: ManagerUser): Promise<Branch[]> {
    return this.request<Branch[]>('/branches/authorized');
  }

  // GET /branches/:branchId
  getActiveBranch(branchId: BranchId): Promise<Branch | null> {
    return this.request<Branch | null>(`/branches/${branchId}`, {}, branchId);
  }

  // POST /branches/switch
  switchBranch(_user: ManagerUser, branchId: BranchId): Promise<{ user: ManagerUser; branch: Branch }> {
    return this.request<{ user: ManagerUser; branch: Branch }>('/branches/switch', {
      method: 'POST',
      body: JSON.stringify({ branchId }),
    }, branchId);
  }

  // GET /customers
  getCustomers(branchId: BranchId): Promise<Customer[]> {
    return this.request<Customer[]>(`/customers?branchId=${encodeURIComponent(branchId)}`, {}, branchId);
  }

  // GET /customers/search?q=
  searchCustomers(branchId: BranchId, query: string): Promise<Customer[]> {
    return this.request<Customer[]>(
      `/customers/search?branchId=${encodeURIComponent(branchId)}&q=${encodeURIComponent(query)}`,
      {},
      branchId
    );
  }

  // POST /customers
  createCustomer(
    branchId: BranchId,
    data: Omit<Customer, 'id' | 'branchId' | 'totalVisits' | 'registeredDate'>
  ): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify({ ...data, branchId }),
    }, branchId);
  }

  // PATCH /customers/:customerId
  updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // GET /service-categories
  getCategories(): Promise<ServiceCategoryRecord[]> {
    return this.request<ServiceCategoryRecord[]>('/service-categories');
  }

  // GET /services
  getServices(): Promise<ServiceItem[]> {
    return this.request<ServiceItem[]>('/services');
  }

  // GET /branches/:branchId/services
  getBranchServices(branchId: BranchId): Promise<ServiceItem[]> {
    return this.request<ServiceItem[]>(`/branches/${branchId}/services`, {}, branchId);
  }

  // GET /staff?branchId=
  getStaff(branchId: BranchId): Promise<StaffMember[]> {
    return this.request<StaffMember[]>(`/staff?branchId=${encodeURIComponent(branchId)}`, {}, branchId);
  }

  // GET /staff/:staffId/shifts
  getStaffShifts(staffId: string): Promise<StaffShiftDay[]> {
    return this.request<StaffShiftDay[]>(`/staff/${staffId}/shifts`);
  }

  // PATCH /staff/:staffId
  updateStaff(staffId: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    return this.request<StaffMember>(`/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // PUT /staff/:staffId/shifts
  updateShift(staffId: string, shifts: StaffShiftDay[]): Promise<StaffMember> {
    return this.request<StaffMember>(`/staff/${staffId}/shifts`, {
      method: 'PUT',
      body: JSON.stringify({ shifts }),
    });
  }

  // GET /visits?branchId=
  getVisits(branchId: BranchId): Promise<CustomerVisit[]> {
    return this.request<CustomerVisit[]>(`/visits?branchId=${encodeURIComponent(branchId)}`, {}, branchId);
  }

  // POST /visits
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
  }): Promise<CustomerVisit> {
    return this.request<CustomerVisit>('/visits', {
      method: 'POST',
      body: JSON.stringify(params),
    }, params.branchId);
  }

  // POST /visits/:visitId/services/:serviceEntryId/assign
  assignStaff(visitId: string, serviceEntryId: string, staffId: string): Promise<void> {
    return this.request<void>(`/visits/${visitId}/services/${serviceEntryId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ staffId }),
    });
  }

  // PATCH /visits/:visitId/reschedule
  rescheduleAppointment(visitId: string, date: string, time: string): Promise<void> {
    return this.request<void>(`/visits/${visitId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ date, time }),
    });
  }

  // POST /visits/:visitId/cancel
  cancelAppointment(visitId: string): Promise<void> {
    return this.request<void>(`/visits/${visitId}/cancel`, { method: 'POST' });
  }

  // GET /sales?branchId=
  getSales(branchId: BranchId): Promise<POSOrder[]> {
    return this.request<POSOrder[]>(`/sales?branchId=${encodeURIComponent(branchId)}`, {}, branchId);
  }

  // POST /sales
  createSale(order: Omit<POSOrder, 'id' | 'orderReference' | 'createdAt'>): Promise<POSOrder> {
    return this.request<POSOrder>('/sales', {
      method: 'POST',
      body: JSON.stringify(order),
    }, order.branchId);
  }

  // POST /visits/:visitId/services/:serviceEntryId/discount
  applyServiceDiscount(
    visitId: string,
    serviceEntryId: string,
    discount: { type: DiscountType; value: number; reason?: string }
  ): Promise<void> {
    return this.request<void>(`/visits/${visitId}/services/${serviceEntryId}/discount`, {
      method: 'POST',
      body: JSON.stringify(discount),
    });
  }

  // POST /visits/:visitId/invoice
  generateInvoice(visitId: string): Promise<InvoiceRecord> {
    return this.request<InvoiceRecord>(`/visits/${visitId}/invoice`, { method: 'POST' });
  }

  // POST /visits/:visitId/payments
  recordPayment(
    visitId: string,
    payment: { amount: number; method: PaymentMethod; transactionReference?: string; notes?: string }
  ): Promise<PaymentTransaction> {
    return this.request<PaymentTransaction>(`/visits/${visitId}/payments`, {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }
}

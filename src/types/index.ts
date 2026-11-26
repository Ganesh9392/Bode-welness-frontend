export type BranchId = 'branch-ecil' | 'branch-nagole';

export interface Branch {
  id: BranchId;
  name: string;
  shortName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  imageUrl?: string;
}

export interface ManagerUser {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'Branch Manager' | 'Admin';
  branchId: BranchId;
  branchName: string;
  authorizedBranchIds: BranchId[];
  avatarUrl?: string;
}

export type VisitStatus = 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ServiceStatus = 'ADDED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type InvoiceStatus = 'NOT_GENERATED' | 'GENERATED' | 'WHATSAPP_SHARING_INITIATED' | 'SENT_CONFIRMED';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'FULLY_PAID';

export type DiscountType = 'FIXED' | 'PERCENTAGE';

export type BookingSource = 'WEBSITE' | 'MANAGER' | 'WALK_IN' | 'PHONE';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';

export type OrderType = 'SERVICE' | 'MEMBERSHIP' | 'PACKAGE' | 'GIFT_CARD';

export type OrderStatus = 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';

// ─── Service Catalogue ───────────────────────────────────────────────────────

export type ServiceCategory =
  | 'Massages & Body Therapies'
  | 'Facials & Skincare'
  | 'Ayurvedic & Holistic'
  | 'Express & Add-ons'
  | 'Body Scrubs & Wraps'
  | 'Head, Neck & Shoulder'
  | 'Foot Reflexology'
  | 'Pedicure & Manicure'
  | 'Exclusive Massages'
  | 'Best Sellers';

export interface ServiceDuration {
  durationMinutes: number;
  price: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durations: ServiceDuration[];
  imageUrl?: string;
  branchAvailability: BranchId[];
  isActive?: boolean;
  eligibleStaffIds?: string[];
}

export interface ServiceCategoryRecord {
  id: string;
  name: string;
  position: number;
  isActive: boolean;
  group: 'BOTH' | 'FEMALE' | 'MALE';
  hideFromCatalogue: boolean;
  assignedStaffIds: string[];
  imageUrl?: string;
  imageFemaleUrl?: string;
  imageMaleUrl?: string;
}

// ─── Discounts ───────────────────────────────────────────────────────────────

export interface ServiceDiscount {
  type: DiscountType;
  value: number;
  discountAmount: number;
  reason?: string;
  appliedByManager: string;
  appliedAt: string;
}

// ─── Visit Service Entry ──────────────────────────────────────────────────────

export interface VisitServiceEntry {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  durationMinutes: number;
  originalPrice: number;
  discount?: ServiceDiscount;
  finalPrice: number;
  status: ServiceStatus;
  staffId?: string;
  staffName?: string;
  startTime?: string;
  completedTime?: string;
  scheduledTime?: string;
  isAdditionalService?: boolean;
  notes?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
  timestamp: string;
  recordedByManager: string;
  notes?: string;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export interface InvoiceRecord {
  invoiceNumber: string;
  generatedAt: string;
  subtotal: number;
  totalDiscount: number;
  taxRatePercent: number;
  taxAmount: number;
  finalAmount: number;
  onlineAdvanceCredit: number;
  paidAmount: number;
  outstandingBalance: number;
  status: InvoiceStatus;
  whatsAppStatus: 'NOT_SENT' | 'LINK_OPENED' | 'DELIVERED_CONFIRMED' | 'FAILED';
  whatsAppSentTimestamp?: string;
  whatsAppDeliveryDetails?: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  alternateNumber?: string;
  whatsAppNumber: string;
  email?: string;
  dateOfBirth?: string;
  anniversary?: string;
  gstNumber?: string;
  source?: string;
  gender?: 'Male' | 'Female' | 'Other';
  branchId: BranchId;
  totalVisits: number;
  lastVisitDate?: string;
  lastService?: string;
  notes?: string;
  registeredDate: string;
  tags?: string[];
}

// ─── Customer Visit ───────────────────────────────────────────────────────────

export interface CustomerVisit {
  id: string;
  visitReference: string;
  bookingReference?: string;
  branchId: BranchId;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerWhatsApp: string;
  customerEmail?: string;
  customerGender?: 'Male' | 'Female' | 'Other';
  customerDob?: string;
  source: BookingSource;
  visitStatus: VisitStatus;
  appointmentDate: string;
  appointmentTime: string;
  appointmentTimeTo?: string;
  services: VisitServiceEntry[];
  onlineAdvancePaid: number;
  isOnlineAdvanceCredited: boolean;
  invoice?: InvoiceRecord;
  payments: PaymentTransaction[];
  paymentStatus: PaymentStatus;
  orderType?: OrderType;
  createdAt: string;
  checkedInAt?: string;
  completedAt?: string;
  notes?: string;
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export type StaffRole = 'Senior Spa Therapist' | 'Ayurvedic Specialist' | 'Aesthetician' | 'Massage Therapist' | 'Receptionist' | 'Manager';

export interface StaffShiftDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOff: boolean;
  startTime?: string;
  endTime?: string;
}

export interface StaffExperience {
  id: string;
  company: string;
  role: string;
  fromDate: string;
  toDate?: string;
  current?: boolean;
  description?: string;
}

export interface StaffDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  role: StaffRole;
  position?: string;
  designation?: string;
  branchId: BranchId;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  joiningDate?: string;
  reportingTo?: string;
  uanNumber?: string;
  workingHours?: string;
  username?: string;

  // Bank Details
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  ifscCode?: string;

  // Toggles
  isActive: boolean;
  showAllAppointments: boolean;
  enableAppointments: boolean;
  onlineNotifications: boolean;
  teamNotifications: boolean;

  // Service
  specializations: string[];
  availability: 'AVAILABLE' | 'IN_SERVICE' | 'ON_BREAK' | 'OFF_DUTY';
  currentAssignedService?: string;
  currentCustomerName?: string;

  // Shifts (array of 7 days)
  shifts?: StaffShiftDay[];

  // Extra
  experience?: StaffExperience[];
  documents?: StaffDocument[];

  avatarUrl?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'appointment' | 'service' | 'payment' | 'system';
  read: boolean;
  linkAction?: string;
}

// ─── Quick Sale / POS Order ───────────────────────────────────────────────────

export interface POSCartItem {
  id: string;
  type: 'SERVICE' | 'PRODUCT';
  name: string;
  category: string;
  durationMinutes?: number;
  quantity: number;
  unitPrice: number;
  discount?: {
    type: DiscountType;
    value: number;
    amount: number;
  };
  finalPrice: number;
  serviceId?: string;
  productId?: string;
  staffId?: string;
  staffName?: string;
}

export interface POSOrder {
  id: string;
  orderReference: string;
  branchId: BranchId;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  orderType: OrderType;
  orderStatus: OrderStatus;
  items: POSCartItem[];
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  finalAmount: number;
  appointmentDate?: string;
  appointmentTime?: string;
  invoiceNumber?: string;
  payments: PaymentTransaction[];
  paymentStatus: PaymentStatus;
  source: BookingSource;
  createdAt: string;
  notes?: string;
  visitId?: string; // link to CustomerVisit if service-based
}


// ─── Campaigns ───────────────────────────────────────────────────────────────

export type CampaignType =
  | 'WhatsApp Broadcast'
  | 'Seasonal Promotion'
  | 'Social Media Ad'
  | 'SMS Alert'
  | 'Membership Drive'
  | 'Loyalty & Referral';

export type CampaignObjective =
  | 'Bookings & Appointments'
  | 'Lead Generation'
  | 'Brand Awareness'
  | 'Repeat Visits & Retention'
  | 'Membership Signups';

export type CampaignChannel =
  | 'WhatsApp'
  | 'SMS'
  | 'Instagram'
  | 'Facebook'
  | 'Email'
  | 'Digital Catalogue';

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CampaignMediaAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface CampaignActivityItem {
  id: string;
  action: string;
  timestamp: string;
  detail?: string;
  performedBy: string;
}

export interface CampaignMetrics {
  reach: number;
  impressions: number;
  clicks: number;
  engagement: number;
  leadsGenerated: number;
  bookingsCount: number;
  conversions: number;
  conversionRate: number;
  amountSpent: number;
  revenueGenerated: number;
  roiPercent: number;
}

export interface CampaignRecord {
  id: string;
  campaignReference: string;
  branchId: BranchId;
  name: string;
  description: string;
  type: CampaignType;
  objective: CampaignObjective;
  targetAudience: string;
  audienceSegment?: string;
  locationScope?: string;
  startDate: string;
  endDate: string;
  budget: number;
  channels: CampaignChannel[];
  contentHeadline?: string;
  contentBody: string;
  ctaText?: string;
  promoCode?: string;
  promoLink?: string;
  showOnDigitalCatalogue?: boolean;
  media?: CampaignMediaAttachment;
  imageUrl?: string;
  status: CampaignStatus;
  metrics: CampaignMetrics;
  activityLog: CampaignActivityItem[];
  createdAt: string;
  updatedAt?: string;
  createdByManager?: string;
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'Spa Consumables & Oils'
  | 'Linen & Laundry'
  | 'Utilities & Rent'
  | 'Facility Maintenance'
  | 'Staff Welfare & Pantry'
  | 'Marketing & Promotions'
  | 'Equipment & Supplies'
  | 'Miscellaneous';

export type ExpenseStatus = 'PAID' | 'PENDING' | 'APPROVED' | 'CANCELLED';

export type ExpensePaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'BANK_TRANSFER';

export interface ExpenseReceiptAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface ExpenseRecord {
  id: string;
  expenseReference: string;
  branchId: BranchId;
  title: string;
  category: ExpenseCategory;
  vendorName?: string;
  amount: number;
  expenseDate: string;
  paymentMethod: ExpensePaymentMethod;
  paymentReference?: string;
  status: ExpenseStatus;
  description?: string;
  receipt?: ExpenseReceiptAttachment;
  createdByManager: string;
  createdAt: string;
  updatedAt?: string;
}

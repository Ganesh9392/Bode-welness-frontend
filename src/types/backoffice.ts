export type BackofficeSection =
  | 'hub'
  | 'homepage'
  | 'services'
  | 'products'
  | 'membership'
  | 'packages'
  | 'giftcard'
  | 'staff';

export type AudienceGroup = 'BOTH' | 'FEMALE' | 'MALE';

export interface BackofficeToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// ─── Homepage ────────────────────────────────────────────────────────────────

export interface BackofficePromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  isActive: boolean;
  showOnCatalogue: boolean;
}

export interface BackofficeTrendingItem {
  id: string;
  title: string;
  imageUrl: string;
  linkedServiceName?: string;
  isActive: boolean;
}

export interface BackofficeHomepageConfig {
  banners: BackofficePromoBanner[];
  trending: BackofficeTrendingItem[];
  storeWebsiteUrl: string;
}

// ─── Shared Category (Services & Products) ───────────────────────────────────

export interface BackofficeCategory {
  id: string;
  kind: 'service' | 'product';
  name: string;
  isActive: boolean;
  position: number;
  group: AudienceGroup;
  hideFromCatalogue: boolean;
  imageBothUrl?: string;
  imageFemaleUrl?: string;
  imageMaleUrl?: string;
  assignedStaffIds: string[];
}

// ─── Services ────────────────────────────────────────────────────────────────

export interface BackofficeConsumableLink {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

export interface BackofficeServiceItem {
  id: string;
  categoryId: string;
  name: string;
  isActive: boolean;
  position: number;
  serviceReminderDays?: number;
  durationHours: number;
  durationMinutes: number;
  group: AudienceGroup;
  hideFromCatalogue: boolean;
  price: number;
  salePrice?: number;
  nonDiscountable: boolean;
  serviceTag?: string;
  descriptionPoints: string[];
  consumables: BackofficeConsumableLink[];
  resourceIds: string[];
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface BackofficeProductVariation {
  id: string;
  name: string;
  price: number;
  sku?: string;
}

export interface BackofficeProductItem {
  id: string;
  categoryId: string;
  name: string;
  isActive: boolean;
  position: number;
  group: AudienceGroup;
  hideFromCatalogue: boolean;
  nonDiscountable: boolean;
  price: number;
  salePrice?: number;
  storeSku?: string;
  isRetail: boolean;
  variations: BackofficeProductVariation[];
  productTag?: string;
  videoLink?: string;
  benefits?: string;
  ingredients?: string;
  usageInstructions?: string;
  descriptionPoints: string[];
  displayImages: string[];
}

// ─── Membership ──────────────────────────────────────────────────────────────

export type MembershipType = 'FIXED' | 'PERCENTAGE' | 'HOURLY' | 'HYBRID';

export interface BackofficeMembershipPlan {
  id: string;
  type: MembershipType;
  name: string;
  isActive: boolean;
  fees: number;
  validityDays: number;
  renewalReminderDays?: number;
  totalHours?: number;
  creditValue?: number;
  discountPercentage?: number;
  isShareable: boolean;
  maxShareCount?: number;
  hasSpecificServices: boolean;
  specificServiceIds: string[];
}

// ─── Packages ────────────────────────────────────────────────────────────────

export type PackageType = 'BASE' | 'CUSTOM';

export interface BackofficePackageServiceEntry {
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
}

export interface BackofficePackageProductEntry {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface BackofficePackagePlan {
  id: string;
  type: PackageType;
  name: string;
  isActive: boolean;
  price: number;
  validityDays: number;
  renewalReminderDays?: number;
  includeServices: boolean;
  services: BackofficePackageServiceEntry[];
  includeProducts: boolean;
  products: BackofficePackageProductEntry[];
}

// ─── Gift Card ───────────────────────────────────────────────────────────────

export interface BackofficeGiftCard {
  id: string;
  name: string;
  isActive: boolean;
  description?: string;
  amount: number;
  validityDays: number;
  renewalReminderDays?: number;
}

// ─── Staff Management ────────────────────────────────────────────────────────

export type ShiftDayKey = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface BackofficeShiftDay {
  day: ShiftDayKey;
  isOff: boolean;
  startTime: string; // HH:mm 24h
  endTime: string;   // HH:mm 24h
}

export interface BackofficeWorkExperience {
  id: string;
  company: string;
  role: string;
  fromDate: string;
  toDate?: string;
  isCurrent?: boolean;
}

export interface BackofficeStaffDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface BackofficeStaffMember {
  id: string;
  // Toggles
  isActive: boolean;
  showAllAppointments: boolean;
  enableAppointments: boolean;
  onlineNotifications: boolean;
  teamNotifications: boolean;
  // Personal Information
  firstName: string;
  lastName: string;
  displayName: string;
  mobileNumber: string;
  email?: string;
  dateOfBirth?: string;
  position?: string;
  role: string;
  store: string;
  username: string;
  useMobileAsUsername: boolean;
  gender: 'Male' | 'Female' | 'Other';
  // Shifts
  shifts: BackofficeShiftDay[];
  // Experience & Documents
  experiences: BackofficeWorkExperience[];
  documents: BackofficeStaffDocument[];
  // Joining Details
  joiningDate: string;
  reportingTo?: string;
  uanNumber?: string;
  workingHours?: string;
  designation?: string;
  // Bank Details
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  ifscCode?: string;
}

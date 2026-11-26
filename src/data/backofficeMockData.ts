import {
  BackofficeCategory,
  BackofficeGiftCard,
  BackofficeHomepageConfig,
  BackofficeMembershipPlan,
  BackofficePackagePlan,
  BackofficeProductItem,
  BackofficeServiceItem,
  BackofficeShiftDay,
  BackofficeStaffMember,
  ShiftDayKey,
} from '../types/backoffice';

export const SHIFT_DAY_KEYS: ShiftDayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const createDefaultShifts = (): BackofficeShiftDay[] =>
  SHIFT_DAY_KEYS.map((day) => ({
    day,
    isOff: day === 'Sun',
    startTime: '09:00',
    endTime: '21:00',
  }));

export const RESOURCE_OPTIONS = [
  { id: 'res-suite-1', name: 'Therapy Suite 1 (Single)' },
  { id: 'res-suite-2', name: 'Therapy Suite 2 (Single)' },
  { id: 'res-couple', name: 'Royal Couple Suite' },
  { id: 'res-ayurveda', name: 'Ayurveda & Steam Room' },
  { id: 'res-facial-1', name: 'Facial & Glow Room' },
  { id: 'res-reflexology', name: 'Foot Reflexology Lounge' },
  { id: 'res-pedicure', name: 'Pedicure & Manicure Station' },
  { id: 'res-hair', name: 'Hair Spa Station' },
];

export const STAFF_ROLE_OPTIONS = [
  'Superadmin',
  'Admin',
  'Branch Manager',
  'Senior Spa Therapist',
  'Massage Therapist',
  'Aesthetician',
  'Ayurvedic Specialist',
  'Receptionist',
];

export const STORE_OPTIONS = [
  'All Stores',
  'Secunderabad',
  'Nagole',
  'AMR Planet Mall, ECIL',
  'SVM Grand, Nagole',
];

export const DESIGNATION_OPTIONS = [
  'Lead Therapist',
  'Senior Therapist',
  'Therapist',
  'Senior Aesthetician',
  'Aesthetician',
  'Ayurvedic Practitioner',
  'Front Desk Executive',
  'Branch Manager',
  'Store Admin',
];

export const INITIAL_HOMEPAGE_CONFIG: BackofficeHomepageConfig = {
  banners: [
    {
      id: 'ban-1',
      title: 'INDEPENDENCE DAY OFFER — 30% FLAT',
      subtitle: 'Offer applicable on all signature body massages & wellness rituals',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      showOnCatalogue: true,
    },
  ],
  trending: [
    {
      id: 'trd-1',
      title: 'Signature Scrub & Polish',
      imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=80',
      linkedServiceName: 'Peppermint Scrub',
      isActive: true,
    },
    {
      id: 'trd-2',
      title: '24K Gold Radiance Facial',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
      linkedServiceName: '24 Karat Gold Premium Facial',
      isActive: true,
    },
    {
      id: 'trd-3',
      title: 'Red Carpet Manicure',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500&auto=format&fit=crop&q=80',
      linkedServiceName: 'Red Carpet Manicure',
      isActive: true,
    },
  ],
  storeWebsiteUrl: 'https://bode-wellness-spa.respark.in',
};

// ─── Staff Management (14 members exact from prompt) ─────────────────────────

const STAFF_NAMES = [
  { id: 'bo-stf-1', firstName: 'Bode Wellness', lastName: 'Spa', displayName: 'Bode Wellness Spa', role: 'Superadmin', store: 'All Stores', mobile: '9121288401', gender: 'Male' as const },
  { id: 'bo-stf-2', firstName: 'Bode Wellness', lastName: 'Spa Nagole', displayName: 'Bode Wellness Spa Nagole', role: 'Admin', store: 'Nagole', mobile: '9121288402', gender: 'Male' as const },
  { id: 'bo-stf-3', firstName: 'Pranay', lastName: 'P', displayName: 'Pranay P', role: 'Superadmin', store: 'Secunderabad', mobile: '7893984388', gender: 'Male' as const },
  { id: 'bo-stf-4', firstName: 'Daizy', lastName: '', displayName: 'Daizy', role: 'Senior Spa Therapist', store: 'Secunderabad', mobile: '9848011101', gender: 'Female' as const },
  { id: 'bo-stf-5', firstName: 'Dabiang', lastName: '', displayName: 'Dabiang', role: 'Massage Therapist', store: 'Secunderabad', mobile: '9848011102', gender: 'Female' as const },
  { id: 'bo-stf-6', firstName: 'Admin Bode', lastName: 'Wellness Spa', displayName: 'Admin Bode Wellness Spa', role: 'Admin', store: 'All Stores', mobile: '9848011103', gender: 'Male' as const },
  { id: 'bo-stf-7', firstName: 'Sai Prasad', lastName: 'Reddy', displayName: 'Sai Prasad Reddy', role: 'Branch Manager', store: 'Secunderabad', mobile: '9848011104', gender: 'Male' as const },
  { id: 'bo-stf-8', firstName: 'Mahender', lastName: 'Reddy', displayName: 'Mahender Reddy', role: 'Branch Manager', store: 'Nagole', mobile: '9848011105', gender: 'Male' as const },
  { id: 'bo-stf-9', firstName: 'Jenny', lastName: '2', displayName: 'Jenny 2', role: 'Massage Therapist', store: 'Secunderabad', mobile: '9848011106', gender: 'Female' as const },
  { id: 'bo-stf-10', firstName: 'Hema', lastName: 'CH', displayName: 'Hema CH', role: 'Aesthetician', store: 'Nagole', mobile: '9848011107', gender: 'Female' as const },
  { id: 'bo-stf-11', firstName: 'Nu', lastName: 'Khai', displayName: 'Nu Khai', role: 'Senior Spa Therapist', store: 'Secunderabad', mobile: '9848011108', gender: 'Female' as const },
  { id: 'bo-stf-12', firstName: 'Shim', lastName: '', displayName: 'Shim', role: 'Massage Therapist', store: 'Nagole', mobile: '9848011109', gender: 'Female' as const },
  { id: 'bo-stf-13', firstName: 'Anitha', lastName: 'R', displayName: 'Anitha R', role: 'Aesthetician', store: 'Secunderabad', mobile: '9848011110', gender: 'Female' as const },
  { id: 'bo-stf-14', firstName: 'Kiran', lastName: 'Kumar', displayName: 'Kiran Kumar', role: 'Ayurvedic Specialist', store: 'Nagole', mobile: '9848011111', gender: 'Male' as const },
];

export const INITIAL_BACKOFFICE_STAFF: BackofficeStaffMember[] = STAFF_NAMES.map((s, idx) => ({
  id: s.id,
  isActive: true,
  showAllAppointments: true,
  enableAppointments: idx >= 3,
  onlineNotifications: false,
  teamNotifications: false,
  firstName: s.firstName,
  lastName: s.lastName || '-',
  displayName: s.displayName,
  mobileNumber: s.mobile,
  email: '',
  dateOfBirth: '',
  position: s.role === 'Superadmin' || s.role === 'Admin' ? 'Administrator' : 'Therapist',
  role: s.role,
  store: s.store,
  username: s.mobile,
  useMobileAsUsername: true,
  gender: s.gender,
  shifts: createDefaultShifts(),
  experiences: [],
  documents: [],
  joiningDate: '2025-01-15',
  reportingTo: idx > 2 ? 'Sai Prasad Reddy' : '',
  uanNumber: '',
  workingHours: '9',
  designation: s.role === 'Superadmin' ? 'Store Admin' : 'Therapist',
  bankName: '',
  bankBranch: '',
  accountNumber: '',
  ifscCode: '',
}));

// ─── Service Categories (9) ──────────────────────────────────────────────────

export const INITIAL_SERVICE_CATEGORIES: BackofficeCategory[] = [
  {
    id: 'srv-cat-massages',
    kind: 'service',
    name: 'Massages',
    isActive: true,
    position: 1,
    group: 'BOTH',
    hideFromCatalogue: false,
    imageFemaleUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&auto=format&fit=crop&q=80',
    imageMaleUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&auto=format&fit=crop&q=80',
    assignedStaffIds: ['bo-stf-4', 'bo-stf-5', 'bo-stf-11'],
  },
  { id: 'srv-cat-scrub', kind: 'service', name: 'Scrub Services', isActive: true, position: 2, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-4', 'bo-stf-9'] },
  { id: 'srv-cat-classic-facial', kind: 'service', name: 'Classic Facial', isActive: true, position: 3, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-10', 'bo-stf-13'] },
  { id: 'srv-cat-premium-facial', kind: 'service', name: 'Premium Facials', isActive: true, position: 4, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-10', 'bo-stf-13'] },
  { id: 'srv-cat-foot', kind: 'service', name: 'Foot Reflexology', isActive: true, position: 5, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-5', 'bo-stf-12'] },
  { id: 'srv-cat-pedi-mani', kind: 'service', name: 'Pedicure & Manicure', isActive: true, position: 6, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-9', 'bo-stf-13'] },
  { id: 'srv-cat-bestsellers', kind: 'service', name: 'Best Sellers', isActive: true, position: 7, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-4', 'bo-stf-5', 'bo-stf-11'] },
  { id: 'srv-cat-hns', kind: 'service', name: 'Head Neck & Shoulder', isActive: true, position: 8, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-4', 'bo-stf-14'] },
  { id: 'srv-cat-hair', kind: 'service', name: 'Hair Services', isActive: true, position: 9, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: ['bo-stf-10', 'bo-stf-13'] },
];

const mkService = (
  id: string,
  categoryId: string,
  name: string,
  price: number,
  position: number,
  durationHours = 1,
  durationMinutes = 0
): BackofficeServiceItem => ({
  id,
  categoryId,
  name,
  isActive: true,
  position,
  serviceReminderDays: 15,
  durationHours,
  durationMinutes,
  group: 'BOTH',
  hideFromCatalogue: false,
  price,
  nonDiscountable: false,
  serviceTag: '',
  descriptionPoints: [`Signature ${name} wellness therapy`],
  consumables: [],
  resourceIds: ['res-suite-1'],
});

export const INITIAL_BACKOFFICE_SERVICES: BackofficeServiceItem[] = [
  // Massages (8)
  mkService('bo-srv-m1', 'srv-cat-massages', 'Swedish Massage 60 Min', 2500, 1, 1, 0),
  mkService('bo-srv-m2', 'srv-cat-massages', 'Aroma Massage 60 Min', 2500, 2, 1, 0),
  mkService('bo-srv-m3', 'srv-cat-massages', 'Balinese Massage 60 Min', 3000, 3, 1, 0),
  mkService('bo-srv-m4', 'srv-cat-massages', 'Deep Tissue Massage 60 Min', 3000, 4, 1, 0),
  mkService('bo-srv-m5', 'srv-cat-massages', 'Swedish Massage 90 Min', 3500, 5, 1, 30),
  mkService('bo-srv-m6', 'srv-cat-massages', 'Aroma Massage 90 Min', 3500, 6, 1, 30),
  mkService('bo-srv-m7', 'srv-cat-massages', 'Balinese Massage 90 Min', 4000, 7, 1, 30),
  mkService('bo-srv-m8', 'srv-cat-massages', 'Deep Tissue Massage 90 Min', 4000, 8, 1, 30),

  // Scrub Services (3)
  mkService('bo-srv-s1', 'srv-cat-scrub', 'Peppermint Scrub', 1499, 1, 0, 45),
  mkService('bo-srv-s2', 'srv-cat-scrub', 'Charcoal Scrub', 1499, 2, 0, 45),
  mkService('bo-srv-s3', 'srv-cat-scrub', 'White & Bright Scrub', 1499, 3, 0, 45),

  // Classic Facial (5)
  mkService('bo-srv-cf1', 'srv-cat-classic-facial', 'Classic Facials', 2499, 1, 1, 0),
  mkService('bo-srv-cf2', 'srv-cat-classic-facial', 'Anti Aging Classic Facials', 2899, 2, 1, 0),
  mkService('bo-srv-cf3', 'srv-cat-classic-facial', 'Whitening Classic Facial', 2899, 3, 1, 0),
  mkService('bo-srv-cf4', 'srv-cat-classic-facial', 'Clean Up', 1599, 4, 0, 45),
  mkService('bo-srv-cf5', 'srv-cat-classic-facial', 'De Tan + Clean Up', 1899, 5, 0, 45),

  // Premium Facials (3)
  mkService('bo-srv-pf1', 'srv-cat-premium-facial', '24 Karat Gold Premium Facial', 3499, 1, 1, 15),
  mkService('bo-srv-pf2', 'srv-cat-premium-facial', 'Platinum Premium Facial', 3499, 2, 1, 15),
  mkService('bo-srv-pf3', 'srv-cat-premium-facial', 'Hydrating Facial', 2899, 3, 1, 0),

  // Foot Reflexology (4)
  mkService('bo-srv-fr1', 'srv-cat-foot', 'Foot Nirvana', 1499, 1, 0, 45),
  mkService('bo-srv-fr2', 'srv-cat-foot', 'Wellness Walk', 2499, 2, 1, 0),
  mkService('bo-srv-fr3', 'srv-cat-foot', 'Walk On Foot', 1599, 3, 0, 45),
  mkService('bo-srv-fr4', 'srv-cat-foot', 'Foot Massage', 1499, 4, 0, 30),

  // Pedicure & Manicure (5)
  mkService('bo-srv-pm1', 'srv-cat-pedi-mani', 'Pedicure', 999, 1, 0, 45),
  mkService('bo-srv-pm2', 'srv-cat-pedi-mani', 'Manicure', 699, 2, 0, 30),
  mkService('bo-srv-pm3', 'srv-cat-pedi-mani', 'Red Carpet Pedicure', 1899, 3, 1, 0),
  mkService('bo-srv-pm4', 'srv-cat-pedi-mani', 'Red Carpet Manicure', 1599, 4, 0, 45),
  mkService('bo-srv-pm5', 'srv-cat-pedi-mani', 'Pedicure & Manicure', 1499, 5, 1, 0),

  // Best Sellers (10)
  mkService('bo-srv-bs1', 'srv-cat-bestsellers', 'Couple Massage 60 Min', 4500, 1, 1, 0),
  mkService('bo-srv-bs2', 'srv-cat-bestsellers', 'Couple Massage 90 Min', 6000, 2, 1, 30),
  mkService('bo-srv-bs3', 'srv-cat-bestsellers', 'Four Hand Massage 60 Min', 4500, 3, 1, 0),
  mkService('bo-srv-bs4', 'srv-cat-bestsellers', 'Four Hand Massage 90 Min', 6000, 4, 1, 30),
  mkService('bo-srv-bs5', 'srv-cat-bestsellers', 'Deep Tissue', 2599, 5, 1, 0),
  mkService('bo-srv-bs6', 'srv-cat-bestsellers', '24 Carrot Gold Facial', 2099, 6, 1, 0),
  mkService('bo-srv-bs7', 'srv-cat-bestsellers', 'Foot Nirvana', 599, 7, 0, 30),
  mkService('bo-srv-bs8', 'srv-cat-bestsellers', 'Complete Hair Spa', 1299, 8, 0, 45),
  mkService('bo-srv-bs9', 'srv-cat-bestsellers', 'Hair Spa Anti Dandruff', 1299, 9, 0, 45),
  mkService('bo-srv-bs10', 'srv-cat-bestsellers', 'Classic Facials', 2499, 10, 1, 0),

  // Head Neck & Shoulder (3)
  mkService('bo-srv-hn1', 'srv-cat-hns', 'Head Massage', 999, 1, 0, 30),
  mkService('bo-srv-hn2', 'srv-cat-hns', 'Head & Neck Massage', 1850, 2, 0, 45),
  mkService('bo-srv-hn3', 'srv-cat-hns', 'Head Neck & Shoulder Massage', 2699, 3, 1, 0),

  // Hair Services (4)
  mkService('bo-srv-hr1', 'srv-cat-hair', 'Hair Wash Without Conditioner', 499, 1, 0, 20),
  mkService('bo-srv-hr2', 'srv-cat-hair', 'Hair Spa Anti Dandruff', 1299, 2, 0, 45),
  mkService('bo-srv-hr3', 'srv-cat-hair', 'Hair Spa Deep Nourishing', 1299, 3, 0, 45),
  mkService('bo-srv-hr4', 'srv-cat-hair', 'Hair Spa Volumetric', 1299, 4, 0, 45),
];

// ─── Product Categories (6) ──────────────────────────────────────────────────

export const INITIAL_PRODUCT_CATEGORIES: BackofficeCategory[] = [
  { id: 'prd-cat-kama', kind: 'product', name: 'Kama Ayurveda Organic', isActive: true, position: 1, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: [] },
  { id: 'prd-cat-oil', kind: 'product', name: 'Oil', isActive: true, position: 2, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: [] },
  { id: 'prd-cat-disposables', kind: 'product', name: 'Disposables', isActive: true, position: 3, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: [] },
  { id: 'prd-cat-cleaning', kind: 'product', name: 'Cleaning Items', isActive: true, position: 4, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: [] },
  { id: 'prd-cat-shower', kind: 'product', name: 'Shower gells', isActive: true, position: 5, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: [] },
  { id: 'prd-cat-pedifacial', kind: 'product', name: 'Pedicure+Facial =Products', isActive: true, position: 6, group: 'BOTH', hideFromCatalogue: false, assignedStaffIds: [] },
];

const mkProduct = (
  id: string,
  categoryId: string,
  name: string,
  position: number
): BackofficeProductItem => ({
  id,
  categoryId,
  name,
  isActive: true,
  position,
  group: 'BOTH',
  hideFromCatalogue: false,
  nonDiscountable: false,
  price: 0,
  salePrice: undefined,
  storeSku: '',
  isRetail: false,
  variations: [],
  productTag: '',
  videoLink: '',
  benefits: '',
  ingredients: '',
  usageInstructions: '',
  descriptionPoints: [],
  displayImages: [],
});

export const INITIAL_BACKOFFICE_PRODUCTS: BackofficeProductItem[] = [
  // Kama Ayurveda Organic
  mkProduct('bo-prd-k1', 'prd-cat-kama', 'Kama Ayurveda Organic Sweet Almond Oil (1000 ML)', 1),

  // Oil
  mkProduct('bo-prd-o1', 'prd-cat-oil', 'Massage oil', 1),
  mkProduct('bo-prd-o2', 'prd-cat-oil', 'P OIL', 2),
  mkProduct('bo-prd-o3', 'prd-cat-oil', 'Scrub', 3),
  mkProduct('bo-prd-o4', 'prd-cat-oil', 'Oilheter', 4),

  // Disposables
  mkProduct('bo-prd-d1', 'prd-cat-disposables', 'Bedsheets', 1),
  mkProduct('bo-prd-d2', 'prd-cat-disposables', 'Tissue', 2),
  mkProduct('bo-prd-d3', 'prd-cat-disposables', 'Combs', 3),
  mkProduct('bo-prd-d4', 'prd-cat-disposables', 'Bra', 4),
  mkProduct('bo-prd-d5', 'prd-cat-disposables', 'Pantys', 5),
  mkProduct('bo-prd-d6', 'prd-cat-disposables', 'Tissuerolls', 6),

  // Cleaning Items
  mkProduct('bo-prd-c1', 'prd-cat-cleaning', 'Floor cleaner', 1),
  mkProduct('bo-prd-c2', 'prd-cat-cleaning', 'Toilet cleaner', 2),
  mkProduct('bo-prd-c3', 'prd-cat-cleaning', 'Handwash', 3),
  mkProduct('bo-prd-c4', 'prd-cat-cleaning', 'Dustbincovers Small SIZE', 4),
  mkProduct('bo-prd-c5', 'prd-cat-cleaning', 'Dustbincovers Big SIZE', 5),
  mkProduct('bo-prd-c6', 'prd-cat-cleaning', 'Buckets', 6),
  mkProduct('bo-prd-c7', 'prd-cat-cleaning', 'Mugs', 7),
  mkProduct('bo-prd-c8', 'prd-cat-cleaning', 'Dustbins', 8),
  mkProduct('bo-prd-c9', 'prd-cat-cleaning', 'Mop', 9),
  mkProduct('bo-prd-c10', 'prd-cat-cleaning', 'Gloves', 10),

  // Shower gells
  mkProduct('bo-prd-sg1', 'prd-cat-shower', 'Shampoo', 1),
  mkProduct('bo-prd-sg2', 'prd-cat-shower', 'Showrgel', 2),
  mkProduct('bo-prd-sg3', 'prd-cat-shower', 'Room Freshnar', 3),

  // Pedicure+Facial =Products
  mkProduct('bo-prd-pf1', 'prd-cat-pedifacial', 'Wood Scaper', 1),
  mkProduct('bo-prd-pf2', 'prd-cat-pedifacial', 'Facial Brush', 2),
  mkProduct('bo-prd-pf3', 'prd-cat-pedifacial', 'Puser', 3),
  mkProduct('bo-prd-pf4', 'prd-cat-pedifacial', 'Hiper', 4),
  mkProduct('bo-prd-pf5', 'prd-cat-pedifacial', 'Filer', 5),
  mkProduct('bo-prd-pf6', 'prd-cat-pedifacial', 'Pumicestone', 6),
  mkProduct('bo-prd-pf7', 'prd-cat-pedifacial', 'Pedicure Brush', 7),
  mkProduct('bo-prd-pf8', 'prd-cat-pedifacial', 'Side Cuffer', 8),
  mkProduct('bo-prd-pf9', 'prd-cat-pedifacial', 'Nail Cutter', 9),
  mkProduct('bo-prd-pf10', 'prd-cat-pedifacial', 'Cotton Rolls', 10),
];

// ─── Memberships (9 plans exact from prompt) ─────────────────────────────────

export const INITIAL_MEMBERSHIPS: BackofficeMembershipPlan[] = [
  {
    id: 'mem-1',
    type: 'HOURLY',
    name: 'Platinum',
    isActive: true,
    fees: 20000,
    validityDays: 270,
    renewalReminderDays: 20,
    totalHours: 18,
    isShareable: true,
    maxShareCount: 3,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-2',
    type: 'HOURLY',
    name: 'Gold',
    isActive: true,
    fees: 15000,
    validityDays: 180,
    renewalReminderDays: 15,
    totalHours: 12,
    isShareable: true,
    maxShareCount: 2,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-3',
    type: 'HOURLY',
    name: 'Silver',
    isActive: true,
    fees: 10000,
    validityDays: 120,
    renewalReminderDays: 10,
    totalHours: 8,
    isShareable: false,
    maxShareCount: 1,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-4',
    type: 'HOURLY',
    name: 'Bronze',
    isActive: true,
    fees: 6000,
    validityDays: 90,
    renewalReminderDays: 7,
    totalHours: 5,
    isShareable: false,
    maxShareCount: 1,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-5',
    type: 'HOURLY',
    name: 'BODE SPECIAL',
    isActive: true,
    fees: 25000,
    validityDays: 365,
    renewalReminderDays: 30,
    totalHours: 24,
    isShareable: true,
    maxShareCount: 4,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-6',
    type: 'FIXED',
    name: 'Packages',
    isActive: false,
    fees: 12000,
    validityDays: 180,
    renewalReminderDays: 15,
    creditValue: 15000,
    isShareable: false,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-7',
    type: 'FIXED',
    name: 'Silver',
    isActive: false,
    fees: 8000,
    validityDays: 120,
    renewalReminderDays: 10,
    creditValue: 10000,
    isShareable: false,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-8',
    type: 'FIXED',
    name: 'Bronze',
    isActive: false,
    fees: 5000,
    validityDays: 90,
    renewalReminderDays: 7,
    creditValue: 6000,
    isShareable: false,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
  {
    id: 'mem-9',
    type: 'FIXED',
    name: '15000',
    isActive: false,
    fees: 15000,
    validityDays: 180,
    renewalReminderDays: 15,
    creditValue: 18000,
    isShareable: false,
    hasSpecificServices: false,
    specificServiceIds: [],
  },
];

// ─── Packages ────────────────────────────────────────────────────────────────

export const INITIAL_PACKAGES: BackofficePackagePlan[] = [
  {
    id: 'pkg-1',
    type: 'BASE',
    name: 'Vyoma Package',
    isActive: true,
    price: 10000,
    validityDays: 3,
    renewalReminderDays: 3,
    includeServices: true,
    services: [
      { serviceId: 'bo-srv-m1', serviceName: 'Swedish Massage 60 Min', unitPrice: 2500, quantity: 1 },
      { serviceId: 'bo-srv-m2', serviceName: 'Aroma Massage 60 Min', unitPrice: 2500, quantity: 1 },
      { serviceId: 'bo-srv-m3', serviceName: 'Balinese Massage 60 Min', unitPrice: 3000, quantity: 1 },
      { serviceId: 'bo-srv-m4', serviceName: 'Deep Tissue Massage 60 Min', unitPrice: 3000, quantity: 1 },
      { serviceId: 'bo-srv-m5', serviceName: 'Swedish Massage 90 Min', unitPrice: 3500, quantity: 1 },
      { serviceId: 'bo-srv-m6', serviceName: 'Aroma Massage 90 Min', unitPrice: 3500, quantity: 1 },
      { serviceId: 'bo-srv-m7', serviceName: 'Balinese Massage 90 Min', unitPrice: 4000, quantity: 1 },
      { serviceId: 'bo-srv-m8', serviceName: 'Deep Tissue Massage 90 Min', unitPrice: 4000, quantity: 1 },
    ],
    includeProducts: false,
    products: [],
  },
  {
    id: 'pkg-2',
    type: 'CUSTOM',
    name: 'CUSTOM',
    isActive: true,
    price: 5000,
    validityDays: 30,
    renewalReminderDays: 5,
    includeServices: true,
    services: [
      { serviceId: 'bo-srv-cf1', serviceName: 'Classic Facials', unitPrice: 2499, quantity: 1 },
      { serviceId: 'bo-srv-m1', serviceName: 'Swedish Massage 60 Min', unitPrice: 2500, quantity: 1 },
    ],
    includeProducts: false,
    products: [],
  },
];

// ─── Gift Cards ──────────────────────────────────────────────────────────────

export const INITIAL_GIFT_CARDS: BackofficeGiftCard[] = [
  {
    id: 'gc-1',
    name: 'First time use',
    isActive: true,
    description: 'This is for first time users for family and AMR staff',
    amount: 1999,
    validityDays: 20,
    renewalReminderDays: 3,
  },
  {
    id: 'gc-2',
    name: 'Birthday Special',
    isActive: true,
    description: 'Celebratory wellness gift voucher for birthdays',
    amount: 2999,
    validityDays: 60,
    renewalReminderDays: 5,
  },
];

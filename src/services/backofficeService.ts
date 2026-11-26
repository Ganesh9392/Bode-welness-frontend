import {
  BackofficeCategory,
  BackofficeGiftCard,
  BackofficeHomepageConfig,
  BackofficeMembershipPlan,
  BackofficePackagePlan,
  BackofficeProductItem,
  BackofficeServiceItem,
  BackofficeStaffMember,
} from '../types/backoffice';
import {
  INITIAL_BACKOFFICE_PRODUCTS,
  INITIAL_BACKOFFICE_SERVICES,
  INITIAL_BACKOFFICE_STAFF,
  INITIAL_GIFT_CARDS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_MEMBERSHIPS,
  INITIAL_PACKAGES,
  INITIAL_PRODUCT_CATEGORIES,
  INITIAL_SERVICE_CATEGORIES,
} from '../data/backofficeMockData';

const KEYS = {
  HOMEPAGE: 'bode_bo_homepage_v1',
  SERVICE_CATS: 'bode_bo_service_cats_v1',
  SERVICES: 'bode_bo_services_v1',
  PRODUCT_CATS: 'bode_bo_product_cats_v1',
  PRODUCTS: 'bode_bo_products_v1',
  MEMBERSHIPS: 'bode_bo_memberships_v1',
  PACKAGES: 'bode_bo_packages_v1',
  GIFT_CARDS: 'bode_bo_gift_cards_v1',
  STAFF: 'bode_bo_staff_v1',
};

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore corrupted localStorage
  }
  return fallback;
}

function writeStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota error
  }
}

export interface BackofficeState {
  homepage: BackofficeHomepageConfig;
  serviceCategories: BackofficeCategory[];
  services: BackofficeServiceItem[];
  productCategories: BackofficeCategory[];
  products: BackofficeProductItem[];
  memberships: BackofficeMembershipPlan[];
  packages: BackofficePackagePlan[];
  giftCards: BackofficeGiftCard[];
  staff: BackofficeStaffMember[];
}

export const backofficeService = {
  loadAll(): BackofficeState {
    return {
      homepage: readStore(KEYS.HOMEPAGE, INITIAL_HOMEPAGE_CONFIG),
      serviceCategories: readStore(KEYS.SERVICE_CATS, INITIAL_SERVICE_CATEGORIES),
      services: readStore(KEYS.SERVICES, INITIAL_BACKOFFICE_SERVICES),
      productCategories: readStore(KEYS.PRODUCT_CATS, INITIAL_PRODUCT_CATEGORIES),
      products: readStore(KEYS.PRODUCTS, INITIAL_BACKOFFICE_PRODUCTS),
      memberships: readStore(KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS),
      packages: readStore(KEYS.PACKAGES, INITIAL_PACKAGES),
      giftCards: readStore(KEYS.GIFT_CARDS, INITIAL_GIFT_CARDS),
      staff: readStore(KEYS.STAFF, INITIAL_BACKOFFICE_STAFF),
    };
  },

  saveHomepage(homepage: BackofficeHomepageConfig): BackofficeHomepageConfig {
    writeStore(KEYS.HOMEPAGE, homepage);
    return homepage;
  },

  saveServiceCategories(categories: BackofficeCategory[]): BackofficeCategory[] {
    writeStore(KEYS.SERVICE_CATS, categories);
    return categories;
  },

  saveServices(services: BackofficeServiceItem[]): BackofficeServiceItem[] {
    writeStore(KEYS.SERVICES, services);
    return services;
  },

  saveProductCategories(categories: BackofficeCategory[]): BackofficeCategory[] {
    writeStore(KEYS.PRODUCT_CATS, categories);
    return categories;
  },

  saveProducts(products: BackofficeProductItem[]): BackofficeProductItem[] {
    writeStore(KEYS.PRODUCTS, products);
    return products;
  },

  saveMemberships(plans: BackofficeMembershipPlan[]): BackofficeMembershipPlan[] {
    writeStore(KEYS.MEMBERSHIPS, plans);
    return plans;
  },

  savePackages(packages: BackofficePackagePlan[]): BackofficePackagePlan[] {
    writeStore(KEYS.PACKAGES, packages);
    return packages;
  },

  saveGiftCards(cards: BackofficeGiftCard[]): BackofficeGiftCard[] {
    writeStore(KEYS.GIFT_CARDS, cards);
    return cards;
  },

  saveStaff(staff: BackofficeStaffMember[]): BackofficeStaffMember[] {
    writeStore(KEYS.STAFF, staff);
    return staff;
  },

  resetAll(): BackofficeState {
    Object.values(KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    return this.loadAll();
  },
};

export function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function formatINR(amount: number, decimals = 0): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Route Constants
 */

// Auth Routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  TRANSACTIONS: '/admin/transactions',
  TRANSACTION_DETAILS: (id: string) => `/admin/transactions/${id}`,
  KYC: '/admin/kyc',
  KYC_DETAILS: (id: string) => `/admin/kyc/${id}`,
  USERS: '/admin/users',
  USER_DETAILS: (id: string) => `/admin/users/${id}`,
  ORGANIZATIONS: '/admin/organizations',
  ORGANIZATION_DETAILS: (id: string) => `/admin/organizations/${id}`,
  SETTINGS: '/admin/settings',
} as const;

// Vendor Routes
export const VENDOR_ROUTES = {
  DASHBOARD: '/vendor/dashboard',
  PAYMENT_PAGES: '/vendor/payment-pages',
  PAYMENT_PAGE_CREATE: '/vendor/payment-pages/create',
  PAYMENT_PAGE_DETAILS: (id: string) => `/vendor/payment-pages/${id}`,
  PAYMENT_PAGE_EDIT: (id: string) => `/vendor/payment-pages/${id}/edit`,
  TRANSACTIONS: '/vendor/transactions',
  TRANSACTION_DETAILS: (id: string) => `/vendor/transactions/${id}`,
  DISBURSEMENTS: '/vendor/disbursements',
  SETTINGS: '/vendor/settings',
} as const;

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  ADMIN: {
    TRANSACTIONS: '/api/admin/transactions',
    TRANSACTION: (id: string) => `/api/admin/transactions/${id}`,
    KYC_PENDING: '/api/admin/kyc/pending',
    KYC_DETAILS: (id: string) => `/api/admin/kyc/${id}`,
    KYC_APPROVE: (id: string) => `/api/admin/kyc/${id}/approve`,
    KYC_REJECT: (id: string) => `/api/admin/kyc/${id}/reject`,
    USERS: '/api/admin/users',
    ORGANIZATIONS: '/api/admin/organizations',
  },
  VENDOR: {
    DASHBOARD: '/api/vendor/dashboard',
    PAYMENT_PAGES: '/api/vendor/payment-pages',
    PAYMENT_PAGE: (id: string) => `/api/vendor/payment-pages/${id}`,
    TRANSACTIONS: '/api/vendor/transactions',
    TRANSACTION: (id: string) => `/api/vendor/transactions/${id}`,
    DISBURSEMENTS: '/api/vendor/disbursements',
  },
} as const;

/**
 * Check if route requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const publicRoutes = Object.values(AUTH_ROUTES);
  return !publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get redirect URL after login based on user role
 */
export function getRedirectUrl(roles: string[]): string {
  const isAdmin = roles.some((role) =>
    ['super_admin', 'platform_admin'].includes(role)
  );

  return isAdmin ? ADMIN_ROUTES.DASHBOARD : VENDOR_ROUTES.DASHBOARD;
}

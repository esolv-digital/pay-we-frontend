/**
 * Test Data Fixtures for PayWe E2E Tests
 *
 * Provides consistent test data across all test suites.
 */

// Unique ID generator for test data
let idCounter = 0;
export function uniqueId(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${++idCounter}`;
}

// =============================================================================
// ROLES & PERMISSIONS TEST DATA
// =============================================================================

export const roleTestData = {
  // Valid role data for creation
  validRole: () => ({
    name: uniqueId('Test Role'),
    guard_name: 'api' as const,
    permissions: [],
  }),

  // Role with permissions
  roleWithPermissions: () => ({
    name: uniqueId('Role With Perms'),
    guard_name: 'api' as const,
    permissions: ['view_users', 'view_organizations', 'view_transactions'],
  }),

  // Invalid role data for validation testing
  invalidRole: {
    emptyName: {
      name: '',
      guard_name: 'api' as const,
    },
    tooLongName: {
      name: 'A'.repeat(256),
      guard_name: 'api' as const,
    },
  },

  // Common permission groups
  permissionGroups: {
    users: [
      'view_users',
      'create_users',
      'edit_users',
      'delete_users',
      'manage_user_roles',
    ],
    organizations: [
      'view_organizations',
      'create_organizations',
      'edit_organizations',
      'delete_organizations',
      'verify_organizations',
    ],
    transactions: [
      'view_transactions',
      'create_transactions',
      'refund_transactions',
      'export_transactions',
    ],
    kyc: [
      'view_kyc',
      'approve_kyc',
      'reject_kyc',
      'request_kyc_info',
    ],
    reports: [
      'view_reports',
      'export_reports',
      'view_analytics',
    ],
    settings: [
      'manage_settings',
      'manage_integrations',
      'manage_api_keys',
    ],
  },
};

// =============================================================================
// KYC TEST DATA
// =============================================================================

export const kycTestData = {
  // Valid KYC status transitions
  validTransitions: [
    { from: 'submitted', to: 'in_review' },
    { from: 'in_review', to: 'needs_more_info' },
    { from: 'in_review', to: 'reviewed' },
    { from: 'reviewed', to: 'approved' },
    { from: 'in_review', to: 'rejected' },
  ],

  // Invalid transitions for testing
  invalidTransitions: [
    { from: 'approved', to: 'submitted' },
    { from: 'rejected', to: 'approved' },
    { from: 'not_submitted', to: 'approved' },
  ],

  // Status update data
  approveData: {
    status: 'approved' as const,
    notes: 'All documents verified successfully.',
  },

  rejectData: {
    status: 'rejected' as const,
    reason: 'Documents do not meet requirements.',
    notes: 'Please resubmit with valid government-issued ID.',
  },

  needsMoreInfoData: {
    status: 'needs_more_info' as const,
    reason: 'Additional documentation required.',
    notes: 'Please provide proof of address dated within last 3 months.',
  },

  // Filter options
  filterOptions: {
    statuses: [
      'not_submitted',
      'pending',
      'submitted',
      'in_review',
      'needs_more_info',
      'reviewed',
      'approved',
      'rejected',
    ],
    sortOptions: ['created_at', 'updated_at', 'organization_name'],
  },
};

// =============================================================================
// USER TEST DATA
// =============================================================================

export const userTestData = {
  // Valid user data
  validUser: () => ({
    name: `Test User ${uniqueId()}`,
    email: `testuser_${uniqueId()}@example.com`,
    password: 'SecurePassword123!',
    role: 'viewer',
  }),

  // Admin user
  adminUser: () => ({
    name: `Admin User ${uniqueId()}`,
    email: `admin_${uniqueId()}@example.com`,
    password: 'AdminPassword123!',
    role: 'admin',
  }),

  // Invalid user data
  invalidUser: {
    invalidEmail: {
      name: 'Test User',
      email: 'invalid-email',
      password: 'Password123!',
    },
    weakPassword: {
      name: 'Test User',
      email: 'test@example.com',
      password: '123',
    },
  },
};

// =============================================================================
// ORGANIZATION TEST DATA
// =============================================================================

export const organizationTestData = {
  // Valid organization
  validOrganization: () => ({
    name: `Test Organization ${uniqueId()}`,
    email: `org_${uniqueId()}@example.com`,
    phone: '+1234567890',
    address: '123 Test Street, Test City',
    type: 'business' as const,
  }),

  // Organization types
  types: ['individual', 'business', 'enterprise', 'government'],

  // Verification statuses
  verificationStatuses: ['pending', 'verified', 'rejected', 'suspended'],
};

// =============================================================================
// TRANSACTION TEST DATA
// =============================================================================

export const transactionTestData = {
  // Transaction statuses
  statuses: ['pending', 'processing', 'completed', 'failed', 'refunded'],

  // Transaction types
  types: ['payment', 'refund', 'transfer', 'withdrawal', 'deposit'],

  // Filter options
  filterOptions: {
    dateRanges: ['today', 'yesterday', 'last_7_days', 'last_30_days', 'custom'],
    amountRanges: [
      { min: 0, max: 100 },
      { min: 100, max: 1000 },
      { min: 1000, max: 10000 },
      { min: 10000, max: null },
    ],
  },

  // Sample transaction
  sampleTransaction: () => ({
    id: uniqueId('txn'),
    amount: Math.floor(Math.random() * 10000) + 100,
    currency: 'USD',
    status: 'completed',
    type: 'payment',
    created_at: new Date().toISOString(),
  }),
};

// =============================================================================
// REPORT TEST DATA
// =============================================================================

export const reportTestData = {
  // Report periods
  periods: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],

  // Report types
  types: ['revenue', 'transactions', 'users', 'organizations', 'kyc'],

  // Export formats
  exportFormats: ['csv', 'xlsx', 'pdf'],

  // Sample report request
  sampleReportRequest: () => ({
    type: 'revenue',
    period: 'monthly',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
    format: 'csv',
  }),
};

// =============================================================================
// API RESPONSE MOCKS
// =============================================================================

export const mockResponses = {
  // Success response
  success: <T>(data: T) => ({
    success: true,
    data,
    message: 'Operation successful',
  }),

  // Error response
  error: (message: string, code: number = 400) => ({
    success: false,
    error: {
      code,
      message,
    },
  }),

  // Paginated response
  paginated: <T>(items: T[], page: number = 1, perPage: number = 10) => ({
    success: true,
    data: {
      data: items,
      meta: {
        current_page: page,
        per_page: perPage,
        total: items.length,
        last_page: Math.ceil(items.length / perPage),
      },
    },
  }),

  // Validation error
  validationError: (errors: Record<string, string[]>) => ({
    success: false,
    error: {
      code: 422,
      message: 'Validation failed',
      errors,
    },
  }),
};

// =============================================================================
// TEST HELPERS
// =============================================================================

/**
 * Wait for a specific duration
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test_${randomString(8)}@example.com`;
}

/**
 * Generate random phone number
 */
export function randomPhone(): string {
  return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

/**
 * Format date for API requests
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for testing
 */
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

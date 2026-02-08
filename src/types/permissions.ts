/**
 * Permission categories from backend
 */
export type PermissionCategory =
  | 'Organization'
  | 'Member Management'
  | 'Vendor Management'
  | 'Payment Pages'
  | 'Transactions'
  | 'Disbursements'
  | 'Reports'
  | 'KYC Management'
  | 'Role & Permission Management';

/**
 * Permission definition matching backend structure
 */
export interface Permission {
  id: number;
  name: string;
  guard_name: 'api';
  description?: string;
  category?: PermissionCategory;
  created_at?: string;
  updated_at?: string;
}

/**
 * Permission with source information (direct or from role)
 */
export interface PermissionWithSource extends Permission {
  source: 'direct' | `role:${string}`;
}

/**
 * Role definition matching backend structure
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  guard_name: 'api';
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
  users_count?: number;
  is_system?: boolean;
}

/**
 * Grouped permissions by category
 */
export type GroupedPermissions = Record<PermissionCategory, Permission[]>;

/**
 * Permission check options
 */
export interface PermissionCheckOptions {
  /**
   * Require all permissions (AND logic) or any permission (OR logic)
   * @default 'all'
   */
  requireAll?: boolean;

  /**
   * Check only direct permissions, ignoring role-based permissions
   * @default false
   */
  directOnly?: boolean;
}

/**
 * System roles that cannot be modified
 */
export const SYSTEM_ROLES = ['Super Admin', 'Platform Admin'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

/**
 * All available permissions (matches backend ROLE_MANAGEMENT_API.md)
 */
export const PERMISSIONS = {
  // Organization Management
  MANAGE_ORGANIZATION: 'Manage Organization',
  MANAGE_SETTINGS: 'Manage Settings',

  // Member Management
  MANAGE_MEMBERS: 'Manage Members',

  // Vendor Management
  MANAGE_VENDORS: 'Manage Vendors',

  // Payment Pages
  MANAGE_PAYMENT_PAGES: 'Manage Payment Pages',

  // Transactions
  VIEW_TRANSACTIONS: 'View Transactions',
  EXPORT_TRANSACTIONS: 'Export Transactions',

  // Disbursements
  MANAGE_DISBURSEMENTS: 'Manage Disbursements',

  // Reports
  VIEW_REPORTS: 'View Reports',

  // KYC Management
  VIEW_KYC: 'View KYC',
  APPROVE_KYC: 'Approve KYC',
  REJECT_KYC: 'Reject KYC',
  EXPORT_KYC: 'Export KYC',

  // Role & Permission Management
  VIEW_ROLES: 'View Roles',
  CREATE_ROLES: 'Create Roles',
  UPDATE_ROLES: 'Update Roles',
  DELETE_ROLES: 'Delete Roles',
  ASSIGN_ROLES: 'Assign Roles',
  VIEW_PERMISSIONS: 'View Permissions',
  ASSIGN_PERMISSIONS: 'Assign Permissions',

  // Admin - User Management
  ADMIN_VIEW_USERS: 'Admin View Users',
  ADMIN_MANAGE_USERS: 'Admin Manage Users',

  // Admin - Organization Management
  ADMIN_VIEW_ORGANIZATIONS: 'Admin View Organizations',
  ADMIN_MANAGE_ORGANIZATIONS: 'Admin Manage Organizations',

  // Admin - Activity Logs
  ADMIN_VIEW_LOGS: 'Admin View Logs',

  // Admin - Reports
  ADMIN_VIEW_REVENUE_REPORTS: 'Admin View Revenue Reports',

  // Admin - Vendors
  ADMIN_VIEW_VENDORS: 'Admin View Vendors',
  ADMIN_MANAGE_VENDORS: 'Admin Manage Vendors',

  // Admin - Payment Pages
  ADMIN_VIEW_PAYMENT_PAGES: 'Admin View Payment Pages',
  ADMIN_MANAGE_PAYMENT_PAGES: 'Admin Manage Payment Pages',

  // Admin - Disbursements
  ADMIN_VIEW_DISBURSEMENTS: 'Admin View Disbursements',
  ADMIN_MANAGE_DISBURSEMENTS: 'Admin Manage Disbursements',

  // Admin - Payout Accounts
  ADMIN_VIEW_PAYOUT_ACCOUNTS: 'Admin View Payout Accounts',
  ADMIN_MANAGE_PAYOUT_ACCOUNTS: 'Admin Manage Payout Accounts',

  // Admin - Platform Configuration
  ADMIN_MANAGE_COUNTRIES: 'Admin Manage Countries',
  ADMIN_MANAGE_GATEWAYS: 'Admin Manage Gateways',
  ADMIN_MANAGE_FEES: 'Admin Manage Fees',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Convert permission name to backend format (snake_case)
 * Frontend uses "View KYC" but backend uses "view_kyc"
 */
export function toBackendPermission(permission: string): string {
  return permission.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Convert backend permission (snake_case) to frontend format (Title Case with spaces)
 */
export function toFrontendPermission(permission: string): string {
  return permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a permission name is valid
 */
export function isValidPermission(permission: string): boolean {
  const backendFormat = toBackendPermission(permission);
  return Object.values(PERMISSIONS).some(
    p => toBackendPermission(p) === backendFormat
  );
}

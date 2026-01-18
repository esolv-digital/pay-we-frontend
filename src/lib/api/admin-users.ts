/**
 * Admin User Management API Client
 *
 * Provides methods for admin users to manage all platform users.
 * Includes CRUD operations, role assignment, and user status management.
 *
 * @module lib/api/admin-users
 */

import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * User status enumeration
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * User data structure
 */
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: UserStatus;

  // Roles & Permissions
  roles?: string[];
  permissions?: string[];

  // Organization association
  organization_id?: string;
  organization_name?: string;

  // Metadata
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * User list filters
 */
export interface UserFilters extends PaginationParams {
  search?: string; // Search by name, email, phone
  status?: UserStatus | UserStatus[];
  role?: string; // Filter by role name
  organization_id?: string;
  email_verified?: boolean;
  sort_by?: 'created_at' | 'last_login_at' | 'email' | 'first_name';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Create user request
 */
export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  roles?: string[]; // Role names to assign
  organization_id?: string;
  send_welcome_email?: boolean;
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
  roles?: string[];
  organization_id?: string;
}

/**
 * Assign roles request
 */
export interface AssignRolesRequest {
  user_id: string;
  roles: string[]; // Array of role names
}

/**
 * User statistics
 */
export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  suspended_users: number;
  pending_users: number;
  verified_users: number;
  unverified_users: number;

  // By role
  by_role?: Array<{
    role: string;
    count: number;
  }>;

  // By organization
  by_organization?: Array<{
    organization_id: string;
    organization_name: string;
    count: number;
  }>;

  // Recent activity
  recent_registrations: number; // Last 7 days
  recent_logins: number; // Last 24 hours
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Admin User API Client
 */
export const adminUsersApi = {
  /**
   * List all users with filters and pagination
   *
   * @param filters - User filters
   * @returns Paginated list of users
   *
   * @example
   * ```typescript
   * const users = await adminUsersApi.list({
   *   status: 'active',
   *   role: 'Vendor Admin',
   *   page: 1,
   *   per_page: 20,
   * });
   * ```
   */
  async list(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    // Search
    if (filters.search) params.append('search', filters.search);

    // Status
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => params.append('status[]', s));
      } else {
        params.append('status', filters.status);
      }
    }

    // Role filter
    if (filters.role) params.append('role', filters.role);

    // Organization
    if (filters.organization_id) {
      params.append('organization_id', filters.organization_id);
    }

    // Email verified
    if (filters.email_verified !== undefined) {
      params.append('email_verified', filters.email_verified.toString());
    }

    // Sorting
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) {
      params.append('sort_direction', filters.sort_direction);
    }

    const response = await apiClient.get<PaginatedResponse<User>>(
      `/admin/users?${params.toString()}`
    );

    return response;
  },

  /**
   * Get a single user by ID
   *
   * @param id - User ID
   * @returns User details
   *
   * @example
   * ```typescript
   * const user = await adminUsersApi.get('user-uuid-123');
   * ```
   */
  async get(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(
      `/admin/users/${id}`
    );

    return response;
  },

  /**
   * Create a new user
   *
   * @param data - User creation data
   * @returns Created user
   *
   * @example
   * ```typescript
   * const user = await adminUsersApi.create({
   *   first_name: 'John',
   *   last_name: 'Doe',
   *   email: 'john@example.com',
   *   password: 'SecurePassword123!',
   *   password_confirmation: 'SecurePassword123!',
   *   roles: ['Platform Admin'],
   * });
   * ```
   */
  async create(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/admin/users',
      data
    );

    return response;
  },

  /**
   * Update an existing user
   *
   * @param id - User ID
   * @param data - User update data
   * @returns Updated user
   *
   * @example
   * ```typescript
   * const user = await adminUsersApi.update('user-uuid-123', {
   *   first_name: 'Jane',
   *   email: 'jane@example.com',
   * });
   * ```
   */
  async update(
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(
      `/admin/users/${id}`,
      data
    );

    return response;
  },

  /**
   * Delete a user
   *
   * @param id - User ID
   * @returns Success response
   *
   * @example
   * ```typescript
   * await adminUsersApi.delete('user-uuid-123');
   * ```
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/users/${id}`
    );

    return response;
  },

  /**
   * Suspend a user account
   *
   * @param id - User ID
   * @param reason - Suspension reason
   * @returns Updated user
   *
   * @example
   * ```typescript
   * await adminUsersApi.suspend('user-uuid-123', 'Violation of terms');
   * ```
   */
  async suspend(
    id: string,
    reason?: string
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/suspend`,
      { reason }
    );

    return response;
  },

  /**
   * Activate a suspended user account
   *
   * @param id - User ID
   * @returns Updated user
   *
   * @example
   * ```typescript
   * await adminUsersApi.activate('user-uuid-123');
   * ```
   */
  async activate(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/activate`
    );

    return response;
  },

  /**
   * Assign roles to a user
   *
   * @param userId - User ID
   * @param roles - Array of role names
   * @returns Updated user with roles
   *
   * @example
   * ```typescript
   * await adminUsersApi.assignRoles('user-uuid-123', ['Platform Admin', 'Vendor Admin']);
   * ```
   */
  async assignRoles(
    userId: string,
    roles: string[]
  ): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/admin/roles/assign',
      {
        user_id: userId,
        roles,
      }
    );

    return response;
  },

  /**
   * Get user statistics
   *
   * @returns User statistics
   *
   * @example
   * ```typescript
   * const stats = await adminUsersApi.getStatistics();
   * console.log(stats.total_users, stats.active_users);
   * ```
   */
  async getStatistics(): Promise<ApiResponse<UserStatistics>> {
    const response = await apiClient.get<ApiResponse<UserStatistics>>(
      '/admin/users/statistics'
    );

    return response;
  },

  /**
   * Resend verification email to user
   *
   * @param id - User ID
   * @returns Success response
   *
   * @example
   * ```typescript
   * await adminUsersApi.resendVerificationEmail('user-uuid-123');
   * ```
   */
  async resendVerificationEmail(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/admin/users/${id}/resend-verification`
    );

    return response;
  },

  /**
   * Reset user password (sends reset email)
   *
   * @param id - User ID
   * @returns Success response
   *
   * @example
   * ```typescript
   * await adminUsersApi.resetPassword('user-uuid-123');
   * ```
   */
  async resetPassword(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/admin/users/${id}/reset-password`
    );

    return response;
  },
};

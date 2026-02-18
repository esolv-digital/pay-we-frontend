/**
 * Admin Management API Client
 *
 * Manages platform administrators (Super Admin, Platform Admin).
 * Separate from general user management — admins have elevated access.
 *
 * Backend: A12 - Admin Management endpoints
 * Ref: docs/ADMIN_AND_USER_MANAGEMENT.md
 *
 * NOTE: Admins CANNOT be deleted — only suspended/activated (ISO 27001 audit trail).
 *
 * @module lib/api/admin-management
 */

import { apiClient } from './client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

export type AdminStatus = 'active' | 'suspended';
export type AdminRole = 'Super Admin' | 'Platform Admin';

/**
 * Admin-specific metadata nested under `admin` key
 */
export interface AdminInfo {
  is_super_admin: boolean;
  is_platform_admin: boolean;
  platform_roles: string[];
  platform_permissions: string[];
}

/**
 * Administrator user returned by the backend.
 * `id` is a UUID string.
 */
export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  middle_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  status: AdminStatus;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  admin: AdminInfo;
  has_admin_access: boolean;
  has_vendor_access: boolean;
}

/**
 * Admin list filters
 */
export interface AdminFilters extends PaginationParams {
  search?: string;
  status?: AdminStatus;
  role?: AdminRole;
}

/**
 * Admin statistics from the backend
 */
export interface AdminStatistics {
  total: number;
  super_admins: number;
  platform_admins: number;
  active: number;
  suspended: number;
}

/**
 * Create administrator request
 */
export interface CreateAdminRequest {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role?: AdminRole;
}

/**
 * Update administrator request (all fields optional)
 */
export interface UpdateAdminRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: AdminRole;
}

/**
 * Suspend administrator request
 * ISO 27001: reason is required for audit trail.
 */
export interface SuspendAdminRequest {
  reason: string;
  /** 1-365 days. Omit for indefinite suspension. */
  duration_days?: number;
}

/**
 * Promote an existing user to administrator.
 * Used from User Management to grant admin access.
 */
export interface PromoteUserRequest {
  role: AdminRole;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminManagementApi = {
  /**
   * List all administrators with pagination
   * Auth: Platform Admin or Super Admin
   */
  async list(filters: AdminFilters = {}): Promise<PaginatedResponse<AdminUser>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);

    const query = params.toString();
    return apiClient.get<PaginatedResponse<AdminUser>>(
      `/admin/users/admins${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get administrator statistics
   * Auth: Super Admin only
   */
  async getStatistics(): Promise<AdminStatistics> {
    return apiClient.get<AdminStatistics>('/admin/users/admins/statistics');
  },

  /**
   * Get a single administrator by UUID
   * Auth: Platform Admin or Super Admin
   */
  async get(id: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(`/admin/users/admins/${id}`);
  },

  /**
   * Create a new administrator
   * Auth: Super Admin only
   */
  async create(data: CreateAdminRequest): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/users', data);
  },

  /**
   * Update an administrator
   * Auth: Super Admin only
   */
  async update(id: string, data: UpdateAdminRequest): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`/admin/users/admins/${id}`, data);
  },

  /**
   * Suspend an administrator
   * Auth: Super Admin only
   * Self-protection: cannot suspend self or Super Admin (backend enforces)
   */
  async suspend(id: string, data: SuspendAdminRequest): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/admins/${id}/suspend`, data);
  },

  /**
   * Activate a suspended administrator
   * Auth: Super Admin only
   */
  async activate(id: string): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/admins/${id}/activate`);
  },

  /**
   * Promote an existing vendor/org user to administrator (creates a dual user).
   * Auth: Super Admin only
   * Returns 422 if user is already an admin.
   */
  async promote(id: string, data: PromoteUserRequest): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/${id}/promote`, data);
  },

  /**
   * Demote an administrator — removes all platform admin roles.
   * Auth: Super Admin only
   * Self-protection: cannot demote self or Super Admin (backend enforces).
   */
  async demote(id: string): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/admins/${id}/demote`);
  },

  // NOTE: No delete endpoint — admins cannot be deleted (ISO 27001 audit trail).
};

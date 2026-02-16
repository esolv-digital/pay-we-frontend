/**
 * Admin Management API Client
 *
 * Manages platform administrators (Super Admin, Platform Admin).
 * Separate from general user management — admins have elevated access.
 *
 * Backend: A12 - Admin Management endpoints
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
 * Administrator user returned by the backend
 */
export interface AdminUser {
  id: number;
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
 * Update administrator request
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
 */
export interface SuspendAdminRequest {
  reason: string;
  duration_days?: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminManagementApi = {
  /**
   * List all administrators with pagination
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
   */
  async getStatistics(): Promise<AdminStatistics> {
    return apiClient.get<AdminStatistics>('/admin/users/admins/statistics');
  },

  /**
   * Get a single administrator by ID
   */
  async get(id: number): Promise<AdminUser> {
    return apiClient.get<AdminUser>(`/admin/users/admins/${id}`);
  },

  /**
   * Create a new administrator
   * Uses the general POST /admin/users endpoint with admin role
   */
  async create(data: CreateAdminRequest): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/users', data);
  },

  /**
   * Update an administrator
   */
  async update(id: number, data: UpdateAdminRequest): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`/admin/users/admins/${id}`, data);
  },

  /**
   * Suspend an administrator
   */
  async suspend(id: number, data: SuspendAdminRequest): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/admins/${id}/suspend`, data);
  },

  /**
   * Activate a suspended administrator
   */
  async activate(id: number): Promise<AdminUser> {
    return apiClient.post<AdminUser>(`/admin/users/admins/${id}/activate`);
  },

  /**
   * Soft-delete an administrator
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/admins/${id}`);
  },
};

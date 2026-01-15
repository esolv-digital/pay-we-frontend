/**
 * Admin Organization Management API Client
 *
 * Provides methods for admin users to manage organizations.
 * Includes listing, viewing, and status management operations.
 *
 * @module lib/api/admin-organizations
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
 * Organization status enumeration
 */
export type OrganizationStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * Organization data structure
 */
export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: OrganizationStatus;

  // Business details
  business_name?: string;
  business_type?: string;
  tax_id?: string;
  registration_number?: string;

  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  // Financial
  balance?: number;
  currency?: string;

  // Settings
  settings?: Record<string, unknown>;

  // Metadata
  owner_id?: string;
  owner_name?: string;
  user_count?: number;
  transaction_count?: number;
  total_volume?: number;

  // Timestamps
  verified_at?: string;
  suspended_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Organization list filters
 */
export interface OrganizationFilters extends PaginationParams {
  search?: string; // Search by name, email, business name
  status?: OrganizationStatus | OrganizationStatus[];
  country?: string;
  business_type?: string;
  verified?: boolean;
  sort_by?: 'created_at' | 'name' | 'transaction_count' | 'total_volume';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Organization statistics
 */
export interface OrganizationStatistics {
  total_organizations: number;
  active_organizations: number;
  inactive_organizations: number;
  suspended_organizations: number;
  pending_organizations: number;
  verified_organizations: number;
  unverified_organizations: number;

  // By country
  by_country?: Array<{
    country: string;
    count: number;
  }>;

  // By business type
  by_business_type?: Array<{
    business_type: string;
    count: number;
  }>;

  // Financial
  total_balance: number;
  total_transaction_volume: number;

  // Recent activity
  recent_registrations: number; // Last 7 days
  recent_transactions: number; // Last 24 hours
}

/**
 * Suspend organization request
 */
export interface SuspendOrganizationRequest {
  reason?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Admin Organization API Client
 */
export const adminOrganizationsApi = {
  /**
   * List all organizations with filters and pagination
   *
   * @param filters - Organization filters
   * @returns Paginated list of organizations
   *
   * @example
   * ```typescript
   * const organizations = await adminOrganizationsApi.list({
   *   status: 'active',
   *   country: 'NG',
   *   page: 1,
   *   per_page: 20,
   * });
   * ```
   */
  async list(
    filters: OrganizationFilters = {}
  ): Promise<PaginatedResponse<Organization>> {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page)
      params.append('per_page', filters.per_page.toString());

    // Search
    if (filters.search) params.append('search', filters.search);

    // Status
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach((s) => params.append('status[]', s));
      } else {
        params.append('status', filters.status);
      }
    }

    // Country
    if (filters.country) params.append('country', filters.country);

    // Business type
    if (filters.business_type) {
      params.append('business_type', filters.business_type);
    }

    // Verified
    if (filters.verified !== undefined) {
      params.append('verified', filters.verified.toString());
    }

    // Sorting
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) {
      params.append('sort_direction', filters.sort_direction);
    }

    const response = await apiClient.get<PaginatedResponse<Organization>>(
      `/admin/organizations?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Get a single organization by ID
   *
   * @param id - Organization ID
   * @returns Organization details
   *
   * @example
   * ```typescript
   * const organization = await adminOrganizationsApi.get('org-uuid-123');
   * ```
   */
  async get(id: string): Promise<ApiResponse<Organization>> {
    const response = await apiClient.get<ApiResponse<Organization>>(
      `/admin/organizations/${id}`
    );

    return response.data;
  },

  /**
   * Suspend an organization
   *
   * @param id - Organization ID
   * @param reason - Suspension reason
   * @returns Updated organization
   *
   * @example
   * ```typescript
   * await adminOrganizationsApi.suspend('org-uuid-123', 'Fraudulent activity detected');
   * ```
   */
  async suspend(
    id: string,
    reason?: string
  ): Promise<ApiResponse<Organization>> {
    const response = await apiClient.post<ApiResponse<Organization>>(
      `/admin/organizations/${id}/suspend`,
      { reason }
    );

    return response.data;
  },

  /**
   * Activate a suspended organization
   *
   * @param id - Organization ID
   * @returns Updated organization
   *
   * @example
   * ```typescript
   * await adminOrganizationsApi.activate('org-uuid-123');
   * ```
   */
  async activate(id: string): Promise<ApiResponse<Organization>> {
    const response = await apiClient.post<ApiResponse<Organization>>(
      `/admin/organizations/${id}/activate`
    );

    return response.data;
  },

  /**
   * Get organization statistics
   *
   * @returns Organization statistics
   *
   * @example
   * ```typescript
   * const stats = await adminOrganizationsApi.getStatistics();
   * console.log(stats.total_organizations, stats.active_organizations);
   * ```
   */
  async getStatistics(): Promise<ApiResponse<OrganizationStatistics>> {
    const response = await apiClient.get<
      ApiResponse<OrganizationStatistics>
    >('/admin/organizations/statistics');

    return response.data;
  },
};

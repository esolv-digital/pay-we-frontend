/**
 * Admin Vendor Management API Client
 *
 * Aligned with backend Postman B4 contract.
 */

import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

export type AdminVendorStatus = 'active' | 'inactive' | 'suspended';

export interface AdminVendor {
  id: string;
  slug: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  country: string;
  currency_code: string;
  status: AdminVendorStatus;
  balance: number;
  total_revenue: number;
  total_transactions: number;
  auto_payout_enabled: boolean;
  fee_percentage: string;
  fee_bearer: string;
  payout_method: string;
  organization: { id: string; name: string };
  owner: { id: string; name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface AdminVendorFilters extends PaginationParams {
  search?: string;
  status?: AdminVendorStatus;
  organization_id?: string;
  currency_code?: string;
  sort_by?: 'business_name' | 'created_at' | 'status' | 'currency_code';
  sort_direction?: 'asc' | 'desc';
}

export interface AdminVendorStatistics {
  total: number;
  active: number;
  suspended: number;
  inactive: number;
  by_country: Array<{ country: string; count: number }>;
  by_currency: Array<{ currency: string; count: number }>;
  total_balance: number;
  total_revenue: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminVendorsApi = {
  async list(filters: AdminVendorFilters = {}): Promise<PaginatedResponse<AdminVendor>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.organization_id) params.append('organization_id', filters.organization_id);
    if (filters.currency_code) params.append('currency_code', filters.currency_code);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

    return apiClient.get<PaginatedResponse<AdminVendor>>(`/admin/vendors?${params.toString()}`);
  },

  async get(id: string): Promise<AdminVendor> {
    return apiClient.get<AdminVendor>(`/admin/vendors/${id}`);
  },

  async suspend(id: string, reason: string): Promise<AdminVendor> {
    return apiClient.post<AdminVendor>(`/admin/vendors/${id}/suspend`, { reason });
  },

  async activate(id: string): Promise<AdminVendor> {
    return apiClient.post<AdminVendor>(`/admin/vendors/${id}/activate`);
  },

  async getStatistics(): Promise<AdminVendorStatistics> {
    return apiClient.get<AdminVendorStatistics>('/admin/vendors/statistics');
  },
};

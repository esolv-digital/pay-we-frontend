/**
 * Admin Payout Accounts Management API Client
 *
 * Aligned with backend Postman B7 contract.
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

export type PayoutAccountType = 'bank' | 'mobile_money';
export type PayoutAccountStatus = 'active' | 'inactive' | 'pending_verification';

export interface AdminPayoutAccount {
  id: string;
  account_type: PayoutAccountType;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  bank_code: string | null;
  branch_code: string | null;
  mobile_money_network: string | null;
  mobile_money_phone: string | null;
  provider_name: string | null;
  country_code: string;
  currency_code: string;
  status: PayoutAccountStatus;
  is_primary: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  vendor: { id: string; business_name: string; slug: string };
  organization: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface AdminPayoutAccountFilters extends PaginationParams {
  search?: string;
  status?: PayoutAccountStatus;
  vendor_id?: string;
  account_type?: PayoutAccountType;
  gateway?: string;
  country_code?: string;
  sort_by?: 'created_at' | 'provider_name' | 'account_type' | 'status';
  sort_direction?: 'asc' | 'desc';
}

export interface AdminPayoutAccountStatistics {
  total: number;
  by_type: Array<{ type: string; count: number }>;
  verified: number;
  unverified: number;
  flagged: number;
  by_country: Array<{ country: string; count: number }>;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminPayoutAccountsApi = {
  async list(filters: AdminPayoutAccountFilters = {}): Promise<PaginatedResponse<AdminPayoutAccount>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
    if (filters.account_type) params.append('account_type', filters.account_type);
    if (filters.gateway) params.append('gateway', filters.gateway);
    if (filters.country_code) params.append('country_code', filters.country_code);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

    return apiClient.get<PaginatedResponse<AdminPayoutAccount>>(`/admin/payout-accounts?${params.toString()}`);
  },

  async get(id: string): Promise<ApiResponse<AdminPayoutAccount>> {
    return apiClient.get<ApiResponse<AdminPayoutAccount>>(`/admin/payout-accounts/${id}`);
  },

  async verify(id: string): Promise<ApiResponse<AdminPayoutAccount>> {
    return apiClient.post<ApiResponse<AdminPayoutAccount>>(`/admin/payout-accounts/${id}/verify`);
  },

  async flag(id: string, reason: string): Promise<ApiResponse<AdminPayoutAccount>> {
    return apiClient.post<ApiResponse<AdminPayoutAccount>>(`/admin/payout-accounts/${id}/flag`, { reason });
  },

  async getStatistics(): Promise<ApiResponse<AdminPayoutAccountStatistics>> {
    return apiClient.get<ApiResponse<AdminPayoutAccountStatistics>>('/admin/payout-accounts/statistics');
  },
};

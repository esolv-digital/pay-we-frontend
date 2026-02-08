/**
 * Admin Payment Pages Management API Client
 *
 * Aligned with backend Postman B5 contract.
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

export type AdminPaymentPageStatus = 'active' | 'inactive' | 'suspended';
export type AmountType = 'fixed' | 'flexible' | 'donation';

export interface AdminPaymentPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  amount: number | null;
  amount_type: AmountType;
  currency_code: string;
  status: AdminPaymentPageStatus;
  url: string;
  total_transactions: number;
  total_revenue: number;
  platform_fee_percentage: string;
  gateway_fee_percentage: string;
  flat_fee_amount: string;
  vendor: { id: string; business_name: string; slug: string };
  organization: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface AdminPaymentPageFilters extends PaginationParams {
  search?: string;
  status?: AdminPaymentPageStatus;
  vendor_id?: string;
  amount_type?: AmountType;
  currency?: string;
  sort_by?: 'title' | 'created_at' | 'amount_type' | 'currency_code';
  sort_direction?: 'asc' | 'desc';
}

export interface AdminPaymentPageStatistics {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  total_revenue: number;
  by_currency: Array<{ currency: string; count: number }>;
  by_amount_type: Array<{ type: string; count: number }>;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminPaymentPagesApi = {
  async list(filters: AdminPaymentPageFilters = {}): Promise<PaginatedResponse<AdminPaymentPage>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
    if (filters.amount_type) params.append('amount_type', filters.amount_type);
    if (filters.currency) params.append('currency', filters.currency);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

    return apiClient.get<PaginatedResponse<AdminPaymentPage>>(`/admin/payment-pages?${params.toString()}`);
  },

  async get(id: string): Promise<ApiResponse<AdminPaymentPage>> {
    return apiClient.get<ApiResponse<AdminPaymentPage>>(`/admin/payment-pages/${id}`);
  },

  async suspend(id: string, reason: string): Promise<ApiResponse<AdminPaymentPage>> {
    return apiClient.post<ApiResponse<AdminPaymentPage>>(`/admin/payment-pages/${id}/suspend`, { reason });
  },

  async activate(id: string): Promise<ApiResponse<AdminPaymentPage>> {
    return apiClient.post<ApiResponse<AdminPaymentPage>>(`/admin/payment-pages/${id}/activate`);
  },

  async getStatistics(): Promise<ApiResponse<AdminPaymentPageStatistics>> {
    return apiClient.get<ApiResponse<AdminPaymentPageStatistics>>('/admin/payment-pages/statistics');
  },
};

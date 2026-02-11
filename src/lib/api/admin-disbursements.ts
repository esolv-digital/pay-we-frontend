/**
 * Admin Disbursements Management API Client
 *
 * Aligned with backend Postman B6 contract.
 */

import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

export type AdminDisbursementStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';

export interface AdminDisbursement {
  id: string;
  batch_reference: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  currency_code: string;
  status: AdminDisbursementStatus;
  transaction_count: number;
  payout_method: string;
  payout_account: {
    id: string;
    account_name: string;
    account_number: string;
    bank_name: string | null;
  };
  vendor: { id: string; business_name: string; slug: string };
  organization: { id: string; name: string };
  initiated_at: string;
  scheduled_at: string | null;
  completed_at: string | null;
  failed_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminDisbursementFilters extends PaginationParams {
  search?: string;
  status?: AdminDisbursementStatus;
  vendor_id?: string;
  currency_code?: string;
  payout_method?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'net_amount' | 'status' | 'scheduled_at';
  sort_direction?: 'asc' | 'desc';
}

export interface AdminDisbursementStatistics {
  total_disbursed: number;
  pending_count: number;
  pending_amount: number;
  completed_count: number;
  completed_amount: number;
  failed_count: number;
  failed_amount: number;
  average_amount: number;
  by_status: Array<{ status: string; count: number; amount: number }>;
  by_currency: Array<{ currency: string; count: number; amount: number }>;
}

export interface ExportDisbursementsFilters {
  status?: string;
  currency_code?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminDisbursementsApi = {
  async list(filters: AdminDisbursementFilters = {}): Promise<PaginatedResponse<AdminDisbursement>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
    if (filters.currency_code) params.append('currency_code', filters.currency_code);
    if (filters.payout_method) params.append('payout_method', filters.payout_method);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

    return apiClient.get<PaginatedResponse<AdminDisbursement>>(`/admin/disbursements?${params.toString()}`);
  },

  async get(id: string): Promise<AdminDisbursement> {
    return apiClient.get<AdminDisbursement>(`/admin/disbursements/${id}`);
  },

  async approve(id: string): Promise<AdminDisbursement> {
    return apiClient.post<AdminDisbursement>(`/admin/disbursements/${id}/approve`);
  },

  async reject(id: string, reason: string): Promise<AdminDisbursement> {
    return apiClient.post<AdminDisbursement>(`/admin/disbursements/${id}/reject`, { reason });
  },

  async getStatistics(): Promise<AdminDisbursementStatistics> {
    return apiClient.get<AdminDisbursementStatistics>('/admin/disbursements/statistics');
  },

  async export(filters: ExportDisbursementsFilters = {}): Promise<string> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.currency_code) params.append('currency_code', filters.currency_code);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    return apiClient.get<string>(`/admin/disbursements/export?${params.toString()}`);
  },
};

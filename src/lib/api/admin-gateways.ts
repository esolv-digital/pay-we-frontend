/**
 * Admin Payment Gateways Management API Client
 *
 * Aligned with backend Postman B2 contract.
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

export interface Gateway {
  id: string;
  vendor_id: string | null;
  gateway: string;
  region: string;
  public_key: string;
  secret_key: string;
  merchant_id: string | null;
  encryption_key: string | null;
  webhook_secret: string;
  is_test_mode: boolean;
  is_active: boolean;
  supported_currencies: string[];
  supported_payment_methods: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GatewayFilters extends PaginationParams {
  search?: string;
  is_active?: boolean;
  provider?: string;
  sort_by?: 'created_at' | 'gateway' | 'is_active';
  sort_direction?: 'asc' | 'desc';
}

export interface CreateGatewayRequest {
  vendor_id?: string | null;
  gateway: string;
  region: string;
  public_key: string;
  secret_key: string;
  merchant_id?: string | null;
  encryption_key?: string | null;
  webhook_secret: string;
  is_test_mode: boolean;
  is_active: boolean;
  supported_currencies: string[];
  supported_payment_methods: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateGatewayRequest extends Partial<CreateGatewayRequest> {}

export interface GatewayStatistics {
  total: number;
  active: number;
  inactive: number;
  total_processed: number;
  transaction_volume_by_gateway: Array<{ gateway: string; count: number; amount: number }>;
  success_rate_by_gateway: Array<{ gateway: string; rate: number }>;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminGatewaysApi = {
  async list(filters: GatewayFilters = {}): Promise<PaginatedResponse<Gateway>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0');
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

    return apiClient.get<PaginatedResponse<Gateway>>(`/admin/gateways?${params.toString()}`);
  },

  async get(id: string): Promise<ApiResponse<Gateway>> {
    return apiClient.get<ApiResponse<Gateway>>(`/admin/gateways/${id}`);
  },

  async create(data: CreateGatewayRequest): Promise<ApiResponse<Gateway>> {
    return apiClient.post<ApiResponse<Gateway>>('/admin/gateways', data);
  },

  async update(id: string, data: UpdateGatewayRequest): Promise<ApiResponse<Gateway>> {
    return apiClient.put<ApiResponse<Gateway>>(`/admin/gateways/${id}`, data);
  },

  async deleteGateway(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/admin/gateways/${id}`);
  },

  async toggleActive(id: string): Promise<ApiResponse<Gateway>> {
    return apiClient.post<ApiResponse<Gateway>>(`/admin/gateways/${id}/toggle`);
  },

  async getStatistics(): Promise<ApiResponse<GatewayStatistics>> {
    return apiClient.get<ApiResponse<GatewayStatistics>>('/admin/gateways/statistics');
  },
};

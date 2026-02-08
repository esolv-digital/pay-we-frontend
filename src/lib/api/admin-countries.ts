/**
 * Admin Countries Management API Client
 *
 * Aligned with backend Postman B1 contract.
 */

import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types/api';
import type { Country, CountryPaymentMethod, PaymentMethod } from '@/types/country';

// ============================================================================
// TYPES
// ============================================================================

export interface CountryFilters extends PaginationParams {
  search?: string;
  region?: string;
  is_active?: boolean;
  can_send?: boolean;
  can_receive?: boolean;
  sort_by?: 'name' | 'code' | 'created_at' | 'region';
  sort_direction?: 'asc' | 'desc';
}

export interface CreateCountryRequest {
  code: string;
  name: string;
  currency_code: string;
  currency_symbol: string;
  region: string;
  phone_code: string;
  is_active: boolean;
  can_send: boolean;
  can_receive: boolean;
  platform_fee_percentage: number;
  min_transaction_amount: number;
  max_transaction_amount: number;
}

export interface UpdateCountryRequest extends Partial<CreateCountryRequest> {}

export interface UpdatePaymentMethodsRequest {
  payment_methods: Array<{
    payment_method: PaymentMethod;
    is_active: boolean;
    is_default: boolean;
    display_order: number;
    additional_fee_percentage: number;
  }>;
}

export interface CountryGatewayAssignment {
  gateway: string;
  is_active: boolean;
  priority: number;
}

export interface UpdateGatewaysRequest {
  gateways: CountryGatewayAssignment[];
}

export interface CountryStatistics {
  total: number;
  active: number;
  inactive: number;
  by_region: Array<{ region: string; count: number }>;
  total_payment_methods: number;
  active_payment_methods: number;
}

export interface AdminCountry extends Country {
  gateways?: CountryGatewayAssignment[];
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminCountriesApi = {
  async list(filters: CountryFilters = {}): Promise<PaginatedResponse<Country>> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.region) params.append('region', filters.region);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0');
    if (filters.can_send !== undefined) params.append('can_send', filters.can_send ? '1' : '0');
    if (filters.can_receive !== undefined) params.append('can_receive', filters.can_receive ? '1' : '0');
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

    return apiClient.get<PaginatedResponse<Country>>(`/admin/countries?${params.toString()}`);
  },

  async get(id: string): Promise<ApiResponse<AdminCountry>> {
    return apiClient.get<ApiResponse<AdminCountry>>(`/admin/countries/${id}`);
  },

  async create(data: CreateCountryRequest): Promise<ApiResponse<Country>> {
    return apiClient.post<ApiResponse<Country>>('/admin/countries', data);
  },

  async update(id: string, data: UpdateCountryRequest): Promise<ApiResponse<Country>> {
    return apiClient.put<ApiResponse<Country>>(`/admin/countries/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/admin/countries/${id}`);
  },

  async updatePaymentMethods(id: string, data: UpdatePaymentMethodsRequest): Promise<ApiResponse<CountryPaymentMethod[]>> {
    return apiClient.put<ApiResponse<CountryPaymentMethod[]>>(`/admin/countries/${id}/payment-methods`, data);
  },

  async updateGateways(id: string, data: UpdateGatewaysRequest): Promise<ApiResponse<CountryGatewayAssignment[]>> {
    return apiClient.put<ApiResponse<CountryGatewayAssignment[]>>(`/admin/countries/${id}/gateways`, data);
  },

  async getStatistics(): Promise<ApiResponse<CountryStatistics>> {
    return apiClient.get<ApiResponse<CountryStatistics>>('/admin/countries/statistics');
  },
};

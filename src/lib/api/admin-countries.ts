/**
 * Admin Countries Management API Client
 *
 * Aligned with backend COUNTRY_AND_FEE_SYSTEM_API.md contract.
 * Countries use ISO alpha-2 `code` (e.g. "GH") in all URL paths, NOT numeric IDs.
 * Countries cannot be deleted — only toggled active/inactive.
 */

import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/types/api';
import type { Country, CountryPaymentMethod, CountryGateway, PaymentMethod } from '@/types/country';

// ============================================================================
// TYPES
// ============================================================================

export interface CountryFilters extends PaginationParams {
  search?: string;
  region?: string;
  is_active?: boolean;
  can_send?: boolean;
  can_receive?: boolean;
  currency_code?: string;
  sort_by?: 'name' | 'code' | 'created_at' | 'region' | 'organizations_count';
  sort_direction?: 'asc' | 'desc';
}

export interface CreateCountryRequest {
  code: string;
  name: string;
  currency_code: string;
  currency_symbol?: string;
  region: string;
  phone_code?: string;
  is_active?: boolean;
  can_send?: boolean;
  can_receive?: boolean;
  platform_fee_percentage?: number;
  min_transaction_amount?: number;
  max_transaction_amount?: number;
}

export interface UpdateCountryRequest extends Partial<CreateCountryRequest> {}

export interface UpdatePaymentMethodsRequest {
  payment_methods: Array<{
    payment_method: PaymentMethod | string;
    is_active?: boolean;
    is_default?: boolean;
    display_order?: number;
    additional_fee_percentage?: number;
  }>;
}

export interface UpdateGatewaysRequest {
  gateways: Array<{
    gateway: string;
    is_active?: boolean;
    is_default?: boolean;
    priority?: number;
    fee_percentage?: number;
    supports_payouts?: boolean;
    supported_currencies?: string[];
    supported_payment_methods?: string[];
    metadata?: Record<string, unknown>;
  }>;
}

export interface CountryStatistics {
  total: number;
  active: number;
  by_region: Array<{ region: string; count: number }>;
  total_payment_methods: number;
  active_payment_methods: number;
  total_gateways: number;
  active_gateways: number;
  countries_with_gateways: number;
  payout_supporting_gateways: number;
  total_organizations: number;
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
    if (filters.currency_code) params.append('currency_code', filters.currency_code);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);

    return apiClient.get<PaginatedResponse<Country>>(`/admin/countries?${params.toString()}`);
  },

  async get(code: string): Promise<Country> {
    return apiClient.get<Country>(`/admin/countries/${code}`);
  },

  async create(data: CreateCountryRequest): Promise<Country> {
    return apiClient.post<Country>('/admin/countries', data);
  },

  async update(code: string, data: UpdateCountryRequest): Promise<Country> {
    return apiClient.put<Country>(`/admin/countries/${code}`, data);
  },

  async toggleStatus(code: string): Promise<Country> {
    return apiClient.post<Country>(`/admin/countries/${code}/toggle-status`);
  },

  async updatePaymentMethods(code: string, data: UpdatePaymentMethodsRequest): Promise<CountryPaymentMethod[]> {
    return apiClient.put<CountryPaymentMethod[]>(`/admin/countries/${code}/payment-methods`, data);
  },

  async updateGateways(code: string, data: UpdateGatewaysRequest): Promise<CountryGateway[]> {
    return apiClient.put<CountryGateway[]>(`/admin/countries/${code}/gateways`, data);
  },

  async getStatistics(): Promise<CountryStatistics> {
    return apiClient.get<CountryStatistics>('/admin/countries/statistics');
  },
};

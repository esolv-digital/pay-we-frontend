/**
 * Admin Fee Management API Client
 *
 * Aligned with backend COUNTRY_AND_FEE_SYSTEM_API.md contract.
 *
 * Fee hierarchy (highest priority first):
 * 1. Payment Page Level (gateway_fee_bearer override, include_fees_in_amount)
 * 2. Vendor Level (platform_fee_type/value, gateway_fee_bearer/vendor_percentage)
 * 3. Organization Level (fee_overrides in settings)
 * 4. Country + Gateway Level (country.platform_fee_percentage + gateway.fee_percentage)
 * 5. Global Platform Level (PlatformSetting, group: 'fees')
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

/** 'inherit' is used at payment page level to inherit vendor's fee bearer setting */
export type FeeBearer = 'customer' | 'vendor' | 'split' | 'inherit';

export interface FeeConfiguration {
  platform_fee_percentage: number;
  gateway_fee_percentage: number;
  flat_fee: number;
  fee_bearer: FeeBearer;
  split_percentage?: number;
}

export interface GlobalFees extends FeeConfiguration {
  updated_at: string;
  updated_by?: string;
}

export interface GatewayFeeOverride {
  gateway_id: string;
  gateway_name: string;
  fee_percentage: number;
  flat_fee: number;
  fee_bearer: FeeBearer;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationFeeOverride {
  organization_id: string;
  organization_name: string;
  fee_configuration: FeeConfiguration;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorFeeOverride {
  vendor_id: string;
  vendor_name: string;
  organization_name: string;
  platform_fee_type: string;
  platform_fee_value: number;
  gateway_fee_bearer: FeeBearer;
  gateway_fee_vendor_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeeOverviewResponse {
  global: GlobalFees;
  gateway_overrides: GatewayFeeOverride[];
  organization_overrides_count: number;
  vendor_overrides_count: number;
}

export interface FeeStatistics {
  global_fees: FeeConfiguration;
  total_overrides: number;
  org_overrides: number;
  vendor_overrides: number;
  total_fees_collected: number;
  avg_fee_percentage: string;
}

export interface UpdateGlobalFeesRequest {
  platform_fee_percentage: number;
  gateway_fee_percentage: number;
  flat_fee: number;
  fee_bearer: FeeBearer;
  split_percentage?: number;
}

export interface UpdateGatewayFeesRequest {
  fee_percentage: number;
  flat_fee: number;
  fee_bearer: FeeBearer;
}

export interface UpdateOrganizationFeesRequest {
  platform_fee_percentage?: number;
  gateway_fee_percentage?: number;
  flat_fee?: number;
  fee_bearer?: FeeBearer;
  split_percentage?: number;
}

export interface UpdateVendorFeesRequest {
  platform_fee_type?: string;
  platform_fee_value?: number;
  gateway_fee_bearer?: FeeBearer;
  gateway_fee_vendor_percentage?: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const adminFeesApi = {
  async getOverview(): Promise<FeeOverviewResponse> {
    return apiClient.get<FeeOverviewResponse>('/admin/fees');
  },

  async updateGlobalFees(data: UpdateGlobalFeesRequest): Promise<GlobalFees> {
    return apiClient.put<GlobalFees>('/admin/fees/global', data);
  },

  async getGatewayFees(gatewayId: string): Promise<GatewayFeeOverride> {
    return apiClient.get<GatewayFeeOverride>(`/admin/fees/gateways/${gatewayId}`);
  },

  async updateGatewayFees(gatewayId: string, data: UpdateGatewayFeesRequest): Promise<GatewayFeeOverride> {
    return apiClient.put<GatewayFeeOverride>(`/admin/fees/gateways/${gatewayId}`, data);
  },

  async getOrganizationFees(orgId: string): Promise<OrganizationFeeOverride> {
    return apiClient.get<OrganizationFeeOverride>(`/admin/fees/organizations/${orgId}`);
  },

  async updateOrganizationFees(orgId: string, data: UpdateOrganizationFeesRequest): Promise<OrganizationFeeOverride> {
    return apiClient.put<OrganizationFeeOverride>(`/admin/fees/organizations/${orgId}`, data);
  },

  async getVendorFees(vendorId: string): Promise<VendorFeeOverride> {
    return apiClient.get<VendorFeeOverride>(`/admin/fees/vendors/${vendorId}`);
  },

  async updateVendorFees(vendorId: string, data: UpdateVendorFeesRequest): Promise<VendorFeeOverride> {
    return apiClient.put<VendorFeeOverride>(`/admin/fees/vendors/${vendorId}`, data);
  },

  async getStatistics(): Promise<FeeStatistics> {
    return apiClient.get<FeeStatistics>('/admin/fees/statistics');
  },
};

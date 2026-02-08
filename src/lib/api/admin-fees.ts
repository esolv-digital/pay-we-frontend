/**
 * Admin Fee Management API Client
 *
 * Aligned with backend Postman B3 contract.
 */

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

export type FeeBearer = 'customer' | 'vendor' | 'split';

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
  async getOverview(): Promise<ApiResponse<FeeOverviewResponse>> {
    return apiClient.get<ApiResponse<FeeOverviewResponse>>('/admin/fees');
  },

  async updateGlobalFees(data: UpdateGlobalFeesRequest): Promise<ApiResponse<GlobalFees>> {
    return apiClient.put<ApiResponse<GlobalFees>>('/admin/fees/global', data);
  },

  async getGatewayFees(gatewayId: string): Promise<ApiResponse<GatewayFeeOverride>> {
    return apiClient.get<ApiResponse<GatewayFeeOverride>>(`/admin/fees/gateways/${gatewayId}`);
  },

  async updateGatewayFees(gatewayId: string, data: UpdateGatewayFeesRequest): Promise<ApiResponse<GatewayFeeOverride>> {
    return apiClient.put<ApiResponse<GatewayFeeOverride>>(`/admin/fees/gateways/${gatewayId}`, data);
  },

  async getOrganizationFees(orgId: string): Promise<ApiResponse<OrganizationFeeOverride>> {
    return apiClient.get<ApiResponse<OrganizationFeeOverride>>(`/admin/fees/organizations/${orgId}`);
  },

  async updateOrganizationFees(orgId: string, data: UpdateOrganizationFeesRequest): Promise<ApiResponse<OrganizationFeeOverride>> {
    return apiClient.put<ApiResponse<OrganizationFeeOverride>>(`/admin/fees/organizations/${orgId}`, data);
  },

  async getVendorFees(vendorId: string): Promise<ApiResponse<VendorFeeOverride>> {
    return apiClient.get<ApiResponse<VendorFeeOverride>>(`/admin/fees/vendors/${vendorId}`);
  },

  async updateVendorFees(vendorId: string, data: UpdateVendorFeesRequest): Promise<ApiResponse<VendorFeeOverride>> {
    return apiClient.put<ApiResponse<VendorFeeOverride>>(`/admin/fees/vendors/${vendorId}`, data);
  },

  async getStatistics(): Promise<ApiResponse<FeeStatistics>> {
    return apiClient.get<ApiResponse<FeeStatistics>>('/admin/fees/statistics');
  },
};

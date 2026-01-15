/**
 * Admin Reports API Client
 *
 * Provides methods for viewing revenue reports and analytics.
 * Includes filtering by period, organization, and vendor.
 *
 * @module lib/api/admin-reports
 */

import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Report period enumeration
 */
export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * Revenue report data structure
 */
export interface RevenueReport {
  // Summary
  total_revenue: number;
  total_transactions: number;
  average_transaction_value: number;
  currency: string;

  // By status
  completed_revenue: number;
  completed_transactions: number;
  pending_revenue: number;
  pending_transactions: number;
  failed_transactions: number;

  // Growth metrics
  revenue_growth_percentage?: number; // Compared to previous period
  transaction_growth_percentage?: number;

  // By gateway
  by_gateway?: Array<{
    gateway: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }>;

  // By organization
  by_organization?: Array<{
    organization_id: string;
    organization_name: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }>;

  // By vendor
  by_vendor?: Array<{
    vendor_id: string;
    vendor_name: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }>;

  // Top performers
  top_vendors?: Array<{
    vendor_id: string;
    vendor_name: string;
    revenue: number;
    transactions: number;
  }>;

  top_organizations?: Array<{
    organization_id: string;
    organization_name: string;
    revenue: number;
    transactions: number;
  }>;

  // Time series data (for charts)
  revenue_over_time?: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;

  // Period info
  period_start: string;
  period_end: string;
}

/**
 * Revenue report filters
 */
export interface RevenueReportFilters {
  period?: ReportPeriod;
  from_date?: string; // ISO 8601 date (for custom period)
  to_date?: string; // ISO 8601 date (for custom period)
  organization_id?: string;
  vendor_id?: string;
  gateway?: string;
  currency?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Admin Reports API Client
 */
export const adminReportsApi = {
  /**
   * Get revenue report with filters
   *
   * @param filters - Report filters
   * @returns Revenue report data
   *
   * @example
   * ```typescript
   * const report = await adminReportsApi.getRevenue({
   *   period: 'month',
   *   organization_id: 'org-123',
   * });
   * ```
   */
  async getRevenue(
    filters: RevenueReportFilters = {}
  ): Promise<ApiResponse<RevenueReport>> {
    const params = new URLSearchParams();

    // Period
    if (filters.period) params.append('period', filters.period);

    // Custom date range
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    // Filters
    if (filters.organization_id) {
      params.append('organization_id', filters.organization_id);
    }
    if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
    if (filters.gateway) params.append('gateway', filters.gateway);
    if (filters.currency) params.append('currency', filters.currency);

    const response = await apiClient.get<ApiResponse<RevenueReport>>(
      `/admin/reports/revenue?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Export revenue report
   *
   * @param filters - Report filters
   * @param format - Export format
   * @returns Blob for download
   *
   * @example
   * ```typescript
   * const blob = await adminReportsApi.exportRevenue({
   *   period: 'month',
   * }, 'pdf');
   * ```
   */
  async exportRevenue(
    filters: RevenueReportFilters = {},
    format: 'csv' | 'excel' | 'pdf' = 'pdf'
  ): Promise<Blob> {
    const params = new URLSearchParams();

    // Apply filters
    if (filters.period) params.append('period', filters.period);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.organization_id) {
      params.append('organization_id', filters.organization_id);
    }
    if (filters.vendor_id) params.append('vendor_id', filters.vendor_id);
    if (filters.gateway) params.append('gateway', filters.gateway);
    if (filters.currency) params.append('currency', filters.currency);

    params.append('format', format);

    const response = await apiClient.get(
      `/admin/reports/revenue/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  },
};

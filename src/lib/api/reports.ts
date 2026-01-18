import { apiClient } from './client';
import type { Report, ReportRequest, ExportReportParams } from '@/types';

// ============================================================================
// API CLIENT
// ============================================================================

export const reportsApi = {
  /**
   * Generate/get a report
   * GET /vendors/{vendor}/reports?period=...&type=...
   */
  getReport: async (vendorSlug: string, params: ReportRequest): Promise<Report> => {
    return apiClient.get<Report>(`/vendors/${vendorSlug}/reports`, { params });
  },

  /**
   * Export transactions as CSV
   * GET /vendors/{vendor}/reports/export/transactions
   * Returns CSV file download
   */
  exportTransactions: async (
    vendorSlug: string,
    params: ExportReportParams
  ): Promise<void> => {
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('period', params.period);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    // Trigger file download
    const downloadUrl = `/api/vendors/${vendorSlug}/reports/export/transactions?${queryParams.toString()}`;
    window.location.href = downloadUrl;
  },

  /**
   * Export payouts as CSV
   * GET /vendors/{vendor}/reports/export/payouts
   * Returns CSV file download
   */
  exportPayouts: async (
    vendorSlug: string,
    params: ExportReportParams
  ): Promise<void> => {
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('period', params.period);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    // Trigger file download
    const downloadUrl = `/api/vendors/${vendorSlug}/reports/export/payouts?${queryParams.toString()}`;
    window.location.href = downloadUrl;
  },

  /**
   * Download report as blob (for custom handling)
   */
  downloadTransactionsBlob: async (
    vendorSlug: string,
    params: ExportReportParams
  ): Promise<Blob> => {
    const response = await fetch(
      `/api/vendors/${vendorSlug}/reports/export/transactions?period=${params.period}${
        params.date_from ? `&date_from=${params.date_from}` : ''
      }${params.date_to ? `&date_to=${params.date_to}` : ''}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    return response.blob();
  },

  /**
   * Download payouts report as blob (for custom handling)
   */
  downloadPayoutsBlob: async (
    vendorSlug: string,
    params: ExportReportParams
  ): Promise<Blob> => {
    const response = await fetch(
      `/api/vendors/${vendorSlug}/reports/export/payouts?period=${params.period}${
        params.date_from ? `&date_from=${params.date_from}` : ''
      }${params.date_to ? `&date_to=${params.date_to}` : ''}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    return response.blob();
  },
};

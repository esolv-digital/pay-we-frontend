/**
 * Admin KYC Management API Service
 *
 * Provides comprehensive KYC management functionality for admins including:
 * - List all KYC documents with advanced filtering
 * - View KYC details
 * - Approve/Reject KYC documents
 * - Export KYC data
 * - View KYC statistics
 *
 * @see /Users/mac/Projects/esolv/paywe/backend/ADMIN_KYC_API.md
 */

import { apiClient } from './client';
import type {
  AdminKYCDocument,
  AdminKYCFilters,
  AdminKYCListResponse,
  KYCStatisticsResponse,
  KYCApproveRequest,
  KYCRejectRequest,
  KYCActionResponse,
  KYCExportFormat,
} from '@/types/kyc';

/**
 * Admin KYC API Service
 *
 * All endpoints require authentication and appropriate permissions:
 * - List/View: view_kyc
 * - Approve: approve_kyc
 * - Reject: reject_kyc
 * - Export: export_kyc
 */
export const adminKycApi = {
  /**
   * List all KYC documents with filtering, sorting, and pagination
   *
   * @param filters - Optional filters for the query
   * @returns Paginated list of KYC documents with metadata
   * @permission view_kyc
   *
   * @example
   * // Get pending KYC documents
   * const result = await adminKycApi.list({ status: 'pending' });
   *
   * @example
   * // Search and filter
   * const result = await adminKycApi.list({
   *   search: 'ABC Company',
   *   status: 'pending',
   *   date_from: '2024-01-01',
   *   sort_by: 'created_at',
   *   sort_direction: 'desc',
   *   per_page: 20
   * });
   */
  list: async (filters?: AdminKYCFilters): Promise<AdminKYCListResponse> => {
    return apiClient.get<AdminKYCListResponse>('/admin/kyc', {
      params: filters,
    });
  },

  /**
   * Get a single KYC document by ID
   *
   * @param id - KYC document ID
   * @returns Detailed KYC document information
   * @permission view_kyc
   */
  get: async (id: string): Promise<AdminKYCDocument> => {
    return apiClient.get<AdminKYCDocument>(`/admin/kyc/${id}`);
  },

  /**
   * Get all pending KYC documents (quick access for review queue)
   *
   * @returns List of pending KYC documents
   * @permission view_kyc
   *
   * @example
   * const pending = await adminKycApi.getPending();
   */
  getPending: async (): Promise<AdminKYCListResponse> => {
    return apiClient.get<AdminKYCListResponse>('/admin/kyc/pending');
  },

  /**
   * Get KYC statistics and reports
   *
   * @param dateFrom - Optional start date (YYYY-MM-DD)
   * @param dateTo - Optional end date (YYYY-MM-DD)
   * @returns KYC statistics including counts, breakdowns, and average review time
   * @permission view_kyc
   *
   * @example
   * // Get all-time statistics
   * const stats = await adminKycApi.getStatistics();
   *
   * @example
   * // Get statistics for a date range
   * const stats = await adminKycApi.getStatistics('2024-01-01', '2024-12-31');
   */
  getStatistics: async (
    dateFrom?: string,
    dateTo?: string
  ): Promise<KYCStatisticsResponse> => {
    return apiClient.get<KYCStatisticsResponse>('/admin/kyc/statistics', {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
      },
    });
  },

  /**
   * Update KYC status with dynamic workflow transitions (RECOMMENDED)
   *
   * This is the primary method for managing KYC status changes.
   * It provides transparency and flexibility in the KYC review process.
   *
   * @param organizationId - Organization ID
   * @param data - Status update data including new status, notes, and reason
   * @returns Updated KYC status
   * @permission approve_kyc
   *
   * @example
   * // Start reviewing
   * await adminKycApi.updateStatus('org-123', {
   *   status: 'in_review',
   *   notes: 'Starting review process'
   * });
   *
   * @example
   * // Request more information
   * await adminKycApi.updateStatus('org-123', {
   *   status: 'needs_more_info',
   *   reason: 'Please provide updated business registration',
   *   notes: 'Current certificate has expired'
   * });
   *
   * @example
   * // Mark as reviewed (pending approval)
   * await adminKycApi.updateStatus('org-123', {
   *   status: 'reviewed',
   *   notes: 'All documents reviewed, awaiting final approval'
   * });
   *
   * @example
   * // Approve KYC
   * await adminKycApi.updateStatus('org-123', {
   *   status: 'approved',
   *   notes: 'All documents verified and approved'
   * });
   *
   * @example
   * // Reject KYC
   * await adminKycApi.updateStatus('org-123', {
   *   status: 'rejected',
   *   reason: 'Document has expired and business address cannot be verified'
   * });
   */
  updateStatus: async (
    organizationId: string,
    data: import('@/types/kyc').KYCStatusUpdateRequest
  ): Promise<KYCActionResponse> => {
    return apiClient.patch<KYCActionResponse>(
      `/admin/kyc/${organizationId}/status`,
      data
    );
  },

  /**
   * Approve KYC documents for an organization
   *
   * @deprecated Use updateStatus() with status='approved' instead
   *
   * @param organizationId - Organization ID
   * @param data - Approval data including notes and document IDs
   * @returns Updated KYC status
   * @permission approve_kyc
   *
   * @example
   * const result = await adminKycApi.approve('org-123', {
   *   notes: 'All documents verified and validated',
   *   approved_documents: ['doc-1', 'doc-2']
   * });
   */
  approve: async (
    organizationId: string,
    data: KYCApproveRequest
  ): Promise<KYCActionResponse> => {
    return apiClient.post<KYCActionResponse>(
      `/admin/kyc/${organizationId}/approve`,
      data
    );
  },

  /**
   * Reject KYC documents for an organization
   *
   * @deprecated Use updateStatus() with status='rejected' instead
   *
   * @param organizationId - Organization ID
   * @param data - Rejection data including reason and document IDs
   * @returns Updated KYC status
   * @permission reject_kyc
   *
   * @example
   * const result = await adminKycApi.reject('org-123', {
   *   reason: 'Document has expired. Please upload a valid document.',
   *   rejected_documents: ['doc-1']
   * });
   */
  reject: async (
    organizationId: string,
    data: KYCRejectRequest
  ): Promise<KYCActionResponse> => {
    return apiClient.post<KYCActionResponse>(
      `/admin/kyc/${organizationId}/reject`,
      data
    );
  },

  /**
   * Export KYC documents to CSV or Excel format
   *
   * Downloads a file with KYC documents data.
   * All filter parameters from the list endpoint are supported.
   *
   * @param format - Export format (csv, xlsx, pdf)
   * @param filters - Optional filters to apply before export
   * @permission export_kyc
   *
   * @example
   * // Export all approved KYC to CSV
   * await adminKycApi.export('csv', { status: 'approved' });
   *
   * @example
   * // Export pending KYC to Excel
   * await adminKycApi.export('xlsx', {
   *   status: 'pending',
   *   date_from: '2024-01-01'
   * });
   */
  export: async (
    format: KYCExportFormat = 'csv',
    filters?: AdminKYCFilters
  ): Promise<Blob> => {
    const params = {
      ...filters,
      format,
    };

    // Use axios directly for blob response
    const response = await fetch(
      `/api/admin/kyc/export?${new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)])
      )}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  /**
   * Download export file helper
   *
   * @param blob - The blob data from export
   * @param format - File format
   * @param filename - Optional custom filename
   */
  downloadExport: (
    blob: Blob,
    format: KYCExportFormat,
    filename?: string
  ): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      filename || `kyc_export_${new Date().toISOString()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

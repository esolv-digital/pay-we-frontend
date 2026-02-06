import { apiClient } from './client';
import type {
  PaymentPage,
  CreatePaymentPageInput,
  UpdatePaymentPageInput,
  Transaction,
  TransactionFilters,
  TransactionListResponse,
  VendorTransactionMetricsResponse,
  ExportSummaryResponse,
  ExportFormat,
  Vendor,
  PaginatedResponse,
} from '@/types';
import type { PayoutMethod, FeeBearer } from '@/types/vendor';

/**
 * Transform transaction filters to match backend expectations
 * Backend expects boolean values as 1/0, not true/false
 */
function transformTransactionFilters(filters?: TransactionFilters): Record<string, any> | undefined {
  if (!filters) return undefined;

  const transformed = { ...filters };

  // Convert boolean 'settled' to 1/0 format
  if (typeof transformed.settled === 'boolean') {
    (transformed as any).settled = transformed.settled ? 1 : 0;
  }

  return transformed;
}

/**
 * Note: All vendor endpoints require a vendor_slug parameter.
 * The vendor slug should be obtained from the authenticated user's vendor profile.
 * These methods will be called by Next.js API routes which will inject the vendor_slug.
 */
export const vendorApi = {
  // Dashboard
  getDashboardStats: async (vendorSlug: string) => {
    return apiClient.get<{
      balance: number;
      total_revenue: number;
      total_transactions: number;
      pending_disbursements: number;
    }>(`/vendors/${vendorSlug}/dashboard`);
  },

  // Payment Pages
  getPaymentPages: async (vendorSlug: string, filters?: {
    page?: number;
    per_page?: number;
    is_active?: boolean;
    amount_type?: 'fixed' | 'flexible' | 'donation';
    search?: string;
  }) => {
    return apiClient.get<PaginatedResponse<PaymentPage>>(`/vendors/${vendorSlug}/payment-pages`, {
      params: filters,
    });
  },

  getPaymentPage: async (vendorSlug: string, id: string) => {
    return apiClient.get<PaymentPage>(`/vendors/${vendorSlug}/payment-pages/${id}`);
  },

  createPaymentPage: async (vendorSlug: string, data: CreatePaymentPageInput) => {
    return apiClient.post<PaymentPage>(`/vendors/${vendorSlug}/payment-pages`, data);
  },

  updatePaymentPage: async (vendorSlug: string, id: string, data: UpdatePaymentPageInput) => {
    return apiClient.put<PaymentPage>(`/vendors/${vendorSlug}/payment-pages/${id}`, data);
  },

  deletePaymentPage: async (vendorSlug: string, id: string) => {
    return apiClient.delete(`/vendors/${vendorSlug}/payment-pages/${id}`);
  },

  togglePaymentPage: async (vendorSlug: string, id: string) => {
    return apiClient.post(`/vendors/${vendorSlug}/payment-pages/${id}/toggle-status`);
  },

  // Transactions - Comprehensive API
  /**
   * Get vendor transactions with advanced filtering, sorting, and pagination
   * @param vendorSlug - The vendor slug
   * @param filters - Optional filters (status, date range, amount, gateway, etc.)
   * @returns Paginated list of transactions with metadata
   */
  getTransactions: async (vendorSlug: string, filters?: TransactionFilters) => {
    return apiClient.get<TransactionListResponse>(`/vendors/${vendorSlug}/transactions`, {
      params: transformTransactionFilters(filters),
    });
  },

  /**
   * Get a single transaction by ID in vendor context
   * @param vendorSlug - The vendor slug
   * @param transactionId - The transaction ID
   * @returns Transaction details
   */
  getTransaction: async (vendorSlug: string, transactionId: string) => {
    return apiClient.get<Transaction>(`/vendors/${vendorSlug}/transactions/${transactionId}`);
  },

  /**
   * Get aggregated transaction metrics for a vendor
   * @param vendorSlug - The vendor slug
   * @param filters - Optional filters to apply to metrics calculation
   * @returns Transaction metrics and breakdown by gateway/currency
   */
  getTransactionMetrics: async (vendorSlug: string, filters?: TransactionFilters) => {
    return apiClient.get<VendorTransactionMetricsResponse>(
      `/vendors/${vendorSlug}/transactions/metrics`,
      {
        params: transformTransactionFilters(filters),
      }
    );
  },

  /**
   * Get export summary before performing actual export
   * @param vendorSlug - The vendor slug
   * @param filters - Optional filters to apply to export
   * @returns Summary including total records, file size estimate, and metrics
   */
  getExportSummary: async (vendorSlug: string, filters?: TransactionFilters) => {
    return apiClient.get<ExportSummaryResponse>(
      `/vendors/${vendorSlug}/transactions/export/summary`,
      {
        params: transformTransactionFilters(filters),
      }
    );
  },

  /**
   * Export transactions to CSV or Excel
   * @param vendorSlug - The vendor slug
   * @param filters - Optional filters to apply to export
   * @param format - Export format (csv or excel)
   * @returns Download URL or triggers browser download
   */
  exportTransactions: async (
    vendorSlug: string,
    filters?: TransactionFilters,
    format: ExportFormat = 'csv'
  ) => {
    // Transform filters to backend format (boolean → 1/0)
    const transformedFilters = transformTransactionFilters(filters);

    // Build query parameters
    const params = new URLSearchParams();
    if (transformedFilters) {
      Object.entries(transformedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    params.append('export_format', format);

    const queryString = params.toString();
    const url = `/vendors/${vendorSlug}/transactions/export${queryString ? `?${queryString}` : ''}`;

    // Trigger download by navigating to the URL
    // The Next.js API route will handle the actual file download
    window.location.href = url;
  },

  // Vendor Profile
  getVendor: async (vendorSlug: string) => {
    return apiClient.get<Vendor>(`/vendors/${vendorSlug}`);
  },

  updateVendor: async (vendorSlug: string, data: Partial<Vendor>) => {
    return apiClient.put<Vendor>(`/vendors/${vendorSlug}`, data);
  },

  // Disbursements
  getDisbursements: async (vendorSlug: string) => {
    return apiClient.get(`/vendors/${vendorSlug}/disbursements`);
  },

  requestDisbursement: async (vendorSlug: string) => {
    return apiClient.post(`/vendors/${vendorSlug}/disbursements/request`);
  },

  // Payout Settings (NEW)
  updatePayoutSettings: async (vendorSlug: string, data: {
    payout_recipient?: string;
    payout_method?: PayoutMethod;
    fee_bearer?: FeeBearer;
    fee_percentage?: number;
    custom_fee_amount?: number;
  }) => {
    return apiClient.patch<Vendor>(`/vendors/${vendorSlug}`, data);
  },

  /**
   * Get disbursement statistics
   * @param vendorSlug - The vendor slug
   * @returns Disbursement statistics (total disbursed, pending, completed, failed, average amount)
   */
  getDisbursementStatistics: async (vendorSlug: string) => {
    return apiClient.get<{
      total_disbursed: number;
      pending_disbursements: number;
      completed_disbursements: number;
      failed_disbursements: number;
      average_disbursement_amount: number;
    }>(`/vendors/${vendorSlug}/disbursements/statistics`);
  },

  /**
   * Toggle automatic payout setting
   * @param vendorSlug - The vendor slug
   * @param enabled - Whether to enable or disable auto-payout
   * @returns Updated auto-payout status
   */
  toggleAutoPayout: async (vendorSlug: string, enabled: boolean) => {
    return apiClient.post<{
      auto_payout_enabled: boolean;
      message: string;
    }>(`/vendors/${vendorSlug}/disbursements/toggle-auto-payout`, { enabled });
  },
};

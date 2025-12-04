import { apiClient } from './client';
import type {
  PaymentPage,
  CreatePaymentPageInput,
  UpdatePaymentPageInput,
  Transaction,
  TransactionFilters,
  Vendor,
  PaginatedResponse,
} from '@/types';
import type { PayoutMethod, FeeBearer } from '@/types/vendor';

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

  // Transactions
  getTransactions: async (vendorSlug: string, filters?: TransactionFilters) => {
    return apiClient.get<Transaction[]>(`/vendors/${vendorSlug}/transactions`, {
      params: filters,
    });
  },

  getTransaction: async (vendorSlug: string, id: string) => {
    return apiClient.get<Transaction>(`/vendors/${vendorSlug}/transactions/${id}`);
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
};

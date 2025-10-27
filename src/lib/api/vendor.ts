import { apiClient } from './client';
import type {
  PaymentPage,
  CreatePaymentPageInput,
  Transaction,
  TransactionFilters,
  Vendor,
} from '@/types';

export const vendorApi = {
  // Dashboard
  getDashboardStats: async () => {
    return apiClient.get<{
      balance: number;
      total_revenue: number;
      total_transactions: number;
      pending_disbursements: number;
    }>('/vendor/dashboard');
  },

  // Payment Pages
  getPaymentPages: async () => {
    return apiClient.get<PaymentPage[]>('/vendor/payment-pages');
  },

  getPaymentPage: async (id: string) => {
    return apiClient.get<PaymentPage>(`/vendor/payment-pages/${id}`);
  },

  createPaymentPage: async (data: CreatePaymentPageInput) => {
    return apiClient.post<PaymentPage>('/vendor/payment-pages', data);
  },

  updatePaymentPage: async (id: string, data: Partial<CreatePaymentPageInput>) => {
    return apiClient.put<PaymentPage>(`/vendor/payment-pages/${id}`, data);
  },

  deletePaymentPage: async (id: string) => {
    return apiClient.delete(`/vendor/payment-pages/${id}`);
  },

  togglePaymentPage: async (id: string, isActive: boolean) => {
    return apiClient.patch(`/vendor/payment-pages/${id}/toggle`, { is_active: isActive });
  },

  // Transactions
  getTransactions: async (filters?: TransactionFilters) => {
    return apiClient.get<Transaction[]>('/vendor/transactions', {
      params: filters,
    });
  },

  getTransaction: async (id: string) => {
    return apiClient.get<Transaction>(`/vendor/transactions/${id}`);
  },

  // Vendor Profile
  getVendor: async () => {
    return apiClient.get<Vendor>('/vendor/profile');
  },

  updateVendor: async (data: Partial<Vendor>) => {
    return apiClient.put<Vendor>('/vendor/profile', data);
  },

  // Disbursements
  getDisbursements: async () => {
    return apiClient.get('/vendor/disbursements');
  },

  requestDisbursement: async () => {
    return apiClient.post('/vendor/disbursements/request');
  },
};

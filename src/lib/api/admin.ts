import { apiClient } from './client';
import type {
  Transaction,
  TransactionFilters,
  KYCReview,
  Organization,
  User,
} from '@/types';

export const adminApi = {
  // Transactions
  getTransactions: async (filters?: TransactionFilters) => {
    return apiClient.get<Transaction[]>('/admin/transactions', {
      params: filters,
    });
  },

  getTransaction: async (id: string) => {
    return apiClient.get<Transaction>(`/admin/transactions/${id}`);
  },

  // KYC Management
  getPendingKYC: async () => {
    return apiClient.get<KYCReview[]>('/admin/kyc/pending');
  },

  getKYCDetails: async (organizationId: string) => {
    return apiClient.get<KYCReview>(`/admin/kyc/${organizationId}`);
  },

  approveKYC: async (organizationId: string, notes?: string) => {
    return apiClient.post(`/admin/kyc/${organizationId}/approve`, { notes });
  },

  rejectKYC: async (organizationId: string, reason: string, notes?: string) => {
    return apiClient.post(`/admin/kyc/${organizationId}/reject`, {
      reason,
      notes,
    });
  },

  // Organizations
  getOrganizations: async () => {
    return apiClient.get<Organization[]>('/admin/organizations');
  },

  getOrganization: async (id: string) => {
    return apiClient.get<Organization>(`/admin/organizations/${id}`);
  },

  // Users
  getUsers: async () => {
    return apiClient.get<User[]>('/admin/users');
  },

  getUser: async (id: string) => {
    return apiClient.get<User>(`/admin/users/${id}`);
  },

  // Statistics
  getStatistics: async () => {
    return apiClient.get<{
      total_transactions: number;
      total_revenue: number;
      pending_kyc: number;
      active_vendors: number;
    }>('/admin/statistics');
  },
};

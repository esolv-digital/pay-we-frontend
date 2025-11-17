import { apiClient } from './client';
import type { PaymentPage, Transaction } from '@/types';

/**
 * Transaction creation data interface
 * DRY: Single source of truth for transaction creation parameters
 */
export interface CreateTransactionData {
  amount: number;
  quantity?: number;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  custom_field_values?: Record<string, string>;
}

/**
 * Public API Client
 *
 * Single Responsibility: Handle all public API calls that don't require authentication
 * Open/Closed: Open for extension with new public endpoints, closed for modification
 * Liskov Substitution: All methods return consistent Promise types
 * Interface Segregation: Provides focused public API interface
 * Dependency Inversion: Depends on apiClient abstraction, not concrete implementation
 */
export const publicApi = {
  // Get payment page by short URL (no auth required)
  getPaymentPageByShortUrl: async (shortUrl: string) => {
    return apiClient.get<PaymentPage>(`/pay/${shortUrl}`);
  },

  // Get payment page by vendor slug and payment page slug (SEO-friendly, no auth required)
  getPaymentPageBySeoUrl: async (vendorSlug: string, paymentPageSlug: string) => {
    return apiClient.get<PaymentPage>(`/pay/${vendorSlug}/${paymentPageSlug}`);
  },

  // Create a transaction for a payment page using short URL (no auth required)
  createTransaction: async (shortUrl: string, data: CreateTransactionData) => {
    return apiClient.post<Transaction>(`/pay/${shortUrl}/transactions`, data);
  },

  // Create a transaction for a payment page using SEO-friendly URL (no auth required)
  createTransactionBySeoUrl: async (
    vendorSlug: string,
    paymentPageSlug: string,
    data: CreateTransactionData
  ) => {
    return apiClient.post<Transaction>(`/pay/${vendorSlug}/${paymentPageSlug}/transactions`, data);
  },

  // Get transaction by reference
  getTransactionByReference: async (reference: string) => {
    return apiClient.get<Transaction>(`/public/transactions/${reference}`);
  },
};

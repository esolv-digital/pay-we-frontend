import { apiClient } from './client';
import type { PaymentPage, Transaction } from '@/types';

export const publicApi = {
  // Get payment page by short URL (no auth required)
  getPaymentPageByShortUrl: async (shortUrl: string) => {
    return apiClient.get<PaymentPage>(`/pay/${shortUrl}`);
  },

  // Create a transaction for a payment page (no auth required)
  createTransaction: async (shortUrl: string, data: {
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
  }) => {
    return apiClient.post<Transaction>(`/pay/${shortUrl}/transactions`, data);
  },

  // Get transaction by reference
  getTransactionByReference: async (reference: string) => {
    return apiClient.get<Transaction>(`/public/transactions/${reference}`);
  },
};

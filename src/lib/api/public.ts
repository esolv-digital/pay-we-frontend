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

  // Initiate payment transaction
  // IMPORTANT: Backend uses /payments/initiate (not /pay/{slug}/transactions)
  // Requires payment_page_id and currency_code from payment page
  initiatePayment: async (paymentPage: PaymentPage, data: CreateTransactionData) => {
    return apiClient.post<Transaction>(`/payments/initiate`, {
      payment_page_id: paymentPage.id,
      amount: data.amount,
      currency_code: paymentPage.currency_code,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      description: `Payment for ${paymentPage.title}`,
      metadata: {
        quantity: data.quantity,
        shipping_address: data.shipping_address,
        custom_field_values: data.custom_field_values,
      },
    });
  },

  // Verify transaction by reference
  // Backend uses /payments/verify/{reference} (POST, not GET)
  verifyTransaction: async (reference: string) => {
    return apiClient.post<Transaction>(`/payments/verify/${reference}`, {});
  },

  // Backward compatibility - createTransaction now uses initiatePayment
  createTransaction: async (paymentPage: PaymentPage, data: CreateTransactionData) => {
    return publicApi.initiatePayment(paymentPage, data);
  },

  // Backward compatibility - createTransactionBySeoUrl now uses initiatePayment
  createTransactionBySeoUrl: async (
    paymentPage: PaymentPage,
    _vendorSlug: string,
    _paymentPageSlug: string,
    data: CreateTransactionData
  ) => {
    return publicApi.initiatePayment(paymentPage, data);
  },

  // Backward compatibility - getTransactionByReference now uses verifyTransaction
  getTransactionByReference: async (reference: string) => {
    return publicApi.verifyTransaction(reference);
  },
};

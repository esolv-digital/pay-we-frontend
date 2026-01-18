import { apiClient } from './client';
import type {
  Provider,
  ProvidersResponse,
  ProvidersParams,
} from '@/types';

/**
 * Payment Providers API Client
 *
 * Fetches banks and mobile money providers from the gateway-aware backend API.
 * The backend determines which payment gateway to use based on the organization's
 * country and returns the appropriate providers from PayStack/WePay.
 */
export const providersApi = {
  /**
   * Get all payment providers (banks + mobile money)
   * GET /providers
   */
  getAll: async (params?: ProvidersParams): Promise<ProvidersResponse> => {
    return apiClient.get<ProvidersResponse>('/providers', { params });
  },

  /**
   * Get banks only (for bank transfer payouts)
   * GET /providers?payment_method=bank_transfer
   */
  getBanks: async (country?: string, currency?: string): Promise<Provider[]> => {
    const response = await apiClient.get<ProvidersResponse>('/providers', {
      params: {
        country,
        currency,
        payment_method: 'bank_transfer',
      },
    });
    return response.banks ?? [];
  },

  /**
   * Get mobile money providers only
   * GET /providers?payment_method=mobile_money
   */
  getMobileMoneyProviders: async (
    country?: string,
    currency?: string
  ): Promise<Provider[]> => {
    const response = await apiClient.get<ProvidersResponse>('/providers', {
      params: {
        country,
        currency,
        payment_method: 'mobile_money',
      },
    });
    return response.mobile_money ?? [];
  },
};

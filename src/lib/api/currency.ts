import { apiClient } from './client';
import type { CurrencyConversion, CurrencyConversionRate } from '@/types/currency';

/**
 * Currency API Client
 * All methods call Next.js API routes (BFF pattern)
 */
export const currencyApi = {
  /**
   * Convert an amount from one currency to another
   * @param from - Source currency code (3 characters)
   * @param to - Target currency code (3 characters)
   * @param amount - Amount to convert
   */
  convertCurrency: async (from: string, to: string, amount: number) => {
    return apiClient.get<CurrencyConversion>('/currencies/convert', {
      params: { from, to, amount },
    });
  },

  /**
   * Get all conversion rates
   * @param filters - Optional filters for from/to currencies
   */
  getConversionRates: async (filters?: {
    from?: string;
    to?: string;
  }) => {
    return apiClient.get<CurrencyConversionRate[]>('/currencies/rates', {
      params: filters,
    });
  },
};

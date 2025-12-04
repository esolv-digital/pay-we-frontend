import { apiClient } from './client';
import type { Country, RegionGroup } from '@/types/country';

/**
 * Country API Client
 * All methods call Next.js API routes (BFF pattern)
 */
export const countryApi = {
  /**
   * Get all active countries
   * @param filters - Optional filters for region, can_send, can_receive
   */
  getAllCountries: async (filters?: {
    region?: string;
    can_send?: boolean;
    can_receive?: boolean;
  }) => {
    return apiClient.get<Country[]>('/countries', {
      params: filters,
    });
  },

  /**
   * Get specific country by code
   * @param code - 2-letter country code (case-insensitive)
   */
  getCountryByCode: async (code: string) => {
    return apiClient.get<Country>(`/countries/${code}`);
  },

  /**
   * Get payment methods for a specific country
   * @param code - 2-letter country code
   */
  getPaymentMethods: async (code: string) => {
    return apiClient.get<Country>(`/countries/${code}/payment-methods`);
  },

  /**
   * Get all regions with their countries
   */
  getAllRegions: async () => {
    return apiClient.get<RegionGroup[]>('/countries/regions');
  },

  /**
   * Get all currencies used across countries
   */
  getAllCurrencies: async () => {
    return apiClient.get<Array<{
      code: string;
      name: string;
      symbol: string;
      countries: string[];
    }>>('/countries/currencies');
  },
};

import { apiClient } from './client';
import type { Country, RegionGroup, CountryPaymentMethod, CurrencyInfo } from '@/types/country';

/**
 * Country API Client
 * All methods call Next.js API routes (BFF pattern)
 * Follows SOLID principles:
 * - Single Responsibility: Only handles country-related API calls
 * - Open/Closed: Extensible for new endpoints without modifying existing code
 * - Dependency Inversion: Depends on apiClient abstraction
 */
export const countryApi = {
  /**
   * Get all active countries
   * @param filters - Optional filters for region, can_send, can_receive
   * @returns Array of countries matching the filter criteria
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
   * @param code - ISO 3166-1 alpha-2 country code (e.g., "NG", "JM")
   * @returns Single country object with full details
   */
  getCountryByCode: async (code: string) => {
    return apiClient.get<Country>(`/countries/${code.toUpperCase()}`);
  },

  /**
   * Get payment methods available for a specific country
   * @param code - ISO 3166-1 alpha-2 country code
   * @returns Array of payment methods with configuration
   */
  getPaymentMethods: async (code: string) => {
    return apiClient.get<CountryPaymentMethod[]>(`/countries/${code.toUpperCase()}/payment-methods`);
  },

  /**
   * Get all regions with their countries (useful for grouped dropdowns)
   * @returns Array of regions with their associated countries
   */
  getAllRegions: async () => {
    return apiClient.get<RegionGroup[]>('/countries/regions');
  },

  /**
   * Get all supported currencies across the platform
   * @returns Array of unique currencies with example countries
   */
  getAllCurrencies: async () => {
    return apiClient.get<CurrencyInfo[]>('/countries/currencies');
  },
} as const;

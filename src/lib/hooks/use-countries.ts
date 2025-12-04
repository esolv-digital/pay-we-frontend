import { useQuery } from '@tanstack/react-query';
import { countryApi } from '@/lib/api/country';

/**
 * Fetch all countries with optional filters
 */
export function useCountries(filters?: {
  region?: string;
  can_send?: boolean;
  can_receive?: boolean;
}) {
  return useQuery({
    queryKey: ['countries', filters],
    queryFn: () => countryApi.getAllCountries(filters),
    staleTime: 1000 * 60 * 30, // 30 minutes (countries don't change often)
  });
}

/**
 * Fetch specific country by code
 */
export function useCountry(code: string) {
  return useQuery({
    queryKey: ['country', code],
    queryFn: () => countryApi.getCountryByCode(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch payment methods for a country
 */
export function useCountryPaymentMethods(code: string) {
  return useQuery({
    queryKey: ['country-payment-methods', code],
    queryFn: () => countryApi.getPaymentMethods(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch all regions with countries
 */
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: () => countryApi.getAllRegions(),
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch all currencies
 */
export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => countryApi.getAllCurrencies(),
    staleTime: 1000 * 60 * 30,
  });
}

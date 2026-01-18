import { useQuery } from '@tanstack/react-query';
import { providersApi } from '@/lib/api/providers';
import type { ProvidersParams } from '@/types';

/**
 * Hook to fetch all payment providers (banks + mobile money)
 */
export function useProviders(params?: ProvidersParams) {
  return useQuery({
    queryKey: ['providers', params],
    queryFn: () => providersApi.getAll(params),
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });
}

/**
 * Hook to fetch banks only (for bank transfer payouts)
 */
export function useBankProviders(country?: string, currency?: string) {
  return useQuery({
    queryKey: ['providers', 'banks', country, currency],
    queryFn: () => providersApi.getBanks(country, currency),
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });
}

/**
 * Hook to fetch mobile money providers only
 */
export function useMobileMoneyProviders(country?: string, currency?: string) {
  return useQuery({
    queryKey: ['providers', 'mobile_money', country, currency],
    queryFn: () => providersApi.getMobileMoneyProviders(country, currency),
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });
}

/**
 * Convenience hook that returns providers based on account type
 * This is the recommended hook for the payout account form
 */
export function usePayoutProviders(
  accountType: 'bank' | 'mobile_money',
  country?: string,
  currency?: string
) {
  const bankQuery = useBankProviders(country, currency);
  const mobileMoneyQuery = useMobileMoneyProviders(country, currency);

  if (accountType === 'bank') {
    return {
      data: bankQuery.data,
      isLoading: bankQuery.isLoading,
      error: bankQuery.error,
    };
  }

  return {
    data: mobileMoneyQuery.data,
    isLoading: mobileMoneyQuery.isLoading,
    error: mobileMoneyQuery.error,
  };
}

import { useQuery } from '@tanstack/react-query';
import { currencyApi } from '@/lib/api/currency';

/**
 * Convert currency in real-time
 * @param from - Source currency
 * @param to - Target currency
 * @param amount - Amount to convert
 * @param enabled - Whether to run the query
 */
export function useCurrencyConverter(
  from: string,
  to: string,
  amount: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['currency-convert', from, to, amount],
    queryFn: () => currencyApi.convertCurrency(from, to, amount),
    enabled: enabled && !!from && !!to && amount > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch conversion rates
 */
export function useConversionRates(filters?: {
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ['conversion-rates', filters],
    queryFn: () => currencyApi.getConversionRates(filters),
    staleTime: 1000 * 60 * 5,
  });
}

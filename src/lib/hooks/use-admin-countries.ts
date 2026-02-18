/**
 * Admin Countries Management React Query Hooks
 *
 * All country identification uses ISO alpha-2 `code` (e.g. "GH"), not numeric IDs.
 * Countries cannot be deleted — use toggleStatus to activate/deactivate.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminCountriesApi,
  type CountryFilters,
  type CreateCountryRequest,
  type UpdateCountryRequest,
  type UpdatePaymentMethodsRequest,
  type UpdateGatewaysRequest,
} from '@/lib/api/admin-countries';

export const adminCountriesKeys = {
  all: ['admin', 'countries'] as const,
  lists: () => [...adminCountriesKeys.all, 'list'] as const,
  list: (filters: CountryFilters) => [...adminCountriesKeys.lists(), filters] as const,
  details: () => [...adminCountriesKeys.all, 'detail'] as const,
  detail: (code: string) => [...adminCountriesKeys.details(), code] as const,
  statistics: () => [...adminCountriesKeys.all, 'statistics'] as const,
};

export function useAdminCountriesList(filters: CountryFilters = {}) {
  return useQuery({
    queryKey: adminCountriesKeys.list(filters),
    queryFn: () => adminCountriesApi.list(filters),
    staleTime: 30_000,
  });
}

export function useAdminCountry(code: string) {
  return useQuery({
    queryKey: adminCountriesKeys.detail(code),
    queryFn: () => adminCountriesApi.get(code),
    enabled: !!code,
    staleTime: 60_000,
  });
}

export function useAdminCountryStatistics() {
  return useQuery({
    queryKey: adminCountriesKeys.statistics(),
    queryFn: () => adminCountriesApi.getStatistics(),
    staleTime: 60_000,
  });
}

export function useCreateCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCountryRequest) => adminCountriesApi.create(data),
    onSuccess: () => {
      toast.success('Country created successfully');
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to create country'); },
  });
}

export function useUpdateCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateCountryRequest }) =>
      adminCountriesApi.update(code, data),
    onSuccess: () => {
      toast.success('Country updated successfully');
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to update country'); },
  });
}

export function useToggleCountryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => adminCountriesApi.toggleStatus(code),
    onSuccess: (data) => {
      const status = data?.is_active ? 'activated' : 'deactivated';
      toast.success(`Country ${status} successfully`);
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to toggle country status'); },
  });
}

export function useUpdateCountryPaymentMethods() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdatePaymentMethodsRequest }) =>
      adminCountriesApi.updatePaymentMethods(code, data),
    onSuccess: () => {
      toast.success('Payment methods updated successfully');
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to update payment methods'); },
  });
}

export function useUpdateCountryGateways() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateGatewaysRequest }) =>
      adminCountriesApi.updateGateways(code, data),
    onSuccess: () => {
      toast.success('Gateways updated successfully');
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to update gateways'); },
  });
}

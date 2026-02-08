/**
 * Admin Countries Management React Query Hooks
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
  detail: (id: string) => [...adminCountriesKeys.details(), id] as const,
  statistics: () => [...adminCountriesKeys.all, 'statistics'] as const,
};

export function useAdminCountriesList(filters: CountryFilters = {}) {
  return useQuery({
    queryKey: adminCountriesKeys.list(filters),
    queryFn: () => adminCountriesApi.list(filters),
    staleTime: 30_000,
  });
}

export function useAdminCountry(id: string) {
  return useQuery({
    queryKey: adminCountriesKeys.detail(id),
    queryFn: () => adminCountriesApi.get(id),
    enabled: !!id,
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
    mutationFn: ({ id, data }: { id: string; data: UpdateCountryRequest }) =>
      adminCountriesApi.update(id, data),
    onSuccess: () => {
      toast.success('Country updated successfully');
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to update country'); },
  });
}

export function useDeleteCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCountriesApi.delete(id),
    onSuccess: () => {
      toast.success('Country deleted successfully');
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to delete country'); },
  });
}

export function useUpdateCountryPaymentMethods() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentMethodsRequest }) =>
      adminCountriesApi.updatePaymentMethods(id, data),
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
    mutationFn: ({ id, data }: { id: string; data: UpdateGatewaysRequest }) =>
      adminCountriesApi.updateGateways(id, data),
    onSuccess: () => {
      toast.success('Gateways updated successfully');
      queryClient.invalidateQueries({ queryKey: adminCountriesKeys.all });
    },
    onError: () => { toast.error('Failed to update gateways'); },
  });
}

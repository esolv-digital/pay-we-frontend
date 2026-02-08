/**
 * Admin Vendors Management React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminVendorsApi, type AdminVendorFilters } from '@/lib/api/admin-vendors';

export const adminVendorsKeys = {
  all: ['admin', 'vendors'] as const,
  lists: () => [...adminVendorsKeys.all, 'list'] as const,
  list: (filters: AdminVendorFilters) => [...adminVendorsKeys.lists(), filters] as const,
  details: () => [...adminVendorsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminVendorsKeys.details(), id] as const,
  statistics: () => [...adminVendorsKeys.all, 'statistics'] as const,
};

export function useAdminVendorsList(filters: AdminVendorFilters = {}) {
  return useQuery({
    queryKey: adminVendorsKeys.list(filters),
    queryFn: () => adminVendorsApi.list(filters),
    staleTime: 30_000,
  });
}

export function useAdminVendor(id: string) {
  return useQuery({
    queryKey: adminVendorsKeys.detail(id),
    queryFn: () => adminVendorsApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAdminVendorStatistics() {
  return useQuery({
    queryKey: adminVendorsKeys.statistics(),
    queryFn: () => adminVendorsApi.getStatistics(),
    staleTime: 60_000,
  });
}

export function useSuspendVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminVendorsApi.suspend(id, reason),
    onSuccess: () => {
      toast.success('Vendor suspended successfully');
      queryClient.invalidateQueries({ queryKey: adminVendorsKeys.all });
    },
    onError: () => { toast.error('Failed to suspend vendor'); },
  });
}

export function useActivateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminVendorsApi.activate(id),
    onSuccess: () => {
      toast.success('Vendor activated successfully');
      queryClient.invalidateQueries({ queryKey: adminVendorsKeys.all });
    },
    onError: () => { toast.error('Failed to activate vendor'); },
  });
}

/**
 * Admin Payout Accounts Management React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminPayoutAccountsApi, type AdminPayoutAccountFilters } from '@/lib/api/admin-payout-accounts';

export const adminPayoutAccountsKeys = {
  all: ['admin', 'payout-accounts'] as const,
  lists: () => [...adminPayoutAccountsKeys.all, 'list'] as const,
  list: (filters: AdminPayoutAccountFilters) => [...adminPayoutAccountsKeys.lists(), filters] as const,
  details: () => [...adminPayoutAccountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminPayoutAccountsKeys.details(), id] as const,
  statistics: () => [...adminPayoutAccountsKeys.all, 'statistics'] as const,
};

export function useAdminPayoutAccountsList(filters: AdminPayoutAccountFilters = {}) {
  return useQuery({
    queryKey: adminPayoutAccountsKeys.list(filters),
    queryFn: () => adminPayoutAccountsApi.list(filters),
    staleTime: 30_000,
  });
}

export function useAdminPayoutAccount(id: string) {
  return useQuery({
    queryKey: adminPayoutAccountsKeys.detail(id),
    queryFn: () => adminPayoutAccountsApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAdminPayoutAccountStatistics() {
  return useQuery({
    queryKey: adminPayoutAccountsKeys.statistics(),
    queryFn: () => adminPayoutAccountsApi.getStatistics(),
    staleTime: 60_000,
  });
}

export function useVerifyPayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminPayoutAccountsApi.verify(id),
    onSuccess: () => {
      toast.success('Payout account verified successfully');
      queryClient.invalidateQueries({ queryKey: adminPayoutAccountsKeys.all });
    },
    onError: () => { toast.error('Failed to verify payout account'); },
  });
}

export function useFlagPayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminPayoutAccountsApi.flag(id, reason),
    onSuccess: () => {
      toast.success('Payout account flagged');
      queryClient.invalidateQueries({ queryKey: adminPayoutAccountsKeys.all });
    },
    onError: () => { toast.error('Failed to flag payout account'); },
  });
}

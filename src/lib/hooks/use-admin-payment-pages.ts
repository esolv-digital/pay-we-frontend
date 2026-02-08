/**
 * Admin Payment Pages Management React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminPaymentPagesApi, type AdminPaymentPageFilters } from '@/lib/api/admin-payment-pages';

export const adminPaymentPagesKeys = {
  all: ['admin', 'payment-pages'] as const,
  lists: () => [...adminPaymentPagesKeys.all, 'list'] as const,
  list: (filters: AdminPaymentPageFilters) => [...adminPaymentPagesKeys.lists(), filters] as const,
  details: () => [...adminPaymentPagesKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminPaymentPagesKeys.details(), id] as const,
  statistics: () => [...adminPaymentPagesKeys.all, 'statistics'] as const,
};

export function useAdminPaymentPagesList(filters: AdminPaymentPageFilters = {}) {
  return useQuery({
    queryKey: adminPaymentPagesKeys.list(filters),
    queryFn: () => adminPaymentPagesApi.list(filters),
    staleTime: 30_000,
  });
}

export function useAdminPaymentPage(id: string) {
  return useQuery({
    queryKey: adminPaymentPagesKeys.detail(id),
    queryFn: () => adminPaymentPagesApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAdminPaymentPageStatistics() {
  return useQuery({
    queryKey: adminPaymentPagesKeys.statistics(),
    queryFn: () => adminPaymentPagesApi.getStatistics(),
    staleTime: 60_000,
  });
}

export function useSuspendPaymentPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminPaymentPagesApi.suspend(id, reason),
    onSuccess: () => {
      toast.success('Payment page suspended successfully');
      queryClient.invalidateQueries({ queryKey: adminPaymentPagesKeys.all });
    },
    onError: () => { toast.error('Failed to suspend payment page'); },
  });
}

export function useActivatePaymentPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminPaymentPagesApi.activate(id),
    onSuccess: () => {
      toast.success('Payment page activated successfully');
      queryClient.invalidateQueries({ queryKey: adminPaymentPagesKeys.all });
    },
    onError: () => { toast.error('Failed to activate payment page'); },
  });
}

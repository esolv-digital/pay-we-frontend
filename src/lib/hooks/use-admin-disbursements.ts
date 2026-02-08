/**
 * Admin Disbursements Management React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminDisbursementsApi, type AdminDisbursementFilters } from '@/lib/api/admin-disbursements';

export const adminDisbursementsKeys = {
  all: ['admin', 'disbursements'] as const,
  lists: () => [...adminDisbursementsKeys.all, 'list'] as const,
  list: (filters: AdminDisbursementFilters) => [...adminDisbursementsKeys.lists(), filters] as const,
  details: () => [...adminDisbursementsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminDisbursementsKeys.details(), id] as const,
  statistics: () => [...adminDisbursementsKeys.all, 'statistics'] as const,
};

export function useAdminDisbursementsList(filters: AdminDisbursementFilters = {}) {
  return useQuery({
    queryKey: adminDisbursementsKeys.list(filters),
    queryFn: () => adminDisbursementsApi.list(filters),
    staleTime: 30_000,
  });
}

export function useAdminDisbursement(id: string) {
  return useQuery({
    queryKey: adminDisbursementsKeys.detail(id),
    queryFn: () => adminDisbursementsApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAdminDisbursementStatistics() {
  return useQuery({
    queryKey: adminDisbursementsKeys.statistics(),
    queryFn: () => adminDisbursementsApi.getStatistics(),
    staleTime: 60_000,
  });
}

export function useApproveDisbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminDisbursementsApi.approve(id),
    onSuccess: () => {
      toast.success('Disbursement approved successfully');
      queryClient.invalidateQueries({ queryKey: adminDisbursementsKeys.all });
    },
    onError: () => { toast.error('Failed to approve disbursement'); },
  });
}

export function useRejectDisbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminDisbursementsApi.reject(id, reason),
    onSuccess: () => {
      toast.success('Disbursement rejected');
      queryClient.invalidateQueries({ queryKey: adminDisbursementsKeys.all });
    },
    onError: () => { toast.error('Failed to reject disbursement'); },
  });
}

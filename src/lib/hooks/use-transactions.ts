import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { vendorApi } from '@/lib/api/vendor';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { TransactionFilters } from '@/types';

export function useTransactions(filters?: TransactionFilters) {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole(['super_admin', 'platform_admin']);

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () =>
      isAdmin
        ? adminApi.getTransactions(filters)
        : vendorApi.getTransactions(filters),
  });
}

export function useTransaction(id: string) {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole(['super_admin', 'platform_admin']);

  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () =>
      isAdmin ? adminApi.getTransaction(id) : vendorApi.getTransaction(id),
    enabled: !!id,
  });
}

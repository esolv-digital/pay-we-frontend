import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { vendorApi } from '@/lib/api/vendor';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAuth } from '@/lib/hooks/use-auth';
import type { TransactionFilters } from '@/types';

export function useTransactions(filters?: TransactionFilters) {
  const { hasRole } = useAuthStore();
  const { user } = useAuth();
  const isAdmin = hasRole(['super_admin', 'platform_admin']);

  // Get the vendor slug from the user's first organization's first vendor
  const vendorSlug = user?.organizations?.[0]?.vendors?.[0]?.slug;

  return useQuery({
    queryKey: ['transactions', filters, vendorSlug],
    queryFn: () =>
      isAdmin
        ? adminApi.getTransactions(filters)
        : vendorApi.getTransactions(vendorSlug!, filters),
    enabled: isAdmin || !!vendorSlug,
  });
}

export function useTransaction(id: string) {
  const { hasRole } = useAuthStore();
  const { user } = useAuth();
  const isAdmin = hasRole(['super_admin', 'platform_admin']);

  // Get the vendor slug from the user's first organization's first vendor
  const vendorSlug = user?.organizations?.[0]?.vendors?.[0]?.slug;

  return useQuery({
    queryKey: ['transaction', id, vendorSlug],
    queryFn: () =>
      isAdmin ? adminApi.getTransaction(id) : vendorApi.getTransaction(vendorSlug!, id),
    enabled: !!id && (isAdmin || !!vendorSlug),
  });
}

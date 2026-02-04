/**
 * Admin Messaging Providers React Query Hooks
 *
 * Provides data fetching, caching, and mutations for messaging provider management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminMessagingProvidersApi } from '@/lib/api/admin-messaging-providers';
import type {
  ProviderFilters,
  CreateProviderRequest,
  UpdateProviderRequest,
  MessagingProvider,
  ProviderStatistics,
  AdminPaginatedResponse,
} from '@/lib/api/admin-messaging-providers';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const messagingProvidersKeys = {
  all: ['admin', 'messaging-providers'] as const,
  lists: () => [...messagingProvidersKeys.all, 'list'] as const,
  list: (filters: ProviderFilters) =>
    [...messagingProvidersKeys.lists(), filters] as const,
  details: () => [...messagingProvidersKeys.all, 'detail'] as const,
  detail: (id: string) => [...messagingProvidersKeys.details(), id] as const,
  statistics: () => [...messagingProvidersKeys.all, 'statistics'] as const,
};

// =============================================================================
// QUERY HOOKS
// =============================================================================

/**
 * Hook to fetch paginated list of messaging providers
 */
export function useMessagingProvidersList(
  filters: ProviderFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery<AdminPaginatedResponse<MessagingProvider>, Error>({
    queryKey: messagingProvidersKeys.list(filters),
    queryFn: () => adminMessagingProvidersApi.list(filters),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch single messaging provider
 */
export function useMessagingProvider(
  providerId: string,
  options?: { enabled?: boolean }
) {
  return useQuery<MessagingProvider, Error>({
    queryKey: messagingProvidersKeys.detail(providerId),
    queryFn: () => adminMessagingProvidersApi.get(providerId),
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    enabled: (options?.enabled ?? true) && !!providerId,
  });
}

/**
 * Hook to fetch messaging provider statistics
 */
export function useMessagingProviderStatistics(options?: { enabled?: boolean }) {
  return useQuery<ProviderStatistics, Error>({
    queryKey: messagingProvidersKeys.statistics(),
    queryFn: () => adminMessagingProvidersApi.getStatistics(),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

// =============================================================================
// MUTATION HOOKS
// =============================================================================

/**
 * Hook to create a new messaging provider
 */
export function useCreateMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation<MessagingProvider, Error, CreateProviderRequest>({
    mutationFn: (providerData) => adminMessagingProvidersApi.create(providerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.statistics() });
      toast.success('Messaging provider created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create messaging provider');
    },
  });
}

/**
 * Hook to update a messaging provider
 */
export function useUpdateMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation<
    MessagingProvider,
    Error,
    { providerId: string; data: UpdateProviderRequest }
  >({
    mutationFn: ({ providerId, data }) =>
      adminMessagingProvidersApi.update(providerId, data),
    onSuccess: (data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: messagingProvidersKeys.detail(providerId),
      });
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.statistics() });
      toast.success('Messaging provider updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update messaging provider');
    },
  });
}

/**
 * Hook to delete a messaging provider
 */
export function useDeleteMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (providerId) => adminMessagingProvidersApi.deleteProvider(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.statistics() });
      toast.success('Messaging provider deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete messaging provider');
    },
  });
}

/**
 * Hook to toggle provider active status
 */
export function useToggleMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation<MessagingProvider, Error, string>({
    mutationFn: (providerId) => adminMessagingProvidersApi.toggleActive(providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: messagingProvidersKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.statistics() });
      toast.success(
        `Provider ${data.is_active ? 'activated' : 'deactivated'} successfully`
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle provider status');
    },
  });
}

/**
 * Hook to reset provider failure tracking
 */
export function useResetProviderFailures() {
  const queryClient = useQueryClient();

  return useMutation<MessagingProvider, Error, string>({
    mutationFn: (providerId) => adminMessagingProvidersApi.resetFailures(providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: messagingProvidersKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: messagingProvidersKeys.statistics() });
      toast.success('Provider failure tracking reset successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset failure tracking');
    },
  });
}

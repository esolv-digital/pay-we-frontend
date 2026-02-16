/**
 * Admin Management React Query Hooks
 *
 * Hooks for managing platform administrators.
 * @module lib/hooks/use-admin-management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminManagementApi,
  type AdminUser,
  type AdminFilters,
  type AdminStatistics,
  type CreateAdminRequest,
  type UpdateAdminRequest,
  type SuspendAdminRequest,
} from '@/lib/api/admin-management';
import type { PaginatedResponse } from '@/types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const adminManagementKeys = {
  all: ['admin', 'management'] as const,
  lists: () => [...adminManagementKeys.all, 'list'] as const,
  list: (filters: AdminFilters) => [...adminManagementKeys.lists(), filters] as const,
  details: () => [...adminManagementKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminManagementKeys.details(), id] as const,
  statistics: () => [...adminManagementKeys.all, 'statistics'] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

export function useAdminList(filters: AdminFilters = {}) {
  return useQuery<PaginatedResponse<AdminUser>, Error>({
    queryKey: adminManagementKeys.list(filters),
    queryFn: () => adminManagementApi.list(filters),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAdminDetail(id: number) {
  return useQuery<AdminUser, Error>({
    queryKey: adminManagementKeys.detail(id),
    queryFn: () => adminManagementApi.get(id),
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}

export function useAdminStatistics() {
  return useQuery<AdminStatistics, Error>({
    queryKey: adminManagementKeys.statistics(),
    queryFn: () => adminManagementApi.getStatistics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, CreateAdminRequest>({
    mutationFn: (data) => adminManagementApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.statistics() });
      toast.success('Administrator created', {
        description: `${data.full_name} has been added as an administrator.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create administrator', {
        description: error.message || 'An error occurred.',
      });
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, { id: number; data: UpdateAdminRequest }>({
    mutationFn: ({ id, data }) => adminManagementApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.statistics() });
      toast.success('Administrator updated', {
        description: `${data.full_name} has been updated.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to update administrator', {
        description: error.message || 'An error occurred.',
      });
    },
  });
}

export function useSuspendAdmin() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, { id: number; data: SuspendAdminRequest }>({
    mutationFn: ({ id, data }) => adminManagementApi.suspend(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.statistics() });
      toast.success('Administrator suspended', {
        description: `${data.full_name} has been suspended.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to suspend administrator', {
        description: error.message || 'An error occurred.',
      });
    },
  });
}

export function useActivateAdmin() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, number>({
    mutationFn: (id) => adminManagementApi.activate(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.statistics() });
      toast.success('Administrator activated', {
        description: `${data.full_name} has been reactivated.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to activate administrator', {
        description: error.message || 'An error occurred.',
      });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => adminManagementApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: adminManagementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.statistics() });
      toast.success('Administrator removed', {
        description: 'The administrator has been removed from the platform.',
      });
    },
    onError: (error) => {
      toast.error('Failed to remove administrator', {
        description: error.message || 'An error occurred.',
      });
    },
  });
}

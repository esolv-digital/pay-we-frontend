/**
 * Admin Management React Query Hooks
 *
 * Hooks for managing platform administrators.
 * NOTE: No delete hook — admins cannot be deleted (ISO 27001).
 *
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
  type PromoteUserRequest,
} from '@/lib/api/admin-management';
import type { PaginatedResponse } from '@/types/api';
import { adminUsersKeys } from './use-admin-users';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const adminManagementKeys = {
  all: ['admin', 'management'] as const,
  lists: () => [...adminManagementKeys.all, 'list'] as const,
  list: (filters: AdminFilters) => [...adminManagementKeys.lists(), filters] as const,
  details: () => [...adminManagementKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminManagementKeys.details(), id] as const,
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

export function useAdminDetail(id: string) {
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

  return useMutation<AdminUser, Error, { id: string; data: UpdateAdminRequest }>({
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

  return useMutation<AdminUser, Error, { id: string; data: SuspendAdminRequest }>({
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

  return useMutation<AdminUser, Error, string>({
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

export function usePromoteUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, { id: string; data: PromoteUserRequest }>({
    mutationFn: ({ id, data }) => adminManagementApi.promote(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      toast.success('User promoted to administrator', {
        description: `${data.full_name} now has admin access.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to promote user', {
        description: error.message || 'An error occurred.',
      });
    },
  });
}

export function useDemoteAdmin() {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, string>({
    mutationFn: (id) => adminManagementApi.demote(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminManagementKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      toast.success('Administrator demoted', {
        description: `${data.full_name} admin rights have been removed.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to demote administrator', {
        description: error.message || 'An error occurred.',
      });
    },
  });
}

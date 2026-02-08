/**
 * Admin Gateways Management React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminGatewaysApi,
  type GatewayFilters,
  type CreateGatewayRequest,
  type UpdateGatewayRequest,
} from '@/lib/api/admin-gateways';

export const adminGatewaysKeys = {
  all: ['admin', 'gateways'] as const,
  lists: () => [...adminGatewaysKeys.all, 'list'] as const,
  list: (filters: GatewayFilters) => [...adminGatewaysKeys.lists(), filters] as const,
  details: () => [...adminGatewaysKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminGatewaysKeys.details(), id] as const,
  statistics: () => [...adminGatewaysKeys.all, 'statistics'] as const,
};

export function useAdminGatewaysList(filters: GatewayFilters = {}) {
  return useQuery({
    queryKey: adminGatewaysKeys.list(filters),
    queryFn: () => adminGatewaysApi.list(filters),
    staleTime: 30_000,
  });
}

export function useAdminGateway(id: string) {
  return useQuery({
    queryKey: adminGatewaysKeys.detail(id),
    queryFn: () => adminGatewaysApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAdminGatewayStatistics() {
  return useQuery({
    queryKey: adminGatewaysKeys.statistics(),
    queryFn: () => adminGatewaysApi.getStatistics(),
    staleTime: 60_000,
  });
}

export function useCreateGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGatewayRequest) => adminGatewaysApi.create(data),
    onSuccess: () => {
      toast.success('Gateway created successfully');
      queryClient.invalidateQueries({ queryKey: adminGatewaysKeys.all });
    },
    onError: () => { toast.error('Failed to create gateway'); },
  });
}

export function useUpdateGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGatewayRequest }) =>
      adminGatewaysApi.update(id, data),
    onSuccess: () => {
      toast.success('Gateway updated successfully');
      queryClient.invalidateQueries({ queryKey: adminGatewaysKeys.all });
    },
    onError: () => { toast.error('Failed to update gateway'); },
  });
}

export function useDeleteGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminGatewaysApi.deleteGateway(id),
    onSuccess: () => {
      toast.success('Gateway deleted successfully');
      queryClient.invalidateQueries({ queryKey: adminGatewaysKeys.all });
    },
    onError: () => { toast.error('Failed to delete gateway'); },
  });
}

export function useToggleGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminGatewaysApi.toggleActive(id),
    onSuccess: () => {
      toast.success('Gateway status toggled');
      queryClient.invalidateQueries({ queryKey: adminGatewaysKeys.all });
    },
    onError: () => { toast.error('Failed to toggle gateway'); },
  });
}

/**
 * Admin Fee Management React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminFeesApi,
  type UpdateGlobalFeesRequest,
  type UpdateGatewayFeesRequest,
  type UpdateOrganizationFeesRequest,
  type UpdateVendorFeesRequest,
} from '@/lib/api/admin-fees';

export const adminFeesKeys = {
  all: ['admin', 'fees'] as const,
  overview: () => [...adminFeesKeys.all, 'overview'] as const,
  statistics: () => [...adminFeesKeys.all, 'statistics'] as const,
  gatewayFees: (id: string) => [...adminFeesKeys.all, 'gateway', id] as const,
  organizationFees: (id: string) => [...adminFeesKeys.all, 'organization', id] as const,
  vendorFees: (id: string) => [...adminFeesKeys.all, 'vendor', id] as const,
};

export function useAdminFeeOverview() {
  return useQuery({
    queryKey: adminFeesKeys.overview(),
    queryFn: () => adminFeesApi.getOverview(),
    staleTime: 30_000,
  });
}

export function useAdminFeeStatistics() {
  return useQuery({
    queryKey: adminFeesKeys.statistics(),
    queryFn: () => adminFeesApi.getStatistics(),
    staleTime: 60_000,
  });
}

export function useGatewayFees(gatewayId: string) {
  return useQuery({
    queryKey: adminFeesKeys.gatewayFees(gatewayId),
    queryFn: () => adminFeesApi.getGatewayFees(gatewayId),
    enabled: !!gatewayId,
    staleTime: 60_000,
  });
}

export function useOrganizationFees(orgId: string) {
  return useQuery({
    queryKey: adminFeesKeys.organizationFees(orgId),
    queryFn: () => adminFeesApi.getOrganizationFees(orgId),
    enabled: !!orgId,
    staleTime: 60_000,
  });
}

export function useVendorFees(vendorId: string) {
  return useQuery({
    queryKey: adminFeesKeys.vendorFees(vendorId),
    queryFn: () => adminFeesApi.getVendorFees(vendorId),
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}

export function useUpdateGlobalFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateGlobalFeesRequest) => adminFeesApi.updateGlobalFees(data),
    onSuccess: () => {
      toast.success('Global fees updated successfully');
      queryClient.invalidateQueries({ queryKey: adminFeesKeys.all });
    },
    onError: () => { toast.error('Failed to update global fees'); },
  });
}

export function useUpdateGatewayFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gatewayId, data }: { gatewayId: string; data: UpdateGatewayFeesRequest }) =>
      adminFeesApi.updateGatewayFees(gatewayId, data),
    onSuccess: () => {
      toast.success('Gateway fees updated successfully');
      queryClient.invalidateQueries({ queryKey: adminFeesKeys.all });
    },
    onError: () => { toast.error('Failed to update gateway fees'); },
  });
}

export function useUpdateOrganizationFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: UpdateOrganizationFeesRequest }) =>
      adminFeesApi.updateOrganizationFees(orgId, data),
    onSuccess: () => {
      toast.success('Organization fees updated successfully');
      queryClient.invalidateQueries({ queryKey: adminFeesKeys.all });
    },
    onError: () => { toast.error('Failed to update organization fees'); },
  });
}

export function useUpdateVendorFees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: UpdateVendorFeesRequest }) =>
      adminFeesApi.updateVendorFees(vendorId, data),
    onSuccess: () => {
      toast.success('Vendor fees updated successfully');
      queryClient.invalidateQueries({ queryKey: adminFeesKeys.all });
    },
    onError: () => { toast.error('Failed to update vendor fees'); },
  });
}

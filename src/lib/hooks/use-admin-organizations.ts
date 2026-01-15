/**
 * Admin Organization Management React Query Hooks
 *
 * Provides React Query hooks for managing organization operations.
 * Includes caching, optimistic updates, and automatic refetching.
 *
 * @module lib/hooks/use-admin-organizations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminOrganizationsApi,
  type Organization,
  type OrganizationFilters,
} from '@/lib/api/admin-organizations';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for admin organizations
 */
export const adminOrganizationsKeys = {
  all: ['admin', 'organizations'] as const,
  lists: () => [...adminOrganizationsKeys.all, 'list'] as const,
  list: (filters: OrganizationFilters) =>
    [...adminOrganizationsKeys.lists(), filters] as const,
  details: () => [...adminOrganizationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminOrganizationsKeys.details(), id] as const,
  statistics: () => [...adminOrganizationsKeys.all, 'statistics'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch paginated list of organizations with filters
 *
 * @param filters - Organization filters
 * @param options - React Query options
 * @returns Query result with organizations data
 *
 * @example
 * ```tsx
 * function OrganizationsList() {
 *   const { data, isLoading, error } = useAdminOrganizationsList({
 *     status: 'active',
 *     country: 'NG',
 *     page: 1,
 *     per_page: 20,
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       {data?.data.map(org => (
 *         <OrganizationCard key={org.id} organization={org} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminOrganizationsList(
  filters: OrganizationFilters = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<Organization>, Error>({
    queryKey: adminOrganizationsKeys.list(filters),
    queryFn: () => adminOrganizationsApi.list(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to fetch a single organization by ID
 *
 * @param id - Organization ID
 * @param options - React Query options
 * @returns Query result with organization details
 *
 * @example
 * ```tsx
 * function OrganizationDetail({ orgId }: { orgId: string }) {
 *   const { data, isLoading } = useAdminOrganization(orgId);
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <h1>{data?.data.name}</h1>
 *       <p>Email: {data?.data.email}</p>
 *       <p>Status: {data?.data.status}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminOrganization(
  id: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ApiResponse<Organization>, Error>({
    queryKey: adminOrganizationsKeys.detail(id),
    queryFn: () => adminOrganizationsApi.get(id),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? !!id,
  });
}

/**
 * Hook to fetch organization statistics
 *
 * @param options - React Query options
 * @returns Query result with organization statistics
 *
 * @example
 * ```tsx
 * function OrganizationStatistics() {
 *   const { data, isLoading } = useAdminOrganizationStatistics();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <Card>
 *         <h3>Total Organizations</h3>
 *         <p>{data?.data.total_organizations}</p>
 *       </Card>
 *       <Card>
 *         <h3>Active Organizations</h3>
 *         <p>{data?.data.active_organizations}</p>
 *       </Card>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminOrganizationStatistics(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: adminOrganizationsKeys.statistics(),
    queryFn: () => adminOrganizationsApi.getStatistics(),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to suspend an organization
 *
 * @returns Mutation hook for suspending organizations
 *
 * @example
 * ```tsx
 * function SuspendOrganizationButton({ orgId }: { orgId: string }) {
 *   const { mutate: suspendOrg, isPending } = useSuspendOrganization();
 *
 *   const handleSuspend = () => {
 *     const reason = prompt('Reason for suspension:');
 *     if (reason) {
 *       suspendOrg({ id: orgId, reason });
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleSuspend} disabled={isPending}>
 *       {isPending ? 'Suspending...' : 'Suspend Organization'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSuspendOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminOrganizationsApi.suspend(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminOrganizationsKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminOrganizationsKeys.detail(variables.id),
      });
      toast.success('Organization suspended successfully');
    },
    onError: (error: Error) => {
      console.error('Suspend organization error:', error);
      toast.error(`Failed to suspend organization: ${error.message}`);
    },
  });
}

/**
 * Hook to activate a suspended organization
 *
 * @returns Mutation hook for activating organizations
 *
 * @example
 * ```tsx
 * function ActivateOrganizationButton({ orgId }: { orgId: string }) {
 *   const { mutate: activateOrg, isPending } = useActivateOrganization();
 *
 *   return (
 *     <button
 *       onClick={() => activateOrg(orgId)}
 *       disabled={isPending}
 *     >
 *       {isPending ? 'Activating...' : 'Activate Organization'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useActivateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminOrganizationsApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: adminOrganizationsKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminOrganizationsKeys.detail(id),
      });
      toast.success('Organization activated successfully');
    },
    onError: (error: Error) => {
      console.error('Activate organization error:', error);
      toast.error(`Failed to activate organization: ${error.message}`);
    },
  });
}

/**
 * Hook to invalidate organization queries (useful after updates)
 *
 * @example
 * ```tsx
 * function RefreshButton() {
 *   const invalidateOrganizations = useInvalidateOrganizations();
 *
 *   return (
 *     <button onClick={invalidateOrganizations}>
 *       Refresh Organizations
 *     </button>
 *   );
 * }
 * ```
 */
export function useInvalidateOrganizations() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: adminOrganizationsKeys.all,
    });
  };
}

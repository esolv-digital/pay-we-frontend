/**
 * Organization Hooks
 *
 * React Query hooks for managing organization data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi, type UpdateOrganizationInput } from '@/lib/api/organization';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { useAuth } from './use-auth';

/**
 * Get current user's organization
 * Uses the first organization from the user's organizations array
 */
export function useOrganization() {
  const { user } = useAuth();
  const organizationId = user?.organizations?.[0]?.id;

  return useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationApi.getOrganization(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get all organizations for current user
 */
export function useMyOrganizations() {
  return useQuery({
    queryKey: ['my-organizations'],
    queryFn: organizationApi.getMyOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update organization details
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const organizationId = user?.organizations?.[0]?.id;

  return useMutation({
    mutationFn: (data: UpdateOrganizationInput) =>
      organizationApi.updateOrganization(organizationId!, data),
    onSuccess: (updatedOrganization) => {
      // Invalidate and refetch organization queries
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['my-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      // Update the cache optimistically
      queryClient.setQueryData(['organization', organizationId], updatedOrganization);

      showSuccess('Organization updated successfully');
    },
    onError: (error: any) => {
      showApiError(error);
    },
  });
}

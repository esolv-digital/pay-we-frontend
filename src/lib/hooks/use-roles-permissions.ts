import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, permissionsApi } from '@/lib/api/roles';
import { toast } from 'sonner';

/**
 * React Query hooks for roles and permissions
 */

/**
 * Fetch all roles
 */
export function useRoles(params?: Parameters<typeof rolesApi.list>[0]) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => rolesApi.list(params),
  });
}

/**
 * Fetch single role
 */
export function useRole(id: number) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesApi.get(id),
    enabled: !!id,
  });
}

/**
 * Create new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role');
    },
  });
}

/**
 * Update existing role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof rolesApi.update>[1];
    }) => rolesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    },
  });
}

/**
 * Delete role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
    },
  });
}

/**
 * Assign roles to user
 */
export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesApi.assign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Roles assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign roles');
    },
  });
}

/**
 * Get users by role
 */
export function useRoleUsers(
  roleId: number,
  params?: { page?: number; per_page?: number }
) {
  return useQuery({
    queryKey: ['roles', roleId, 'users', params],
    queryFn: () => rolesApi.getUsers(roleId, params),
    enabled: !!roleId,
  });
}

/**
 * Fetch all permissions
 */
export function usePermissions(grouped = false) {
  return useQuery({
    queryKey: ['permissions', grouped],
    queryFn: () => permissionsApi.list(grouped),
  });
}

/**
 * Assign permissions to user
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: permissionsApi.assign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Permissions assigned successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to assign permissions'
      );
    },
  });
}

/**
 * Get users with specific permission
 */
export function usePermissionUsers(
  permission: string,
  params?: { page?: number; per_page?: number }
) {
  return useQuery({
    queryKey: ['permissions', permission, 'users', params],
    queryFn: () => permissionsApi.getUsers(permission, params),
    enabled: !!permission,
  });
}

/**
 * Fetch role statistics
 */
export function useRoleStatistics() {
  return useQuery({
    queryKey: ['roles', 'statistics'],
    queryFn: rolesApi.getStatistics,
  });
}

/**
 * Admin Roles & Permissions React Query Hooks
 *
 * Provides React Query hooks for managing roles and permissions.
 * Includes caching, optimistic updates, and automatic refetching.
 *
 * @module lib/hooks/use-admin-roles
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminRolesApi, {
  type Role,
  type Permission,
  type GroupedPermission,
  type RoleFilters,
  type CreateRoleRequest,
  type UpdateRoleRequest,
  type AssignRolesRequest,
  type AssignPermissionsRequest,
  type RoleStatistics,
  type UserWithRoles,
} from '@/lib/api/admin-roles';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for admin roles
 */
export const adminRolesKeys = {
  all: ['admin', 'roles'] as const,
  lists: () => [...adminRolesKeys.all, 'list'] as const,
  list: (filters: RoleFilters) => [...adminRolesKeys.lists(), filters] as const,
  details: () => [...adminRolesKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminRolesKeys.details(), id] as const,
  statistics: () => [...adminRolesKeys.all, 'statistics'] as const,
  roleUsers: (roleId: number, filters?: PaginationParams) =>
    [...adminRolesKeys.detail(roleId), 'users', filters] as const,
};

/**
 * Query key factory for permissions
 */
export const adminPermissionsKeys = {
  all: ['admin', 'permissions'] as const,
  lists: () => [...adminPermissionsKeys.all, 'list'] as const,
  list: (grouped?: boolean) =>
    [...adminPermissionsKeys.lists(), { grouped }] as const,
  permissionUsers: (permissionId: number, filters?: PaginationParams) =>
    [...adminPermissionsKeys.all, 'permission', permissionId, 'users', filters] as const,
};

// ============================================================================
// ROLES HOOKS
// ============================================================================

/**
 * Hook to fetch paginated list of roles
 *
 * @param filters - Role filters
 * @param options - React Query options
 * @returns Query result with roles data
 */
export function useAdminRolesList(
  filters: RoleFilters = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<Role>, Error>({
    queryKey: adminRolesKeys.list(filters),
    queryFn: () => adminRolesApi.list(filters),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to fetch a single role by ID
 *
 * @param roleId - Role ID
 * @param options - React Query options
 * @returns Query result with role details
 */
export function useAdminRole(
  roleId: number,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<Role, Error>({
    queryKey: adminRolesKeys.detail(roleId),
    queryFn: () => adminRolesApi.get(roleId),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? !!roleId,
  });
}

/**
 * Hook to fetch users with a specific role
 *
 * @param roleId - Role ID
 * @param filters - Pagination filters
 * @param options - React Query options
 * @returns Query result with users
 */
export function useRoleUsers(
  roleId: number,
  filters?: PaginationParams,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<PaginatedResponse<UserWithRoles>, Error>({
    queryKey: adminRolesKeys.roleUsers(roleId, filters),
    queryFn: () => adminRolesApi.getRoleUsers(roleId, filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? !!roleId,
  });
}

/**
 * Hook to fetch role statistics
 *
 * @param options - React Query options
 * @returns Query result with role statistics
 */
export function useAdminRoleStatistics(options?: { enabled?: boolean }) {
  return useQuery<RoleStatistics, Error>({
    queryKey: adminRolesKeys.statistics(),
    queryFn: () => adminRolesApi.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to create a new role
 *
 * @returns Mutation function and state
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, CreateRoleRequest>({
    mutationFn: (roleData) => adminRolesApi.create(roleData),
    onSuccess: (data) => {
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: adminRolesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminRolesKeys.statistics() });

      toast.success('Role created successfully', {
        description: `${data.name} has been created.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create role', {
        description: error.message || 'An error occurred while creating the role.',
      });
    },
  });
}

/**
 * Hook to update an existing role
 *
 * @returns Mutation function and state
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation<
    Role,
    Error,
    { roleId: number; data: UpdateRoleRequest }
  >({
    mutationFn: ({ roleId, data }) => adminRolesApi.update(roleId, data),
    onSuccess: (data, variables) => {
      // Invalidate specific role and lists
      queryClient.invalidateQueries({
        queryKey: adminRolesKeys.detail(variables.roleId),
      });
      queryClient.invalidateQueries({ queryKey: adminRolesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminRolesKeys.statistics() });

      toast.success('Role updated successfully', {
        description: `${data.name} has been updated.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to update role', {
        description: error.message || 'An error occurred while updating the role.',
      });
    },
  });
}

/**
 * Hook to delete a role
 *
 * @returns Mutation function and state
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (roleId) => adminRolesApi.delete(roleId),
    onSuccess: (_, roleId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: adminRolesKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: adminRolesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminRolesKeys.statistics() });

      toast.success('Role deleted successfully', {
        description: 'The role has been removed from the system.',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete role', {
        description: error.message || 'An error occurred while deleting the role.',
      });
    },
  });
}

// ============================================================================
// PERMISSIONS HOOKS
// ============================================================================

/**
 * Hook to fetch all permissions
 *
 * @param grouped - Whether to group permissions by category
 * @param options - React Query options
 * @returns Query result with permissions
 */
export function useAdminPermissions(
  grouped: boolean = false,
  options?: { enabled?: boolean }
) {
  return useQuery<
    Permission[] | { permissions: GroupedPermission[] },
    Error
  >({
    queryKey: adminPermissionsKeys.list(grouped),
    queryFn: () => adminRolesApi.getPermissions(grouped),
    staleTime: 10 * 60 * 1000, // 10 minutes (permissions rarely change)
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch users with a specific permission
 *
 * @param permissionId - Permission ID
 * @param filters - Pagination filters
 * @param options - React Query options
 * @returns Query result with users
 */
export function usePermissionUsers(
  permissionId: number,
  filters?: PaginationParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<UserWithRoles>, Error>({
    queryKey: adminPermissionsKeys.permissionUsers(permissionId, filters),
    queryFn: () => adminRolesApi.getPermissionUsers(permissionId, filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? !!permissionId,
  });
}

// ============================================================================
// ASSIGNMENT HOOKS
// ============================================================================

/**
 * Hook to assign roles to a user
 *
 * @returns Mutation function and state
 */
export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation<UserWithRoles, Error, AssignRolesRequest>({
    mutationFn: (assignData) => adminRolesApi.assignRoles(assignData),
    onSuccess: (data) => {
      // Invalidate user queries and role users
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminRolesKeys.all });

      toast.success('Roles assigned successfully', {
        description: `Roles have been assigned to ${data.full_name}.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to assign roles', {
        description: error.message || 'An error occurred while assigning roles.',
      });
    },
  });
}

/**
 * Hook to assign permissions to a user
 *
 * @returns Mutation function and state
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation<UserWithRoles, Error, AssignPermissionsRequest>({
    mutationFn: (assignData) => adminRolesApi.assignPermissions(assignData),
    onSuccess: (data) => {
      // Invalidate user queries and permission users
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminPermissionsKeys.all });

      toast.success('Permissions assigned successfully', {
        description: `Permissions have been assigned to ${data.full_name}.`,
      });
    },
    onError: (error) => {
      toast.error('Failed to assign permissions', {
        description:
          error.message || 'An error occurred while assigning permissions.',
      });
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to manually invalidate roles cache
 *
 * @returns Invalidation function
 */
export function useInvalidateRoles() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminRolesKeys.all });
  };
}

/**
 * Hook to manually invalidate permissions cache
 *
 * @returns Invalidation function
 */
export function useInvalidatePermissions() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminPermissionsKeys.all });
  };
}

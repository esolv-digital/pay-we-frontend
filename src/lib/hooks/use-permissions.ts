import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { PermissionService } from '@/lib/services/permissions';
import { PermissionName, PermissionCheckOptions } from '@/types/permissions';

/**
 * Hook for permission checking
 *
 * Provides memoized permission check functions to avoid unnecessary re-renders
 * Follows Interface Segregation Principle - only exposes what's needed
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: PermissionName, options?: PermissionCheckOptions) => {
      return PermissionService.hasPermission(user, permission, options);
    },
    [user]
  );

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissions: PermissionName[], options?: PermissionCheckOptions) => {
      return PermissionService.hasAllPermissions(user, permissions, options);
    },
    [user]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissions: PermissionName[], options?: PermissionCheckOptions) => {
      return PermissionService.hasAnyPermission(user, permissions, options);
    },
    [user]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (roleName: string) => {
      return PermissionService.hasRole(user, roleName);
    },
    [user]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roleNames: string[]) => {
      return PermissionService.hasAnyRole(user, roleNames);
    },
    [user]
  );

  /**
   * Check if user has all specified roles
   */
  const hasAllRoles = useCallback(
    (roleNames: string[]) => {
      return PermissionService.hasAllRoles(user, roleNames);
    },
    [user]
  );

  /**
   * Check if user is Super Admin
   */
  const isSuperAdmin = useMemo(
    () => PermissionService.isSuperAdmin(user),
    [user]
  );

  /**
   * Check if user is Platform Admin
   */
  const isPlatformAdmin = useMemo(
    () => PermissionService.isPlatformAdmin(user),
    [user]
  );

  /**
   * Get all user permissions
   */
  const allPermissions = useMemo(
    () => PermissionService.getAllPermissions(user),
    [user]
  );

  /**
   * Get direct permissions only
   */
  const directPermissions = useMemo(
    () => PermissionService.getDirectPermissions(user),
    [user]
  );

  /**
   * Get role-based permissions only
   */
  const rolePermissions = useMemo(
    () => PermissionService.getRolePermissions(user),
    [user]
  );

  /**
   * Get user roles
   */
  const roles = useMemo(() => user?.admin?.platform_roles || [], [user]);

  /**
   * Check if user can modify a role
   */
  const canModifyRole = useCallback(
    (roleName: string) => {
      return PermissionService.canModifyRole(user, roleName);
    },
    [user]
  );

  /**
   * Check if user can delete a role
   */
  const canDeleteRole = useCallback(
    (roleName: string) => {
      return PermissionService.canDeleteRole(user, roleName);
    },
    [user]
  );

  return {
    // Permission checks
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,

    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Admin checks
    isSuperAdmin,
    isPlatformAdmin,

    // Permission lists
    allPermissions,
    directPermissions,
    rolePermissions,
    roles,

    // Role modification checks
    canModifyRole,
    canDeleteRole,
  };
}

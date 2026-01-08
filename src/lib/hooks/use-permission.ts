import { useMemo } from 'react';
import { usePermissions } from './use-permissions';
import { PermissionName, PermissionCheckOptions } from '@/types/permissions';

/**
 * Simplified hook for checking a single permission
 * Useful for inline permission checks
 *
 * @example
 * const canViewRoles = usePermission('View Roles');
 * const canEditDirectOnly = usePermission('Update Roles', { directOnly: true });
 */
export function usePermission(
  permission: PermissionName,
  options?: PermissionCheckOptions
): boolean {
  const { hasPermission } = usePermissions();

  return useMemo(
    () => hasPermission(permission, options),
    [hasPermission, permission, options]
  );
}

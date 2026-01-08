import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionName, PermissionCheckOptions } from '@/types/permissions';

/**
 * Component that conditionally renders children based on permissions
 *
 * Follows Open/Closed Principle:
 * - Open for extension (can add new permission types)
 * - Closed for modification (core logic doesn't change)
 *
 * @example
 * // Single permission
 * <Can permission="View Roles">
 *   <RolesList />
 * </Can>
 *
 * @example
 * // Multiple permissions (AND logic)
 * <Can permissions={['View Roles', 'Update Roles']} requireAll>
 *   <EditRoleButton />
 * </Can>
 *
 * @example
 * // Multiple permissions (OR logic)
 * <Can permissions={['View KYC', 'Approve KYC']}>
 *   <KYCSection />
 * </Can>
 *
 * @example
 * // With fallback
 * <Can permission="View Reports" fallback={<NoAccessMessage />}>
 *   <ReportsPage />
 * </Can>
 */
interface CanProps {
  /** Single permission to check */
  permission?: PermissionName;

  /** Multiple permissions to check */
  permissions?: PermissionName[];

  /** Require all permissions (AND) or any permission (OR) */
  requireAll?: boolean;

  /** Permission check options */
  options?: PermissionCheckOptions;

  /** Content to render when user has permission */
  children: ReactNode;

  /** Content to render when user doesn't have permission */
  fallback?: ReactNode;
}

export function Can({
  permission,
  permissions,
  requireAll = true,
  options,
  children,
  fallback = null,
}: CanProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission, options);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions, options)
      : hasAnyPermission(permissions, options);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

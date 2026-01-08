import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';

/**
 * Component that conditionally renders children based on roles
 *
 * @example
 * // Single role
 * <CanRole role="Super Admin">
 *   <SystemSettings />
 * </CanRole>
 *
 * @example
 * // Multiple roles (AND logic)
 * <CanRole roles={['Platform Admin', 'Finance Manager']} requireAll>
 *   <AdvancedFeature />
 * </CanRole>
 *
 * @example
 * // Multiple roles (OR logic)
 * <CanRole roles={['Super Admin', 'Platform Admin']}>
 *   <AdminPanel />
 * </CanRole>
 */
interface CanRoleProps {
  /** Single role to check */
  role?: string;

  /** Multiple roles to check */
  roles?: string[];

  /** Require all roles (AND) or any role (OR) */
  requireAll?: boolean;

  /** Content to render when user has role */
  children: ReactNode;

  /** Content to render when user doesn't have role */
  fallback?: ReactNode;
}

export function CanRole({
  role,
  roles,
  requireAll = true,
  children,
  fallback = null,
}: CanRoleProps) {
  const { hasRole, hasAllRoles, hasAnyRole } = usePermissions();

  let hasAccess = false;

  if (role) {
    hasAccess = hasRole(role);
  } else if (roles && roles.length > 0) {
    hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

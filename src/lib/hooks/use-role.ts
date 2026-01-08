import { useMemo } from 'react';
import { usePermissions } from './use-permissions';

/**
 * Simplified hook for checking a single role
 * Useful for inline role checks
 *
 * @example
 * const isSuperAdmin = useRole('Super Admin');
 * const isFinanceManager = useRole('Finance Manager');
 */
export function useRole(roleName: string): boolean {
  const { hasRole } = usePermissions();

  return useMemo(() => hasRole(roleName), [hasRole, roleName]);
}

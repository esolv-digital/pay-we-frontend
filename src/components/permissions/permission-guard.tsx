import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionName } from '@/types/permissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

/**
 * Full-page permission guard with user-friendly error message
 * Use this for protecting entire pages/routes
 *
 * @example
 * export default function RolesPage() {
 *   return (
 *     <PermissionGuard permission="View Roles">
 *       <RolesContent />
 *     </PermissionGuard>
 *   );
 * }
 */
interface PermissionGuardProps {
  /** Permission required to access this content */
  permission: PermissionName;

  /** Content to render when user has permission */
  children: ReactNode;

  /** Custom message for access denied */
  message?: string;
}

export function PermissionGuard({
  permission,
  children,
  message = `You don't have permission to access this page. Required permission: ${permission}`,
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Admin Detail Page
 *
 * View and manage a single administrator:
 * - Profile information with audit trail fields
 * - Role management (promote/demote)
 * - Suspend/activate (no delete — ISO 27001)
 * - Permissions overview
 *
 * Self-protection rules enforced in UI:
 * - Cannot change own role
 * - Cannot suspend self
 * - Cannot suspend a Super Admin (must demote first)
 *
 * Ref: docs/ADMIN_AND_USER_MANAGEMENT.md
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconBadge } from '@/components/ui/icon-badge';
import { formatDate } from '@/lib/utils/format';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  useAdminDetail,
  useUpdateAdmin,
  useActivateAdmin,
} from '@/lib/hooks/use-admin-management';
import type { AdminRole } from '@/lib/api/admin-management';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  Lock,
  Clock,
  Mail,
  Phone,
  Edit,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  EditAdminDialog,
  SuspendAdminDialog,
  DemoteAdminDialog,
} from '@/components/admin/admin-management';

export default function AdminDetailPage() {
  const params = useParams();
  const adminId = params?.id as string;
  const { user: currentUser } = useAuth();

  // Dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDemoteDialog, setShowDemoteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<AdminRole>('Platform Admin');

  // Data
  const { data: admin, isLoading, error } = useAdminDetail(adminId);

  // Mutations
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin();
  const { mutate: activateAdmin, isPending: isActivating } = useActivateAdmin();

  // Self-protection checks
  const isCurrentUser = admin?.id === currentUser?.id;
  const isSuperAdmin = admin?.admin.is_super_admin ?? false;
  const canChangeRole = !isCurrentUser;
  const canSuspendAdmin = !isCurrentUser && !isSuperAdmin;
  const canDemoteAdmin = !isCurrentUser && !isSuperAdmin;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="p-12 text-center">
          <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
          <h2 className="text-2xl font-semibold mb-2">Administrator Not Found</h2>
          <p className="text-gray-600 mb-4">
            The requested administrator could not be found or you don&apos;t have permission.
          </p>
          <Link href={ADMIN_ROUTES.ADMIN_MANAGEMENT}>
            <Button>Back to Admin Management</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleOpenRole = () => {
    setNewRole(admin.admin.is_super_admin ? 'Platform Admin' : 'Super Admin');
    setShowRoleDialog(true);
  };

  const handleRoleChange = () => {
    updateAdmin(
      { id: admin.id, data: { role: newRole } },
      { onSuccess: () => setShowRoleDialog(false) }
    );
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_ADMINS}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Back link */}
        <Link
          href={ADMIN_ROUTES.ADMIN_MANAGEMENT}
          className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin Management
        </Link>

        {/* Header */}
        <div className="flex justify-between items-start mt-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {admin.full_name}
                {isCurrentUser && (
                  <span className="ml-2 text-lg text-gray-400">(You)</span>
                )}
              </h1>
              <Badge
                className={
                  admin.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {admin.status}
              </Badge>
              <Badge
                className={
                  admin.admin.is_super_admin
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-indigo-100 text-indigo-800'
                }
              >
                {admin.admin.is_super_admin ? 'Super Admin' : 'Platform Admin'}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">Administrator profile and access management</p>
          </div>
          <Can permission={PERMISSIONS.ADMIN_MANAGE_ADMINS}>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              {canChangeRole && (
                <Button variant="outline" onClick={handleOpenRole}>
                  <Shield className="mr-2 h-4 w-4" />
                  Change Role
                </Button>
              )}
              <Button
                variant="outline"
                className={
                  canDemoteAdmin
                    ? 'text-orange-600 hover:text-orange-700'
                    : 'text-gray-300'
                }
                onClick={() => setShowDemoteDialog(true)}
                disabled={!canDemoteAdmin}
                title={
                  isCurrentUser
                    ? 'You cannot demote your own account'
                    : isSuperAdmin
                      ? 'Cannot demote a Super Admin. Change their role to Platform Admin first.'
                      : undefined
                }
              >
                Demote
              </Button>
              {admin.status === 'active' ? (
                <Button
                  variant="outline"
                  className={
                    canSuspendAdmin
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-gray-300'
                  }
                  onClick={() => setShowSuspendDialog(true)}
                  disabled={!canSuspendAdmin}
                  title={
                    isCurrentUser
                      ? 'You cannot suspend your own account'
                      : isSuperAdmin
                        ? 'Cannot suspend a Super Admin. Demote them first.'
                        : undefined
                  }
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                  onClick={() => activateAdmin(admin.id)}
                  disabled={isActivating}
                >
                  {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Activate
                </Button>
              )}
            </div>
          </Can>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Role</p>
                <p className="text-xl font-bold text-gray-900">
                  {admin.admin.is_super_admin ? 'Super Admin' : 'Platform Admin'}
                </p>
              </div>
              <IconBadge icon={ShieldCheck} color="purple" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Permissions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {admin.admin.platform_permissions.length}
                </p>
              </div>
              <IconBadge icon={Lock} color="blue" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">2FA</p>
                <p className="text-xl font-bold text-gray-900">
                  {admin.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <IconBadge icon={Shield} color="green" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Login</p>
                <p className="text-sm font-bold text-gray-900">
                  {admin.last_login_at ? formatDate(admin.last_login_at) : 'Never'}
                </p>
              </div>
              <IconBadge icon={Clock} color="orange" />
            </div>
          </Card>
        </div>

        {/* Profile Info */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-gray-900 font-medium">{admin.full_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{admin.email}</p>
                </div>
                {admin.email_verified_at && (
                  <Badge variant="outline" className="text-green-700 ml-2">Verified</Badge>
                )}
              </div>
              {admin.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{admin.phone}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900">{formatDate(admin.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDate(admin.updated_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Access</p>
                <div className="flex gap-2 mt-1">
                  {admin.has_admin_access && (
                    <Badge variant="outline" className="text-purple-700">Admin Access</Badge>
                  )}
                  {admin.has_vendor_access && (
                    <Badge variant="outline" className="text-blue-700">Vendor Access</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Roles & Permissions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Roles & Permissions</h2>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Roles</p>
            <div className="flex flex-wrap gap-2">
              {admin.admin.platform_roles.length > 0 ? (
                admin.admin.platform_roles.map((role) => (
                  <Badge key={role} className="bg-purple-100 text-purple-800">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No roles assigned</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Permissions ({admin.admin.platform_permissions.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {admin.admin.platform_permissions.length > 0 ? (
                admin.admin.platform_permissions.map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs">
                    {perm}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No direct permissions</span>
              )}
            </div>
          </div>
        </Card>

        {/* Extracted Dialogs */}
        {showEditDialog && (
          <EditAdminDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            admin={admin}
          />
        )}

        {showSuspendDialog && (
          <SuspendAdminDialog
            open={showSuspendDialog}
            onOpenChange={setShowSuspendDialog}
            admin={admin}
          />
        )}

        {showDemoteDialog && (
          <DemoteAdminDialog
            open={showDemoteDialog}
            onOpenChange={setShowDemoteDialog}
            admin={admin}
          />
        )}

        {/* Change Role Dialog — kept inline (simple confirmation) */}
        <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Role</AlertDialogTitle>
              <AlertDialogDescription>
                {admin.admin.is_super_admin
                  ? `Demote ${admin.full_name} from Super Admin to Platform Admin? They will lose elevated privileges.`
                  : `Promote ${admin.full_name} from Platform Admin to Super Admin? They will gain full platform access.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label htmlFor="new-role" className="block text-sm font-medium text-gray-700 mb-1">
                New Role
              </label>
              <select
                id="new-role"
                aria-label="Select new role"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Platform Admin">Platform Admin</option>
              </select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRoleChange} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Role Change
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}

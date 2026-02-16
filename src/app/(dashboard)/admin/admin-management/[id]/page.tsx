/**
 * Admin Detail Page
 *
 * View and manage a single administrator:
 * - Profile information
 * - Role management (promote/demote)
 * - Suspend/activate
 * - Permissions overview
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import {
  useAdminDetail,
  useUpdateAdmin,
  useSuspendAdmin,
  useActivateAdmin,
} from '@/lib/hooks/use-admin-management';
import type { AdminRole, SuspendAdminRequest, UpdateAdminRequest } from '@/lib/api/admin-management';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Loader2,
  ArrowLeft,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  Lock,
  Edit,
  AlertCircle,
} from 'lucide-react';

export default function AdminDetailPage() {
  const params = useParams();
  const adminId = parseInt(params?.id as string);

  // Dialogs
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editForm, setEditForm] = useState<UpdateAdminRequest>({});
  const [suspendForm, setSuspendForm] = useState<SuspendAdminRequest>({ reason: '' });
  const [newRole, setNewRole] = useState<AdminRole>('Platform Admin');

  // Data
  const { data: admin, isLoading, error } = useAdminDetail(adminId);

  // Mutations
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateAdmin();
  const { mutate: suspendAdmin, isPending: isSuspending } = useSuspendAdmin();
  const { mutate: activateAdmin, isPending: isActivating } = useActivateAdmin();

  if (isLoading) {
    return (
      <div className="p-8">
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
      <div className="p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
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

  const handleOpenEdit = () => {
    setEditForm({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      phone: admin.phone || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    updateAdmin(
      { id: admin.id, data: editForm },
      { onSuccess: () => setShowEditDialog(false) }
    );
  };

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

  const handleOpenSuspend = () => {
    setSuspendForm({ reason: '', duration_days: undefined });
    setShowSuspendDialog(true);
  };

  const handleSuspend = () => {
    suspendAdmin(
      { id: admin.id, data: suspendForm },
      { onSuccess: () => setShowSuspendDialog(false) }
    );
  };

  const handleActivate = () => {
    activateAdmin(admin.id);
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_ADMINS}>
      <div className="p-8">
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
              <h1 className="text-3xl font-bold text-gray-900">{admin.full_name}</h1>
              <Badge className={admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {admin.status}
              </Badge>
              {admin.admin.is_super_admin ? (
                <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
              ) : (
                <Badge className="bg-indigo-100 text-indigo-800">Platform Admin</Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">Administrator profile and access management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={handleOpenRole}>
              <Shield className="mr-2 h-4 w-4" />
              Change Role
            </Button>
            {admin.status === 'active' ? (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={handleOpenSuspend}
              >
                Suspend
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-green-600 hover:text-green-700"
                onClick={handleActivate}
                disabled={isActivating}
              >
                {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Activate
              </Button>
            )}
          </div>
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
              <div className="rounded-full p-3 bg-purple-50">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
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
              <div className="rounded-full p-3 bg-blue-50">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
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
              <div className="rounded-full p-3 bg-green-50">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
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
              <div className="rounded-full p-3 bg-orange-50">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
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

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Administrator</DialogTitle>
              <DialogDescription>Update {admin.full_name}&apos;s profile information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-first-name">First Name</Label>
                  <Input
                    id="edit-first-name"
                    value={editForm.first_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-last-name">Last Name</Label>
                  <Input
                    id="edit-last-name"
                    value={editForm.last_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Role Dialog */}
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
              <Label htmlFor="new-role">New Role</Label>
              <select
                id="new-role"
                aria-label="Select new role"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mt-1"
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

        {/* Suspend Dialog */}
        <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend Administrator</AlertDialogTitle>
              <AlertDialogDescription>
                Suspend {admin.full_name}&apos;s access. They will not be able to log in until reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="detail-suspend-reason">Reason (required)</Label>
                <Input
                  id="detail-suspend-reason"
                  placeholder="Reason for suspension"
                  value={suspendForm.reason}
                  onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="detail-suspend-duration">Duration (days, optional)</Label>
                <Input
                  id="detail-suspend-duration"
                  type="number"
                  min={1}
                  max={365}
                  placeholder="Leave empty for indefinite"
                  value={suspendForm.duration_days ?? ''}
                  onChange={(e) =>
                    setSuspendForm({
                      ...suspendForm,
                      duration_days: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSuspend}
                disabled={isSuspending || !suspendForm.reason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSuspending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Suspend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}

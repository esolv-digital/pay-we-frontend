/**
 * Admin Management Page
 *
 * List and manage platform administrators (Super Admins, Platform Admins).
 * Supports: create, edit, suspend/activate, role assignment.
 * No delete — only suspend.
 */

'use client';

import { useState } from 'react';
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
  useAdminList,
  useAdminStatistics,
  useCreateAdmin,
  useSuspendAdmin,
  useActivateAdmin,
} from '@/lib/hooks/use-admin-management';
import type {
  AdminUser,
  AdminFilters,
  AdminStatus,
  AdminRole,
  CreateAdminRequest,
  SuspendAdminRequest,
} from '@/lib/api/admin-management';
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
  Plus,
  Shield,
  ShieldCheck,
  Users,
  UserX,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const STATUS_COLORS: Record<AdminStatus, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
};

const ADMIN_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
];

const ADMIN_ROLES: { label: string; value: string }[] = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'Super Admin' },
  { label: 'Platform Admin', value: 'Platform Admin' },
];

export default function AdminManagementPage() {
  const [filters, setFilters] = useState<AdminFilters>({
    page: 1,
    per_page: 20,
  });

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [createForm, setCreateForm] = useState<CreateAdminRequest>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'Platform Admin',
  });
  const [suspendForm, setSuspendForm] = useState<SuspendAdminRequest>({
    reason: '',
    duration_days: undefined,
  });

  // Data
  const { data, isLoading, error } = useAdminList(filters);
  const { data: statsData } = useAdminStatistics();

  // Mutations
  const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
  const { mutate: suspendAdmin, isPending: isSuspending } = useSuspendAdmin();
  const { mutate: activateAdmin, isPending: isActivating } = useActivateAdmin();

  const admins = data?.data || [];
  const meta = data?.meta;
  const stats = statsData || { total: 0, super_admins: 0, platform_admins: 0, active: 0, suspended: 0 };

  const handleFilterChange = (key: keyof AdminFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: key !== 'page' ? 1 : prev.page,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleOpenCreate = () => {
    setCreateForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      role: 'Platform Admin',
    });
    setShowCreateDialog(true);
  };

  const handleCreate = () => {
    createAdmin(createForm, {
      onSuccess: () => {
        setShowCreateDialog(false);
      },
    });
  };

  const handleOpenSuspend = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setSuspendForm({ reason: '', duration_days: undefined });
    setShowSuspendDialog(true);
  };

  const handleSuspend = () => {
    if (!selectedAdmin) return;
    suspendAdmin(
      { id: selectedAdmin.id, data: suspendForm },
      {
        onSuccess: () => {
          setShowSuspendDialog(false);
          setSelectedAdmin(null);
        },
      }
    );
  };

  const handleActivate = (admin: AdminUser) => {
    activateAdmin(admin.id);
  };

  const statisticsCards = [
    { label: 'Total Admins', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Super Admins', value: stats.super_admins, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Platform Admins', value: stats.platform_admins, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active', value: stats.active, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Suspended', value: stats.suspended, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_ADMINS}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600 mt-1">Manage platform administrators and their access</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Admin
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statisticsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`rounded-full p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by status"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {ADMIN_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by role"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={filters.role || ''}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              {ADMIN_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="p-8 mb-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load administrators</h3>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && admins.length === 0 && (
          <Card className="p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Administrators Found</h2>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status || filters.role
                ? 'Try adjusting your filters'
                : 'Get started by creating a new administrator'}
            </p>
            <Button onClick={handleOpenCreate}>Create Admin</Button>
          </Card>
        )}

        {/* Admin List */}
        {!isLoading && !error && admins.length > 0 && (
          <>
            <div className="space-y-4">
              {admins.map((admin) => (
                <Card key={admin.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{admin.full_name}</h3>
                        <Badge className={STATUS_COLORS[admin.status]}>
                          {admin.status}
                        </Badge>
                        {admin.admin.is_super_admin && (
                          <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
                        )}
                        {!admin.admin.is_super_admin && admin.admin.is_platform_admin && (
                          <Badge className="bg-indigo-100 text-indigo-800">Platform Admin</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{admin.email}</p>
                        {admin.phone && <p>{admin.phone}</p>}
                        <div className="flex items-center gap-4 mt-2">
                          <span>
                            2FA: {admin.two_factor_enabled ? (
                              <Badge variant="outline" className="text-green-700">Enabled</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">Disabled</Badge>
                            )}
                          </span>
                          {admin.last_login_at && (
                            <span className="text-gray-500">
                              Last login: {formatDate(admin.last_login_at)}
                            </span>
                          )}
                        </div>
                        {admin.admin.platform_roles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {admin.admin.platform_roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={ADMIN_ROUTES.ADMIN_MANAGEMENT_DETAILS(String(admin.id))}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {admin.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleOpenSuspend(admin)}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleActivate(admin)}
                          disabled={isActivating}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Showing page {meta.current_page} of {meta.last_page} ({meta.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page >= meta.last_page}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Admin Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Administrator</DialogTitle>
              <DialogDescription>
                Add a new platform administrator. They will have immediate access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-first-name">First Name</Label>
                  <Input
                    id="create-first-name"
                    placeholder="First name"
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="create-last-name">Last Name</Label>
                  <Input
                    id="create-last-name"
                    placeholder="Last name"
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="admin@paywe.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-phone">Phone (optional)</Label>
                <Input
                  id="create-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={createForm.phone || ''}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-role">Role</Label>
                <select
                  id="create-role"
                  aria-label="Select admin role"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, role: e.target.value as AdminRole })
                  }
                >
                  <option value="Platform Admin">Platform Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div>
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-password-confirm">Confirm Password</Label>
                <Input
                  id="create-password-confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={createForm.password_confirmation}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password_confirmation: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  isCreating ||
                  !createForm.first_name.trim() ||
                  !createForm.last_name.trim() ||
                  !createForm.email.trim() ||
                  !createForm.password.trim() ||
                  createForm.password !== createForm.password_confirmation
                }
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Administrator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend Administrator</AlertDialogTitle>
              <AlertDialogDescription>
                Suspend {selectedAdmin?.full_name}&apos;s access to the platform. They will not be
                able to log in until reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="suspend-reason">Reason (required)</Label>
                <Input
                  id="suspend-reason"
                  placeholder="Reason for suspension"
                  value={suspendForm.reason}
                  onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="suspend-duration">Duration (days, optional)</Label>
                <Input
                  id="suspend-duration"
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
                Suspend Administrator
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}

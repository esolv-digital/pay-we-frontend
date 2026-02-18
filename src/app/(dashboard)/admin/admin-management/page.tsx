/**
 * Admin Management Page
 *
 * Manage platform administrators (Super Admin, Platform Admin).
 * Features: listing with table, filtering, statistics, create/edit/suspend/activate.
 *
 * ISO 27001: No delete — only suspend/activate. Suspension requires reason.
 * Self-protection: Cannot suspend self or Super Admins.
 * SOLID: Dialogs extracted into single-responsibility components.
 *
 * Ref: docs/ADMIN_AND_USER_MANAGEMENT.md
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconBadge } from '@/components/ui/icon-badge';
import { formatDate } from '@/lib/utils/format';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  useAdminList,
  useAdminStatistics,
  useActivateAdmin,
} from '@/lib/hooks/use-admin-management';
import type { AdminFilters, AdminStatus, AdminRole, AdminUser } from '@/lib/api/admin-management';
import { ShieldCheck, Shield, UserCheck, UserX, AlertTriangle, Plus } from 'lucide-react';
import {
  CreateAdminDialog,
  SuspendAdminDialog,
  DemoteAdminDialog,
} from '@/components/admin/admin-management';

const STATUS_COLORS: Record<AdminStatus, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
};

const ADMIN_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
];

const ROLE_FILTER_OPTIONS = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'Super Admin' },
  { label: 'Platform Admin', value: 'Platform Admin' },
];

export default function AdminManagementPage() {
  const { user: currentUser } = useAuth();

  const [filters, setFilters] = useState<AdminFilters>({
    page: 1,
    per_page: 20,
  });

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [demoteTarget, setDemoteTarget] = useState<AdminUser | null>(null);

  // Data fetching
  const { data, isLoading, isError, error } = useAdminList(filters);
  const { data: statistics } = useAdminStatistics();
  const { mutate: activateAdmin } = useActivateAdmin();

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

  const handleClearFilters = () => {
    setFilters({ page: 1, per_page: 20 });
  };

  const getAdminRoleLabel = (admin: AdminUser): string => {
    if (admin.admin.is_super_admin) return 'Super Admin';
    if (admin.admin.is_platform_admin) return 'Platform Admin';
    return 'Admin';
  };

  /**
   * Self-protection rules (backend also enforces these):
   * - Cannot suspend yourself
   * - Cannot suspend a Super Admin (must demote first)
   */
  const canSuspend = (admin: AdminUser): boolean => {
    const isCurrentUser = admin.id === currentUser?.id;
    const isSuperAdmin = admin.admin.is_super_admin;
    return !isCurrentUser && !isSuperAdmin;
  };

  const getSuspendTooltip = (admin: AdminUser): string | undefined => {
    if (admin.id === currentUser?.id) return 'You cannot suspend your own account';
    if (admin.admin.is_super_admin) return 'Cannot suspend a Super Admin. Demote them first.';
    return undefined;
  };

  /**
   * Self-protection rules for demote (same as suspend):
   * - Cannot demote yourself
   * - Cannot demote a Super Admin (must change role first)
   */
  const canDemote = (admin: AdminUser): boolean => {
    const isCurrentUser = admin.id === currentUser?.id;
    const isSuperAdmin = admin.admin.is_super_admin;
    return !isCurrentUser && !isSuperAdmin;
  };

  const getDemoteTooltip = (admin: AdminUser): string | undefined => {
    if (admin.id === currentUser?.id) return 'You cannot demote your own account';
    if (admin.admin.is_super_admin) return 'Cannot demote a Super Admin. Change their role to Platform Admin first.';
    return undefined;
  };

  const stats = [
    {
      label: 'Total Admins',
      value: statistics?.total?.toLocaleString() || '0',
      subtext: 'All administrators',
      icon: ShieldCheck,
      color: 'blue',
    },
    {
      label: 'Super Admins',
      value: statistics?.super_admins?.toLocaleString() || '0',
      subtext: 'Full platform access',
      icon: Shield,
      color: 'purple',
    },
    {
      label: 'Active',
      value: statistics?.active?.toLocaleString() || '0',
      subtext: statistics?.total
        ? `${((statistics.active / statistics.total) * 100).toFixed(0)}% of total`
        : '0% of total',
      icon: UserCheck,
      color: 'green',
    },
    {
      label: 'Suspended',
      value: statistics?.suspended?.toLocaleString() || '0',
      subtext: 'Access revoked',
      icon: UserX,
      color: 'red',
    },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_ADMINS}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600 mt-1">
              Manage platform administrators and their access levels
            </p>
          </div>
          <Can permission={PERMISSIONS.ADMIN_MANAGE_ADMINS}>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Administrator
            </Button>
          </Can>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <IconBadge icon={stat.icon} color={stat.color} />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Name or email..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                aria-label="Filter by admin status"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {ADMIN_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                aria-label="Filter by admin role"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value as AdminRole)}
              >
                {ROLE_FILTER_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Admin List */}
        {isError ? (
          <Card className="p-12 text-center">
            <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
            <h2 className="text-2xl font-semibold mb-2 text-red-600">
              Error Loading Administrators
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Failed to load administrators.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </Card>
        ) : isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : !data?.data || data.data.length === 0 ? (
          <Card className="p-12 text-center">
            <IconBadge icon={ShieldCheck} variant="empty-state" color="blue" />
            <h2 className="text-2xl font-semibold mb-2">No Administrators Found</h2>
            <p className="text-gray-600">
              {filters.search || filters.status || filters.role
                ? 'Try adjusting your filters'
                : 'Get started by adding a new administrator'}
            </p>
          </Card>
        ) : (
          <>
            {/* Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Administrator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        2FA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {admin.first_name[0]}{admin.last_name[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {admin.full_name}
                                {admin.id === currentUser?.id && (
                                  <span className="ml-2 text-xs text-gray-400">(You)</span>
                                )}
                              </div>
                              {admin.phone && (
                                <div className="text-xs text-gray-500">{admin.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{admin.email}</div>
                          {admin.email_verified_at ? (
                            <div className="text-xs text-green-600">Verified</div>
                          ) : (
                            <div className="text-xs text-gray-500">Not verified</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              admin.admin.is_super_admin
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {getAdminRoleLabel(admin)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={STATUS_COLORS[admin.status]}>
                            {admin.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {admin.two_factor_enabled ? (
                            <span className="text-green-600 font-medium">Enabled</span>
                          ) : (
                            <span className="text-gray-400">Disabled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.last_login_at ? formatDate(admin.last_login_at) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(admin.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={ADMIN_ROUTES.ADMIN_MANAGEMENT_DETAILS(admin.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Can permission={PERMISSIONS.ADMIN_MANAGE_ADMINS}>
                              {admin.status === 'active' && (
                                <button
                                  type="button"
                                  onClick={() => setSuspendTarget(admin)}
                                  disabled={!canSuspend(admin)}
                                  title={getSuspendTooltip(admin)}
                                  className={
                                    canSuspend(admin)
                                      ? 'text-red-600 hover:text-red-900'
                                      : 'text-gray-300 cursor-not-allowed'
                                  }
                                >
                                  Suspend
                                </button>
                              )}
                              {admin.status === 'suspended' && (
                                <button
                                  type="button"
                                  onClick={() => activateAdmin(admin.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setDemoteTarget(admin)}
                                disabled={!canDemote(admin)}
                                title={getDemoteTooltip(admin)}
                                className={
                                  canDemote(admin)
                                    ? 'text-orange-600 hover:text-orange-900'
                                    : 'text-gray-300 cursor-not-allowed'
                                }
                              >
                                Demote
                              </button>
                            </Can>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {data.meta && data.meta.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {data.meta.from} to {data.meta.to} of {data.meta.total} administrators
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(data.meta.current_page - 1)}
                    disabled={data.meta.current_page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {data.meta.current_page} of {data.meta.last_page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(data.meta.current_page + 1)}
                    disabled={data.meta.current_page === data.meta.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Dialogs */}
        <CreateAdminDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {suspendTarget && (
          <SuspendAdminDialog
            open={!!suspendTarget}
            onOpenChange={(open) => { if (!open) setSuspendTarget(null); }}
            admin={suspendTarget}
          />
        )}

        {demoteTarget && (
          <DemoteAdminDialog
            open={!!demoteTarget}
            onOpenChange={(open) => { if (!open) setDemoteTarget(null); }}
            admin={demoteTarget}
          />
        )}
      </div>
    </PermissionGuard>
  );
}

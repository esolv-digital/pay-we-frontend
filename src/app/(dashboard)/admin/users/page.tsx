/**
 * Admin User Management Page
 *
 * Comprehensive user management with:
 * - User listing with advanced filters
 * - Create, edit, delete user operations
 * - Role assignment
 * - User status management (suspend, activate)
 * - Real-time statistics
 */

'use client';

import { useState } from 'react';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import {
  useAdminUsersList,
  useAdminUserStatistics,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
  useResetUserPassword,
} from '@/lib/hooks/use-admin-users';
import type { UserFilters as ApiUserFilters, UserStatus } from '@/lib/api/admin-users';

// User status colors
const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const USER_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending', value: 'pending' },
];

export default function AdminUsersPage() {
  const [filters, setFilters] = useState<ApiUserFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch users list
  const { data, isLoading, isError, error } = useAdminUsersList(filters);

  // Fetch statistics
  const { data: statsData } = useAdminUserStatistics();

  // Mutations
  const { mutate: suspendUser } = useSuspendUser();
  const { mutate: activateUser } = useActivateUser();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: resetPassword } = useResetUserPassword();

  const handleFilterChange = (key: keyof ApiUserFilters, value: any) => {
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
    setFilters({
      page: 1,
      per_page: 20,
      sort_by: 'created_at',
      sort_direction: 'desc',
    });
    setShowAdvancedFilters(false);
  };

  const handleSuspendUser = (userId: string) => {
    const reason = prompt('Reason for suspension:');
    if (reason) {
      suspendUser({ id: userId, reason });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  };

  // Calculate stats
  const stats = [
    {
      label: 'Total Users',
      value: statsData?.data.total_users?.toLocaleString() || '0',
      subtext: 'All platform users',
      icon: '👥',
      color: 'bg-blue-50'
    },
    {
      label: 'Active Users',
      value: statsData?.data.active_users?.toLocaleString() || '0',
      subtext: statsData?.data.total_users
        ? `${((statsData.data.active_users / statsData.data.total_users) * 100).toFixed(1)}% of total`
        : '0% of total',
      icon: '✓',
      color: 'bg-green-50'
    },
    {
      label: 'Suspended',
      value: statsData?.data.suspended_users?.toLocaleString() || '0',
      subtext: 'Requires attention',
      icon: '⚠️',
      color: 'bg-red-50'
    },
    {
      label: 'Pending',
      value: statsData?.data.pending_users?.toLocaleString() || '0',
      subtext: 'Awaiting verification',
      icon: '⏳',
      color: 'bg-yellow-50'
    },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.MANAGE_MEMBERS}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all platform users, roles, and permissions
            </p>
          </div>
          <div className="flex gap-3">
            <Can permission={PERMISSIONS.MANAGE_MEMBERS}>
              <Link href="/admin/users/create">
                <Button>
                  <span className="mr-2">+</span>
                  Create User
                </Button>
              </Link>
            </Can>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className={`p-6 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  aria-label="Filter by user status"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value as UserStatus)}
                >
                  {USER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Input
                  type="text"
                  placeholder="Filter by role..."
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex-1"
                  >
                    {showAdvancedFilters ? 'Hide' : 'Advanced'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Filter by organization..."
                      value={filters.organization_id || ''}
                      onChange={(e) => handleFilterChange('organization_id', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Verified
                    </label>
                    <select
                      aria-label="Filter by email verification status"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={filters.email_verified === undefined ? '' : filters.email_verified.toString()}
                      onChange={(e) => handleFilterChange('email_verified', e.target.value === '' ? undefined : e.target.value === 'true')}
                    >
                      <option value="">All</option>
                      <option value="true">Verified</option>
                      <option value="false">Unverified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      aria-label="Sort users by field"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={filters.sort_by || 'created_at'}
                      onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    >
                      <option value="created_at">Date Created</option>
                      <option value="last_login_at">Last Login</option>
                      <option value="email">Email</option>
                      <option value="first_name">First Name</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Users List */}
        {isError ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-semibold mb-2 text-red-600">
              Error Loading Users
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Failed to load users. Please try again.'}
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
            <span className="text-6xl mb-4 block">👥</span>
            <h2 className="text-2xl font-semibold mb-2">No Users Found</h2>
            <p className="text-gray-600">
              {Object.keys(filters).length > 4
                ? 'Try adjusting your filters'
                : 'No users have been registered yet'}
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
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {user.first_name[0]}{user.last_name[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              {user.organization_name && (
                                <div className="text-xs text-gray-500">
                                  {user.organization_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          {user.email_verified_at ? (
                            <div className="text-xs text-green-600">✓ Verified</div>
                          ) : (
                            <div className="text-xs text-gray-500">Not verified</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role: string) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">No roles</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={STATUS_COLORS[user.status]}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Can permission={PERMISSIONS.MANAGE_MEMBERS}>
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleSuspendUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Suspend
                                </button>
                              )}
                              {user.status === 'suspended' && (
                                <button
                                  onClick={() => activateUser(user.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => resetPassword(user.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Reset PW
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
                  Showing {data.meta.from} to {data.meta.to} of {data.meta.total} users
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
      </div>
    </PermissionGuard>
  );
}

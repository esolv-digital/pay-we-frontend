'use client';

/**
 * Admin Organization Management Page
 *
 * Provides interface for managing platform organizations.
 * Features: list, view, suspend/activate, search, filter
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useAdminOrganizationsList,
  useAdminOrganizationStatistics,
  useSuspendOrganization,
  useActivateOrganization,
} from '@/lib/hooks/use-admin-organizations';
import type { OrganizationFilters as ApiOrganizationFilters } from '@/lib/api/admin-organizations';
import { Building2, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminOrganizationsPage() {
  const router = useRouter();

  // Filters state
  const [filters, setFilters] = useState<ApiOrganizationFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Data fetching
  const { data, isLoading, isError, error } =
    useAdminOrganizationsList(filters);
  const { data: statsData } = useAdminOrganizationStatistics();

  // Mutations
  const { mutate: suspendOrganization, isPending: isSuspending } =
    useSuspendOrganization();
  const { mutate: activateOrganization, isPending: isActivating } =
    useActivateOrganization();

  // Statistics
  const stats = [
    {
      label: 'Total Organizations',
      value:
        statsData?.total_organizations?.toLocaleString() ||
        data?.meta?.total?.toLocaleString() ||
        '0',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Organizations',
      value:
        statsData?.active_organizations?.toLocaleString() || '0',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Suspended',
      value:
        statsData?.suspended_organizations?.toLocaleString() || '0',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Total Volume',
      value: statsData?.total_transaction_volume
        ? `$${(statsData.total_transaction_volume / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1, // Reset to first page when filters change
    }));
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

  // Pagination
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actions
  const handleSuspend = (id: string, name: string) => {
    const reason = prompt(
      `Enter reason for suspending "${name}":`
    );
    if (reason) {
      suspendOrganization({ id, reason });
    }
  };

  const handleActivate = (id: string) => {
    if (
      confirm(
        'Are you sure you want to activate this organization?'
      )
    ) {
      activateOrganization(id);
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/admin/organizations/${id}`);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_ORGANIZATIONS}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Organizations
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage platform organizations and their settings
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.search || ''}
                  onChange={(e) =>
                    handleFilterChange('search', e.target.value)
                  }
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  aria-label="Filter by organization status"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.status || ''}
                  onChange={(e) =>
                    handleFilterChange('status', e.target.value)
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  aria-label="Filter by country"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.country || ''}
                  onChange={(e) =>
                    handleFilterChange('country', e.target.value)
                  }
                >
                  <option value="">All Countries</option>
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="KE">Kenya</option>
                  <option value="ZA">South Africa</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setShowAdvancedFilters(!showAdvancedFilters)
                }
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                Filters
              </button>
              {(filters.search ||
                filters.status ||
                filters.country ||
                filters.business_type ||
                filters.verified !== undefined) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <select
                    aria-label="Filter by business type"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.business_type || ''}
                    onChange={(e) =>
                      handleFilterChange('business_type', e.target.value)
                    }
                  >
                    <option value="">All Types</option>
                    <option value="vendor">Vendor</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Verified */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Status
                  </label>
                  <select
                    aria-label="Filter by verification status"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={
                      filters.verified === undefined
                        ? ''
                        : filters.verified.toString()
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        'verified',
                        e.target.value === ''
                          ? ''
                          : e.target.value === 'true'
                            ? 'true'
                            : 'false'
                      )
                    }
                  >
                    <option value="">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sort By
                  </label>
                  <select
                    aria-label="Sort organizations"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.sort_by || 'created_at'}
                    onChange={(e) =>
                      handleFilterChange('sort_by', e.target.value)
                    }
                  >
                    <option value="created_at">Date Created</option>
                    <option value="name">Name</option>
                    <option value="transaction_count">
                      Transaction Count
                    </option>
                    <option value="total_volume">Total Volume</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Organizations Table */}
        <Card className="overflow-hidden">
          {/* Error State */}
          {isError && (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Failed to load organizations
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                {error?.message || 'An error occurred'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Success State */}
          {!isLoading && !isError && data && (
            <>
              {/* Empty State */}
              {data.data.length === 0 && (
                <div className="p-4 sm:p-6 lg:p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No organizations found
                  </h3>
                  <p className="text-sm text-gray-600">
                    {filters.search || filters.status
                      ? 'Try adjusting your filters'
                      : 'No organizations registered yet'}
                  </p>
                </div>
              )}

              {/* Table */}
              {data.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Organization
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Volume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.data.map((org) => (
                        <tr
                          key={org.id}
                          className="hover:bg-gray-50"
                        >
                          {/* Organization */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                {org.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {org.name}
                                </div>
                                {org.business_name && (
                                  <div className="text-sm text-gray-500">
                                    {org.business_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {org.email}
                            </div>
                            {org.phone && (
                              <div className="text-sm text-gray-500">
                                {org.phone}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(org.status)}`}
                            >
                              {org.status}
                            </span>
                            {org.verified_at && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="h-3 w-3" /> Verified
                              </div>
                            )}
                          </td>

                          {/* Users */}
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {org.user_count?.toLocaleString() || '0'}
                          </td>

                          {/* Volume */}
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {org.total_volume
                              ? `$${(org.total_volume / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                              : '$0.00'}
                          </td>

                          {/* Created */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              org.created_at
                            ).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <Can permission={PERMISSIONS.ADMIN_VIEW_ORGANIZATIONS}>
                                <Button
                                  onClick={() =>
                                    handleViewDetails(org.id)
                                  }
                                  variant="outline"
                                  size="sm"
                                >
                                  View
                                </Button>
                              </Can>
                              {org.status === 'active' && (
                                <Can permission={PERMISSIONS.ADMIN_MANAGE_ORGANIZATIONS}>
                                  <Button
                                    onClick={() =>
                                      handleSuspend(org.id, org.name)
                                    }
                                    variant="outline"
                                    size="sm"
                                    disabled={isSuspending}
                                  >
                                    Suspend
                                  </Button>
                                </Can>
                              )}
                              {org.status === 'suspended' && (
                                <Can permission={PERMISSIONS.ADMIN_MANAGE_ORGANIZATIONS}>
                                  <Button
                                    onClick={() =>
                                      handleActivate(org.id)
                                    }
                                    variant="outline"
                                    size="sm"
                                    disabled={isActivating}
                                  >
                                    Activate
                                  </Button>
                                </Can>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {data.meta && data.meta.total > 0 && (
                <div className="border-t bg-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {data.meta.from || 0}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {data.meta.to || 0}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">
                        {data.meta.total}
                      </span>{' '}
                      organizations
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handlePageChange(data.meta.current_page - 1)
                        }
                        disabled={data.meta.current_page === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4 text-sm text-gray-700">
                        Page {data.meta.current_page} of{' '}
                        {data.meta.last_page}
                      </span>
                      <Button
                        onClick={() =>
                          handlePageChange(data.meta.current_page + 1)
                        }
                        disabled={
                          data.meta.current_page === data.meta.last_page
                        }
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </PermissionGuard>
  );
}

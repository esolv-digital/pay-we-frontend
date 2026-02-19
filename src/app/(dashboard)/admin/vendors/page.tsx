/**
 * Admin Vendor Management Page
 *
 * Manage all platform vendors with:
 * - Vendor listing with advanced filters
 * - Suspend/activate vendor operations
 * - Revenue & transaction statistics
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
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import {
  useAdminVendorsList,
  useAdminVendorStatistics,
  useSuspendVendor,
  useActivateVendor,
} from '@/lib/hooks/use-admin-vendors';
import type { AdminVendorFilters, AdminVendorStatus } from '@/lib/api/admin-vendors';
import { Store, CheckCircle, DollarSign, Landmark, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

const STATUS_COLORS: Record<AdminVendorStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

const VENDOR_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
];

export default function AdminVendorsPage() {
  const [filters, setFilters] = useState<AdminVendorFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const { data, isLoading, isError, error } = useAdminVendorsList(filters);
  const { data: statsData } = useAdminVendorStatistics();
  const { mutate: suspendVendor } = useSuspendVendor();
  const { mutate: activateVendor } = useActivateVendor();

  const handleFilterChange = (key: keyof AdminVendorFilters, value: any) => {
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
    setFilters({ page: 1, per_page: 20, sort_by: 'created_at', sort_direction: 'desc' });
  };

  const handleSuspend = (id: string) => {
    const reason = prompt('Reason for suspension:');
    if (reason) suspendVendor({ id, reason });
  };

  const statistics = statsData;
  const stats = [
    { label: 'Total Vendors', value: statistics?.total ?? 0, subtext: 'All vendors', icon: Store, color: 'blue' },
    { label: 'Active', value: statistics?.active ?? 0, subtext: 'Currently active', icon: CheckCircle, color: 'green' },
    { label: 'Total Revenue', value: statistics?.total_revenue ? formatCurrency(statistics.total_revenue) : '$0', subtext: 'All time', icon: DollarSign, color: 'purple' },
    { label: 'Total Balance', value: statistics?.total_balance ? formatCurrency(statistics.total_balance) : '$0', subtext: 'Pending payouts', icon: Landmark, color: 'indigo' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_VENDORS}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all platform vendors</p>
          </div>
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
                placeholder="Business name, email..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                aria-label="Filter by status"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value as AdminVendorStatus)}
              >
                {VENDOR_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <Input
                type="text"
                placeholder="Currency code..."
                value={filters.currency_code || ''}
                onChange={(e) => handleFilterChange('currency_code', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">Clear Filters</Button>
            </div>
          </div>
        </Card>

        {/* Vendors List */}
        {isError ? (
          <Card className="p-12 text-center">
            <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading Vendors</h2>
            <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Failed to load vendors.'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </Card>
        ) : isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          </Card>
        ) : !data?.data || data.data.length === 0 ? (
          <Card className="p-12 text-center">
            <IconBadge icon={Store} variant="empty-state" color="blue" />
            <h2 className="text-2xl font-semibold mb-2">No Vendors Found</h2>
            <p className="text-gray-600">{Object.keys(filters).length > 4 ? 'Try adjusting your filters' : 'No vendors registered yet'}</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vendor.business_name}</div>
                          <div className="text-xs text-gray-500">{vendor.business_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.organization.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(vendor.total_revenue, vendor.currency_code)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(vendor.balance, vendor.currency_code)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={STATUS_COLORS[vendor.status]}>{vendor.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(vendor.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link href={ADMIN_ROUTES.VENDOR_DETAILS(vendor.id)} className="text-blue-600 hover:text-blue-900">View</Link>
                            <Can permission={PERMISSIONS.ADMIN_MANAGE_VENDORS}>
                              {vendor.status === 'active' && (
                                <button onClick={() => handleSuspend(vendor.id)} className="text-red-600 hover:text-red-900">Suspend</button>
                              )}
                              {vendor.status === 'suspended' && (
                                <button onClick={() => activateVendor(vendor.id)} className="text-green-600 hover:text-green-900">Activate</button>
                              )}
                            </Can>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {data.meta && data.meta.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">Showing {data.meta.from} to {data.meta.to} of {data.meta.total} vendors</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handlePageChange(data.meta.current_page - 1)} disabled={data.meta.current_page === 1}>Previous</Button>
                  <span className="px-4 py-2 text-sm text-gray-700">Page {data.meta.current_page} of {data.meta.last_page}</span>
                  <Button variant="outline" onClick={() => handlePageChange(data.meta.current_page + 1)} disabled={data.meta.current_page === data.meta.last_page}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}

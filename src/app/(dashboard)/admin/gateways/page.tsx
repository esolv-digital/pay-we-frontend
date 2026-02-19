/**
 * Admin Payment Gateways Management Page
 *
 * Aligned with backend Postman B2 contract.
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
import { ADMIN_ROUTES } from '@/lib/config/routes';
import {
  useAdminGatewaysList,
  useAdminGatewayStatistics,
  useToggleGateway,
} from '@/lib/hooks/use-admin-gateways';
import type { GatewayFilters } from '@/lib/api/admin-gateways';
import { Plug, CheckCircle, Pause, CreditCard, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

const PROVIDERS: { label: string; value: string }[] = [
  { label: 'All Providers', value: '' },
  { label: 'Paystack', value: 'paystack' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'Flutterwave', value: 'flutterwave' },
  { label: 'WiPay', value: 'wipay' },
];

export default function AdminGatewaysPage() {
  const [filters, setFilters] = useState<GatewayFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const { data, isLoading, isError, error } = useAdminGatewaysList(filters);
  const { data: statsData } = useAdminGatewayStatistics();
  const { mutate: toggleGateway } = useToggleGateway();

  const handleFilterChange = (key: keyof GatewayFilters, value: unknown) => {
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

  const statistics = statsData;
  const stats = [
    { label: 'Total Gateways', value: statistics?.total ?? 0, subtext: 'Configured', icon: Plug, color: 'blue' },
    { label: 'Active', value: statistics?.active ?? 0, subtext: 'Currently enabled', icon: CheckCircle, color: 'green' },
    { label: 'Inactive', value: statistics?.inactive ?? 0, subtext: 'Disabled', icon: Pause, color: 'gray' },
    { label: 'Total Processed', value: statistics?.total_processed?.toLocaleString() ?? '0', subtext: 'All time', icon: CreditCard, color: 'indigo' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_GATEWAYS}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Gateways</h1>
            <p className="text-gray-600 mt-1">Manage payment gateway integrations and configurations</p>
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
                placeholder="Gateway name..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select
                aria-label="Filter by provider"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.provider || ''}
                onChange={(e) => handleFilterChange('provider', e.target.value)}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                aria-label="Filter by status"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.is_active === undefined ? '' : String(filters.is_active)}
                onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">Clear Filters</Button>
            </div>
          </div>
        </Card>

        {/* Gateways List */}
        {isError ? (
          <Card className="p-12 text-center">
            <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading Gateways</h2>
            <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Failed to load gateways.'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </Card>
        ) : isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded bg-gray-200 h-10 w-10" />
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
            <IconBadge icon={Plug} variant="empty-state" color="blue" />
            <h2 className="text-2xl font-semibold mb-2">No Gateways Found</h2>
            <p className="text-gray-600">
              {Object.keys(filters).length > 4 ? 'Try adjusting your filters' : 'No gateways configured yet'}
            </p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currencies</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Methods</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((gw) => (
                      <tr key={gw.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">{gw.gateway}</div>
                          <div className="text-xs text-gray-500">{gw.vendor_id ? `Vendor: ${gw.vendor_id}` : 'Platform'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{gw.region.replace('_', ' ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={gw.is_test_mode ? 'outline' : 'default'} className="text-xs">{gw.is_test_mode ? 'Test' : 'Live'}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gw.supported_currencies.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gw.supported_payment_methods.length} methods</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={gw.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {gw.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link href={ADMIN_ROUTES.GATEWAY_DETAILS(gw.id)} className="text-blue-600 hover:text-blue-900">View</Link>
                            <Can permission={PERMISSIONS.ADMIN_MANAGE_GATEWAYS}>
                              <button
                                onClick={() => toggleGateway(gw.id)}
                                className={gw.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                              >
                                {gw.is_active ? 'Disable' : 'Enable'}
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

            {data.meta && data.meta.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {data.meta.from} to {data.meta.to} of {data.meta.total} gateways
                </div>
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

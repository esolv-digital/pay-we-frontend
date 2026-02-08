/**
 * Admin Payment Pages Management
 *
 * Monitor all vendor payment pages with:
 * - Listing with filters (status, vendor, amount type)
 * - Suspend/activate operations
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
import { formatCurrency } from '@/lib/utils/format';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import {
  useAdminPaymentPagesList,
  useAdminPaymentPageStatistics,
  useSuspendPaymentPage,
  useActivatePaymentPage,
} from '@/lib/hooks/use-admin-payment-pages';
import type { AdminPaymentPageFilters, AdminPaymentPageStatus } from '@/lib/api/admin-payment-pages';

const STATUS_COLORS: Record<AdminPaymentPageStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

export default function AdminPaymentPagesPage() {
  const [filters, setFilters] = useState<AdminPaymentPageFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const { data, isLoading, isError, error } = useAdminPaymentPagesList(filters);
  const { data: statsData } = useAdminPaymentPageStatistics();
  const { mutate: suspendPage } = useSuspendPaymentPage();
  const { mutate: activatePage } = useActivatePaymentPage();

  const handleFilterChange = (key: keyof AdminPaymentPageFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: key !== 'page' ? 1 : prev.page }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, per_page: 20, sort_by: 'created_at', sort_direction: 'desc' });
  };

  const handleSuspend = (id: string) => {
    const reason = prompt('Reason for suspension:');
    if (reason) suspendPage({ id, reason });
  };

  const statistics = statsData?.data;
  const stats = [
    { label: 'Total Pages', value: statistics?.total ?? 0, subtext: 'All payment pages', icon: '📄', color: 'bg-blue-50' },
    { label: 'Active', value: statistics?.active ?? 0, subtext: 'Currently live', icon: '✓', color: 'bg-green-50' },
    { label: 'Total Revenue', value: statistics?.total_revenue ? formatCurrency(statistics.total_revenue) : '$0', subtext: 'All time', icon: '💰', color: 'bg-purple-50' },
    { label: 'Suspended', value: statistics?.suspended ?? 0, subtext: 'Requires review', icon: '⚠️', color: 'bg-red-50' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_PAYMENT_PAGES}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Pages</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all vendor payment pages</p>
          </div>
        </div>

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

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input type="text" placeholder="Title, slug..." value={filters.search || ''} onChange={(e) => handleFilterChange('search', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select aria-label="Filter by status" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.status || ''} onChange={(e) => handleFilterChange('status', e.target.value as AdminPaymentPageStatus)}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Type</label>
              <select aria-label="Filter by amount type" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.amount_type || ''} onChange={(e) => handleFilterChange('amount_type', e.target.value)}>
                <option value="">All</option>
                <option value="fixed">Fixed</option>
                <option value="flexible">Flexible</option>
                <option value="donation">Donation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">Clear Filters</Button>
            </div>
          </div>
        </Card>

        {isError ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading Payment Pages</h2>
            <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Failed to load payment pages.'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </Card>
        ) : isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="animate-pulse flex space-x-4"><div className="rounded bg-gray-200 h-10 w-10" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>))}</div>
          </Card>
        ) : !data?.data || data.data.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">📄</span>
            <h2 className="text-2xl font-semibold mb-2">No Payment Pages Found</h2>
            <p className="text-gray-600">{Object.keys(filters).length > 4 ? 'Try adjusting your filters' : 'No payment pages created yet'}</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{page.title}</div>
                          <div className="text-xs text-gray-500">{page.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.vendor.business_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {page.amount_type === 'fixed' && page.amount
                            ? formatCurrency(page.amount, page.currency_code)
                            : <Badge variant="outline" className="text-xs capitalize">{page.amount_type}</Badge>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(page.total_revenue, page.currency_code)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{page.total_transactions.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><Badge className={STATUS_COLORS[page.status]}>{page.status}</Badge></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link href={ADMIN_ROUTES.PAYMENT_PAGE_DETAILS(page.id)} className="text-blue-600 hover:text-blue-900">View</Link>
                            <Can permission={PERMISSIONS.ADMIN_MANAGE_PAYMENT_PAGES}>
                              {page.status === 'active' && <button onClick={() => handleSuspend(page.id)} className="text-red-600 hover:text-red-900">Suspend</button>}
                              {page.status === 'suspended' && <button onClick={() => activatePage(page.id)} className="text-green-600 hover:text-green-900">Activate</button>}
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
                <div className="text-sm text-gray-700">Showing {data.meta.from} to {data.meta.to} of {data.meta.total} pages</div>
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

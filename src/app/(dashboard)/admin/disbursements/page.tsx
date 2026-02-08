/**
 * Admin Disbursements Management Page
 *
 * Monitor all vendor disbursements with:
 * - Listing with advanced filters (status, date range, amount)
 * - Approve/reject pending disbursements
 * - Export functionality
 * - Statistics overview
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
  useAdminDisbursementsList,
  useAdminDisbursementStatistics,
  useApproveDisbursement,
  useRejectDisbursement,
} from '@/lib/hooks/use-admin-disbursements';
import type { AdminDisbursementFilters, AdminDisbursementStatus } from '@/lib/api/admin-disbursements';

const STATUS_COLORS: Record<AdminDisbursementStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

export default function AdminDisbursementsPage() {
  const [filters, setFilters] = useState<AdminDisbursementFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data, isLoading, isError, error } = useAdminDisbursementsList(filters);
  const { data: statsData } = useAdminDisbursementStatistics();
  const { mutate: approveDisbursement } = useApproveDisbursement();
  const { mutate: rejectDisbursement } = useRejectDisbursement();

  const handleFilterChange = (key: keyof AdminDisbursementFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: key !== 'page' ? 1 : prev.page }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, per_page: 20, sort_by: 'created_at', sort_direction: 'desc' });
    setShowAdvancedFilters(false);
  };

  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason) rejectDisbursement({ id, reason });
  };

  const statistics = statsData?.data;
  const stats = [
    { label: 'Total Disbursed', value: statistics?.total_disbursed ? formatCurrency(statistics.total_disbursed) : '$0', subtext: 'All time', icon: '💸', color: 'bg-green-50' },
    { label: 'Pending', value: statistics?.pending_count ?? 0, subtext: statistics?.pending_amount ? formatCurrency(statistics.pending_amount) : '$0', icon: '⏳', color: 'bg-yellow-50' },
    { label: 'Completed', value: statistics?.completed_count ?? 0, subtext: statistics?.completed_amount ? formatCurrency(statistics.completed_amount) : '$0', icon: '✓', color: 'bg-blue-50' },
    { label: 'Failed', value: statistics?.failed_count ?? 0, subtext: statistics?.failed_amount ? formatCurrency(statistics.failed_amount) : '$0', icon: '✗', color: 'bg-red-50' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_DISBURSEMENTS}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disbursements</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all vendor payouts and disbursements</p>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input type="text" placeholder="Batch reference..." value={filters.search || ''} onChange={(e) => handleFilterChange('search', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select aria-label="Filter by status" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={(filters.status as string) || ''} onChange={(e) => handleFilterChange('status', e.target.value as AdminDisbursementStatus)}>
                  {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <Input type="date" value={filters.date_from || ''} onChange={(e) => handleFilterChange('date_from', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="flex-1">
                    {showAdvancedFilters ? 'Hide' : 'Advanced'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>Clear</Button>
                </div>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <Input type="date" value={filters.date_to || ''} onChange={(e) => handleFilterChange('date_to', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <Input type="text" placeholder="e.g. GHS" value={filters.currency_code || ''} onChange={(e) => handleFilterChange('currency_code', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
                    <select aria-label="Filter by payout method" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.payout_method || ''} onChange={(e) => handleFilterChange('payout_method', e.target.value)}>
                      <option value="">All Methods</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {isError ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading Disbursements</h2>
            <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Failed to load disbursements.'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </Card>
        ) : isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="animate-pulse flex space-x-4"><div className="rounded bg-gray-200 h-10 w-10" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>))}</div>
          </Card>
        ) : !data?.data || data.data.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">💸</span>
            <h2 className="text-2xl font-semibold mb-2">No Disbursements Found</h2>
            <p className="text-gray-600">{Object.keys(filters).length > 4 ? 'Try adjusting your filters' : 'No disbursements processed yet'}</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{d.batch_reference}</div>
                          <div className="text-xs text-gray-500">{d.transaction_count} txns</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.vendor.business_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(d.gross_amount, d.currency_code)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-{formatCurrency(d.fees, d.currency_code)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(d.net_amount, d.currency_code)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><Badge className={STATUS_COLORS[d.status]}>{d.status}</Badge></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(d.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link href={ADMIN_ROUTES.DISBURSEMENT_DETAILS(d.id)} className="text-blue-600 hover:text-blue-900">View</Link>
                            <Can permission={PERMISSIONS.ADMIN_MANAGE_DISBURSEMENTS}>
                              {d.status === 'pending' && (
                                <>
                                  <button onClick={() => approveDisbursement(d.id)} className="text-green-600 hover:text-green-900">Approve</button>
                                  <button onClick={() => handleReject(d.id)} className="text-red-600 hover:text-red-900">Reject</button>
                                </>
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
                <div className="text-sm text-gray-700">Showing {data.meta.from} to {data.meta.to} of {data.meta.total} disbursements</div>
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

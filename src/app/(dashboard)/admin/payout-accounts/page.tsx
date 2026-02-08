/**
 * Admin Payout Accounts Management Page
 *
 * Monitor all vendor payout accounts with:
 * - Listing with filters (type, verification, flagged)
 * - Verify/flag account operations
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
import { formatDate } from '@/lib/utils/format';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import {
  useAdminPayoutAccountsList,
  useAdminPayoutAccountStatistics,
  useVerifyPayoutAccount,
  useFlagPayoutAccount,
} from '@/lib/hooks/use-admin-payout-accounts';
import type { AdminPayoutAccountFilters, PayoutAccountType, PayoutAccountStatus } from '@/lib/api/admin-payout-accounts';

const STATUS_COLORS: Record<PayoutAccountStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending_verification: 'bg-yellow-100 text-yellow-800',
};

export default function AdminPayoutAccountsPage() {
  const [filters, setFilters] = useState<AdminPayoutAccountFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const { data, isLoading, isError, error } = useAdminPayoutAccountsList(filters);
  const { data: statsData } = useAdminPayoutAccountStatistics();
  const { mutate: verifyAccount } = useVerifyPayoutAccount();
  const { mutate: flagAccount } = useFlagPayoutAccount();

  const handleFilterChange = (key: keyof AdminPayoutAccountFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: key !== 'page' ? 1 : prev.page }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, per_page: 20, sort_by: 'created_at', sort_direction: 'desc' });
  };

  const handleFlag = (id: string) => {
    const reason = prompt('Reason for flagging:');
    if (reason) flagAccount({ id, reason });
  };

  const statistics = statsData?.data;
  const stats = [
    { label: 'Total Accounts', value: statistics?.total ?? 0, subtext: 'All payout accounts', icon: '🏦', color: 'bg-blue-50' },
    { label: 'Verified', value: statistics?.verified ?? 0, subtext: 'Confirmed accounts', icon: '✓', color: 'bg-green-50' },
    { label: 'Unverified', value: statistics?.unverified ?? 0, subtext: 'Pending verification', icon: '⏳', color: 'bg-yellow-50' },
    { label: 'Flagged', value: statistics?.flagged ?? 0, subtext: 'Requires review', icon: '🚩', color: 'bg-red-50' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_PAYOUT_ACCOUNTS}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payout Accounts</h1>
            <p className="text-gray-600 mt-1">Monitor and verify all vendor payout accounts</p>
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
              <Input type="text" placeholder="Account name, number..." value={filters.search || ''} onChange={(e) => handleFilterChange('search', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select aria-label="Filter by type" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.account_type || ''} onChange={(e) => handleFilterChange('account_type', e.target.value as PayoutAccountType)}>
                <option value="">All Types</option>
                <option value="bank">Bank</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select aria-label="Filter by status" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.status || ''} onChange={(e) => handleFilterChange('status', e.target.value as PayoutAccountStatus)}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">Clear</Button>
            </div>
          </div>
        </Card>

        {isError ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading Payout Accounts</h2>
            <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Failed to load payout accounts.'}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </Card>
        ) : isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="animate-pulse flex space-x-4"><div className="rounded bg-gray-200 h-10 w-10" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>))}</div>
          </Card>
        ) : !data?.data || data.data.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">🏦</span>
            <h2 className="text-2xl font-semibold mb-2">No Payout Accounts Found</h2>
            <p className="text-gray-600">{Object.keys(filters).length > 4 ? 'Try adjusting your filters' : 'No payout accounts registered yet'}</p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{account.account_name}</div>
                          <div className="text-xs text-gray-500">
                            {account.account_type === 'bank'
                              ? `${account.bank_name || 'Bank'} - ${account.account_number}`
                              : `${account.mobile_money_network || 'Mobile'} - ${account.mobile_money_phone}`
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs capitalize">{account.account_type.replace('_', ' ')}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.vendor.business_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.country_code} ({account.currency_code})</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            <Badge className={STATUS_COLORS[account.status]}>
                              {account.status === 'active' ? 'Active' : account.status === 'pending_verification' ? 'Pending' : 'Inactive'}
                            </Badge>
                            {account.is_flagged && <Badge className="bg-red-100 text-red-800">Flagged</Badge>}
                            {account.is_primary && <Badge variant="outline">Primary</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(account.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link href={ADMIN_ROUTES.PAYOUT_ACCOUNT_DETAILS(account.id)} className="text-blue-600 hover:text-blue-900">View</Link>
                            <Can permission={PERMISSIONS.ADMIN_MANAGE_PAYOUT_ACCOUNTS}>
                              {account.status === 'pending_verification' && <button onClick={() => verifyAccount(account.id)} className="text-green-600 hover:text-green-900">Verify</button>}
                              {!account.is_flagged && <button onClick={() => handleFlag(account.id)} className="text-red-600 hover:text-red-900">Flag</button>}
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
                <div className="text-sm text-gray-700">Showing {data.meta.from} to {data.meta.to} of {data.meta.total} accounts</div>
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

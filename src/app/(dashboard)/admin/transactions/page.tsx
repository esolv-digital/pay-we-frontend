/**
 * Admin Transactions Management Page
 *
 * Comprehensive transaction management with:
 * - Advanced filtering (status, gateway, organization, vendor, date range, amount range)
 * - Real-time statistics
 * - Pagination
 * - Export functionality
 * - Permission-based access
 * - Defensive rendering
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
import { formatCurrency, formatDate } from '@/lib/utils/format';
import {
  useAdminTransactionsList,
  useAdminTransactionMetrics,
  useExportTransactions,
} from '@/lib/hooks/use-admin-transactions';
import type { TransactionFilters as ApiTransactionFilters } from '@/lib/api/admin-transactions';

// Transaction status colors
const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const TRANSACTION_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
];

const GATEWAYS = [
  { label: 'All Gateways', value: '' },
  { label: 'Paystack', value: 'paystack' },
  { label: 'Wipay', value: 'wipay' },
  { label: 'Flutterwave', value: 'flutterwave' },
  { label: 'Stripe', value: 'stripe' },
];

export default function AdminTransactionsPage() {
  const [filters, setFilters] = useState<ApiTransactionFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch transactions list
  const { data, isLoading, isError, error } = useAdminTransactionsList(filters);

  // Fetch metrics for statistics cards
  const { data: metricsData } = useAdminTransactionMetrics({
    status: filters.status,
    gateway: filters.gateway,
    from_date: filters.from_date,
    to_date: filters.to_date,
    organization_id: filters.organization_id,
    vendor_id: filters.vendor_id,
  });

  // Export mutation
  const { mutate: exportTransactions, isPending: isExporting } = useExportTransactions();

  const handleFilterChange = (key: keyof ApiTransactionFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: key !== 'page' ? 1 : prev.page, // Reset to page 1 when filters change
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

  // Calculate stats from metrics
  const metrics = metricsData;
  const stats = [
    {
      label: 'Total Transactions',
      value: metrics?.total_transactions?.toLocaleString() || '0',
      subtext: 'All time',
      icon: '💳',
      color: 'bg-blue-50'
    },
    {
      label: 'Total Volume',
      value: metrics?.total_amount
        ? `$${metrics.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      subtext: 'All time',
      icon: '💰',
      color: 'bg-green-50'
    },
    {
      label: 'Completed',
      value: metrics?.completed_transactions?.toLocaleString() || '0',
      subtext: metrics?.total_transactions
        ? `Success rate: ${((metrics.completed_transactions / metrics.total_transactions) * 100).toFixed(1)}%`
        : 'Success rate: 0%',
      icon: '✓',
      color: 'bg-emerald-50'
    },
    {
      label: 'Pending',
      value: metrics?.pending_transactions?.toLocaleString() || '0',
      subtext: 'Awaiting completion',
      icon: '⏳',
      color: 'bg-yellow-50'
    },
  ];

  const handleExport = (format: 'csv' | 'excel') => {
    exportTransactions({
      format,
      filters,
    });
  };

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_TRANSACTIONS}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all platform transactions
            </p>
          </div>
          <div className="flex gap-3">
            <Can permission={PERMISSIONS.EXPORT_TRANSACTIONS}>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Excel'}
              </Button>
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
                  placeholder="Reference, customer email..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  aria-label="Filter by transaction status"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {TRANSACTION_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateway
                </label>
                <select
                  aria-label="Filter by payment gateway"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.gateway || ''}
                  onChange={(e) => handleFilterChange('gateway', e.target.value)}
                >
                  {GATEWAYS.map((gateway) => (
                    <option key={gateway.value} value={gateway.value}>
                      {gateway.label}
                    </option>
                  ))}
                </select>
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
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={filters.from_date || ''}
                      onChange={(e) => handleFilterChange('from_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={filters.to_date || ''}
                      onChange={(e) => handleFilterChange('to_date', e.target.value)}
                    />
                  </div>

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
                      Vendor ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Filter by vendor..."
                      value={filters.vendor_id || ''}
                      onChange={(e) => handleFilterChange('vendor_id', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={filters.min_amount || ''}
                      onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={filters.max_amount || ''}
                      onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Transactions List */}
        {isError ? (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-semibold mb-2 text-red-600">
              Error Loading Transactions
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Failed to load transactions. Please try again.'}
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
            <span className="text-6xl mb-4 block">💳</span>
            <h2 className="text-2xl font-semibold mb-2">No Transactions Found</h2>
            <p className="text-gray-600">
              {Object.keys(filters).length > 4
                ? 'Try adjusting your filters'
                : 'No transactions have been recorded yet'}
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
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tx.reference}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {tx.customer_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">{tx.customer_email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {tx.vendor_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tx.organization_name || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(tx.amount, tx.currency)}
                          </div>
                          {tx.net_amount && (
                            <div className="text-xs text-gray-500">
                              Net: {formatCurrency(tx.net_amount, tx.currency)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {tx.gateway}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-800'}>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/transactions/${tx.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
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
                  Showing {data.meta.from} to {data.meta.to} of {data.meta.total} transactions
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

'use client';

import { useState, useEffect } from 'react';
import { useTransactions, useTransactionMetrics, useExportTransactions } from '@/lib/hooks/use-transactions';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { TRANSACTION_STATUS_COLORS, TRANSACTION_STATUS_LABELS } from '@/lib/config/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { TransactionFilters, TransactionStatus, DateRange, ExportFormat } from '@/types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function VendorTransactionsPage() {
  // Applied filters (used for API calls)
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({
    page: 1,
    per_page: 20,
  });

  // Local filter state (user's current selections, not yet applied)
  const [localFilters, setLocalFilters] = useState<TransactionFilters>({
    page: 1,
    per_page: 20,
  });

  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500); // 500ms debounce

  // Check if there are unapplied changes
  const hasUnappliedChanges = JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  // Apply debounced search automatically
  useEffect(() => {
    setAppliedFilters((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
      page: 1,
    }));
  }, [debouncedSearch]);

  // Fetch data with applied filters
  const { data, isLoading, isFetching } = useTransactions(appliedFilters);
  const { data: metricsData, isFetching: isMetricsFetching } = useTransactionMetrics(appliedFilters);
  const exportMutation = useExportTransactions();

  // Extract data
  const transactions = data?.transactions || [];
  const meta = data?.meta;
  const metrics = metricsData?.metrics;

  // Filter handlers
  const handleLocalFilterChange = (key: keyof TransactionFilters, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters({
      ...localFilters,
      page: 1, // Reset to page 1 when applying filters
    });
  };

  const handlePageChange = (page: number) => {
    setAppliedFilters((prev) => ({ ...prev, page }));
    setLocalFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = (format: ExportFormat) => {
    exportMutation.mutate({ filters: appliedFilters, format });
  };

  const clearFilters = () => {
    const defaultFilters = { page: 1, per_page: 20 };
    setLocalFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchInput('');
  };

  if (isLoading && !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exportMutation.isPending}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport('excel')}
            disabled={exportMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="relative">
          {isMetricsFetching && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Transactions"
              value={metrics.total_transactions.toLocaleString()}
              subtitle={formatCurrency(metrics.total_amount)}
              trend="neutral"
            />
            <MetricCard
              title="Successful"
              value={metrics.successful_transactions.toLocaleString()}
              subtitle={formatCurrency(metrics.successful_amount)}
              trend="positive"
            />
            <MetricCard
              title="Pending"
              value={metrics.pending_transactions.toLocaleString()}
              subtitle={formatCurrency(metrics.pending_amount)}
              trend="neutral"
            />
            <MetricCard
              title="Failed"
              value={metrics.failed_transactions.toLocaleString()}
              subtitle={formatCurrency(metrics.failed_amount)}
              trend="negative"
            />
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {hasUnappliedChanges && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                Unapplied changes
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="transaction-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search (auto-applies)
            </label>
            <div className="relative">
              <input
                id="transaction-search"
                type="text"
                placeholder="Reference, email, phone, customer name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={localFilters.status || ''}
              onChange={(e) => handleLocalFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="initiated">Initiated</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="chargeback">Disputed</option>
              <option value="on_hold">Under Review</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label htmlFor="date-range-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="date-range-filter"
              value={localFilters.date_range || ''}
              onChange={(e) => handleLocalFilterChange('date_range', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="last_week">Last Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range Fields */}
          {localFilters.date_range === 'custom' && (
            <>
              <div>
                <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  id="from-date"
                  type="date"
                  value={localFilters.from_date || ''}
                  onChange={(e) => handleLocalFilterChange('from_date', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  id="to-date"
                  type="date"
                  value={localFilters.to_date || ''}
                  onChange={(e) => handleLocalFilterChange('to_date', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Settled Filter */}
          <div>
            <label htmlFor="settlement-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Settlement
            </label>
            <select
              id="settlement-filter"
              value={localFilters.settled === undefined ? '' : localFilters.settled.toString()}
              onChange={(e) =>
                handleLocalFilterChange(
                  'settled',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="true">Settled</option>
              <option value="false">Unsettled</option>
            </select>
          </div>

          {/* Per Page */}
          <div>
            <label htmlFor="per-page-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              id="per-page-filter"
              value={localFilters.per_page || 20}
              onChange={(e) => handleLocalFilterChange('per_page', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={applyFilters}
            disabled={!hasUnappliedChanges}
            className={cn(
              'px-6 py-2 rounded-lg text-sm font-medium transition-colors',
              hasUnappliedChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {/* Loading Overlay - only show during refetch, not initial load */}
        {isFetching && data && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium text-gray-700">Updating transactions...</span>
            </div>
          </div>
        )}

        {/* Table Header Info */}
        {meta && (
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {meta.from} to {meta.to} of {meta.total} transactions
            </p>
          </div>
        )}

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
                  Amount
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
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tx.reference}</div>
                      {tx.external_reference && (
                        <div className="text-xs text-gray-500">{tx.external_reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tx.customer_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tx.customer_email || tx.customer_phone || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(tx.amount, tx.currency_code)}
                      </div>
                      {tx.net_amount && tx.net_amount !== tx.amount && (
                        <div className="text-xs text-gray-500">
                          Net: {formatCurrency(tx.net_amount, tx.currency_code)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          TRANSACTION_STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {TRANSACTION_STATUS_LABELS[tx.status] || tx.status}
                      </span>
                      {tx.settled && (
                        <div className="mt-1">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Settled
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/vendor/transactions/${tx.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm">No transactions found</p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your filters or search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend: 'positive' | 'negative' | 'neutral';
}) {
  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={cn('text-sm mt-1', trendColors[trend])}>{subtitle}</p>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="flex gap-2">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            type="button"
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...' || page === currentPage}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : page === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

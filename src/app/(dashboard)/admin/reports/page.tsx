'use client';

/**
 * Admin Revenue Reports Page
 *
 * Comprehensive revenue reporting and analytics with charts and export
 */

import { useState } from 'react';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useRevenueReport,
  useExportRevenueReport,
} from '@/lib/hooks/use-admin-reports';
import type { RevenueReportFilters, ReportPeriod } from '@/lib/api/admin-reports';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertCircle,
  FileDown,
  BarChart,
} from 'lucide-react';

export default function AdminReportsPage() {
  // Filters state
  const [filters, setFilters] = useState<RevenueReportFilters>({
    period: 'month',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Data fetching
  const { data, isLoading, isError, error, refetch } = useRevenueReport(filters);
  const { mutate: exportReport, isPending: isExporting } = useExportRevenueReport();

  // Statistics
  const report = data;
  const stats = [
    {
      label: 'Total Revenue',
      value: report?.total_revenue
        ? `${report.currency || '$'}${(report.total_revenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      change: report?.revenue_growth_percentage,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Transactions',
      value: report?.total_transactions?.toLocaleString() || '0',
      change: report?.transaction_growth_percentage,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Avg Transaction',
      value: report?.average_transaction_value
        ? `${report.currency || '$'}${(report.average_transaction_value / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      icon: BarChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Completed',
      value: report?.completed_revenue
        ? `${report.currency || '$'}${(report.completed_revenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$0.00',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  // Period options
  const periodOptions: { value: ReportPeriod; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handlePeriodChange = (period: ReportPeriod) => {
    setFilters((prev) => ({
      ...prev,
      period,
      // Clear custom dates if not custom period
      ...(period !== 'custom' && { date_from: undefined, date_to: undefined }),
    }));
  };

  const handleClearFilters = () => {
    setFilters({ period: 'month' });
    setShowAdvancedFilters(false);
  };

  // Export
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    exportReport({ filters, format });
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_REVENUE_REPORTS}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Reports</h1>
            <p className="mt-2 text-sm text-gray-600">
              Comprehensive revenue analytics and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              disabled={isExporting || !report}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              variant="outline"
              disabled={isExporting || !report}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Period Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePeriodChange(option.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filters.period === option.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            {filters.period === 'custom' && (
              <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    aria-label="Report from date"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    aria-label="Report to date"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between border-t pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
              {(filters.organization_id || filters.vendor_id) && (
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
                {/* Group By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group By</label>
                  <select
                    aria-label="Group report by"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.group_by || ''}
                    onChange={(e) => handleFilterChange('group_by', e.target.value)}
                  >
                    <option value="">Default</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="gateway">Gateway</option>
                    <option value="organization">Organization</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    aria-label="Filter by currency"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.currency || ''}
                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                  >
                    <option value="">All Currencies</option>
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Error State */}
        {isError && (
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to load report</h3>
              <p className="mb-4 text-sm text-gray-600">{error?.message || 'An error occurred'}</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="h-24 animate-pulse rounded bg-gray-100" />
                </Card>
              ))}
            </div>
            <Card className="p-8">
              <div className="h-64 animate-pulse rounded bg-gray-100" />
            </Card>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && report && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                        {stat.change !== undefined && (
                          <div className="mt-2 flex items-center gap-1 text-sm">
                            {stat.change >= 0 ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">
                                  +{stat.change.toFixed(1)}%
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-red-600">
                                  {stat.change.toFixed(1)}%
                                </span>
                              </>
                            )}
                            <span className="text-gray-500">vs last period</span>
                          </div>
                        )}
                      </div>
                      <div className={`rounded-full p-3 ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Top Vendors */}
            {report.top_vendors && report.top_vendors.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Top Vendors</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Transactions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {report.top_vendors.map((vendor) => (
                        <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {vendor.vendor_name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {report.currency || '$'}
                            {(vendor.revenue / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {vendor.transactions.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* By Gateway */}
            {report.by_gateway && report.by_gateway.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Revenue by Gateway</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Gateway
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Transactions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {report.by_gateway.map((gateway) => (
                        <tr key={gateway.gateway} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {gateway.gateway}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {report.currency || '$'}
                            {(gateway.revenue / 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {gateway.transactions.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <Badge variant="outline">{gateway.percentage.toFixed(1)}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}

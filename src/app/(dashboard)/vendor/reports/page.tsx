'use client';

import { useState } from 'react';
import { useReport, useExportTransactions, useExportPayouts } from '@/lib/hooks/use-reports';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { ReportPeriod, ReportType } from '@/types';
import { REPORT_PERIODS, REPORT_TYPES } from '@/types';
import { AlertTriangle, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

export default function VendorReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: report, isLoading, error } = useReport({
    period,
    type: reportType,
    date_from: period === 'custom' ? dateFrom : undefined,
    date_to: period === 'custom' ? dateTo : undefined,
  });

  const exportTransactions = useExportTransactions();
  const exportPayouts = useExportPayouts();

  const handleExportTransactions = () => {
    exportTransactions.mutate({
      period,
      date_from: period === 'custom' ? dateFrom : undefined,
      date_to: period === 'custom' ? dateTo : undefined,
    });
  };

  const handleExportPayouts = () => {
    exportPayouts.mutate({
      period,
      date_from: period === 'custom' ? dateFrom : undefined,
      date_to: period === 'custom' ? dateTo : undefined,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportTransactions}
            disabled={exportTransactions.isPending}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            Export Transactions
          </button>
          <button
            type="button"
            onClick={handleExportPayouts}
            disabled={exportPayouts.isPending}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            Export Payouts
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Period Selection */}
          <div>
            <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              id="period-filter"
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label htmlFor="report-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              id="report-type-filter"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <>
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6 animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load Report</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        ) : !report ? (
          <div className="p-12 text-center">
            <IconBadge icon={BarChart3} variant="empty-state" color="blue" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-gray-600">
              No transactions found for the selected period.
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Period Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{report.period.label}</h2>
              <p className="text-sm text-gray-500">
                {report.period.start} to {report.period.end}
              </p>
              <p className="text-xs text-gray-400">
                Generated: {new Date(report.generated_at).toLocaleString()}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Transactions</p>
                <p className="text-2xl font-bold text-blue-900">
                  {report.summary.total_transactions.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(report.summary.total_revenue, 'GHS')}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Net Revenue</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(report.summary.net_revenue, 'GHS')}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Total Fees</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(report.summary.total_fees, 'GHS')}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">Avg Transaction</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(report.summary.average_transaction, 'GHS')}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-600 font-medium">Unique Customers</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {report.summary.unique_customers.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Growth Indicator */}
            {report.growth && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                    report.growth.revenue_growth_percentage >= 0
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  )}>
                    {report.growth.revenue_growth_percentage >= 0 ? <TrendingUp className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue Growth</p>
                    <p className={cn(
                      'text-2xl font-bold',
                      report.growth.revenue_growth_percentage >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}>
                      {report.growth.revenue_growth_percentage >= 0 ? '+' : ''}
                      {report.growth.revenue_growth_percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      vs previous period ({formatCurrency(report.growth.previous_revenue, 'GHS')})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Time Series Data */}
            {report.time_series && report.time_series.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Transaction Trend</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Period
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                          Transactions
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                          Revenue
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                          Net Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {report.time_series.map((ts, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{ts.label}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            {ts.transaction_count.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatCurrency(ts.revenue, 'GHS')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatCurrency(ts.net_revenue, 'GHS')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {report.by_payment_method && report.by_payment_method.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">By Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {report.by_payment_method.map((pm, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <p className="font-medium capitalize">{pm.method.replace('_', ' ')}</p>
                      <p className="text-2xl font-bold">{pm.transaction_count}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(pm.revenue, 'GHS')}
                      </p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${pm.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{pm.percentage.toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payouts Summary */}
            {report.payouts && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Payouts Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Payouts</p>
                    <p className="text-2xl font-bold">
                      {report.payouts.total_payouts}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(report.payouts.total_amount, 'GHS')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Fees</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(report.payouts.total_fees, 'GHS')}
                    </p>
                  </div>
                </div>
                {report.payouts.by_status && (
                  <div className="mt-4 flex gap-4">
                    {Object.entries(report.payouts.by_status).map(([status, count]) => (
                      <div key={status} className="text-sm">
                        <span className="capitalize">{status}:</span>{' '}
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Tip:</span> Use the Export buttons to download transaction and payout data as CSV files for further analysis in spreadsheet applications.
        </p>
      </div>
    </div>
  );
}

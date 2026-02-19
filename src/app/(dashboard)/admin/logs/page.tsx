'use client';

/**
 * Admin Activity Logs Page
 *
 * Comprehensive system activity tracking with filtering and export
 */

import { useState } from 'react';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAdminLogsList,
  useAdminLogStatistics,
  useExportLogs,
} from '@/lib/hooks/use-admin-logs';
import type { LogFilters as ApiLogFilters } from '@/lib/api/admin-logs';
import { AlertCircle, FileDown, Activity, Shield, Info, Clock } from 'lucide-react';

export default function AdminLogsPage() {
  // Filters state
  const [filters, setFilters] = useState<ApiLogFilters>({
    page: 1,
    per_page: 50,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Data fetching
  const { data, isLoading, isError, error, refetch } = useAdminLogsList(filters);
  const { data: statsData } = useAdminLogStatistics();
  const { mutate: exportLogs, isPending: isExporting } = useExportLogs();

  // Statistics
  const stats = [
    {
      label: 'Total Logs',
      value: statsData?.total_logs?.toLocaleString() || data?.meta?.total?.toLocaleString() || '0',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Logs Today',
      value: statsData?.logs_today?.toLocaleString() || '0',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Errors',
      value: statsData?.error_logs?.toLocaleString() || '0',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Security Events',
      value: statsData?.critical_logs?.toLocaleString() || '0',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      per_page: 50,
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

  // Export
  const handleExport = (format: 'csv' | 'excel') => {
    exportLogs({ filters, format });
  };

  // Level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'critical':
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_LOGS}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="mt-2 text-sm text-gray-600">
              Monitor system activity, user actions, and security events
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              disabled={isExporting}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              variant="outline"
              disabled={isExporting}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

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
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select
                  aria-label="Filter by log level"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.level || ''}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <select
                  aria-label="Filter by action type"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <option value="">All Actions</option>
                  <option value="user.login">User Login</option>
                  <option value="user.logout">User Logout</option>
                  <option value="user.created">User Created</option>
                  <option value="user.updated">User Updated</option>
                  <option value="user.deleted">User Deleted</option>
                  <option value="user.suspended">User Suspended</option>
                  <option value="transaction.created">Transaction Created</option>
                  <option value="kyc.approved">KYC Approved</option>
                  <option value="kyc.rejected">KYC Rejected</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
              {(filters.search || filters.level || filters.action || filters.user_id || filters.from_date) && (
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
                {/* From Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    aria-label="Filter from date"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.from_date || ''}
                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    aria-label="Filter to date"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.to_date || ''}
                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                  />
                </div>

                {/* IP Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <input
                    type="text"
                    placeholder="Filter by IP..."
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={filters.ip_address || ''}
                    onChange={(e) => handleFilterChange('ip_address', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Logs Table */}
        <Card className="overflow-hidden">
          {/* Error State */}
          {isError && (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to load logs</h3>
              <p className="mb-4 text-sm text-gray-600">{error?.message || 'An error occurred'}</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
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
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">No logs found</h3>
                  <p className="text-sm text-gray-600">
                    {filters.search || filters.level || filters.action
                      ? 'Try adjusting your filters'
                      : 'No activity logs available yet'}
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
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.data.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          {/* Time */}
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>

                          {/* Level */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getLevelIcon(log.level)}
                              <Badge className={getLevelColor(log.level)}>
                                {log.level.toUpperCase()}
                              </Badge>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {log.action}
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="max-w-md truncate">{log.description}</div>
                          </td>

                          {/* User */}
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {log.user_name || log.user_email || '-'}
                          </td>

                          {/* IP Address */}
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {log.ip_address || '-'}
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
                      Showing <span className="font-medium">{data.meta.from || 0}</span> to{' '}
                      <span className="font-medium">{data.meta.to || 0}</span> of{' '}
                      <span className="font-medium">{data.meta.total}</span> logs
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePageChange(data.meta.current_page - 1)}
                        disabled={data.meta.current_page === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4 text-sm text-gray-700">
                        Page {data.meta.current_page} of {data.meta.last_page}
                      </span>
                      <Button
                        onClick={() => handlePageChange(data.meta.current_page + 1)}
                        disabled={data.meta.current_page === data.meta.last_page}
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

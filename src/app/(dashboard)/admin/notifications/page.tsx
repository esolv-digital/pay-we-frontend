'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import {
  useNotificationLogsList,
  useNotificationStatistics,
} from '@/lib/hooks/use-admin-notification-logs';
import type {
  NotificationLogFilters,
  NotificationChannel,
  NotificationStatus,
  NotificationLog,
} from '@/lib/api/admin-notification-logs';

const NOTIFICATION_STATUS_STYLES: Record<NotificationStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
};

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
};

const STATUS_OPTIONS: { value: NotificationStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
];

const CHANNEL_OPTIONS: { value: NotificationChannel | ''; label: string }[] = [
  { value: '', label: 'All Channels' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function AdminNotificationLogsPage() {
  const [filters, setFilters] = useState<NotificationLogFilters>({
    page: 1,
    per_page: 20,
    date_from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data, isLoading, isError } = useNotificationLogsList(filters);
  const { data: stats } = useNotificationStatistics({
    date_from: filters.date_from,
    date_to: filters.date_to,
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  const handleFilterChange = (key: keyof NotificationLogFilters, value: string) => {
    setFilters((prev: NotificationLogFilters) => ({
      ...prev,
      [key]: value || undefined,
      page: key !== 'page' ? 1 : prev.page,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev: NotificationLogFilters) => ({ ...prev, page: newPage }));
  };

  const statCards = [
    {
      label: 'Total Sent',
      value: stats?.totals?.sent?.toLocaleString() || '0',
      color: 'bg-blue-50',
    },
    {
      label: 'Delivered',
      value: stats?.totals?.delivered?.toLocaleString() || '0',
      subtext: stats?.delivery_rate ? `${stats.delivery_rate.toFixed(1)}% rate` : undefined,
      color: 'bg-green-50',
    },
    {
      label: 'Failed',
      value: stats?.totals?.failed?.toLocaleString() || '0',
      color: 'bg-red-50',
    },
    {
      label: 'Pending',
      value: stats?.totals?.pending?.toLocaleString() || '0',
      color: 'bg-yellow-50',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Logs</h1>
        <p className="text-gray-600 mt-1">
          View and analyze notification delivery logs
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className={cn('p-6', stat.color)}>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            {stat.subtext && <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>}
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
            <select
              value={filters.channel || ''}
              onChange={(e) => handleFilterChange('channel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by channel"
            >
              {CHANNEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <Input
              type="text"
              placeholder="Filter by user..."
              value={filters.user_id || ''}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      {isError ? (
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Logs</h2>
          <p className="text-gray-600">Failed to load notification logs. Please try again.</p>
        </Card>
      ) : isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Logs Found</h2>
          <p className="text-gray-600">
            No notification logs match your filters. Try adjusting the date range or other filters.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log: NotificationLog) => {
                    const statusStyle = NOTIFICATION_STATUS_STYLES[log.status];

                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(log.created_at), 'MMM d, HH:mm')}
                        </td>
                        <td className="px-6 py-4">
                          {log.user ? (
                            <div>
                              <p className="text-sm font-medium">
                                {log.user.first_name} {log.user.last_name}
                              </p>
                              <p className="text-xs text-gray-500">{log.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unknown</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">
                            {log.notification_type.replace(/_/g, ' ')}
                          </p>
                          {log.subject && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {log.subject}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{CHANNEL_LABELS[log.channel]}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]">
                          {log.recipient}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{log.provider}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(statusStyle.bg, statusStyle.text)}>
                              {statusStyle.label}
                            </Badge>
                            {log.error_message && (
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700"
                                title={log.error_message}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} logs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(meta.current_page - 1)}
                  disabled={meta.current_page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(meta.current_page + 1)}
                  disabled={meta.current_page === meta.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

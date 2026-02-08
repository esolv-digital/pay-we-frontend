'use client';

import { useState } from 'react';
import { useNotificationHistory } from '@/lib/hooks/use-notifications';
import type { NotificationChannel, NotificationLogStatus } from '@/types';
import { NOTIFICATION_STATUS_STYLES, CHANNEL_LABELS } from '@/types/notification';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_OPTIONS: { value: NotificationLogStatus | ''; label: string }[] = [
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
  { value: 'database', label: 'In-App' },
];

export function NotificationHistory() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<NotificationLogStatus | ''>('');
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | ''>('');

  const { data, isLoading } = useNotificationHistory({
    page,
    per_page: 10,
    status: statusFilter || undefined,
    channel: channelFilter || undefined,
  });

  const notifications = data?.notifications || [];
  const meta = data?.meta;

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as NotificationLogStatus | '');
    setPage(1);
  };

  const handleChannelChange = (value: string) => {
    setChannelFilter(value as NotificationChannel | '');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Notification History</h2>
      <p className="text-gray-600 mb-6">
        View your past notifications and their delivery status.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={channelFilter}
          onChange={(e) => handleChannelChange(e.target.value)}
          aria-label="Filter by channel"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CHANNEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Filter by status"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications Table */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No notifications found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Recipient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {notifications.map((notification) => {
                  const statusStyle = NOTIFICATION_STATUS_STYLES[notification.status];

                  return (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(notification.created_at), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">
                          {notification.subject || notification.notification_type.replace(/_/g, ' ')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {CHANNEL_LABELS[notification.channel]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">
                          {notification.recipient}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                              statusStyle.bg,
                              statusStyle.text
                            )}
                          >
                            {statusStyle.label}
                          </span>
                          {notification.error_message && (
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              title={notification.error_message}
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

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} results
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

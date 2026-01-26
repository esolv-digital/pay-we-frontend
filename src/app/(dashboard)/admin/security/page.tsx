'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import {
  useLoginAttempts,
  useSuspiciousLoginAttempts,
  useLoginStatistics,
} from '@/lib/hooks/use-admin-notifications';
import type { LoginAttemptFilters, SuspiciousReason } from '@/types';

const SUSPICIOUS_REASON_LABELS: Record<SuspiciousReason, string> = {
  new_device: 'New Device',
  new_country: 'New Country',
  impossible_travel: 'Impossible Travel',
  multiple_failures: 'Multiple Failures',
};

const SUSPICIOUS_REASON_COLORS: Record<SuspiciousReason, string> = {
  new_device: 'bg-blue-100 text-blue-800',
  new_country: 'bg-purple-100 text-purple-800',
  impossible_travel: 'bg-red-100 text-red-800',
  multiple_failures: 'bg-orange-100 text-orange-800',
};

type ViewMode = 'all' | 'suspicious';

export default function AdminSecurityPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [filters, setFilters] = useState<LoginAttemptFilters>({
    page: 1,
    per_page: 20,
    date_from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: allData, isLoading: allLoading } = useLoginAttempts(
    viewMode === 'all' ? filters : undefined
  );
  const { data: suspiciousData, isLoading: suspiciousLoading } = useSuspiciousLoginAttempts(
    viewMode === 'suspicious' ? undefined : undefined,
    viewMode === 'suspicious' ? filters.per_page : undefined,
    viewMode === 'suspicious' ? filters.page : undefined
  );
  const { data: stats } = useLoginStatistics(filters.date_from, filters.date_to);

  const data = viewMode === 'all' ? allData : suspiciousData;
  const isLoading = viewMode === 'all' ? allLoading : suspiciousLoading;
  const attempts = data?.attempts || [];
  const meta = data?.meta;

  const handleFilterChange = (key: keyof LoginAttemptFilters, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: key !== 'page' ? 1 : prev.page,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const statCards = [
    {
      label: 'Total Logins',
      value: stats?.totals?.total?.toLocaleString() || '0',
      color: 'bg-blue-50',
    },
    {
      label: 'Successful',
      value: stats?.totals?.successful?.toLocaleString() || '0',
      subtext: stats?.totals?.total
        ? `${((stats.totals.successful / stats.totals.total) * 100).toFixed(1)}% rate`
        : undefined,
      color: 'bg-green-50',
    },
    {
      label: 'Failed',
      value: stats?.totals?.failed?.toLocaleString() || '0',
      color: 'bg-red-50',
    },
    {
      label: 'Suspicious',
      value: stats?.totals?.suspicious?.toLocaleString() || '0',
      color: 'bg-yellow-50',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security Monitoring</h1>
        <p className="text-gray-600 mt-1">Monitor login attempts and security events</p>
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

      {/* Suspicious Reasons Breakdown */}
      {stats?.suspicious_reasons && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Suspicious Activity Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.entries(stats.suspicious_reasons) as [SuspiciousReason, number][]).map(
              ([reason, count]) => (
                <div key={reason} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{count}</p>
                  <Badge className={cn('mt-2', SUSPICIOUS_REASON_COLORS[reason])}>
                    {SUSPICIOUS_REASON_LABELS[reason]}
                  </Badge>
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* View Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={viewMode === 'all' ? 'default' : 'outline'}
          onClick={() => setViewMode('all')}
        >
          All Attempts
        </Button>
        <Button
          variant={viewMode === 'suspicious' ? 'default' : 'outline'}
          onClick={() => setViewMode('suspicious')}
          className={viewMode === 'suspicious' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          Suspicious Only
        </Button>
      </div>

      {/* Filters */}
      {viewMode === 'all' && (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="text"
                placeholder="Filter by email..."
                value={filters.email || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
              <Input
                type="text"
                placeholder="Filter by IP..."
                value={filters.ip_address || ''}
                onChange={(e) => handleFilterChange('ip_address', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={
                  filters.successful === undefined ? '' : filters.successful ? 'true' : 'false'
                }
                onChange={(e) =>
                  handleFilterChange(
                    'successful',
                    e.target.value === '' ? '' : e.target.value === 'true'
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Successful</option>
                <option value="false">Failed</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Login Attempts Table */}
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      ) : attempts.length === 0 ? (
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Login Attempts Found</h2>
          <p className="text-gray-600">
            {viewMode === 'suspicious'
              ? 'No suspicious login attempts in this period.'
              : 'No login attempts match your filters.'}
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
                      IP / Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Flags
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className={cn(
                        'hover:bg-gray-50',
                        attempt.is_suspicious && 'bg-yellow-50/50',
                        !attempt.successful && !attempt.is_suspicious && 'bg-red-50/30'
                      )}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(attempt.created_at), 'MMM d, HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4">
                        {attempt.user ? (
                          <div>
                            <p className="text-sm font-medium">
                              {attempt.user.first_name} {attempt.user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{attempt.user.email}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-500">{attempt.email}</p>
                            <p className="text-xs text-gray-400">Not registered</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono">{attempt.ip_address}</p>
                        {attempt.location && (
                          <p className="text-xs text-gray-500">{attempt.location}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">
                          {attempt.user_agent?.split(' ')[0] || 'Unknown'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            attempt.successful
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {attempt.successful ? 'Success' : 'Failed'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {attempt.is_suspicious && (
                            <Badge className="bg-yellow-100 text-yellow-800">Suspicious</Badge>
                          )}
                          {attempt.suspicious_reasons?.map((reason) => (
                            <Badge
                              key={reason}
                              className={cn('text-xs', SUSPICIOUS_REASON_COLORS[reason])}
                            >
                              {SUSPICIOUS_REASON_LABELS[reason]}
                            </Badge>
                          ))}
                          {attempt.notification_sent && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Notified</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} attempts
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

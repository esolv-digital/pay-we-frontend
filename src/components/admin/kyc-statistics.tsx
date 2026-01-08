/**
 * KYC Statistics Dashboard Component
 *
 * Displays comprehensive KYC statistics including:
 * - Total counts by status
 * - Average review time
 * - Status breakdown
 * - Date range filtering
 */

'use client';

import { useAdminKYCStatistics } from '@/lib/hooks/use-admin-kyc';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KYCStatisticsProps {
  dateFrom?: string;
  dateTo?: string;
  className?: string;
}

export function KYCStatistics({
  dateFrom,
  dateTo,
  className,
}: KYCStatisticsProps) {
  const { data, isLoading } = useAdminKYCStatistics(dateFrom, dateTo);

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const stats = data?.statistics;
  if (!stats) return null;

  const metrics = [
    {
      label: 'Total KYC',
      value: stats.total.toLocaleString(),
      icon: '📄',
      color: 'text-gray-900',
    },
    {
      label: 'Pending Review',
      value: (stats.pending + stats.submitted + stats.in_review).toLocaleString(),
      icon: '⏳',
      color: 'text-orange-600',
    },
    {
      label: 'Approved',
      value: stats.approved.toLocaleString(),
      icon: '✓',
      color: 'text-green-600',
    },
    {
      label: 'Rejected',
      value: stats.rejected.toLocaleString(),
      icon: '✗',
      color: 'text-red-600',
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className={cn('text-2xl font-bold', metric.color)}>
                  {metric.value}
                </p>
              </div>
              <span className="text-3xl">{metric.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {stats.average_review_time_hours > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Review Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.average_review_time_hours.toFixed(1)} hours
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status Breakdown</p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div>Pending: {stats.status_breakdown.pending}</div>
                <div>In Review: {stats.status_breakdown.in_review}</div>
                <div>Approved: {stats.status_breakdown.approved}</div>
                <div>Rejected: {stats.status_breakdown.rejected}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

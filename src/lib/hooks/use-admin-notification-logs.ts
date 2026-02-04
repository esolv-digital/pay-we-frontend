/**
 * Admin Notification Logs React Query Hooks
 *
 * Provides data fetching and caching for notification log monitoring.
 */

import { useQuery } from '@tanstack/react-query';
import { adminNotificationLogsApi } from '@/lib/api/admin-notification-logs';
import type {
  NotificationLogFilters,
  NotificationLog,
  NotificationStatistics,
  DailyNotificationData,
  AdminPaginatedResponse,
} from '@/lib/api/admin-notification-logs';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const notificationLogsKeys = {
  all: ['admin', 'notification-logs'] as const,
  lists: () => [...notificationLogsKeys.all, 'list'] as const,
  list: (filters: NotificationLogFilters) =>
    [...notificationLogsKeys.lists(), filters] as const,
  details: () => [...notificationLogsKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationLogsKeys.details(), id] as const,
  statistics: (params?: { date_from?: string; date_to?: string }) =>
    [...notificationLogsKeys.all, 'statistics', params] as const,
  daily: (days: number) => [...notificationLogsKeys.all, 'daily', days] as const,
};

// =============================================================================
// QUERY HOOKS
// =============================================================================

/**
 * Hook to fetch paginated list of notification logs
 */
export function useNotificationLogsList(
  filters: NotificationLogFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery<AdminPaginatedResponse<NotificationLog>, Error>({
    queryKey: notificationLogsKeys.list(filters),
    queryFn: () => adminNotificationLogsApi.list(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch single notification log details
 */
export function useNotificationLog(logId: string, options?: { enabled?: boolean }) {
  return useQuery<NotificationLog, Error>({
    queryKey: notificationLogsKeys.detail(logId),
    queryFn: () => adminNotificationLogsApi.get(logId),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!logId,
  });
}

/**
 * Hook to fetch notification statistics
 */
export function useNotificationStatistics(
  params?: { date_from?: string; date_to?: string },
  options?: { enabled?: boolean }
) {
  return useQuery<NotificationStatistics, Error>({
    queryKey: notificationLogsKeys.statistics(params),
    queryFn: () => adminNotificationLogsApi.getStatistics(params),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch daily notification data for charts
 */
export function useNotificationDaily(days: number = 30, options?: { enabled?: boolean }) {
  return useQuery<Record<string, DailyNotificationData>, Error>({
    queryKey: notificationLogsKeys.daily(days),
    queryFn: () => adminNotificationLogsApi.getDaily(days),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

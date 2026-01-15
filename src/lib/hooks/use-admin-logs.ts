/**
 * Admin Activity Logs React Query Hooks
 *
 * Provides React Query hooks for viewing activity logs.
 * Includes caching and automatic refetching.
 *
 * @module lib/hooks/use-admin-logs
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminLogsApi,
  type ActivityLog,
  type LogFilters,
} from '@/lib/api/admin-logs';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for admin logs
 */
export const adminLogsKeys = {
  all: ['admin', 'logs'] as const,
  lists: () => [...adminLogsKeys.all, 'list'] as const,
  list: (filters: LogFilters) => [...adminLogsKeys.lists(), filters] as const,
  details: () => [...adminLogsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminLogsKeys.details(), id] as const,
  statistics: () => [...adminLogsKeys.all, 'statistics'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch paginated list of activity logs with filters
 *
 * @param filters - Log filters
 * @param options - React Query options
 * @returns Query result with logs data
 *
 * @example
 * ```tsx
 * function ActivityLogsList() {
 *   const { data, isLoading, error } = useAdminLogsList({
 *     action: 'user.login',
 *     from_date: '2024-01-01',
 *     page: 1,
 *     per_page: 50,
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       {data?.data.map(log => (
 *         <LogItem key={log.id} log={log} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminLogsList(
  filters: LogFilters = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<ActivityLog>, Error>({
    queryKey: adminLogsKeys.list(filters),
    queryFn: () => adminLogsApi.list(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to fetch a single activity log by ID
 *
 * @param id - Log ID
 * @param options - React Query options
 * @returns Query result with log details
 *
 * @example
 * ```tsx
 * function LogDetail({ logId }: { logId: string }) {
 *   const { data, isLoading } = useAdminLog(logId);
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <h1>{data?.data.action}</h1>
 *       <p>{data?.data.description}</p>
 *       <p>By: {data?.data.user_name}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminLog(
  id: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ApiResponse<ActivityLog>, Error>({
    queryKey: adminLogsKeys.detail(id),
    queryFn: () => adminLogsApi.get(id),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? !!id,
  });
}

/**
 * Hook to fetch activity log statistics
 *
 * @param options - React Query options
 * @returns Query result with log statistics
 *
 * @example
 * ```tsx
 * function LogStatistics() {
 *   const { data, isLoading } = useAdminLogStatistics();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <Card>
 *         <h3>Total Logs</h3>
 *         <p>{data?.data.total_logs}</p>
 *       </Card>
 *       <Card>
 *         <h3>Logs Today</h3>
 *         <p>{data?.data.logs_today}</p>
 *       </Card>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminLogStatistics(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: adminLogsKeys.statistics(),
    queryFn: () => adminLogsApi.getStatistics(),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to export activity logs
 *
 * @returns Mutation hook for exporting logs
 *
 * @example
 * ```tsx
 * function ExportLogsButton() {
 *   const { mutate: exportLogs, isPending } = useExportLogs();
 *
 *   const handleExport = () => {
 *     exportLogs({
 *       filters: {
 *         from_date: '2024-01-01',
 *         to_date: '2024-01-31',
 *       },
 *       format: 'csv',
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleExport} disabled={isPending}>
 *       {isPending ? 'Exporting...' : 'Export Logs'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useExportLogs() {
  return useMutation({
    mutationFn: async ({
      filters,
      format,
    }: {
      filters: LogFilters;
      format: 'csv' | 'excel';
    }) => {
      const blob = await adminLogsApi.export(filters, format);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      a.download = `activity_logs_export_${timestamp}.${extension}`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      toast.success('Activity logs exported successfully');
    },
    onError: (error: Error) => {
      console.error('Export logs error:', error);
      toast.error(`Failed to export logs: ${error.message}`);
    },
  });
}

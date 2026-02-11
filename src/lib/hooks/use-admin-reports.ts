/**
 * Admin Reports React Query Hooks
 *
 * Provides React Query hooks for revenue reports and analytics.
 * Includes caching and automatic refetching.
 *
 * @module lib/hooks/use-admin-reports
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminReportsApi,
  type RevenueReport,
  type RevenueReportFilters,
} from '@/lib/api/admin-reports';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for admin reports
 */
export const adminReportsKeys = {
  all: ['admin', 'reports'] as const,
  revenue: () => [...adminReportsKeys.all, 'revenue'] as const,
  revenueReport: (filters: RevenueReportFilters) =>
    [...adminReportsKeys.revenue(), filters] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch revenue report with filters
 *
 * @param filters - Report filters
 * @param options - React Query options
 * @returns Query result with revenue data
 *
 * @example
 * ```tsx
 * function RevenueReport() {
 *   const { data, isLoading, error } = useRevenueReport({
 *     period: 'month',
 *     organization_id: 'org-123',
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       <h1>Total Revenue: ${data?.data.total_revenue}</h1>
 *       <p>Transactions: {data?.data.total_transactions}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRevenueReport(
  filters: RevenueReportFilters = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<RevenueReport, Error>({
    queryKey: adminReportsKeys.revenueReport(filters),
    queryFn: () => adminReportsApi.getRevenue(filters),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to export revenue report
 *
 * @returns Mutation hook for exporting reports
 *
 * @example
 * ```tsx
 * function ExportReportButton() {
 *   const { mutate: exportReport, isPending } = useExportRevenueReport();
 *
 *   const handleExport = () => {
 *     exportReport({
 *       filters: {
 *         period: 'month',
 *       },
 *       format: 'pdf',
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleExport} disabled={isPending}>
 *       {isPending ? 'Exporting...' : 'Export PDF'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useExportRevenueReport() {
  return useMutation({
    mutationFn: async ({
      filters,
      format,
    }: {
      filters: RevenueReportFilters;
      format: 'csv' | 'excel' | 'pdf';
    }) => {
      const blob = await adminReportsApi.exportRevenue(filters, format);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'xlsx';
      a.download = `revenue_report_${timestamp}.${extension}`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      toast.success('Revenue report exported successfully');
    },
    onError: (error: Error) => {
      console.error('Export revenue report error:', error);
      toast.error(`Failed to export report: ${error.message}`);
    },
  });
}

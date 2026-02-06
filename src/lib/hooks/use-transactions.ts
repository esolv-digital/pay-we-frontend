import { useQuery, useMutation } from '@tanstack/react-query';
import { vendorApi } from '@/lib/api/vendor';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { useRequiredVendorSlug } from './use-vendor-slug';
import type { TransactionFilters, ExportFormat } from '@/types';

/**
 * Hook to fetch vendor transactions with advanced filtering, sorting, and pagination
 * Supports comprehensive filtering by status, date range, amount, gateway, search, etc.
 * @param filters - Optional filters (status, date range, amount, gateway, search, pagination, etc.)
 * @returns Query result with transactions list and metadata
 *
 * @example
 * const { data, isLoading } = useTransactions({
 *   status: 'completed',
 *   date_range: 'this_month',
 *   sort_by: 'created_at',
 *   sort_direction: 'desc',
 *   per_page: 50,
 * });
 */
export function useTransactions(filters?: TransactionFilters) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['transactions', vendorSlug, filters],
    queryFn: () => vendorApi.getTransactions(vendorSlug!, filters),
    enabled: !!vendorSlug,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Hook to fetch a single transaction by ID
 * @param transactionId - The transaction ID
 * @returns Query result with transaction details
 *
 * @example
 * const { data: transaction, isLoading } = useTransaction('txn-123');
 */
export function useTransaction(transactionId: string) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['transaction', vendorSlug, transactionId],
    queryFn: () => vendorApi.getTransaction(vendorSlug!, transactionId),
    enabled: !!vendorSlug && !!transactionId,
  });
}

/**
 * Hook to fetch transaction metrics for a vendor
 * Metrics include total transactions, amounts, fees, success rates, breakdowns by gateway/currency
 * @param filters - Optional filters to apply to metrics calculation
 * @returns Query result with aggregated metrics
 *
 * @example
 * const { data: metrics, isLoading } = useTransactionMetrics({
 *   date_range: 'this_month',
 *   status: 'completed',
 * });
 */
export function useTransactionMetrics(filters?: TransactionFilters) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['transaction-metrics', vendorSlug, filters],
    queryFn: () => vendorApi.getTransactionMetrics(vendorSlug!, filters),
    enabled: !!vendorSlug,
    staleTime: 60000, // Cache for 1 minute (metrics are expensive to calculate)
  });
}

/**
 * Hook to fetch export summary before performing actual export
 * Shows total records, file size estimate, and whether export is possible (max 10,000 records)
 * @param filters - Optional filters to apply to export
 * @returns Query result with export summary
 *
 * @example
 * const { data: summary } = useExportSummary({
 *   status: 'completed',
 *   from_date: '2025-01-01',
 *   to_date: '2025-01-31',
 * });
 */
export function useExportSummary(filters?: TransactionFilters) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['export-summary', vendorSlug, filters],
    queryFn: () => vendorApi.getExportSummary(vendorSlug!, filters),
    enabled: !!vendorSlug,
    staleTime: 10000, // Cache for 10 seconds
  });
}

/**
 * Hook to export transactions
 * Triggers file download in the browser
 * @returns Mutation for exporting transactions
 *
 * @example
 * const exportMutation = useExportTransactions();
 *
 * // Export as CSV
 * exportMutation.mutate({
 *   filters: { status: 'completed', date_range: 'this_month' },
 *   format: 'csv',
 * });
 *
 * // Export as Excel
 * exportMutation.mutate({
 *   filters: { status: 'completed' },
 *   format: 'excel',
 * });
 */
export function useExportTransactions() {
  const vendorSlug = useRequiredVendorSlug();

  return useMutation({
    mutationFn: ({ filters, format }: { filters?: TransactionFilters; format?: ExportFormat }) =>
      vendorApi.exportTransactions(vendorSlug!, filters, format),
    onSuccess: () => {
      showSuccess('Export started. Your download should begin shortly.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Helper hook to check if export is possible with current filters
 * Useful for showing export button state and warnings
 * @param filters - Filters to check
 * @returns Object with can_export flag, total_records count, and file size estimate
 *
 * @example
 * const { canExport, totalRecords, fileSizeEstimate } = useCanExport(filters);
 *
 * <Button disabled={!canExport}>
 *   Export {totalRecords} transactions ({fileSizeEstimate})
 * </Button>
 */
export function useCanExport(filters?: TransactionFilters) {
  const { data: summary, isLoading } = useExportSummary(filters);

  return {
    canExport: summary?.can_export ?? false,
    totalRecords: summary?.summary.total_records ?? 0,
    maxRecords: summary?.max_records ?? 10000,
    fileSizeEstimate: summary?.summary.file_size_estimate ?? '0 KB',
    isLoading,
  };
}

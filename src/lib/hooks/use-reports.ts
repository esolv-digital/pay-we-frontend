import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { useRequiredVendorSlug } from './use-vendor-slug';
import type { ReportRequest, ExportReportParams } from '@/types';

/**
 * Hook to fetch a report
 */
export function useReport(params: ReportRequest) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['report', vendorSlug, params],
    queryFn: () => reportsApi.getReport(vendorSlug!, params),
    enabled: !!vendorSlug && !!params.period,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to export transactions as CSV
 */
export function useExportTransactions() {
  const vendorSlug = useRequiredVendorSlug();

  return useMutation({
    mutationFn: (params: ExportReportParams) =>
      reportsApi.exportTransactions(vendorSlug!, params),
    onSuccess: () => {
      showSuccess('Transaction export started. Download will begin shortly.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to export payouts as CSV
 */
export function useExportPayouts() {
  const vendorSlug = useRequiredVendorSlug();

  return useMutation({
    mutationFn: (params: ExportReportParams) =>
      reportsApi.exportPayouts(vendorSlug!, params),
    onSuccess: () => {
      showSuccess('Payout export started. Download will begin shortly.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to download transactions as blob (for custom handling)
 */
export function useDownloadTransactionsBlob() {
  const vendorSlug = useRequiredVendorSlug();

  return useMutation({
    mutationFn: async (params: ExportReportParams) => {
      const blob = await reportsApi.downloadTransactionsBlob(vendorSlug!, params);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${params.period}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to download payouts as blob (for custom handling)
 */
export function useDownloadPayoutsBlob() {
  const vendorSlug = useRequiredVendorSlug();

  return useMutation({
    mutationFn: async (params: ExportReportParams) => {
      const blob = await reportsApi.downloadPayoutsBlob(vendorSlug!, params);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payouts_${params.period}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// Legacy aliases
export const useGenerateReport = useReport;
export const useDownloadReport = useExportTransactions;

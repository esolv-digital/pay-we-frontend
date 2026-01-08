/**
 * React Query hooks for Admin KYC Management
 *
 * Provides type-safe, optimized data fetching and mutations for KYC management.
 * All hooks follow React Query best practices with proper caching and invalidation.
 *
 * @example
 * ```tsx
 * // In a component
 * const { data, isLoading } = useAdminKYCList({ status: 'pending' });
 * const { mutate: approve } = useApproveKYC();
 * ```
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminKycApi } from '@/lib/api/admin-kyc';
import type {
  AdminKYCFilters,
  KYCApproveRequest,
  KYCRejectRequest,
  KYCExportFormat,
} from '@/types/kyc';
import { toast } from 'sonner';

/**
 * Query keys for KYC endpoints
 * Centralized for consistency and easy invalidation
 */
export const adminKycKeys = {
  all: ['admin', 'kyc'] as const,
  lists: () => [...adminKycKeys.all, 'list'] as const,
  list: (filters?: AdminKYCFilters) =>
    [...adminKycKeys.lists(), filters] as const,
  pending: () => [...adminKycKeys.all, 'pending'] as const,
  details: () => [...adminKycKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminKycKeys.details(), id] as const,
  statistics: () => [...adminKycKeys.all, 'statistics'] as const,
  statisticsWithDates: (dateFrom?: string, dateTo?: string) =>
    [...adminKycKeys.statistics(), { dateFrom, dateTo }] as const,
};

/**
 * Hook to fetch KYC documents with filtering, sorting, and pagination
 *
 * @param filters - Optional filters for the query
 * @param options - React Query options
 * @returns Query result with KYC documents
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAdminKYCList({
 *   status: 'pending',
 *   per_page: 20,
 *   sort_by: 'created_at',
 *   sort_direction: 'desc'
 * });
 * ```
 */
export function useAdminKYCList(
  filters?: AdminKYCFilters,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: adminKycKeys.list(filters),
    queryFn: () => adminKycApi.list(filters),
    ...options,
  });
}

/**
 * Hook to fetch a single KYC document by ID
 *
 * @param id - KYC document ID
 * @param options - React Query options
 * @returns Query result with KYC document details
 *
 * @example
 * ```tsx
 * const { data: kyc, isLoading } = useAdminKYC(kycId);
 * ```
 */
export function useAdminKYC(
  id: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: adminKycKeys.detail(id),
    queryFn: () => adminKycApi.get(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Hook to fetch pending KYC documents (quick access for review queue)
 *
 * @param options - React Query options
 * @returns Query result with pending KYC documents
 *
 * @example
 * ```tsx
 * const { data: pending } = useAdminKYCPending();
 * ```
 */
export function useAdminKYCPending(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminKycKeys.pending(),
    queryFn: () => adminKycApi.getPending(),
    ...options,
  });
}

/**
 * Hook to fetch KYC statistics
 *
 * @param dateFrom - Optional start date (YYYY-MM-DD)
 * @param dateTo - Optional end date (YYYY-MM-DD)
 * @param options - React Query options
 * @returns Query result with KYC statistics
 *
 * @example
 * ```tsx
 * // All-time statistics
 * const { data: stats } = useAdminKYCStatistics();
 *
 * // Date range statistics
 * const { data: stats } = useAdminKYCStatistics('2024-01-01', '2024-12-31');
 * ```
 */
export function useAdminKYCStatistics(
  dateFrom?: string,
  dateTo?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: adminKycKeys.statisticsWithDates(dateFrom, dateTo),
    queryFn: () => adminKycApi.getStatistics(dateFrom, dateTo),
    ...options,
  });
}

/**
 * Hook to update KYC status (RECOMMENDED)
 *
 * Primary method for managing KYC status transitions.
 * Provides transparency and flexibility in the KYC review process.
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const { mutate: updateStatus, isPending } = useUpdateKYCStatus({
 *   onSuccess: () => {
 *     toast.success('KYC status updated');
 *   }
 * });
 *
 * // Start review
 * updateStatus({
 *   organizationId: 'org-123',
 *   data: {
 *     status: 'in_review',
 *     notes: 'Starting review process'
 *   }
 * });
 *
 * // Request more info
 * updateStatus({
 *   organizationId: 'org-123',
 *   data: {
 *     status: 'needs_more_info',
 *     reason: 'Please provide updated business registration',
 *     notes: 'Current certificate has expired'
 *   }
 * });
 *
 * // Approve
 * updateStatus({
 *   organizationId: 'org-123',
 *   data: {
 *     status: 'approved',
 *     notes: 'All documents verified'
 *   }
 * });
 * ```
 */
export function useUpdateKYCStatus(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: import('@/types/kyc').KYCStatusUpdateRequest;
    }) => adminKycApi.updateStatus(organizationId, data),
    onSuccess: (_, variables) => {
      // Invalidate all KYC queries to refresh data
      queryClient.invalidateQueries({ queryKey: adminKycKeys.all });

      // Show appropriate success message based on status
      const statusLabels: Record<string, string> = {
        in_review: 'KYC marked as in review',
        needs_more_info: 'More information requested',
        reviewed: 'KYC marked as reviewed',
        approved: 'KYC approved successfully',
        rejected: 'KYC rejected',
      };

      const message = statusLabels[variables.data.status] || 'KYC status updated';
      toast.success(message);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update KYC status');
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to approve KYC documents
 *
 * @deprecated Use useUpdateKYCStatus with status='approved' instead
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const { mutate: approve, isPending } = useApproveKYC({
 *   onSuccess: () => {
 *     toast.success('KYC approved successfully');
 *   }
 * });
 *
 * // Use it
 * approve({
 *   organizationId: 'org-123',
 *   data: {
 *     notes: 'All documents verified',
 *     approved_documents: ['doc-1', 'doc-2']
 *   }
 * });
 * ```
 */
export function useApproveKYC(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: KYCApproveRequest;
    }) => adminKycApi.approve(organizationId, data),
    onSuccess: () => {
      // Invalidate all KYC queries to refresh data
      queryClient.invalidateQueries({ queryKey: adminKycKeys.all });
      toast.success('KYC approved successfully');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve KYC');
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to reject KYC documents
 *
 * @deprecated Use useUpdateKYCStatus with status='rejected' instead
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const { mutate: reject, isPending } = useRejectKYC({
 *   onSuccess: () => {
 *     toast.success('KYC rejected');
 *   }
 * });
 *
 * // Use it
 * reject({
 *   organizationId: 'org-123',
 *   data: {
 *     reason: 'Document has expired',
 *     rejected_documents: ['doc-1']
 *   }
 * });
 * ```
 */
export function useRejectKYC(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: KYCRejectRequest;
    }) => adminKycApi.reject(organizationId, data),
    onSuccess: () => {
      // Invalidate all KYC queries to refresh data
      queryClient.invalidateQueries({ queryKey: adminKycKeys.all });
      toast.success('KYC rejected successfully');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject KYC');
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to export KYC documents
 *
 * @param options - Mutation options
 * @returns Mutation result
 *
 * @example
 * ```tsx
 * const { mutate: exportKYC, isPending } = useExportKYC();
 *
 * // Export to CSV
 * exportKYC({
 *   format: 'csv',
 *   filters: { status: 'approved' }
 * });
 *
 * // Export to Excel
 * exportKYC({
 *   format: 'xlsx',
 *   filters: { date_from: '2024-01-01' }
 * });
 * ```
 */
export function useExportKYC(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: async ({
      format,
      filters,
      filename,
    }: {
      format: KYCExportFormat;
      filters?: AdminKYCFilters;
      filename?: string;
    }) => {
      const blob = await adminKycApi.export(format, filters);
      adminKycApi.downloadExport(blob, format, filename);
      return blob;
    },
    onSuccess: () => {
      toast.success('Export downloaded successfully');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export KYC data');
      options?.onError?.(error);
    },
  });
}

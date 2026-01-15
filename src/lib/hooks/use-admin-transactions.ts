/**
 * Admin Transaction Management React Query Hooks
 *
 * Provides React Query hooks for managing admin transaction operations.
 * Includes caching, optimistic updates, and automatic refetching.
 *
 * @module lib/hooks/use-admin-transactions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminTransactionsApi,
  type Transaction,
  type TransactionFilters,
  type TransactionMetrics,
  type ExportFormat,
} from '@/lib/api/admin-transactions';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for admin transactions
 */
export const adminTransactionsKeys = {
  all: ['admin', 'transactions'] as const,
  lists: () => [...adminTransactionsKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) =>
    [...adminTransactionsKeys.lists(), filters] as const,
  details: () => [...adminTransactionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminTransactionsKeys.details(), id] as const,
  metrics: () => [...adminTransactionsKeys.all, 'metrics'] as const,
  metric: (filters: Omit<TransactionFilters, 'page' | 'per_page'>) =>
    [...adminTransactionsKeys.metrics(), filters] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch paginated list of transactions with filters
 *
 * @param filters - Transaction filters
 * @param options - React Query options
 * @returns Query result with transactions data
 *
 * @example
 * ```tsx
 * function TransactionsList() {
 *   const { data, isLoading, error } = useAdminTransactionsList({
 *     status: 'completed',
 *     page: 1,
 *     per_page: 20,
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       {data?.data.map(transaction => (
 *         <TransactionCard key={transaction.id} transaction={transaction} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminTransactionsList(
  filters: TransactionFilters = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<Transaction>, Error>({
    queryKey: adminTransactionsKeys.list(filters),
    queryFn: () => adminTransactionsApi.list(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to fetch a single transaction by ID
 *
 * @param id - Transaction ID
 * @param options - React Query options
 * @returns Query result with transaction details
 *
 * @example
 * ```tsx
 * function TransactionDetail({ transactionId }: { transactionId: string }) {
 *   const { data, isLoading } = useAdminTransaction(transactionId);
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <h1>Transaction {data?.data.reference}</h1>
 *       <p>Amount: {data?.data.amount}</p>
 *       <p>Status: {data?.data.status}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminTransaction(
  id: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ApiResponse<Transaction>, Error>({
    queryKey: adminTransactionsKeys.detail(id),
    queryFn: () => adminTransactionsApi.get(id),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? !!id,
  });
}

/**
 * Hook to fetch transaction metrics/statistics
 *
 * @param filters - Filters to scope metrics
 * @param options - React Query options
 * @returns Query result with metrics data
 *
 * @example
 * ```tsx
 * function TransactionMetrics() {
 *   const { data, isLoading } = useAdminTransactionMetrics({
 *     from_date: '2026-01-01',
 *     to_date: '2026-01-31',
 *   });
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <Card>
 *         <h3>Total Transactions</h3>
 *         <p>{data?.data.total_transactions}</p>
 *       </Card>
 *       <Card>
 *         <h3>Total Amount</h3>
 *         <p>${data?.data.total_amount}</p>
 *       </Card>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminTransactionMetrics(
  filters: Omit<TransactionFilters, 'page' | 'per_page'> = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<ApiResponse<TransactionMetrics>, Error>({
    queryKey: adminTransactionsKeys.metric(filters),
    queryFn: () => adminTransactionsApi.getMetrics(filters),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to export transactions to file
 *
 * @returns Mutation hook for exporting transactions
 *
 * @example
 * ```tsx
 * function ExportButton({ filters }: { filters: TransactionFilters }) {
 *   const { mutate: exportTransactions, isPending } = useExportTransactions();
 *
 *   const handleExport = (format: 'csv' | 'excel') => {
 *     exportTransactions({
 *       format,
 *       filters,
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <Button
 *         onClick={() => handleExport('csv')}
 *         disabled={isPending}
 *       >
 *         {isPending ? 'Exporting...' : 'Export CSV'}
 *       </Button>
 *       <Button
 *         onClick={() => handleExport('excel')}
 *         disabled={isPending}
 *       >
 *         {isPending ? 'Exporting...' : 'Export Excel'}
 *       </Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useExportTransactions() {
  return useMutation({
    mutationFn: async ({
      format,
      filters,
      columns,
    }: {
      format: ExportFormat;
      filters?: TransactionFilters;
      columns?: string[];
    }) => {
      const blob = await adminTransactionsApi.export({
        format,
        filters,
        columns,
      });

      // Automatically trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'pdf';
      a.download = `transactions_export_${timestamp}.${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast.success(`Successfully exported transactions as ${variables.format.toUpperCase()}`);
    },
    onError: (error: Error) => {
      console.error('Export error:', error);
      toast.error(`Failed to export transactions: ${error.message}`);
    },
  });
}

/**
 * Hook to prefetch transactions list (useful for pagination)
 *
 * @example
 * ```tsx
 * function TransactionsList() {
 *   const [page, setPage] = useState(1);
 *   const { data } = useAdminTransactionsList({ page, per_page: 20 });
 *   usePrefetchAdminTransactions({ page: page + 1, per_page: 20 });
 *
 *   // Next page will load instantly when user clicks
 * }
 * ```
 */
export function usePrefetchAdminTransactions(filters: TransactionFilters) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: adminTransactionsKeys.list(filters),
      queryFn: () => adminTransactionsApi.list(filters),
      staleTime: 30_000,
    });
  };
}

/**
 * Hook to invalidate transaction queries (useful after updates)
 *
 * @example
 * ```tsx
 * function TransactionActions() {
 *   const invalidateTransactions = useInvalidateTransactions();
 *
 *   const handleRefund = async (transactionId: string) => {
 *     await refundTransaction(transactionId);
 *     invalidateTransactions(); // Refresh all transaction data
 *     toast.success('Transaction refunded');
 *   };
 * }
 * ```
 */
export function useInvalidateTransactions() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: adminTransactionsKeys.all,
    });
  };
}

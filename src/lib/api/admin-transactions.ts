/**
 * Admin Transaction Management API Client
 *
 * Provides methods for admin users to manage and view all platform transactions.
 * Includes comprehensive filtering, metrics, and export capabilities.
 *
 * @module lib/api/admin-transactions
 */

import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Transaction status enumeration
 */
export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Payment gateway enumeration
 */
export type PaymentGateway =
  | 'stripe'
  | 'paystack'
  | 'flutterwave'
  | 'interswitch'
  | 'paypal';

/**
 * Transaction data structure
 */
export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  gateway: PaymentGateway;
  payment_method?: string;

  // Customer information
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;

  // Organization & Vendor
  organization_id?: string;
  organization_name?: string;
  vendor_id?: string;
  vendor_name?: string;

  // Metadata
  description?: string;
  metadata?: Record<string, any>;

  // Settlement
  settled: boolean;
  settled_at?: string;
  settlement_amount?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at?: string;

  // Additional fields
  fee_amount?: number;
  net_amount?: number;
  refund_amount?: number;
  failure_reason?: string;
}

/**
 * Transaction list filters
 */
export interface TransactionFilters extends PaginationParams {
  // Search
  search?: string; // Searches reference, customer_email, customer_name

  // Status & Gateway
  status?: TransactionStatus | TransactionStatus[];
  gateway?: PaymentGateway | PaymentGateway[];
  payment_method?: string;

  // Organization & Vendor
  organization_id?: string;
  vendor_id?: string;

  // Date Range
  from_date?: string; // ISO 8601 format
  to_date?: string;   // ISO 8601 format

  // Amount Range
  min_amount?: number;
  max_amount?: number;

  // Currency
  currency_code?: string;

  // Settlement
  settled?: boolean;

  // Sorting
  sort_by?: 'created_at' | 'amount' | 'status' | 'gateway';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Transaction metrics/statistics
 */
export interface TransactionMetrics {
  total_transactions: number;
  total_amount: number;
  completed_transactions: number;
  completed_amount: number;
  pending_transactions: number;
  pending_amount: number;
  failed_transactions: number;
  failed_amount: number;
  refunded_transactions: number;
  refunded_amount: number;

  // Average metrics
  average_transaction_value: number;

  // Gateway breakdown
  by_gateway?: Array<{
    gateway: PaymentGateway;
    count: number;
    amount: number;
  }>;

  // Status breakdown
  by_status?: Array<{
    status: TransactionStatus;
    count: number;
    amount: number;
  }>;

  // Period comparison (if date filters applied)
  previous_period?: {
    total_transactions: number;
    total_amount: number;
    growth_rate: number;
  };
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  filters?: TransactionFilters;
  columns?: string[];
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Admin Transaction API Client
 */
export const adminTransactionsApi = {
  /**
   * List all transactions with filters and pagination
   *
   * @param filters - Transaction filters
   * @returns Paginated list of transactions
   *
   * @example
   * ```typescript
   * const transactions = await adminTransactionsApi.list({
   *   status: 'completed',
   *   from_date: '2026-01-01',
   *   to_date: '2026-01-31',
   *   page: 1,
   *   per_page: 20,
   * });
   * ```
   */
  async list(
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    // Search
    if (filters.search) params.append('search', filters.search);

    // Status & Gateway
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => params.append('status[]', s));
      } else {
        params.append('status', filters.status);
      }
    }

    if (filters.gateway) {
      if (Array.isArray(filters.gateway)) {
        filters.gateway.forEach(g => params.append('gateway[]', g));
      } else {
        params.append('gateway', filters.gateway);
      }
    }

    if (filters.payment_method) {
      params.append('payment_method', filters.payment_method);
    }

    // Organization & Vendor
    if (filters.organization_id) {
      params.append('organization_id', filters.organization_id);
    }
    if (filters.vendor_id) {
      params.append('vendor_id', filters.vendor_id);
    }

    // Date Range
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    // Amount Range
    if (filters.min_amount !== undefined) {
      params.append('min_amount', filters.min_amount.toString());
    }
    if (filters.max_amount !== undefined) {
      params.append('max_amount', filters.max_amount.toString());
    }

    // Currency
    if (filters.currency_code) {
      params.append('currency_code', filters.currency_code);
    }

    // Settlement
    if (filters.settled !== undefined) {
      params.append('settled', filters.settled.toString());
    }

    // Sorting
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) {
      params.append('sort_direction', filters.sort_direction);
    }

    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      `/admin/transactions?${params.toString()}`
    );

    return response;
  },

  /**
   * Get a single transaction by ID
   *
   * @param id - Transaction ID
   * @returns Transaction details
   *
   * @example
   * ```typescript
   * const transaction = await adminTransactionsApi.get('txn_123');
   * ```
   */
  async get(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(
      `/admin/transactions/${id}`
    );

    return response;
  },

  /**
   * Get transaction metrics/statistics
   *
   * @param filters - Optional filters to scope metrics
   * @returns Transaction metrics
   *
   * @example
   * ```typescript
   * const metrics = await adminTransactionsApi.getMetrics({
   *   from_date: '2026-01-01',
   *   to_date: '2026-01-31',
   * });
   * ```
   */
  async getMetrics(
    filters: Omit<TransactionFilters, 'page' | 'per_page'> = {}
  ): Promise<TransactionMetrics> {
    const params = new URLSearchParams();

    // Apply same filters as list (except pagination)
    if (filters.search) params.append('search', filters.search);
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(s => params.append('status[]', s));
      } else {
        params.append('status', filters.status);
      }
    }
    if (filters.gateway) {
      if (Array.isArray(filters.gateway)) {
        filters.gateway.forEach(g => params.append('gateway[]', g));
      } else {
        params.append('gateway', filters.gateway);
      }
    }
    if (filters.organization_id) {
      params.append('organization_id', filters.organization_id);
    }
    if (filters.vendor_id) {
      params.append('vendor_id', filters.vendor_id);
    }
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.min_amount !== undefined) {
      params.append('min_amount', filters.min_amount.toString());
    }
    if (filters.max_amount !== undefined) {
      params.append('max_amount', filters.max_amount.toString());
    }
    if (filters.currency_code) {
      params.append('currency_code', filters.currency_code);
    }

    const response = await apiClient.get<TransactionMetrics>(
      `/admin/transactions/metrics?${params.toString()}`
    );

    return response;
  },

  /**
   * Export transactions to file
   *
   * @param options - Export options (format, filters, columns)
   * @returns Blob of exported file
   *
   * @example
   * ```typescript
   * const blob = await adminTransactionsApi.export({
   *   format: 'csv',
   *   filters: { status: 'completed' },
   * });
   *
   * // Trigger download
   * const url = URL.createObjectURL(blob);
   * const a = document.createElement('a');
   * a.href = url;
   * a.download = 'transactions.csv';
   * a.click();
   * ```
   */
  async export(options: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams();

    // Format
    params.append('format', options.format);

    // Apply filters if provided
    if (options.filters) {
      const filters = options.filters;

      if (filters.search) params.append('search', filters.search);
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          filters.status.forEach(s => params.append('status[]', s));
        } else {
          params.append('status', filters.status);
        }
      }
      if (filters.gateway) {
        if (Array.isArray(filters.gateway)) {
          filters.gateway.forEach(g => params.append('gateway[]', g));
        } else {
          params.append('gateway', filters.gateway);
        }
      }
      if (filters.organization_id) {
        params.append('organization_id', filters.organization_id);
      }
      if (filters.vendor_id) {
        params.append('vendor_id', filters.vendor_id);
      }
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
      if (filters.min_amount !== undefined) {
        params.append('min_amount', filters.min_amount.toString());
      }
      if (filters.max_amount !== undefined) {
        params.append('max_amount', filters.max_amount.toString());
      }
      if (filters.currency_code) {
        params.append('currency_code', filters.currency_code);
      }
      if (filters.settled !== undefined) {
        params.append('settled', filters.settled.toString());
      }
    }

    // Columns
    if (options.columns && options.columns.length > 0) {
      options.columns.forEach(col => params.append('columns[]', col));
    }

    const response = await apiClient.get(
      `/admin/transactions/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    return (response as Blob);
  },
};

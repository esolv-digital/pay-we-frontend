import type { Vendor } from './vendor';
import type { PaymentPage } from './payment-page';

// Transaction Status Types
export type TransactionStatus =
  | 'pending'
  | 'approved'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'chargeback'
  | 'expired'
  | 'processing'
  | 'on_hold'
  | 'exchange'
  | 'transfer'
  | 'paid'
  | 'refund'
  | 'gift';

// Payment Gateway Types
export type PaymentGateway = 'paystack' | 'wipay' | 'flutterwave';

// Payment Method Types
export type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer' | 'crypto';

// Date Range Types
export type DateRange =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | 'custom';

// Sort Field Types
export type TransactionSortField = 'created_at' | 'amount' | 'completed_at' | 'settled_at';

// Sort Direction Types
export type SortDirection = 'asc' | 'desc';

// Export Format Types
export type ExportFormat = 'csv' | 'excel';

// Payment Method Details
export interface PaymentMethodDetails {
  card_type?: string;
  last4?: string;
  bank?: string;
  [key: string]: unknown;
}

// Transaction Resource
export interface Transaction {
  id: string;
  reference: string;
  external_reference?: string;
  gateway: PaymentGateway;
  payment_method: PaymentMethod;
  payment_method_details?: PaymentMethodDetails;
  status: TransactionStatus;
  previous_status?: TransactionStatus;

  amount: number;
  currency_code: string;
  platform_fee: number;
  gateway_fee: number;
  net_amount: number;
  total_fees: number;

  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_ip?: string;

  settled: boolean;
  settled_at?: string;
  settlement_batch_id?: string;

  initiated_at: string;
  completed_at?: string;
  failed_at?: string;
  created_at: string;
  updated_at: string;

  failure_reason?: string;
  metadata?: Record<string, unknown>;
  idempotency_key?: string;

  vendor?: Vendor;
  payment_page?: PaymentPage;
  vendor_id?: string;
  payment_page_id?: string;

  // Computed fields
  is_completed?: boolean;
  is_pending?: boolean;
  is_failed?: boolean;
  can_be_settled?: boolean;

  // Payment Gateway Integration Fields
  authorization_url?: string;
  access_code?: string;
}

// Transaction Filters
export interface TransactionFilters {
  // Pagination
  per_page?: number;
  page?: number;

  // Status Filtering
  status?: TransactionStatus;
  statuses?: TransactionStatus[];

  // Date Filtering
  from_date?: string;
  to_date?: string;
  date_range?: DateRange;

  // Amount Filtering
  min_amount?: number;
  max_amount?: number;

  // Gateway Filtering
  gateway?: PaymentGateway;
  gateways?: PaymentGateway[];

  // Other Filters
  payment_method?: PaymentMethod;
  settled?: boolean;
  currency_code?: string;
  payment_page_id?: string;
  customer_email?: string;
  customer_phone?: string;

  // Search
  search?: string;

  // Sorting
  sort_by?: TransactionSortField;
  sort_direction?: SortDirection;
}

// Gateway Metrics
export interface GatewayMetrics {
  count: number;
  total_amount: number;
}

// Currency Metrics
export interface CurrencyMetrics {
  count: number;
  total_amount: number;
}

// Transaction Metrics
export interface TransactionMetrics {
  total_transactions: number;
  total_amount: number;
  total_net_amount: number;
  total_fees: number;
  total_platform_fees: number;
  total_gateway_fees: number;

  successful_transactions: number;
  successful_amount: number;
  pending_transactions: number;
  pending_amount: number;
  failed_transactions: number;
  failed_amount: number;
  refunded_transactions: number;
  refunded_amount: number;

  settled_transactions: number;
  settled_amount: number;
  unsettled_transactions: number;
  unsettled_amount: number;

  average_transaction_value: number;
  average_net_value: number;

  by_gateway: Record<string, GatewayMetrics>;
  by_currency: Record<string, CurrencyMetrics>;
}

// Transaction List Response Meta
export interface TransactionListMeta {
  current_page: number;
  from: number;
  to: number;
  per_page: number;
  total: number;
  last_page: number;
  filters_applied: TransactionFilters;
  vendor_id?: string;
  vendor_name?: string;
}

// Transaction List Response
export interface TransactionListResponse {
  transactions: Transaction[];
  meta: TransactionListMeta;
}

// Vendor Metrics Response
export interface VendorTransactionMetricsResponse {
  metrics: TransactionMetrics;
  vendor: {
    id: string;
    name: string;
    currency: string;
  };
  filters_applied: TransactionFilters;
}

// Export Summary
export interface ExportSummary {
  total_records: number;
  file_size_estimate: string;
  metrics: TransactionMetrics;
  filters_applied: TransactionFilters;
}

// Export Summary Response
export interface ExportSummaryResponse {
  summary: ExportSummary;
  vendor: {
    id: string;
    name: string;
  };
  can_export: boolean;
  max_records: number;
}

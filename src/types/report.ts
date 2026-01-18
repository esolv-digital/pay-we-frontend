/**
 * Report Types
 * Matches backend API: /vendors/{vendor}/reports endpoints
 */

export type ReportPeriod =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'last_week'
  | 'month'
  | 'last_month'
  | 'quarter'
  | 'year'
  | 'custom';

export type ReportType = 'summary' | 'transactions' | 'payouts' | 'full';

export type ReportGroupBy = 'hour' | 'day' | 'week' | 'month';

export interface ReportRequest {
  period: ReportPeriod;
  date_from?: string;
  date_to?: string;
  group_by?: ReportGroupBy;
  type?: ReportType;
}

export interface ReportVendor {
  id: string;
  name: string;
}

export interface ReportPeriodInfo {
  start: string;
  end: string;
  label: string;
}

export interface ReportSummary {
  total_transactions: number;
  total_revenue: number;
  net_revenue: number;
  total_fees: number;
  average_transaction: number;
  unique_customers: number;
}

export interface ReportTimeSeries {
  period: string;
  label: string;
  transaction_count: number;
  revenue: number;
  net_revenue: number;
}

export interface ReportPaymentMethod {
  method: string;
  transaction_count: number;
  revenue: number;
  percentage: number;
}

export interface ReportPayouts {
  total_payouts: number;
  total_amount: number;
  total_fees: number;
  by_status: Record<string, number>;
}

export interface ReportGrowth {
  revenue_growth_percentage: number;
  current_revenue: number;
  previous_revenue: number;
  comparison_period: {
    start: string;
    end: string;
  };
}

export interface Report {
  vendor: ReportVendor;
  period: ReportPeriodInfo;
  generated_at: string;
  summary: ReportSummary;
  time_series?: ReportTimeSeries[];
  by_payment_method?: ReportPaymentMethod[];
  payouts?: ReportPayouts;
  growth?: ReportGrowth;
}

export interface ExportReportParams {
  period: ReportPeriod;
  date_from?: string;
  date_to?: string;
}

// Report period options for UI
export const REPORT_PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'summary', label: 'Summary', description: 'Overview metrics and charts' },
  { value: 'transactions', label: 'Transactions', description: 'Transaction details only' },
  { value: 'payouts', label: 'Payouts', description: 'Payout history only' },
  { value: 'full', label: 'Full Report', description: 'Complete report with all data' },
];

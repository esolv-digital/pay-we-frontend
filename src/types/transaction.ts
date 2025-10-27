import type { Vendor } from './vendor';
import type { PaymentPage } from './payment-page';

export interface Transaction {
  id: string;
  vendor_id: string;
  payment_page_id?: string;
  reference: string;
  external_reference?: string;
  amount: number;
  currency_code: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  gateway: 'flutterwave' | 'paystack' | 'wipay';
  payment_method: 'card' | 'mobile_money' | 'bank_transfer' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  gateway_fee: number;
  platform_fee: number;
  net_amount: number;
  settled: boolean;
  settled_at?: string;
  initiated_at: string;
  completed_at?: string;
  failed_at?: string;
  failure_reason?: string;
  created_at: string;
  vendor?: Vendor;
  payment_page?: PaymentPage;
}

export interface TransactionFilters {
  status?: string;
  from_date?: string;
  to_date?: string;
  gateway?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

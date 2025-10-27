import type { Vendor } from './vendor';

export interface PaymentPage {
  id: string;
  vendor_id: string;
  title: string;
  slug: string;
  description?: string;
  amount_type: 'fixed' | 'flexible' | 'donation';
  fixed_amount?: number;
  min_amount?: number;
  max_amount?: number;
  currency_code: string;
  short_url: string;
  qr_code_path?: string;
  is_active: boolean;
  public_url: string;
  collect_customer_info: boolean;
  collect_shipping_address: boolean;
  allow_quantity: boolean;
  redirect_url?: string;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface CreatePaymentPageInput {
  title: string;
  slug: string;
  description?: string;
  amount_type: 'fixed' | 'flexible' | 'donation';
  fixed_amount?: number;
  min_amount?: number;
  max_amount?: number;
  currency_code: string;
  collect_customer_info?: boolean;
  collect_shipping_address?: boolean;
  allow_quantity?: boolean;
  redirect_url?: string;
}

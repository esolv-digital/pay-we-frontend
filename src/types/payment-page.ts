import type { Vendor } from './vendor';

export interface PaymentPageCustomization {
  primary_color?: string;
  background_color?: string;
  background_image_url?: string;
  logo_url?: string;
  custom_css?: string;
  button_text?: string;
  success_message?: string;
  show_vendor_info?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  store_url?: string; // Store/Website URL for post-payment redirect
}

export interface CustomField {
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'email' | 'tel';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

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
  custom_fields?: CustomField[];
  metadata?: {
    customization?: PaymentPageCustomization;
    [key: string]: string | number | boolean | null | PaymentPageCustomization | undefined;
  };
  // NEW FIELDS
  allowed_countries?: string[] | null; // Array of country codes
  allowed_payment_methods?: string[] | null; // Array of payment methods
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
  is_active?: boolean;
  custom_fields?: CustomField[];
  metadata?: {
    customization?: PaymentPageCustomization;
    [key: string]: string | number | boolean | null | PaymentPageCustomization | undefined;
  };
  // NEW FIELDS
  allowed_countries?: string[] | null;
  allowed_payment_methods?: string[] | null;
}

export interface UpdatePaymentPageInput extends Partial<CreatePaymentPageInput> {
  is_active?: boolean;
}

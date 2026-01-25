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
  // Fee handling - backend uses boolean field
  include_fees_in_amount: boolean; // true = customer pays fees (added to amount), false = vendor pays (deducted)
  // Fee breakdown from backend (based on country/gateway/organization settings)
  platform_fee_percentage?: number; // Percentage fee (e.g., 1.5 for 1.5%)
  gateway_fee_percentage?: number;  // Gateway percentage fee
  flat_fee_amount?: number;         // Flat fee amount (e.g., 0.50 for $0.50)
  // Computed total fee percentage for display (optional - backend may provide)
  total_fee_percentage?: number;
  // Country/payment method restrictions
  allowed_countries?: string[] | null;
  allowed_payment_methods?: string[] | null;
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
  // Fee handling - true = customer pays fees (added to amount), false = vendor pays (deducted)
  include_fees_in_amount?: boolean;
  // Country/payment method restrictions
  allowed_countries?: string[] | null;
  allowed_payment_methods?: string[] | null;
}

export interface UpdatePaymentPageInput extends Partial<CreatePaymentPageInput> {
  is_active?: boolean;
}

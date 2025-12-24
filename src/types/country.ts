/**
 * Country type definitions
 * Maps to Laravel Country model and /api/v1/countries API endpoints
 */

export enum Region {
  Africa = 'Africa',
  Caribbean = 'Caribbean',
  NorthAmerica = 'North America',
  SouthAmerica = 'South America',
  Europe = 'Europe',
  Asia = 'Asia',
  Oceania = 'Oceania',
}

export enum PaymentMethod {
  Card = 'card',
  BankTransfer = 'bank_transfer',
  MobileMoney = 'mobile_money',
  Ussd = 'ussd',
  Qr = 'qr',
}

/**
 * Country object from /api/v1/countries endpoint
 * Matches backend response structure exactly
 */
export interface Country {
  id: number;
  code: string; // ISO 3166-1 alpha-2 country code (e.g., "NG", "JM", "US")
  name: string;
  currency_code: string; // ISO 4217 currency code (e.g., "NGN", "USD")
  currency_symbol: string; // Currency symbol (e.g., "₦", "$")
  region: string; // Geographic region (e.g., "Africa", "Caribbean")
  phone_code: string; // International dialing code (e.g., "+234")
  is_active: boolean;
  can_send: boolean; // Whether country can initiate payments
  can_receive: boolean; // Whether country can receive payments
  platform_fee_percentage: string; // Platform fee for transactions
  min_transaction_amount: string; // Minimum allowed transaction amount
  max_transaction_amount: string; // Maximum allowed transaction amount
  payment_methods: CountryPaymentMethod[]; // Available payment methods (may be empty array)
  created_at: string;
  updated_at: string;
}

/**
 * Payment method object for a specific country
 * From /api/v1/countries/{code}/payment-methods endpoint
 */
export interface CountryPaymentMethod {
  id: number;
  payment_method: PaymentMethod; // Method identifier (e.g., "card", "bank_transfer")
  is_active: boolean; // Whether method is currently available
  is_default: boolean; // Whether this is the default payment method
  display_order: number; // Order to display methods (lower = higher priority)
  additional_fee_percentage: string; // Extra fee for this payment method
  metadata: Record<string, unknown> | null; // Additional configuration (varies by payment method)
}

/**
 * Region group from /api/v1/countries/regions endpoint
 */
export interface RegionGroup {
  region: string;
  countries: CountryBasic[];
}

/**
 * Basic country info within region groups
 */
export interface CountryBasic {
  code: string;
  name: string;
  currency_code: string;
  currency_symbol: string;
}

/**
 * Currency info from /api/v1/countries/currencies endpoint
 */
export interface CurrencyInfo {
  code: string; // ISO 4217 currency code
  symbol: string; // Currency symbol
  example_country: string; // Example country name
  example_country_code: string; // Example country code
}

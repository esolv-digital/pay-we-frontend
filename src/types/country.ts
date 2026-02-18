/**
 * Country type definitions
 * Maps to Laravel Country model and /api/v1/countries API endpoints
 *
 * Reference: backend/docs/COUNTRY_AND_FEE_SYSTEM_API.md
 */

export enum Region {
  Africa = 'africa',
  Caribbean = 'caribbean',
  NorthAmerica = 'north_america',
  SouthAmerica = 'south_america',
  Europe = 'europe',
  Asia = 'asia',
  Oceania = 'oceania',
}

/**
 * Payment methods supported per country.
 * Backend enum: card, bank, mobile_money, crypto
 */
export enum PaymentMethod {
  Card = 'card',
  Bank = 'bank',
  MobileMoney = 'mobile_money',
  Crypto = 'crypto',
}

/**
 * Gateway assigned to a country with its fee configuration.
 * Fees are tied to the country+gateway combination.
 */
export interface CountryGateway {
  id?: number;
  gateway: string;
  is_active: boolean;
  is_default: boolean;
  priority: number;
  fee_percentage: string;
  supports_payouts: boolean;
  supported_currencies: string[];
  supported_payment_methods: string[];
  metadata?: Record<string, unknown> | null;
}

/**
 * Country object from /api/v1/countries endpoint
 * Matches backend response structure exactly
 */
export interface Country {
  id: number;
  code: string; // ISO 3166-1 alpha-2 (e.g., "GH", "NG") — used in all URL paths
  name: string;
  currency_code: string; // ISO 4217 currency code (e.g., "NGN", "GHS")
  currency_symbol: string; // Currency symbol (e.g., "₦", "₵")
  region: string; // Geographic region (e.g., "africa", "caribbean")
  phone_code: string; // International dialing code (e.g., "+234")
  is_active: boolean;
  can_send: boolean; // Whether country can initiate payments
  can_receive: boolean; // Whether country can receive payments
  platform_fee_percentage: string; // PayWe's own platform fee %
  min_transaction_amount: string; // Minimum allowed transaction amount
  max_transaction_amount: string; // Maximum allowed transaction amount
  payment_methods: CountryPaymentMethod[];
  gateways?: CountryGateway[]; // Gateway assignments with per-gateway fees
  organizations_count?: number; // Number of orgs in this country (admin list only)
  created_at: string;
  updated_at: string;
}

/**
 * Payment method object for a specific country
 * From /api/v1/countries/{code}/payment-methods endpoint
 */
export interface CountryPaymentMethod {
  id: number;
  payment_method: PaymentMethod;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  additional_fee_percentage: string;
  metadata: Record<string, unknown> | null;
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
  code: string;
  symbol: string;
  example_country: string;
  example_country_code: string;
}

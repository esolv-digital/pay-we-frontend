/**
 * Country type definitions
 * Maps to Laravel Country model
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

export enum PaymentMethod {
  Bank = 'bank',
  MobileMoney = 'mobile_money',
  Card = 'card',
  Ussd = 'ussd',
  BankTransfer = 'bank_transfer',
  Qr = 'qr',
}

export interface Country {
  id: string;
  code: string; // 2-letter ISO code (e.g., "NG", "GH")
  name: string;
  region: Region;
  currency_code: string; // 3-letter code (e.g., "NGN", "USD")
  currency_name: string;
  currency_symbol: string;
  phone_prefix: string;
  can_send: boolean;
  can_receive: boolean;
  is_active: boolean;
  min_transaction_amount: number;
  max_transaction_amount: number;
  daily_transaction_limit: number | null;
  monthly_transaction_limit: number | null;
  payment_methods: CountryPaymentMethod[];
  created_at: string;
  updated_at: string;
}

export interface CountryPaymentMethod {
  id: string;
  country_id: string;
  payment_method: PaymentMethod;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface RegionGroup {
  region: Region;
  countries: Country[];
}

/**
 * Currency info from countries endpoint
 */
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  countries: string[];
}

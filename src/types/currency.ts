/**
 * Currency conversion types
 * Maps to Laravel CurrencyConversionRate model
 */

export enum ConversionRateSource {
  Manual = 'manual',
  Api = 'api',
  Calculated = 'calculated',
}

export interface CurrencyConversionRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  source: ConversionRateSource;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurrencyConversion {
  from_currency: string;
  to_currency: string;
  amount: number;
  converted_amount: number;
  rate: number;
  source: ConversionRateSource;
}

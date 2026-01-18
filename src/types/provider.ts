/**
 * Payment Provider Types
 * Matches backend API: /providers endpoint
 *
 * Providers are gateway-aware and fetched dynamically from PayStack/WePay
 * based on the organization's country and payment gateway.
 */

export type ProviderType = 'bank' | 'mobile_money';

export type PaymentMethodFilter = 'bank_transfer' | 'mobile_money';

export interface Provider {
  code: string;
  name: string;
  slug: string;
  type: ProviderType;
  active: boolean;
}

export interface ProvidersResponse {
  banks?: Provider[];
  mobile_money?: Provider[];
}

export interface ProvidersParams {
  country?: string;
  currency?: string;
  payment_method?: PaymentMethodFilter;
}

import type { Organization } from './auth';

export enum PayoutMethod {
  BankTransfer = 'bank_transfer',
  MobileMoney = 'mobile_money',
  Crypto = 'crypto',
}

export enum FeeBearer {
  Customer = 'customer',
  Vendor = 'vendor',
  Split = 'split',
}

export interface Vendor {
  id: string;
  organization_id: string;
  business_name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  currency_code: string;
  status: 'active' | 'inactive';
  balance: number;
  total_revenue: number;
  total_transactions: number;
  // NEW FIELDS
  payout_recipient?: string | null; // Bank account or mobile money number
  payout_method?: PayoutMethod | null;
  fee_bearer?: FeeBearer;
  fee_percentage?: number | null;
  custom_fee_amount?: number | null;
  created_at: string;
  organization?: Organization;
}

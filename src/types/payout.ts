/**
 * Payout Account Types
 * Matches backend API: /vendors/{vendor}/payout-accounts and /vendors/{vendor}/payouts endpoints
 */

export type PayoutAccountType = 'bank' | 'mobile_money';

export type MobileMoneyNetwork = 'mtn' | 'vodafone' | 'airteltigo';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode?: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

export interface PayoutAccount {
  id: string;
  type: PayoutAccountType;
  account_name: string;
  account_number?: string;
  bank_code?: string;
  bank_name?: string;
  phone_number?: string;
  network?: MobileMoneyNetwork;
  network_name?: string;
  is_default: boolean;
  is_verified: boolean;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface VerifyAccountRequest {
  account_type: PayoutAccountType;
  provider_code: string;
  account_number?: string;
  phone_number?: string;
}

export interface VerifyAccountResponse {
  account_name: string;
  account_number: string;
  bank_code: string;
}

export interface CreateBankAccountRequest {
  account_type: 'bank';
  account_name: string;
  account_number: string;
  provider_code: string;
  provider_name: string;
  is_default?: boolean;
}

export interface CreateMobileMoneyAccountRequest {
  account_type: 'mobile_money';
  account_name: string;
  phone_number: string;
  provider_code: string;
  provider_name: string;
  is_default?: boolean;
}

export type CreatePayoutAccountRequest =
  | CreateBankAccountRequest
  | CreateMobileMoneyAccountRequest;

export interface UpdatePayoutAccountRequest {
  account_name?: string;
  is_default?: boolean;
}

export interface Payout {
  id: string;
  batch_reference: string;
  gross_amount: number;
  fees_amount: number;
  net_amount: number;
  currency_code: string;
  payout_method: PayoutAccountType;
  payout_account?: {
    id: string;
    type: PayoutAccountType;
    account_name: string;
    account_number?: string;
  };
  payout_details?: {
    account_name: string;
    account_number?: string;
    bank_name?: string;
    phone_number?: string;
    network_name?: string;
  };
  description?: string;
  status: PayoutStatus;
  status_label: string;
  created_at: string;
  processed_at?: string;
  completed_at?: string;
}

export interface RequestPayoutRequest {
  amount: number;
  payout_account_id: string;
  description?: string;
}

export interface PayoutFilters {
  status?: PayoutStatus;
  from_date?: string;
  to_date?: string;
  per_page?: number;
  page?: number;
}

export interface VendorBalance {
  balance: number;
  currency_code: string;
  formatted_balance: string;
}

// Legacy type aliases for backward compatibility
export type MobileMoneyProvider = MobileMoneyNetwork;

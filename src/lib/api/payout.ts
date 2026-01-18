import { apiClient } from './client';
import type {
  Bank,
  PayoutAccount,
  VerifyAccountRequest,
  VerifyAccountResponse,
  CreatePayoutAccountRequest,
  UpdatePayoutAccountRequest,
  Payout,
  RequestPayoutRequest,
  PayoutFilters,
  VendorBalance,
  PaginatedResponse,
} from '@/types';

// ============================================================================
// API CLIENT
// ============================================================================

export const payoutApi = {
  /**
   * Get available banks for payout accounts
   * GET /banks?country={country}&currency={currency}
   */
  getBanks: async (country: string = 'GH', currency?: string): Promise<Bank[]> => {
    const params: Record<string, string> = { country };
    if (currency) params.currency = currency;
    return apiClient.get<Bank[]>('/banks', { params });
  },

  /**
   * Verify bank account before saving
   * POST /vendors/{vendor}/payout-accounts/verify
   */
  verifyAccount: async (
    vendorSlug: string,
    data: VerifyAccountRequest
  ): Promise<VerifyAccountResponse> => {
    return apiClient.post<VerifyAccountResponse>(
      `/vendors/${vendorSlug}/payout-accounts/verify`,
      data
    );
  },

  /**
   * Get all payout accounts for a vendor
   * GET /vendors/{vendor}/payout-accounts
   */
  getPayoutAccounts: async (vendorSlug: string): Promise<PayoutAccount[]> => {
    return apiClient.get<PayoutAccount[]>(`/vendors/${vendorSlug}/payout-accounts`);
  },

  /**
   * Get a single payout account
   * GET /vendors/{vendor}/payout-accounts/{id}
   */
  getPayoutAccount: async (
    vendorSlug: string,
    accountId: string
  ): Promise<PayoutAccount> => {
    return apiClient.get<PayoutAccount>(
      `/vendors/${vendorSlug}/payout-accounts/${accountId}`
    );
  },

  /**
   * Add a new payout account
   * POST /vendors/{vendor}/payout-accounts
   */
  createPayoutAccount: async (
    vendorSlug: string,
    data: CreatePayoutAccountRequest
  ): Promise<PayoutAccount> => {
    return apiClient.post<PayoutAccount>(
      `/vendors/${vendorSlug}/payout-accounts`,
      data
    );
  },

  /**
   * Update a payout account
   * PUT /vendors/{vendor}/payout-accounts/{id}
   */
  updatePayoutAccount: async (
    vendorSlug: string,
    accountId: string,
    data: UpdatePayoutAccountRequest
  ): Promise<PayoutAccount> => {
    return apiClient.put<PayoutAccount>(
      `/vendors/${vendorSlug}/payout-accounts/${accountId}`,
      data
    );
  },

  /**
   * Delete a payout account
   * DELETE /vendors/{vendor}/payout-accounts/{id}
   */
  deletePayoutAccount: async (
    vendorSlug: string,
    accountId: string
  ): Promise<void> => {
    await apiClient.delete(`/vendors/${vendorSlug}/payout-accounts/${accountId}`);
  },

  /**
   * Get vendor balance
   * GET /vendors/{vendor}/payouts/balance
   */
  getBalance: async (vendorSlug: string): Promise<VendorBalance> => {
    return apiClient.get<VendorBalance>(`/vendors/${vendorSlug}/payouts/balance`);
  },

  /**
   * List payouts for a vendor
   * GET /vendors/{vendor}/payouts
   */
  getPayouts: async (
    vendorSlug: string,
    filters?: PayoutFilters
  ): Promise<PaginatedResponse<Payout>> => {
    return apiClient.get<PaginatedResponse<Payout>>(
      `/vendors/${vendorSlug}/payouts`,
      { params: filters }
    );
  },

  /**
   * Request a payout
   * POST /vendors/{vendor}/payouts
   */
  requestPayout: async (
    vendorSlug: string,
    data: RequestPayoutRequest
  ): Promise<Payout> => {
    return apiClient.post<Payout>(`/vendors/${vendorSlug}/payouts`, data);
  },

  /**
   * Get single payout details
   * GET /vendors/{vendor}/payouts/{id}
   */
  getPayout: async (vendorSlug: string, payoutId: string): Promise<Payout> => {
    return apiClient.get<Payout>(`/vendors/${vendorSlug}/payouts/${payoutId}`);
  },
};

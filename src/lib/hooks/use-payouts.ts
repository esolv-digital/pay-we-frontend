import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payoutApi } from '@/lib/api/payout';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { useRequiredVendorSlug } from './use-vendor-slug';
import type {
  VerifyAccountRequest,
  CreatePayoutAccountRequest,
  UpdatePayoutAccountRequest,
  RequestPayoutRequest,
  PayoutFilters,
} from '@/types';

// ============================================================================
// DISBURSEMENT STATISTICS HOOKS
// ============================================================================

/**
 * Hook to fetch detailed disbursement statistics
 * Includes available balance, pending payouts, unsettled transactions, auto-payout status
 */
export function useDisbursementStatistics() {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['disbursement-statistics', vendorSlug],
    queryFn: () => payoutApi.getStatistics(vendorSlug!),
    enabled: !!vendorSlug,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch recent settlements/payouts
 */
export function useRecentSettlements(limit: number = 10) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['recent-settlements', vendorSlug, limit],
    queryFn: () => payoutApi.getRecentSettlements(vendorSlug!, limit),
    enabled: !!vendorSlug,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to toggle auto-payout setting
 */
export function useToggleAutoPayout() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      payoutApi.toggleAutoPayout(vendorSlug!, enabled),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['disbursement-statistics', vendorSlug] });
      showSuccess(data.message);
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// ============================================================================
// BANK HOOKS
// ============================================================================

/**
 * Hook to fetch available banks for a country
 */
export function useBanks(country: string = 'GH', currency?: string) {
  return useQuery({
    queryKey: ['banks', country, currency],
    queryFn: () => payoutApi.getBanks(country, currency),
    enabled: !!country,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });
}

// ============================================================================
// BALANCE HOOKS
// ============================================================================

/**
 * Hook to fetch vendor balance
 */
export function useVendorBalance() {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['vendor-balance', vendorSlug],
    queryFn: () => payoutApi.getBalance(vendorSlug!),
    enabled: !!vendorSlug,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// PAYOUT ACCOUNT HOOKS
// ============================================================================

/**
 * Hook to verify a bank account before saving
 */
export function useVerifyAccount() {
  const vendorSlug = useRequiredVendorSlug();

  return useMutation({
    mutationFn: (data: VerifyAccountRequest) =>
      payoutApi.verifyAccount(vendorSlug!, data),
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to fetch all payout accounts for a vendor
 */
export function usePayoutAccounts() {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['payout-accounts', vendorSlug],
    queryFn: () => payoutApi.getPayoutAccounts(vendorSlug!),
    enabled: !!vendorSlug,
  });
}

/**
 * Hook to create a new payout account
 */
export function useCreatePayoutAccount() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayoutAccountRequest) =>
      payoutApi.createPayoutAccount(vendorSlug!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['disbursement-statistics', vendorSlug] });
      showSuccess('Payout account added successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to update a payout account
 */
export function useUpdatePayoutAccount() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, data }: { accountId: string; data: UpdatePayoutAccountRequest }) =>
      payoutApi.updatePayoutAccount(vendorSlug!, accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['disbursement-statistics', vendorSlug] });
      showSuccess('Payout account updated successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to delete a payout account
 */
export function useDeletePayoutAccount() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      payoutApi.deletePayoutAccount(vendorSlug!, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['disbursement-statistics', vendorSlug] });
      showSuccess('Payout account removed successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to set an account as default
 */
export function useSetDefaultPayoutAccount() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      payoutApi.updatePayoutAccount(vendorSlug!, accountId, { is_default: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['disbursement-statistics', vendorSlug] });
      showSuccess('Default payout account updated!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// ============================================================================
// PAYOUT REQUEST HOOKS
// ============================================================================

/**
 * Hook to request a payout
 */
export function useRequestPayout() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestPayoutRequest) =>
      payoutApi.requestPayout(vendorSlug!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['vendor-balance', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['disbursement-statistics', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['recent-settlements', vendorSlug] });
      showSuccess('Payout request submitted successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to fetch payout history
 */
export function usePayouts(filters?: PayoutFilters) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['payouts', vendorSlug, filters],
    queryFn: () => payoutApi.getPayouts(vendorSlug!, filters),
    enabled: !!vendorSlug,
  });
}

/**
 * Hook to fetch a single payout
 */
export function usePayout(payoutId: string) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['payout', vendorSlug, payoutId],
    queryFn: () => payoutApi.getPayout(vendorSlug!, payoutId),
    enabled: !!vendorSlug && !!payoutId,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { twoFactorApi } from '@/lib/api/two-factor';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type { TwoFactorConfirmRequest, TwoFactorDisableRequest } from '@/types';

/**
 * Hook to get 2FA status
 */
export function use2FAStatus() {
  return useQuery({
    queryKey: ['2fa-status'],
    queryFn: () => twoFactorApi.getStatus(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to enable/initiate 2FA setup
 */
export function useEnable2FA() {
  return useMutation({
    mutationFn: () => twoFactorApi.enable(),
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to confirm 2FA setup with TOTP code
 */
export function useConfirm2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TwoFactorConfirmRequest) => twoFactorApi.confirm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess('Two-factor authentication enabled successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to disable 2FA
 */
export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TwoFactorDisableRequest) => twoFactorApi.disable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess('Two-factor authentication disabled.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to regenerate recovery codes
 */
export function useRegenerateRecoveryCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => twoFactorApi.regenerateRecoveryCodes(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      showSuccess('Recovery codes regenerated. Previous codes are now invalid.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to verify 2FA code during login
 */
export function useVerify2FALogin() {
  return useMutation({
    mutationFn: (code: string) => twoFactorApi.verifyLogin({ code }),
    onError: (error) => {
      showApiError(error);
    },
  });
}

// Legacy aliases for backward compatibility
export const useSetup2FA = useEnable2FA;
export const useVerify2FASetup = useConfirm2FA;

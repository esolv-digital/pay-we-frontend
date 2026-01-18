import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAuthApi } from '@/lib/api/social-auth';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type { SocialProvider, SocialAuthUnlinkRequest } from '@/types';

/**
 * Hook to fetch connected social accounts
 */
export function useSocialAccounts() {
  return useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => socialAuthApi.getSocialAccounts(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to link Google account
 * Note: This redirects to Google OAuth, so no mutation needed
 */
export function useLinkGoogleAccount() {
  return {
    linkGoogle: () => socialAuthApi.linkAccount('google'),
    linkGooglePopup: () => socialAuthApi.linkAccountPopup('google'),
  };
}

/**
 * Hook to unlink a social account
 */
export function useUnlinkSocialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      provider,
      data,
    }: {
      provider: SocialProvider;
      data?: SocialAuthUnlinkRequest;
    }) => socialAuthApi.unlinkAccount(provider, data),
    onSuccess: (_, { provider }) => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked successfully.`);
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to unlink Google account specifically
 */
export function useUnlinkGoogleAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password?: string) =>
      socialAuthApi.unlinkAccount('google', password ? { password } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess('Google account unlinked successfully.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook for checking if Google is connected
 */
export function useIsGoogleConnected() {
  const { data: socialAccounts } = useSocialAccounts();
  const googleAccount = socialAccounts?.accounts.find((a) => a.provider === 'google');
  return googleAccount?.connected ?? false;
}

/**
 * Hook for social auth actions (convenience wrapper)
 */
export function useSocialAuth() {
  const { data: socialAccounts, isLoading } = useSocialAccounts();
  const { linkGoogle, linkGooglePopup } = useLinkGoogleAccount();
  const unlinkGoogle = useUnlinkGoogleAccount();

  const googleAccount = socialAccounts?.accounts.find((a) => a.provider === 'google');
  const isGoogleConnected = googleAccount?.connected ?? false;
  const hasPassword = socialAccounts?.has_password ?? true;

  return {
    isLoading,
    isGoogleConnected,
    hasPassword,
    googleConnectedAt: googleAccount?.connected_at,
    linkGoogle,
    linkGooglePopup,
    unlinkGoogle: (password?: string) => unlinkGoogle.mutate(password),
    isUnlinking: unlinkGoogle.isPending,
  };
}

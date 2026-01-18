import { apiClient } from './client';
import type {
  SocialProvider,
  SocialAccountsResponse,
  SocialAuthUnlinkRequest,
  SocialAuthUnlinkResponse,
} from '@/types';

// ============================================================================
// API CLIENT
// ============================================================================

export const socialAuthApi = {
  /**
   * Get all connected social accounts
   * GET /profile/social-accounts
   */
  getSocialAccounts: async (): Promise<SocialAccountsResponse> => {
    return apiClient.get<SocialAccountsResponse>('/profile/social-accounts');
  },

  /**
   * Link a social account (redirects to OAuth provider)
   * GET /profile/social-accounts/{provider}/link
   */
  linkAccount: (provider: SocialProvider): void => {
    // Redirect to the OAuth link endpoint
    window.location.href = `/api/profile/social-accounts/${provider}/link`;
  },

  /**
   * Open link flow in popup window
   */
  linkAccountPopup: (provider: SocialProvider): void => {
    window.open(
      `/api/profile/social-accounts/${provider}/link`,
      `${provider}-link`,
      'width=600,height=700'
    );
  },

  /**
   * Unlink a social account
   * DELETE /profile/social-accounts/{provider}
   */
  unlinkAccount: async (
    provider: SocialProvider,
    data?: SocialAuthUnlinkRequest
  ): Promise<SocialAuthUnlinkResponse> => {
    return apiClient.delete<SocialAuthUnlinkResponse>(
      `/profile/social-accounts/${provider}`,
      { data }
    );
  },

  /**
   * Check if a specific provider is connected
   */
  isProviderConnected: async (provider: SocialProvider): Promise<boolean> => {
    const response = await socialAuthApi.getSocialAccounts();
    const account = response.accounts.find((a) => a.provider === provider);
    return account?.connected ?? false;
  },
};

import { apiClient } from './client';
import type {
  TwoFactorStatus,
  TwoFactorEnableResponse,
  TwoFactorConfirmRequest,
  TwoFactorConfirmResponse,
  TwoFactorDisableRequest,
  TwoFactorRecoveryCodesResponse,
  TwoFactorVerifyLoginRequest,
} from '@/types';

// ============================================================================
// API CLIENT
// ============================================================================

export const twoFactorApi = {
  /**
   * Get 2FA status
   * GET /profile/two-factor/status
   */
  getStatus: async (): Promise<TwoFactorStatus> => {
    return apiClient.get<TwoFactorStatus>('/profile/two-factor/status');
  },

  /**
   * Enable 2FA - generates secret and QR code
   * POST /profile/two-factor/enable
   */
  enable: async (): Promise<TwoFactorEnableResponse> => {
    return apiClient.post<TwoFactorEnableResponse>('/profile/two-factor/enable');
  },

  /**
   * Confirm 2FA setup with TOTP code from authenticator app
   * POST /profile/two-factor/confirm
   */
  confirm: async (data: TwoFactorConfirmRequest): Promise<TwoFactorConfirmResponse> => {
    return apiClient.post<TwoFactorConfirmResponse>('/profile/two-factor/confirm', data);
  },

  /**
   * Disable 2FA (requires password confirmation)
   * POST /profile/two-factor/disable
   */
  disable: async (data: TwoFactorDisableRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/profile/two-factor/disable', data);
  },

  /**
   * Regenerate recovery codes
   * POST /profile/two-factor/recovery-codes
   */
  regenerateRecoveryCodes: async (): Promise<TwoFactorRecoveryCodesResponse> => {
    return apiClient.post<TwoFactorRecoveryCodesResponse>('/profile/two-factor/recovery-codes');
  },

  /**
   * Verify 2FA code during login flow
   * POST /auth/two-factor/verify
   */
  verifyLogin: async (data: TwoFactorVerifyLoginRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/two-factor/verify', data);
  },

  // Legacy method names for backward compatibility
  initiateSetup: async (): Promise<TwoFactorEnableResponse> => {
    return twoFactorApi.enable();
  },

  verifySetup: async (data: TwoFactorConfirmRequest): Promise<TwoFactorConfirmResponse> => {
    return twoFactorApi.confirm(data);
  },
};

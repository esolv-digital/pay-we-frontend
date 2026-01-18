/**
 * Two-Factor Authentication Types
 * Matches backend API: /profile/two-factor/* endpoints
 */

export interface TwoFactorStatus {
  enabled: boolean;
  confirmed: boolean;
  recovery_codes_count: number;
}

export interface TwoFactorEnableResponse {
  secret: string;
  qr_code_url: string;
}

export interface TwoFactorConfirmRequest {
  code: string;
}

export interface TwoFactorConfirmResponse {
  recovery_codes: string[];
}

export interface TwoFactorDisableRequest {
  password: string;
}

export interface TwoFactorRecoveryCodesResponse {
  recovery_codes: string[];
}

export interface TwoFactorVerifyLoginRequest {
  code: string;
}

// Legacy aliases for backward compatibility
export type TwoFactorSetupResponse = TwoFactorEnableResponse;
export type TwoFactorVerifySetupRequest = TwoFactorConfirmRequest;
export type RegenerateRecoveryCodesResponse = TwoFactorRecoveryCodesResponse;

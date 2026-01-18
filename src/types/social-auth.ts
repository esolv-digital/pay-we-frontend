/**
 * Social Authentication Types
 * Matches backend API: /profile/social-accounts endpoints
 */

export type SocialProvider = 'google';

export interface SocialAccount {
  provider: SocialProvider;
  connected: boolean;
  connected_at?: string;
}

export interface SocialAccountsResponse {
  accounts: SocialAccount[];
  has_password: boolean;
}

export interface SocialAuthUnlinkRequest {
  password?: string;
}

export interface SocialAuthUnlinkResponse {
  provider: SocialProvider;
  connected: boolean;
}

// Legacy types for backward compatibility
export type SocialAuthAction = 'login' | 'register' | 'link';

export interface SocialAuthInitiateResponse {
  redirect_url: string;
}

export interface SocialAuthCallbackResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    google_connected: boolean;
    requires_onboarding?: boolean;
  };
  access_token: string;
  token_type: string;
}

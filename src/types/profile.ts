/**
 * Profile Types
 * Matches backend API: /profile endpoints
 */

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  email_verified_at?: string;
  two_factor_enabled: boolean;
  google_connected: boolean;
  created_at: string;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ChangeEmailRequest {
  email: string;
  password: string;
}

export interface AvatarUploadResponse {
  avatar_url: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface OnboardingData {
  name: string;
  type?: 'individual' | 'corporate';
  country_code: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  token_type: string;
  requires_onboarding?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'suspended' | 'inactive';
  email_verified_at?: string;
  phone_verified_at?: string;
  two_factor_enabled: boolean;
  last_login_at?: string;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  organizations?: Organization[];
  roles?: Role[];
  permissions?: string[];

  // Computed property
  full_name?: string;
}

export interface Organization {
  id: string;
  name: string;
  short_name?: string;
  legal_name?: string;
  type: 'individual' | 'corporate';
  industry?: string;
  country_code: string;
  region: 'africa' | 'caribbean' | 'global';
  tax_id?: string;
  registration_number?: string;
  status: 'active' | 'suspended' | 'inactive';
  kyc_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  kyc_submitted_at?: string;
  kyc_reviewed_at?: string;
  kyc_approved_at?: string;
  kyc_rejected_at?: string;
  kyc_expiry_date?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id?: string;
  name: string;
}

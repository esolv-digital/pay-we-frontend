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
  contexts?: UserContexts;
  default_context?: ContextType;
}

export type ContextType = 'admin' | 'vendor';

export interface UserContexts {
  admin: boolean;
  vendor: boolean;
}

export interface AdminDetails {
  is_super_admin: boolean;
  is_platform_admin: boolean;
  platform_roles: import('./permissions').Role[];
  platform_permissions: import('./permissions').PermissionWithSource[];
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  organization_name: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  joined_at: string;
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

  // Admin and context details
  admin?: AdminDetails;
  organization_memberships?: OrganizationMembership[];
  has_admin_access?: boolean;
  has_vendor_access?: boolean;
  vendors?: OrganizationVendor[];

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
  status: 'active' | 'suspended' | 'inactive' | 'pending';
  kyc_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  kyc_submitted_at?: string;
  kyc_reviewed_at?: string;
  kyc_approved_at?: string;
  kyc_rejected_at?: string;
  kyc_expiry_date?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  vendors?: OrganizationVendor[];
}

export interface OrganizationVendor {
  id: string;
  business_name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  support_email?: string;
  support_phone?: string;
  currency_code: string;
  payment_methods: ('card' | 'mobile_money' | 'bank_transfer' | 'crypto')[];
  status: 'active' | 'inactive';
  is_active: boolean;
  is_test_mode: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id?: string;
  name: string;
}

// Role assignment request
export interface AssignRolesRequest {
  user_id: number;
  roles: string[]; // Array of role names
}

// Permission assignment request
export interface AssignPermissionsRequest {
  user_id: number;
  permissions: string[]; // Array of permission names
}

// Context switching types
export interface SwitchContextRequest {
  context_type: ContextType;
  password?: string;
  require_verification?: boolean;
}

export interface SwitchContextResponse {
  user: AuthUser;
  access_token: string;
  token_type: string;
  context: ContextType;
}

export interface VerifyPasswordRequest {
  password: string;
}

export interface VerifyPasswordResponse {
  verified: boolean;
}

export interface GetContextsResponse {
  contexts: UserContexts;
  default_context: ContextType;
}

/**
 * Admin Login Attempts & Security API Service
 *
 * Handles all login attempt monitoring and security-related operations.
 * ISO 27001 compliant with comprehensive audit logging.
 */

import { apiClient } from './client';
import type { PaginationMeta } from '@/types';

// Simplified paginated response for admin endpoints (without links)
export interface AdminPaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// =============================================================================
// TYPES
// =============================================================================

export interface LoginAttemptUser {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

export interface LoginAttempt {
  id: string;
  user_id: string | null;
  user: LoginAttemptUser | null;
  email: string;
  ip_address: string;
  user_agent: string;
  device_fingerprint: string | null;
  country_code: string | null;
  city: string | null;
  location: string | null;
  successful: boolean;
  is_suspicious: boolean;
  suspicious_reasons: string[] | null;
  notification_sent: boolean;
  created_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  user: LoginAttemptUser | null;
  device_fingerprint: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string | null;
  os: string | null;
  ip_address: string;
  country_code: string | null;
  city: string | null;
  is_trusted: boolean;
  last_seen_at: string;
  created_at: string;
}

export interface LoginAttemptStatistics {
  period: {
    from: string;
    to: string;
  };
  totals: {
    total: number;
    successful: number;
    failed: number;
    suspicious: number;
  };
  by_country: Record<string, number>;
  suspicious_reasons: Record<string, number>;
  unique_ips: number;
  unique_users: number;
}

export interface DailyLoginData {
  successful: number;
  failed: number;
  suspicious: number;
}

export interface LoginAttemptFilters {
  user_id?: string;
  email?: string;
  ip_address?: string;
  country_code?: string;
  successful?: boolean;
  is_suspicious?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'email' | 'ip_address' | 'country_code';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface DeviceFilters {
  user_id?: string;
  is_trusted?: boolean;
  per_page?: number;
  page?: number;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * List all login attempts with filtering
 */
export async function list(
  filters?: LoginAttemptFilters
): Promise<AdminPaginatedResponse<LoginAttempt>> {
  const result = await apiClient.get<{ attempts: LoginAttempt[]; meta: PaginationMeta }>(
    '/admin/login-attempts',
    { params: filters }
  );

  return {
    data: result.attempts,
    meta: result.meta,
  };
}

/**
 * Get suspicious login attempts only
 */
export async function getSuspicious(
  filters?: Pick<LoginAttemptFilters, 'user_id' | 'per_page' | 'page'>
): Promise<AdminPaginatedResponse<LoginAttempt>> {
  const result = await apiClient.get<{ attempts: LoginAttempt[]; meta: PaginationMeta }>(
    '/admin/login-attempts/suspicious',
    { params: filters }
  );

  return {
    data: result.attempts,
    meta: result.meta,
  };
}

/**
 * Get single login attempt details
 */
export async function get(attemptId: string): Promise<LoginAttempt> {
  return apiClient.get<LoginAttempt>(`/admin/login-attempts/${attemptId}`);
}

/**
 * Get login attempt statistics
 */
export async function getStatistics(params?: {
  date_from?: string;
  date_to?: string;
}): Promise<LoginAttemptStatistics> {
  return apiClient.get<LoginAttemptStatistics>('/admin/login-attempts/statistics', { params });
}

/**
 * Get daily login attempt counts for charting
 */
export async function getDaily(
  days: number = 30
): Promise<Record<string, DailyLoginData>> {
  return apiClient.get<Record<string, DailyLoginData>>(
    '/admin/login-attempts/daily',
    { params: { days } }
  );
}

/**
 * List user devices
 */
export async function getDevices(
  filters?: DeviceFilters
): Promise<AdminPaginatedResponse<UserDevice>> {
  const result = await apiClient.get<{ devices: UserDevice[]; meta: PaginationMeta }>(
    '/admin/login-attempts/devices',
    { params: filters }
  );

  return {
    data: result.devices,
    meta: result.meta,
  };
}

// =============================================================================
// EXPORT NAMESPACE
// =============================================================================

export const adminLoginAttemptsApi = {
  list,
  getSuspicious,
  get,
  getStatistics,
  getDaily,
  getDevices,
};

export default adminLoginAttemptsApi;

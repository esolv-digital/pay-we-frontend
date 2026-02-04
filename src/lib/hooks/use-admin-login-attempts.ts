/**
 * Admin Login Attempts & Security React Query Hooks
 *
 * Provides data fetching and caching for login attempts and security monitoring.
 */

import { useQuery } from '@tanstack/react-query';
import { adminLoginAttemptsApi } from '@/lib/api/admin-login-attempts';
import type {
  LoginAttemptFilters,
  DeviceFilters,
  LoginAttempt,
  UserDevice,
  LoginAttemptStatistics,
  DailyLoginData,
  AdminPaginatedResponse,
} from '@/lib/api/admin-login-attempts';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const loginAttemptsKeys = {
  all: ['admin', 'login-attempts'] as const,
  lists: () => [...loginAttemptsKeys.all, 'list'] as const,
  list: (filters: LoginAttemptFilters) =>
    [...loginAttemptsKeys.lists(), filters] as const,
  suspicious: (filters?: Pick<LoginAttemptFilters, 'user_id' | 'per_page' | 'page'>) =>
    [...loginAttemptsKeys.all, 'suspicious', filters] as const,
  details: () => [...loginAttemptsKeys.all, 'detail'] as const,
  detail: (id: string) => [...loginAttemptsKeys.details(), id] as const,
  statistics: (params?: { date_from?: string; date_to?: string }) =>
    [...loginAttemptsKeys.all, 'statistics', params] as const,
  daily: (days: number) => [...loginAttemptsKeys.all, 'daily', days] as const,
  devices: (filters?: DeviceFilters) =>
    [...loginAttemptsKeys.all, 'devices', filters] as const,
};

// =============================================================================
// QUERY HOOKS
// =============================================================================

/**
 * Hook to fetch paginated list of login attempts
 */
export function useLoginAttemptsList(
  filters: LoginAttemptFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery<AdminPaginatedResponse<LoginAttempt>, Error>({
    queryKey: loginAttemptsKeys.list(filters),
    queryFn: () => adminLoginAttemptsApi.list(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch suspicious login attempts
 */
export function useSuspiciousAttempts(
  filters?: Pick<LoginAttemptFilters, 'user_id' | 'per_page' | 'page'>,
  options?: { enabled?: boolean }
) {
  return useQuery<AdminPaginatedResponse<LoginAttempt>, Error>({
    queryKey: loginAttemptsKeys.suspicious(filters),
    queryFn: () => adminLoginAttemptsApi.getSuspicious(filters),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch single login attempt details
 */
export function useLoginAttempt(attemptId: string, options?: { enabled?: boolean }) {
  return useQuery<LoginAttempt, Error>({
    queryKey: loginAttemptsKeys.detail(attemptId),
    queryFn: () => adminLoginAttemptsApi.get(attemptId),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!attemptId,
  });
}

/**
 * Hook to fetch login attempt statistics
 */
export function useLoginAttemptStatistics(
  params?: { date_from?: string; date_to?: string },
  options?: { enabled?: boolean }
) {
  return useQuery<LoginAttemptStatistics, Error>({
    queryKey: loginAttemptsKeys.statistics(params),
    queryFn: () => adminLoginAttemptsApi.getStatistics(params),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch daily login data for charts
 */
export function useLoginAttemptDaily(days: number = 30, options?: { enabled?: boolean }) {
  return useQuery<Record<string, DailyLoginData>, Error>({
    queryKey: loginAttemptsKeys.daily(days),
    queryFn: () => adminLoginAttemptsApi.getDaily(days),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch user devices
 */
export function useUserDevices(
  filters?: DeviceFilters,
  options?: { enabled?: boolean }
) {
  return useQuery<AdminPaginatedResponse<UserDevice>, Error>({
    queryKey: loginAttemptsKeys.devices(filters),
    queryFn: () => adminLoginAttemptsApi.getDevices(filters),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

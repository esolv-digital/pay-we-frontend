import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminNotificationsApi } from '@/lib/api/admin-notifications';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type {
  MessagingProviderFilters,
  CreateMessagingProviderRequest,
  UpdateMessagingProviderRequest,
  AdminNotificationLogFilters,
  LoginAttemptFilters,
  AdminDeviceFilters,
} from '@/types';

// ============================================================================
// MESSAGING PROVIDERS HOOKS
// ============================================================================

/**
 * Hook to fetch messaging providers
 */
export function useMessagingProviders(filters?: MessagingProviderFilters) {
  return useQuery({
    queryKey: ['admin-messaging-providers', filters],
    queryFn: () => adminNotificationsApi.getMessagingProviders(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch messaging provider statistics
 */
export function useMessagingProviderStatistics() {
  return useQuery({
    queryKey: ['admin-messaging-provider-statistics'],
    queryFn: () => adminNotificationsApi.getMessagingProviderStatistics(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single messaging provider
 */
export function useMessagingProvider(providerId: string) {
  return useQuery({
    queryKey: ['admin-messaging-provider', providerId],
    queryFn: () => adminNotificationsApi.getMessagingProvider(providerId),
    enabled: !!providerId,
  });
}

/**
 * Hook to create a messaging provider
 */
export function useCreateMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessagingProviderRequest) =>
      adminNotificationsApi.createMessagingProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-provider-statistics'] });
      showSuccess('Messaging provider created successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to update a messaging provider
 */
export function useUpdateMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      data,
    }: {
      providerId: string;
      data: UpdateMessagingProviderRequest;
    }) => adminNotificationsApi.updateMessagingProvider(providerId, data),
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-provider', providerId] });
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-provider-statistics'] });
      showSuccess('Messaging provider updated successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to delete a messaging provider
 */
export function useDeleteMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) =>
      adminNotificationsApi.deleteMessagingProvider(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-provider-statistics'] });
      showSuccess('Messaging provider deleted successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to toggle a messaging provider status
 */
export function useToggleMessagingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) =>
      adminNotificationsApi.toggleMessagingProvider(providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-provider-statistics'] });
      showSuccess(
        data.is_active
          ? 'Provider activated successfully!'
          : 'Provider deactivated successfully!'
      );
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to reset provider failures
 */
export function useResetProviderFailures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) =>
      adminNotificationsApi.resetProviderFailures(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messaging-provider-statistics'] });
      showSuccess('Provider failure count reset successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// ============================================================================
// NOTIFICATION LOGS HOOKS
// ============================================================================

/**
 * Hook to fetch admin notification logs
 */
export function useAdminNotificationLogs(filters?: AdminNotificationLogFilters) {
  return useQuery({
    queryKey: ['admin-notification-logs', filters],
    queryFn: () => adminNotificationsApi.getNotificationLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch notification statistics
 */
export function useNotificationStatistics(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['admin-notification-statistics', dateFrom, dateTo],
    queryFn: () => adminNotificationsApi.getNotificationStatistics(dateFrom, dateTo),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch daily notification data
 */
export function useDailyNotificationData(days?: number) {
  return useQuery({
    queryKey: ['admin-daily-notification-data', days],
    queryFn: () => adminNotificationsApi.getDailyNotificationData(days),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single notification log
 */
export function useAdminNotificationLog(logId: string) {
  return useQuery({
    queryKey: ['admin-notification-log', logId],
    queryFn: () => adminNotificationsApi.getNotificationLog(logId),
    enabled: !!logId,
  });
}

// ============================================================================
// LOGIN ATTEMPTS & SECURITY HOOKS
// ============================================================================

/**
 * Hook to fetch login attempts
 */
export function useLoginAttempts(filters?: LoginAttemptFilters) {
  return useQuery({
    queryKey: ['admin-login-attempts', filters],
    queryFn: () => adminNotificationsApi.getLoginAttempts(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch suspicious login attempts
 */
export function useSuspiciousLoginAttempts(
  userId?: string,
  perPage?: number,
  page?: number
) {
  return useQuery({
    queryKey: ['admin-suspicious-login-attempts', userId, perPage, page],
    queryFn: () => adminNotificationsApi.getSuspiciousLoginAttempts(userId, perPage, page),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch login statistics
 */
export function useLoginStatistics(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['admin-login-statistics', dateFrom, dateTo],
    queryFn: () => adminNotificationsApi.getLoginStatistics(dateFrom, dateTo),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch daily login data
 */
export function useDailyLoginData(days?: number) {
  return useQuery({
    queryKey: ['admin-daily-login-data', days],
    queryFn: () => adminNotificationsApi.getDailyLoginData(days),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch admin device list
 */
export function useAdminDevices(filters?: AdminDeviceFilters) {
  return useQuery({
    queryKey: ['admin-devices', filters],
    queryFn: () => adminNotificationsApi.getDevices(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single login attempt
 */
export function useLoginAttempt(attemptId: string) {
  return useQuery({
    queryKey: ['admin-login-attempt', attemptId],
    queryFn: () => adminNotificationsApi.getLoginAttempt(attemptId),
    enabled: !!attemptId,
  });
}

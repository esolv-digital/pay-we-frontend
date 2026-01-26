import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { showApiError, showSuccess, showWarning } from '@/lib/utils/error-handler';
import type {
  UpdateNotificationPreferenceRequest,
  BulkUpdateNotificationPreferencesRequest,
  NotificationHistoryFilters,
  NotificationType,
  NotificationPreferenceChannel,
} from '@/types';

// ============================================================================
// NOTIFICATION PREFERENCES HOOKS
// ============================================================================

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsApi.getPreferences(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch notification types
 */
export function useNotificationTypes() {
  return useQuery({
    queryKey: ['notification-types'],
    queryFn: () => notificationsApi.getNotificationTypes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update a single notification preference
 */
export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferenceRequest) =>
      notificationsApi.updatePreference(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      showSuccess('Notification preference updated!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to bulk update notification preferences
 */
export function useBulkUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateNotificationPreferencesRequest) =>
      notificationsApi.bulkUpdatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      showSuccess('Notification preferences updated!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to toggle a specific notification preference
 * Useful for quick toggles in the UI
 */
export function useToggleNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notification_type,
      channel,
      enabled,
    }: {
      notification_type: NotificationType;
      channel: NotificationPreferenceChannel;
      enabled: boolean;
    }) => {
      const data: UpdateNotificationPreferenceRequest = {
        notification_type,
        [`${channel}_enabled`]: enabled,
      };
      return notificationsApi.updatePreference(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// ============================================================================
// NOTIFICATION HISTORY HOOKS
// ============================================================================

/**
 * Hook to fetch notification history
 */
export function useNotificationHistory(filters?: NotificationHistoryFilters) {
  return useQuery({
    queryKey: ['notification-history', filters],
    queryFn: () => notificationsApi.getHistory(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// DEVICE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook to fetch user devices
 */
export function useDevices() {
  return useQuery({
    queryKey: ['user-devices'],
    queryFn: () => notificationsApi.getDevices(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to trust a device
 */
export function useTrustDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => notificationsApi.trustDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      showSuccess('Device trusted successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to remove a device
 */
export function useRemoveDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => notificationsApi.removeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      showSuccess('Device removed successfully!');
      showWarning('This device will be re-added on next login.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// ============================================================================
// TEST NOTIFICATION HOOKS
// ============================================================================

/**
 * Hook to send a test notification
 */
export function useSendTestNotification() {
  return useMutation({
    mutationFn: (channel: 'email' | 'sms' | 'whatsapp' | 'push') =>
      notificationsApi.sendTestNotification(channel),
    onSuccess: (_, channel) => {
      const channelLabels = {
        email: 'email',
        sms: 'phone',
        whatsapp: 'WhatsApp',
        push: 'device',
      };
      showSuccess(`Test notification sent to your ${channelLabels[channel]}!`);
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// ============================================================================
// LEGACY ALIASES (backward compatibility)
// ============================================================================

export const useUpdateNotificationPreferences = useUpdateNotificationPreference;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type {
  UpdateNotificationPreferenceRequest,
  BulkUpdateNotificationPreferencesRequest,
  NotificationChannel,
  NotificationType,
} from '@/types';

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
 * Hook to send a test notification
 */
export function useSendTestNotification() {
  return useMutation({
    mutationFn: (channel: 'email' | 'sms') =>
      notificationsApi.sendTestNotification({ channel }),
    onSuccess: (_, channel) => {
      showSuccess(`Test notification sent to your ${channel}!`);
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
      type,
      channel,
      enabled,
    }: {
      type: NotificationType;
      channel: NotificationChannel;
      enabled: boolean;
    }) => {
      return notificationsApi.updatePreference({ type, channel, enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

// Legacy alias for backward compatibility
export const useUpdateNotificationPreferences = useUpdateNotificationPreference;

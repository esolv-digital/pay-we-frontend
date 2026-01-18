import { apiClient } from './client';
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferenceRequest,
  BulkUpdateNotificationPreferencesRequest,
  TestNotificationRequest,
} from '@/types';

// ============================================================================
// API CLIENT
// ============================================================================

export const notificationsApi = {
  /**
   * Get notification preferences
   * GET /notifications/preferences
   */
  getPreferences: async (): Promise<NotificationPreferencesResponse> => {
    return apiClient.get<NotificationPreferencesResponse>('/notifications/preferences');
  },

  /**
   * Update a single notification preference
   * PUT /notifications/preferences
   */
  updatePreference: async (
    data: UpdateNotificationPreferenceRequest
  ): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>('/notifications/preferences', data);
  },

  /**
   * Bulk update notification preferences
   * POST /notifications/preferences/bulk
   */
  bulkUpdatePreferences: async (
    data: BulkUpdateNotificationPreferencesRequest
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/notifications/preferences/bulk', data);
  },

  /**
   * Send test notification
   * POST /notifications/test
   */
  sendTestNotification: async (
    data: TestNotificationRequest
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/notifications/test', data);
  },

  // Legacy method name for backward compatibility
  updatePreferences: async (
    data: UpdateNotificationPreferenceRequest
  ): Promise<{ message: string }> => {
    return notificationsApi.updatePreference(data);
  },
};

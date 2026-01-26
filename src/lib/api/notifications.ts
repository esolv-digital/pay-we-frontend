import { apiClient } from './client';
import type {
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
  BulkUpdateNotificationPreferencesRequest,
  NotificationTypeInfo,
  NotificationHistoryFilters,
  NotificationHistoryResponse,
  UserDevice,
  TestNotificationResponse,
} from '@/types';

// ============================================================================
// VENDOR/USER NOTIFICATION API
// ============================================================================

export const notificationsApi = {
  // ==========================================================================
  // NOTIFICATION PREFERENCES
  // ==========================================================================

  /**
   * Get all notification preferences
   * GET /api/v1/notifications/preferences
   */
  getPreferences: async (): Promise<NotificationPreference[]> => {
    return apiClient.get<NotificationPreference[]>('/notifications/preferences');
  },

  /**
   * Update a single notification preference
   * PUT /api/v1/notifications/preferences
   */
  updatePreference: async (
    data: UpdateNotificationPreferenceRequest
  ): Promise<NotificationPreference> => {
    return apiClient.put<NotificationPreference>('/notifications/preferences', data);
  },

  /**
   * Bulk update notification preferences
   * POST /api/v1/notifications/preferences/bulk
   */
  bulkUpdatePreferences: async (
    data: BulkUpdateNotificationPreferencesRequest
  ): Promise<void> => {
    return apiClient.post<void>('/notifications/preferences/bulk', data);
  },

  /**
   * Get all notification types
   * GET /api/v1/notifications/types
   */
  getNotificationTypes: async (): Promise<NotificationTypeInfo[]> => {
    return apiClient.get<NotificationTypeInfo[]>('/notifications/types');
  },

  // ==========================================================================
  // NOTIFICATION HISTORY
  // ==========================================================================

  /**
   * Get notification history
   * GET /api/v1/notifications/history
   */
  getHistory: async (filters?: NotificationHistoryFilters): Promise<NotificationHistoryResponse> => {
    const params = new URLSearchParams();

    if (filters?.channel) params.append('channel', filters.channel);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.notification_type) params.append('notification_type', filters.notification_type);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString ? `/notifications/history?${queryString}` : '/notifications/history';

    return apiClient.get<NotificationHistoryResponse>(url);
  },

  // ==========================================================================
  // DEVICE MANAGEMENT
  // ==========================================================================

  /**
   * Get user devices
   * GET /api/v1/notifications/devices
   */
  getDevices: async (): Promise<UserDevice[]> => {
    return apiClient.get<UserDevice[]>('/notifications/devices');
  },

  /**
   * Trust a device
   * POST /api/v1/notifications/devices/{device}/trust
   */
  trustDevice: async (deviceId: string): Promise<UserDevice> => {
    return apiClient.post<UserDevice>(`/notifications/devices/${deviceId}/trust`);
  },

  /**
   * Remove a device
   * DELETE /api/v1/notifications/devices/{device}
   */
  removeDevice: async (deviceId: string): Promise<void> => {
    return apiClient.delete<void>(`/notifications/devices/${deviceId}`);
  },

  // ==========================================================================
  // TEST NOTIFICATIONS
  // ==========================================================================

  /**
   * Send test notification
   * POST /api/v1/notifications/test
   */
  sendTestNotification: async (
    channel: 'email' | 'sms' | 'whatsapp' | 'push'
  ): Promise<TestNotificationResponse> => {
    return apiClient.post<TestNotificationResponse>('/notifications/test', { channel });
  },

  // ==========================================================================
  // LEGACY METHODS (backward compatibility)
  // ==========================================================================

  updatePreferences: async (
    data: UpdateNotificationPreferenceRequest
  ): Promise<NotificationPreference> => {
    return notificationsApi.updatePreference(data);
  },
};

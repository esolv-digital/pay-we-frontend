import { apiClient } from './client';
import type {
  MessagingProvider,
  MessagingProviderFilters,
  MessagingProviderListResponse,
  MessagingProviderStatistics,
  CreateMessagingProviderRequest,
  UpdateMessagingProviderRequest,
  AdminNotificationLogFilters,
  AdminNotificationLogListResponse,
  AdminNotificationLog,
  NotificationStatistics,
  DailyNotificationData,
  LoginAttemptFilters,
  LoginAttemptListResponse,
  LoginAttempt,
  LoginStatistics,
  DailyLoginData,
  AdminDeviceFilters,
  AdminDeviceListResponse,
} from '@/types';

// ============================================================================
// ADMIN NOTIFICATION API
// ============================================================================

export const adminNotificationsApi = {
  // ==========================================================================
  // MESSAGING PROVIDERS
  // ==========================================================================

  /**
   * List messaging providers
   * GET /api/v1/admin/messaging-providers
   */
  getMessagingProviders: async (
    filters?: MessagingProviderFilters
  ): Promise<MessagingProviderListResponse> => {
    const params = new URLSearchParams();

    if (filters?.channel) params.append('channel', filters.channel);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/admin/messaging-providers?${queryString}`
      : '/admin/messaging-providers';

    return apiClient.get<MessagingProviderListResponse>(url);
  },

  /**
   * Get messaging provider statistics
   * GET /api/v1/admin/messaging-providers/statistics
   */
  getMessagingProviderStatistics: async (): Promise<MessagingProviderStatistics> => {
    return apiClient.get<MessagingProviderStatistics>('/admin/messaging-providers/statistics');
  },

  /**
   * Get single messaging provider
   * GET /api/v1/admin/messaging-providers/{provider}
   */
  getMessagingProvider: async (providerId: string): Promise<MessagingProvider> => {
    return apiClient.get<MessagingProvider>(`/admin/messaging-providers/${providerId}`);
  },

  /**
   * Create messaging provider
   * POST /api/v1/admin/messaging-providers
   */
  createMessagingProvider: async (
    data: CreateMessagingProviderRequest
  ): Promise<MessagingProvider> => {
    return apiClient.post<MessagingProvider>('/admin/messaging-providers', data);
  },

  /**
   * Update messaging provider
   * PUT /api/v1/admin/messaging-providers/{provider}
   */
  updateMessagingProvider: async (
    providerId: string,
    data: UpdateMessagingProviderRequest
  ): Promise<MessagingProvider> => {
    return apiClient.put<MessagingProvider>(`/admin/messaging-providers/${providerId}`, data);
  },

  /**
   * Delete messaging provider
   * DELETE /api/v1/admin/messaging-providers/{provider}
   */
  deleteMessagingProvider: async (providerId: string): Promise<void> => {
    return apiClient.delete<void>(`/admin/messaging-providers/${providerId}`);
  },

  /**
   * Toggle provider status
   * POST /api/v1/admin/messaging-providers/{provider}/toggle
   */
  toggleMessagingProvider: async (providerId: string): Promise<MessagingProvider> => {
    return apiClient.post<MessagingProvider>(`/admin/messaging-providers/${providerId}/toggle`);
  },

  /**
   * Reset provider failures
   * POST /api/v1/admin/messaging-providers/{provider}/reset-failures
   */
  resetProviderFailures: async (providerId: string): Promise<MessagingProvider> => {
    return apiClient.post<MessagingProvider>(
      `/admin/messaging-providers/${providerId}/reset-failures`
    );
  },

  // ==========================================================================
  // NOTIFICATION LOGS
  // ==========================================================================

  /**
   * List notification logs
   * GET /api/v1/admin/notification-logs
   */
  getNotificationLogs: async (
    filters?: AdminNotificationLogFilters
  ): Promise<AdminNotificationLogListResponse> => {
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.channel) params.append('channel', filters.channel);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.notification_type) params.append('notification_type', filters.notification_type);
    if (filters?.provider) params.append('provider', filters.provider);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString ? `/admin/notification-logs?${queryString}` : '/admin/notification-logs';

    return apiClient.get<AdminNotificationLogListResponse>(url);
  },

  /**
   * Get notification statistics
   * GET /api/v1/admin/notification-logs/statistics
   */
  getNotificationStatistics: async (
    dateFrom?: string,
    dateTo?: string
  ): Promise<NotificationStatistics> => {
    const params = new URLSearchParams();

    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const queryString = params.toString();
    const url = queryString
      ? `/admin/notification-logs/statistics?${queryString}`
      : '/admin/notification-logs/statistics';

    return apiClient.get<NotificationStatistics>(url);
  },

  /**
   * Get daily notification data
   * GET /api/v1/admin/notification-logs/daily
   */
  getDailyNotificationData: async (days?: number): Promise<DailyNotificationData> => {
    const params = new URLSearchParams();

    if (days) params.append('days', days.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/admin/notification-logs/daily?${queryString}`
      : '/admin/notification-logs/daily';

    return apiClient.get<DailyNotificationData>(url);
  },

  /**
   * Get single notification log
   * GET /api/v1/admin/notification-logs/{log}
   */
  getNotificationLog: async (logId: string): Promise<AdminNotificationLog> => {
    return apiClient.get<AdminNotificationLog>(`/admin/notification-logs/${logId}`);
  },

  // ==========================================================================
  // LOGIN ATTEMPTS & SECURITY
  // ==========================================================================

  /**
   * List login attempts
   * GET /api/v1/admin/login-attempts
   */
  getLoginAttempts: async (filters?: LoginAttemptFilters): Promise<LoginAttemptListResponse> => {
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.ip_address) params.append('ip_address', filters.ip_address);
    if (filters?.country_code) params.append('country_code', filters.country_code);
    if (filters?.successful !== undefined) params.append('successful', filters.successful.toString());
    if (filters?.is_suspicious !== undefined) params.append('is_suspicious', filters.is_suspicious.toString());
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString ? `/admin/login-attempts?${queryString}` : '/admin/login-attempts';

    return apiClient.get<LoginAttemptListResponse>(url);
  },

  /**
   * Get suspicious login attempts
   * GET /api/v1/admin/login-attempts/suspicious
   */
  getSuspiciousLoginAttempts: async (
    userId?: string,
    perPage?: number,
    page?: number
  ): Promise<LoginAttemptListResponse> => {
    const params = new URLSearchParams();

    if (userId) params.append('user_id', userId);
    if (perPage) params.append('per_page', perPage.toString());
    if (page) params.append('page', page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/admin/login-attempts/suspicious?${queryString}`
      : '/admin/login-attempts/suspicious';

    return apiClient.get<LoginAttemptListResponse>(url);
  },

  /**
   * Get login statistics
   * GET /api/v1/admin/login-attempts/statistics
   */
  getLoginStatistics: async (dateFrom?: string, dateTo?: string): Promise<LoginStatistics> => {
    const params = new URLSearchParams();

    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const queryString = params.toString();
    const url = queryString
      ? `/admin/login-attempts/statistics?${queryString}`
      : '/admin/login-attempts/statistics';

    return apiClient.get<LoginStatistics>(url);
  },

  /**
   * Get daily login data
   * GET /api/v1/admin/login-attempts/daily
   */
  getDailyLoginData: async (days?: number): Promise<DailyLoginData> => {
    const params = new URLSearchParams();

    if (days) params.append('days', days.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/admin/login-attempts/daily?${queryString}`
      : '/admin/login-attempts/daily';

    return apiClient.get<DailyLoginData>(url);
  },

  /**
   * List user devices (admin view)
   * GET /api/v1/admin/login-attempts/devices
   */
  getDevices: async (filters?: AdminDeviceFilters): Promise<AdminDeviceListResponse> => {
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.is_trusted !== undefined) params.append('is_trusted', filters.is_trusted.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/admin/login-attempts/devices?${queryString}`
      : '/admin/login-attempts/devices';

    return apiClient.get<AdminDeviceListResponse>(url);
  },

  /**
   * Get single login attempt
   * GET /api/v1/admin/login-attempts/{attempt}
   */
  getLoginAttempt: async (attemptId: string): Promise<LoginAttempt> => {
    return apiClient.get<LoginAttempt>(`/admin/login-attempts/${attemptId}`);
  },
};

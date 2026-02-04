/**
 * Admin Notification Logs API Service
 *
 * Handles all notification log retrieval and monitoring operations.
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

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface NotificationUser {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

export interface NotificationLog {
  id: string;
  user_id: string | null;
  user: NotificationUser | null;
  channel: NotificationChannel;
  provider: string;
  notification_type: string;
  recipient: string;
  subject: string | null;
  status: NotificationStatus;
  provider_message_id: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationStatistics {
  period: {
    from: string;
    to: string;
  };
  totals: {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  by_channel: {
    email: {
      delivered: number;
      failed: number;
      pending: number;
    };
    sms: {
      delivered: number;
      failed: number;
      pending: number;
    };
    whatsapp: {
      delivered: number;
      failed: number;
      pending: number;
    };
  };
  by_type: Record<string, number>;
  delivery_rate: number;
}

export interface DailyNotificationData {
  delivered: number;
  failed: number;
  pending: number;
}

export interface NotificationLogFilters {
  user_id?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  notification_type?: string;
  provider?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * List all notification logs with filtering
 */
export async function list(
  filters?: NotificationLogFilters
): Promise<AdminPaginatedResponse<NotificationLog>> {
  const result = await apiClient.get<{ logs: NotificationLog[]; meta: PaginationMeta }>(
    '/admin/notification-logs',
    { params: filters }
  );

  return {
    data: result.logs,
    meta: result.meta,
  };
}

/**
 * Get single notification log details
 */
export async function get(logId: string): Promise<NotificationLog> {
  return apiClient.get<NotificationLog>(`/admin/notification-logs/${logId}`);
}

/**
 * Get notification statistics
 */
export async function getStatistics(params?: {
  date_from?: string;
  date_to?: string;
}): Promise<NotificationStatistics> {
  return apiClient.get<NotificationStatistics>('/admin/notification-logs/statistics', { params });
}

/**
 * Get daily notification counts for charting
 */
export async function getDaily(
  days: number = 30
): Promise<Record<string, DailyNotificationData>> {
  return apiClient.get<Record<string, DailyNotificationData>>(
    '/admin/notification-logs/daily',
    { params: { days } }
  );
}

// =============================================================================
// EXPORT NAMESPACE
// =============================================================================

export const adminNotificationLogsApi = {
  list,
  get,
  getStatistics,
  getDaily,
};

export default adminNotificationLogsApi;

/**
 * Admin Activity Logs API Client
 *
 * Provides methods for viewing platform activity logs.
 * Includes filtering by user, organization, action, and date range.
 *
 * @module lib/api/admin-logs
 */

import { apiClient } from './client';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Log level enumeration
 */
export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

/**
 * Log action categories
 */
export type LogAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.suspended'
  | 'user.activated'
  | 'user.login'
  | 'user.logout'
  | 'organization.created'
  | 'organization.updated'
  | 'organization.suspended'
  | 'organization.activated'
  | 'transaction.created'
  | 'transaction.updated'
  | 'kyc.submitted'
  | 'kyc.approved'
  | 'kyc.rejected'
  | 'role.created'
  | 'role.updated'
  | 'role.deleted'
  | 'role.assigned'
  | 'permission.assigned'
  | string; // Allow other custom actions

/**
 * Activity log data structure
 */
export interface ActivityLog {
  id: string;

  // Actor (who performed the action)
  user_id?: string;
  user_name?: string;
  user_email?: string;

  // Action details
  action: LogAction;
  description: string;
  level: LogLevel;

  // Target (what was affected)
  target_type?: string; // e.g., 'User', 'Organization', 'Transaction'
  target_id?: string;
  target_name?: string;

  // Context
  organization_id?: string;
  organization_name?: string;
  ip_address?: string;
  user_agent?: string;

  // Additional data
  metadata?: Record<string, unknown>;
  changes?: Record<string, { old: unknown; new: unknown }>;

  // Timestamps
  created_at: string;
}

/**
 * Activity log filters
 */
export interface LogFilters extends PaginationParams {
  search?: string; // Search in description, user name, target name
  user_id?: string; // Filter by user who performed action
  organization_id?: string; // Filter by organization
  action?: LogAction | LogAction[]; // Filter by action type
  level?: LogLevel | LogLevel[]; // Filter by log level
  target_type?: string; // Filter by target type
  target_id?: string; // Filter by specific target
  from_date?: string; // ISO 8601 date
  to_date?: string; // ISO 8601 date
  ip_address?: string; // Filter by IP
  sort_by?: 'created_at' | 'action' | 'level';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Log statistics
 */
export interface LogStatistics {
  total_logs: number;

  // By level
  info_logs: number;
  warning_logs: number;
  error_logs: number;
  critical_logs: number;

  // Recent activity
  logs_today: number;
  logs_this_week: number;
  logs_this_month: number;

  // Top actions
  top_actions?: Array<{
    action: string;
    count: number;
  }>;

  // Top users
  top_users?: Array<{
    user_id: string;
    user_name: string;
    count: number;
  }>;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Admin Activity Logs API Client
 */
export const adminLogsApi = {
  /**
   * List activity logs with filters and pagination
   *
   * @param filters - Log filters
   * @returns Paginated list of logs
   *
   * @example
   * ```typescript
   * const logs = await adminLogsApi.list({
   *   action: 'user.login',
   *   from_date: '2024-01-01',
   *   page: 1,
   *   per_page: 50,
   * });
   * ```
   */
  async list(filters: LogFilters = {}): Promise<PaginatedResponse<ActivityLog>> {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    // Search
    if (filters.search) params.append('search', filters.search);

    // Filters
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.organization_id) {
      params.append('organization_id', filters.organization_id);
    }
    if (filters.target_type) params.append('target_type', filters.target_type);
    if (filters.target_id) params.append('target_id', filters.target_id);
    if (filters.ip_address) params.append('ip_address', filters.ip_address);

    // Action
    if (filters.action) {
      if (Array.isArray(filters.action)) {
        filters.action.forEach((a) => params.append('action[]', a));
      } else {
        params.append('action', filters.action);
      }
    }

    // Level
    if (filters.level) {
      if (Array.isArray(filters.level)) {
        filters.level.forEach((l) => params.append('level[]', l));
      } else {
        params.append('level', filters.level);
      }
    }

    // Date range
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    // Sorting
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) {
      params.append('sort_direction', filters.sort_direction);
    }

    const response = await apiClient.get<PaginatedResponse<ActivityLog>>(
      `/admin/logs?${params.toString()}`
    );

    return response;
  },

  /**
   * Get a single activity log by ID
   *
   * @param id - Log ID
   * @returns Activity log details
   *
   * @example
   * ```typescript
   * const log = await adminLogsApi.get('log-uuid-123');
   * ```
   */
  async get(id: string): Promise<ActivityLog> {
    const response = await apiClient.get<ActivityLog>(
      `/admin/logs/${id}`
    );

    return response;
  },

  /**
   * Get activity log statistics
   *
   * @returns Log statistics
   *
   * @example
   * ```typescript
   * const stats = await adminLogsApi.getStatistics();
   * console.log(stats.total_logs, stats.logs_today);
   * ```
   */
  async getStatistics(): Promise<LogStatistics> {
    const response = await apiClient.get<LogStatistics>(
      '/admin/logs/statistics'
    );

    return response;
  },

  /**
   * Export activity logs
   *
   * @param filters - Log filters for export
   * @param format - Export format
   * @returns Blob for download
   *
   * @example
   * ```typescript
   * const blob = await adminLogsApi.export({
   *   from_date: '2024-01-01',
   *   to_date: '2024-01-31',
   * }, 'csv');
   * ```
   */
  async export(
    filters: LogFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    const params = new URLSearchParams();

    // Apply all filters
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.organization_id) {
      params.append('organization_id', filters.organization_id);
    }
    if (filters.action) {
      if (Array.isArray(filters.action)) {
        filters.action.forEach((a) => params.append('action[]', a));
      } else {
        params.append('action', filters.action);
      }
    }
    if (filters.level) {
      if (Array.isArray(filters.level)) {
        filters.level.forEach((l) => params.append('level[]', l));
      } else {
        params.append('level', filters.level);
      }
    }
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.target_type) params.append('target_type', filters.target_type);

    params.append('format', format);

    const response = await apiClient.get(`/admin/logs/export?${params.toString()}`, {
      responseType: 'blob',
    });

    return (response as Blob);
  },
};

/**
 * Admin Messaging Providers API Service
 *
 * Handles all messaging provider management operations (SMS, Email, WhatsApp).
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

export type MessagingChannel = 'email' | 'sms' | 'whatsapp';

export interface MessagingProvider {
  id: string;
  name: string;
  driver: string;
  channel: MessagingChannel;
  is_active: boolean;
  is_primary: boolean;
  priority: number;
  last_failure_at: string | null;
  failure_count: number;
  is_healthy: boolean;
  credentials: Record<string, unknown> | null; // Only visible to Super Admins
  countries: string[];
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProviderRequest {
  name: string;
  driver: string;
  channel: MessagingChannel;
  is_active?: boolean;
  is_primary?: boolean;
  priority?: number;
  credentials: Record<string, unknown>;
  countries?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateProviderRequest {
  name?: string;
  driver?: string;
  channel?: MessagingChannel;
  is_active?: boolean;
  is_primary?: boolean;
  priority?: number;
  credentials?: Record<string, unknown>;
  countries?: string[];
  metadata?: Record<string, unknown>;
}

export interface ProviderStatistics {
  total: number;
  active: number;
  inactive: number;
  by_channel: {
    email: { total: number; active: number };
    sms: { total: number; active: number };
    whatsapp: { total: number; active: number };
  };
  health: {
    healthy: number;
    degraded: number;
    failing: number;
  };
}

export interface ProviderFilters {
  channel?: MessagingChannel;
  is_active?: boolean;
  search?: string;
  sort_by?: 'name' | 'channel' | 'priority' | 'created_at';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * List all messaging providers
 */
export async function list(
  filters?: ProviderFilters
): Promise<AdminPaginatedResponse<MessagingProvider>> {
  const result = await apiClient.get<{ providers: MessagingProvider[]; meta: PaginationMeta }>(
    '/admin/messaging-providers',
    { params: filters }
  );

  return {
    data: result.providers,
    meta: result.meta,
  };
}

/**
 * Get single messaging provider
 */
export async function get(providerId: string): Promise<MessagingProvider> {
  return apiClient.get<MessagingProvider>(`/admin/messaging-providers/${providerId}`);
}

/**
 * Create a new messaging provider
 */
export async function create(
  providerData: CreateProviderRequest
): Promise<MessagingProvider> {
  return apiClient.post<MessagingProvider>('/admin/messaging-providers', providerData);
}

/**
 * Update a messaging provider
 */
export async function update(
  providerId: string,
  providerData: UpdateProviderRequest
): Promise<MessagingProvider> {
  return apiClient.put<MessagingProvider>(
    `/admin/messaging-providers/${providerId}`,
    providerData
  );
}

/**
 * Delete a messaging provider
 */
export async function deleteProvider(providerId: string): Promise<void> {
  await apiClient.delete(`/admin/messaging-providers/${providerId}`);
}

/**
 * Toggle provider active status
 */
export async function toggleActive(
  providerId: string
): Promise<MessagingProvider> {
  return apiClient.post<MessagingProvider>(`/admin/messaging-providers/${providerId}/toggle`);
}

/**
 * Reset provider failure tracking
 */
export async function resetFailures(
  providerId: string
): Promise<MessagingProvider> {
  return apiClient.post<MessagingProvider>(
    `/admin/messaging-providers/${providerId}/reset-failures`
  );
}

/**
 * Get provider statistics
 */
export async function getStatistics(): Promise<ProviderStatistics> {
  return apiClient.get<ProviderStatistics>('/admin/messaging-providers/statistics');
}

// =============================================================================
// EXPORT NAMESPACE
// =============================================================================

export const adminMessagingProvidersApi = {
  list,
  get,
  create,
  update,
  deleteProvider,
  toggleActive,
  resetFailures,
  getStatistics,
};

export default adminMessagingProvidersApi;

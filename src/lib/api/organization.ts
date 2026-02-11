/**
 * Organization API Client
 *
 * Handles organization-related API requests
 */

import { apiClient } from './client';
import type { Organization } from '@/types';

export interface UpdateOrganizationInput {
  name?: string;
  short_name?: string;
  legal_name?: string;
  type?: 'individual' | 'corporate';
  industry?: string;
  country_code?: string;
  tax_id?: string;
  registration_number?: string;
}

export const organizationApi = {
  /**
   * Get organization details by ID
   */
  async getOrganization(organizationId: string): Promise<Organization> {
    return apiClient.get<Organization>(`/organizations/${organizationId}`);
  },

  /**
   * Update organization details
   */
  async updateOrganization(organizationId: string, data: UpdateOrganizationInput): Promise<Organization> {
    return apiClient.put<Organization>(`/organizations/${organizationId}`, data);
  },

  /**
   * Get all organizations for current user
   */
  async getMyOrganizations(): Promise<Organization[]> {
    return apiClient.get<Organization[]>('/my/organizations');
  },
};

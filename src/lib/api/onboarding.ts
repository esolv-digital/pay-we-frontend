/**
 * Onboarding API Client
 *
 * Only getStatus has a working backend endpoint.
 * Steps 2-4 (profile-review, KYC, payout, complete) are handled
 * as frontend-only navigation in use-onboarding.ts since those
 * endpoints don't exist in the backend yet.
 *
 * KYC upload is available via the organization endpoint:
 *   POST /api/v1/organizations/:org/kyc/submit
 */

import { apiClient } from './client';

export interface OnboardingStatus {
  current_step: number;
  completed_steps: number[];
  is_complete: boolean;
  has_organization: boolean;
  has_kyc_submitted: boolean;
  has_payout_account: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const onboardingApi = {
  /**
   * Get current onboarding status
   * Backend endpoint: GET /api/v1/onboarding/status
   */
  async getStatus(): Promise<OnboardingStatus> {
    const response = await apiClient.get<ApiResponse<OnboardingStatus>>('/onboarding/status');
    return response.data;
  },
};

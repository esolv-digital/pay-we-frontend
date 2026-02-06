/**
 * Onboarding API Client
 *
 * Handles all onboarding-related API requests for the multi-step onboarding flow
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

export interface ProfileReviewData {
  skip?: boolean;
}

export interface KYCUploadData {
  document_type?: string;
  file?: File;
  skip?: boolean;
}

export interface PayoutAccountData {
  payment_method: 'bank' | 'mobile_money';
  account_details: {
    // Bank account details
    account_number?: string;
    bank_code?: string;
    account_name?: string;
    // Mobile money details
    mobile_number?: string;
    mobile_provider?: string;
  };
  skip?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const onboardingApi = {
  /**
   * Get current onboarding status
   * Returns which step user is on and what has been completed
   */
  async getStatus(): Promise<OnboardingStatus> {
    const response = await apiClient.get<ApiResponse<OnboardingStatus>>('/onboarding/status');
    return response.data;
  },

  /**
   * Complete profile review step (Step 2)
   * This is just a confirmation step to view user + org details
   * NOTE: This endpoint may not exist in backend - check with backend team
   */
  async completeProfileReview(data: ProfileReviewData = {}): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/onboarding/profile-review', data);
    return response.data;
  },

  /**
   * Upload KYC documents (Step 3)
   * Can be skipped
   * NOTE: This endpoint may not exist in backend - check with backend team
   */
  async uploadKYC(data: KYCUploadData): Promise<{ message: string; kyc_submission?: any }> {
    // If skipping, send skip flag
    if (data.skip) {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/onboarding/kyc', { skip: true });
      return response.data;
    }

    // Otherwise, upload document
    const formData = new FormData();
    if (data.document_type) formData.append('document_type', data.document_type);
    if (data.file) formData.append('file', data.file);

    const response = await apiClient.post<ApiResponse<{ message: string; kyc_submission?: any }>>('/onboarding/kyc', formData);
    return response.data;
  },

  /**
   * Create payout account during onboarding (Step 4)
   * Can be skipped
   * NOTE: This endpoint may not exist in backend - check with backend team
   */
  async createPayoutAccount(data: PayoutAccountData): Promise<{ message: string; payout_account?: any }> {
    // If skipping, send skip flag
    if (data.skip) {
      const response = await apiClient.post<ApiResponse<{ message: string }>>('/onboarding/payout', { skip: true });
      return response.data;
    }

    // Otherwise, create payout account
    const response = await apiClient.post<ApiResponse<{ message: string; payout_account?: any }>>('/onboarding/payout', data);
    return response.data;
  },

  /**
   * Mark onboarding as complete
   * Called after all steps are done (or skipped)
   * NOTE: This endpoint may not exist in backend - check with backend team
   */
  async completeOnboarding(): Promise<{ user: any; message: string }> {
    const response = await apiClient.post<ApiResponse<{ user: any; message: string }>>('/onboarding/complete');
    return response.data;
  },
};

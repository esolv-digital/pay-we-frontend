import { apiClient } from './client';

export interface VerifyEmailResponse {
  verified?: boolean;
  already_verified?: boolean;
}

export interface ResendVerificationResponse {
  message: string;
}

export const emailVerificationApi = {
  /**
   * Resend verification email
   * POST /auth/email/verification-notification
   * Rate limited: 6 requests per minute
   */
  resendVerification: async (): Promise<ResendVerificationResponse> => {
    return apiClient.post<ResendVerificationResponse>('/auth/email/verification-notification');
  },

  /**
   * Verify email from link parameters
   * GET /auth/email/verify/{id}/{hash}?expires={expires}&signature={signature}
   */
  verifyEmail: async (params: {
    id: string;
    hash: string;
    expires: string;
    signature?: string;
  }): Promise<VerifyEmailResponse> => {
    const searchParams = new URLSearchParams({ expires: params.expires });
    if (params.signature) {
      searchParams.set('signature', params.signature);
    }
    return apiClient.get<VerifyEmailResponse>(
      `/auth/email/verify/${encodeURIComponent(params.id)}/${encodeURIComponent(params.hash)}?${searchParams.toString()}`
    );
  },
};

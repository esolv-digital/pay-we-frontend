import { apiClient } from './client';
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  AvatarUploadResponse,
} from '@/types';

// ============================================================================
// API CLIENT
// ============================================================================

export const profileApi = {
  /**
   * Get current user profile
   * GET /profile
   */
  getProfile: async (): Promise<Profile> => {
    return apiClient.get<Profile>('/profile');
  },

  /**
   * Update user profile
   * PUT /profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<Profile> => {
    return apiClient.put<Profile>('/profile', data);
  },

  /**
   * Upload profile avatar
   * POST /profile/avatar
   */
  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    // Use fetch directly for FormData (axios has issues with FormData in this setup)
    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      const errorObj = new Error(error.message || 'Failed to upload avatar') as Error & {
        response?: { data?: { message?: string }; status?: number };
      };
      errorObj.response = {
        data: { message: error.message },
        status: response.status,
      };
      throw errorObj;
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Delete profile avatar
   * DELETE /profile/avatar
   */
  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete('/profile/avatar');
  },

  /**
   * Change password
   * PUT /profile/password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>('/profile/password', data);
  },

  /**
   * Change email
   * PUT /profile/email
   */
  changeEmail: async (data: ChangeEmailRequest): Promise<{ email: string }> => {
    return apiClient.put<{ email: string }>('/profile/email', data);
  },
};

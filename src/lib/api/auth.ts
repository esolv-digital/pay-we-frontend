import { apiClient } from './client';
import type { AuthUser, LoginCredentials, RegisterData, OnboardingData, AuthResponse } from '@/types';

export const authApi = {
  // Register
  register: async (data: RegisterData) => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  // Login
  login: async (credentials: LoginCredentials) => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  // Logout
  logout: async () => {
    return apiClient.post<{ message: string }>('/auth/logout');
  },

  // Get current user
  me: async () => {
    return apiClient.get<AuthUser>('/auth/me');
  },

  // Refresh token
  refresh: async () => {
    return apiClient.post<{ access_token: string; token_type: string }>('/auth/refresh');
  },

  // Onboarding - Complete organization setup
  completeOnboarding: async (data: OnboardingData) => {
    return apiClient.post<{
      organization: Record<string, unknown>;
      vendor: Record<string, unknown>;
      onboarding_complete: boolean;
    }>('/onboarding/organization', data);
  },

  // Google OAuth
  googleLogin: async () => {
    window.location.href = '/api/auth/google';
  },

  // Revoke Google OAuth
  revokeGoogle: async () => {
    return apiClient.post<{ message: string }>('/auth/google/revoke');
  },
};

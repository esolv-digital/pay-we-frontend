import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type { UpdateProfileRequest, ChangePasswordRequest, ChangeEmailRequest } from '@/types';

/**
 * Hook to fetch user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess('Profile updated successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess('Avatar uploaded successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to delete avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileApi.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess('Avatar removed successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileApi.changePassword(data),
    onSuccess: () => {
      showSuccess('Password changed successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to change email
 */
export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeEmailRequest) => profileApi.changeEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      showSuccess('Email updated successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailVerificationApi } from '@/lib/api/email-verification';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';

/**
 * Hook to resend verification email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: () => emailVerificationApi.resendVerification(),
    onSuccess: () => {
      showSuccess('Verification email sent! Please check your inbox.');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Hook to verify email from link parameters
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; hash: string; expires: string; signature?: string }) =>
      emailVerificationApi.verifyEmail(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

/**
 * Onboarding Hook
 *
 * Manages onboarding state and provides functions for navigating the onboarding flow
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { onboardingApi, type ProfileReviewData, type KYCUploadData, type PayoutAccountData } from '@/lib/api/onboarding';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { useAuth } from './use-auth';

export function useOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch onboarding status
  const { data: status, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: onboardingApi.getStatus,
    enabled: !!user, // Only fetch if user is logged in
  });

  // Complete profile review mutation
  const profileReviewMutation = useMutation({
    mutationFn: (data: ProfileReviewData) => onboardingApi.completeProfileReview(data),
    onSuccess: () => {
      showSuccess('Profile reviewed successfully!');
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] });
      router.push('/onboarding/kyc');
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Upload KYC mutation
  const kycUploadMutation = useMutation({
    mutationFn: (data: KYCUploadData) => onboardingApi.uploadKYC(data),
    onSuccess: (data) => {
      if (data.kyc_submission) {
        showSuccess('KYC documents uploaded successfully!');
      } else {
        showSuccess('KYC step skipped');
      }
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] });
      router.push('/onboarding/payout-account');
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Create payout account mutation
  const payoutAccountMutation = useMutation({
    mutationFn: (data: PayoutAccountData) => onboardingApi.createPayoutAccount(data),
    onSuccess: async (data) => {
      if (data.payout_account) {
        showSuccess('Payout account created successfully!');
      } else {
        showSuccess('Payout account setup skipped');
      }

      // Mark onboarding as complete
      await completeOnboardingMutation.mutateAsync();
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: onboardingApi.completeOnboarding,
    onSuccess: async () => {
      showSuccess('Onboarding completed! Welcome to PayWe!');

      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] });

      // Redirect to dashboard
      router.push('/vendor/dashboard');
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  return {
    // Status
    status,
    isLoadingStatus,
    currentStep: status?.current_step || 1,
    isComplete: status?.is_complete || false,
    hasOrganization: status?.has_organization || false,
    hasKYCSubmitted: status?.has_kyc_submitted || false,
    hasPayoutAccount: status?.has_payout_account || false,

    // Step navigation helpers
    canAccessStep: (step: number) => {
      if (!status) return false;
      return status.completed_steps.includes(step - 1) || status.current_step >= step;
    },

    // Step 2: Profile Review
    completeProfileReview: profileReviewMutation.mutate,
    isProfileReviewPending: profileReviewMutation.isPending,

    // Step 3: KYC Upload
    uploadKYC: kycUploadMutation.mutate,
    isKYCUploadPending: kycUploadMutation.isPending,

    // Step 4: Payout Account
    createPayoutAccount: payoutAccountMutation.mutate,
    isPayoutAccountPending: payoutAccountMutation.isPending,

    // Complete onboarding
    completeOnboarding: completeOnboardingMutation.mutate,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
  };
}

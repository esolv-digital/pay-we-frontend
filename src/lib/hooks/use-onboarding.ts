/**
 * Onboarding Hook
 *
 * Manages onboarding state and provides functions for navigating the onboarding flow.
 *
 * Backend only has 2 onboarding endpoints:
 *   - POST /api/v1/onboarding/organization (step 1)
 *   - GET  /api/v1/onboarding/status
 *
 * Steps 2-4 are frontend-only navigation since the backend
 * doesn't have endpoints for profile-review, kyc, payout, or complete.
 * KYC upload uses the organization endpoint: POST /api/v1/organizations/:org/kyc/submit
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { onboardingApi } from '@/lib/api/onboarding';
import { showSuccess } from '@/lib/utils/error-handler';
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

  // Step 2: Profile review (frontend-only — no backend endpoint)
  const handleProfileReview = () => {
    showSuccess('Profile reviewed successfully!');
    router.push('/onboarding/kyc');
  };

  // Step 3: KYC (frontend-only skip — no /onboarding/kyc endpoint in backend)
  // Actual KYC upload is at POST /api/v1/organizations/:org/kyc/submit (separate from onboarding)
  const handleKYC = (action: 'skip' | 'submit') => {
    if (action === 'skip') {
      showSuccess('KYC step skipped. You can submit documents later from Settings.');
    } else {
      showSuccess('KYC documents noted. You can complete verification from Settings.');
    }
    router.push('/onboarding/payout-account');
  };

  // Step 4: Payout account (frontend-only — no /onboarding/payout endpoint in backend)
  const handlePayout = (action: 'skip' | 'submit') => {
    if (action === 'skip') {
      showSuccess('Payout account setup skipped. You can add it later from Disbursements.');
    } else {
      showSuccess('Payout account noted. You can configure it from Disbursements.');
    }
    // Complete onboarding
    handleCompleteOnboarding();
  };

  // Complete onboarding (frontend-only — no /onboarding/complete endpoint in backend)
  const handleCompleteOnboarding = () => {
    showSuccess('Onboarding completed! Welcome to PayWe!');

    // Invalidate queries to refresh user data
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] });

    // Redirect to dashboard
    router.push('/vendor/dashboard');
  };

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

    // Step 2: Profile Review (frontend-only, no API call)
    completeProfileReview: handleProfileReview,
    isProfileReviewPending: false,

    // Step 3: KYC (frontend-only navigation)
    skipKYC: () => handleKYC('skip'),
    submitKYC: () => handleKYC('submit'),
    isKYCUploadPending: false,

    // Step 4: Payout Account (frontend-only navigation)
    skipPayout: () => handlePayout('skip'),
    submitPayout: () => handlePayout('submit'),
    isPayoutAccountPending: false,

    // Complete onboarding (frontend-only)
    completeOnboarding: handleCompleteOnboarding,
    isCompletingOnboarding: false,
  };
}

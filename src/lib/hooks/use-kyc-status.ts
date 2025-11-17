import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEffect } from 'react';

interface UseKYCStatusOptions {
  /**
   * Enable polling for real-time status updates
   * @default false
   */
  enablePolling?: boolean;
  /**
   * Polling interval in milliseconds
   * @default 10000 (10 seconds)
   */
  pollingInterval?: number;
}

/**
 * Custom hook to fetch and monitor KYC status with real-time updates
 *
 * This hook follows the Single Responsibility Principle by focusing solely
 * on KYC status management and provides a clean interface for components.
 *
 * @param options Configuration options for polling behavior
 * @returns Current KYC status and organization data
 */
export function useKYCStatus(options: UseKYCStatusOptions = {}) {
  const { enablePolling = false, pollingInterval = 10000 } = options;
  const { user, setUser } = useAuthStore();
  const organization = user?.organizations?.[0];

  // Fetch current user data with optional polling
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    refetchInterval: enablePolling ? pollingInterval : false,
    refetchIntervalInBackground: false, // Only poll when tab is active
    staleTime: enablePolling ? pollingInterval : 5 * 60 * 1000, // 5 minutes if not polling
  });

  // Update auth store when user data changes
  useEffect(() => {
    if (currentUser && currentUser !== user) {
      setUser(currentUser);
    }
  }, [currentUser, user, setUser]);

  return {
    organization,
    kycStatus: organization?.kyc_status,
    isLoading,
    // Additional metadata for convenience
    isKYCApproved: organization?.kyc_status === 'approved',
    isKYCPending: organization?.kyc_status === 'pending',
    isKYCRejected: organization?.kyc_status === 'rejected',
    isKYCNotSubmitted: organization?.kyc_status === 'not_submitted',
  };
}

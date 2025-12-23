import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type { AuthUser } from '@/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout: clearAuth, hasRole, hasPermission, hasOrganizationPermission, hasHydrated } = useAuthStore();

  // Fetch current user - skip only on login/register, but fetch on all other routes
  const isAuthRoute = typeof window !== 'undefined' &&
    (window.location.pathname === '/login' ||
     window.location.pathname === '/register');

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    // Only fetch if:
    // 1. Not on auth routes (login/register)
    // 2. Store has hydrated (to avoid race conditions)
    // 3. No user in store (need to fetch)
    enabled: !isAuthRoute && hasHydrated && !user,
    // Refetch on mount to ensure fresh data after navigation
    refetchOnMount: true,
    // Consider data stale after 30 seconds
    staleTime: 30 * 1000,
  });

  // Sync React Query cache data to Zustand store
  // This ensures Zustand always has the latest data from the cache
  useEffect(() => {
    // Get the latest data from React Query cache
    const cachedUser = queryClient.getQueryData<AuthUser>(['auth', 'me']);

    console.log('[useAuth] Syncing cache to store:', {
      hasCachedUser: !!cachedUser,
      hasStoreUser: !!user,
      cacheOrgsCount: cachedUser?.organizations?.length || 0,
      storeOrgsCount: user?.organizations?.length || 0,
      needsSync: JSON.stringify(cachedUser) !== JSON.stringify(user)
    });

    // If cache has data and it's different from store, update store
    if (cachedUser && JSON.stringify(cachedUser) !== JSON.stringify(user)) {
      console.log('[useAuth] Updating store with cached data');
      setUser(cachedUser);
    }
  }, [currentUser, user, setUser, queryClient]);

  // Helper function to check if user needs onboarding
  const needsOnboarding = (user: AuthUser) => {
    // Check if user has any organizations
    return !user.organizations || user.organizations.length === 0;
  };

  // Helper function to redirect after successful auth
  const redirectAfterAuth = (user: AuthUser) => {
    // Check if user needs to create an organization
    if (needsOnboarding(user)) {
      router.push('/onboarding');
      return;
    }

    // User has organization, redirect to dashboard
    if (user.is_super_admin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/vendor/dashboard');
    }
  };

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      console.log('[Register] Registration successful, fetching fresh user data...');

      // Force fetch fresh user data to ensure we have the latest state
      const freshUser = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.me,
        staleTime: 0, // Force fresh data
      });

      // Update both React Query cache and Zustand store with fresh data
      queryClient.setQueryData(['auth', 'me'], freshUser);
      setUser(freshUser);

      console.log('[Register] Fresh user data loaded:', {
        userId: freshUser.id,
        email: freshUser.email,
        organizationsCount: freshUser.organizations?.length || 0,
      });

      showSuccess('Account created successfully! Please complete your setup.');

      // Always redirect to onboarding after registration
      // User needs to create their organization
      router.push('/onboarding');
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      console.log('[Login] Login successful, fetching fresh user data...');

      // Force fetch fresh user data to ensure we have the latest state
      const freshUser = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.me,
        staleTime: 0, // Force fresh data
      });

      // Update both React Query cache and Zustand store with fresh data
      queryClient.setQueryData(['auth', 'me'], freshUser);
      setUser(freshUser);

      console.log('[Login] Fresh user data loaded:', {
        userId: freshUser.id,
        email: freshUser.email,
        organizationsCount: freshUser.organizations?.length || 0,
      });

      showSuccess('Welcome back!');

      // Check if user has organization and redirect
      redirectAfterAuth(freshUser);
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Onboarding mutation
  const onboardingMutation = useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: async () => {
      showSuccess('Organization setup completed successfully!');

      console.log('[Onboarding] Fetching fresh user data after organization creation...');

      // Force fetch fresh user data (bypasses the 'enabled' flag)
      // This ensures we get the updated user with the new organization
      const updatedUser = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.me,
        staleTime: 0, // Force fresh data
      });

      console.log('[Onboarding] Updated user data:', {
        userId: updatedUser.id,
        email: updatedUser.email,
        organizationsCount: updatedUser.organizations?.length || 0,
        organizations: updatedUser.organizations,
      });

      // Update both React Query cache and Zustand store with fresh data
      queryClient.setQueryData(['auth', 'me'], updatedUser);
      setUser(updatedUser);

      console.log('[Onboarding] User data updated in store.');

      // NOTE: We don't redirect here. Instead, we let the onboarding page's useEffect
      // detect the updated user.organizations and handle the redirect.
      // This ensures the component has the latest state before navigation.
    },
    onError: (error) => {
      console.error('[Onboarding] Error during onboarding:', error);
      showApiError(error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      showSuccess('Logged out successfully');
      router.push('/login');
    },
    onError: (error) => {
      // Even if logout fails on server, clear client state
      clearAuth();
      queryClient.clear();
      router.push('/login');
      showApiError(error);
    },
  });

  // Always prefer the most recent data from React Query cache
  const cachedUser = queryClient.getQueryData<AuthUser>(['auth', 'me']);
  const latestUser = cachedUser || user || currentUser;

  // Consider loading if store hasn't hydrated OR query is loading
  const isLoadingAuth = !hasHydrated || isLoading;

  return {
    user: latestUser,
    isLoading: isLoadingAuth,
    isAuthenticated: !!latestUser && hasHydrated,

    // Registration
    register: registerMutation.mutate,
    isRegisterPending: registerMutation.isPending,
    registerError: registerMutation.error,

    // Login
    login: loginMutation.mutate,
    isLoginPending: loginMutation.isPending,
    loginError: loginMutation.error,

    // Onboarding
    completeOnboarding: onboardingMutation.mutate,
    isOnboardingPending: onboardingMutation.isPending,
    onboardingError: onboardingMutation.error,
    needsOnboarding: !!latestUser && needsOnboarding(latestUser),

    // Logout
    logout: logoutMutation.mutate,

    // Permissions (from auth store)
    hasRole,
    hasPermission,
    hasOrganizationPermission,
  };
}

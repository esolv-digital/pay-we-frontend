import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type { AuthUser, SwitchContextRequest } from '@/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    setUser,
    logout: clearAuth,
    hasRole,
    hasPermission,
    hasOrganizationPermission,
    hasHydrated,
    currentContext,
    availableContexts,
    setContext,
    canSwitchToContext,
    hasMultipleContexts,
  } = useAuthStore();

  // Fetch current user - skip only on login/register, but fetch on all other routes
  const isAuthRoute = typeof window !== 'undefined' &&
    (window.location.pathname === '/login' ||
     window.location.pathname.startsWith('/login/') ||
     window.location.pathname === '/register');

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    // Only fetch if:
    // 1. Not on auth routes (login/register)
    // 2. Store has hydrated (to avoid race conditions)
    enabled: !isAuthRoute && hasHydrated,
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

    // If cache has data and it's different from store, update store
    if (cachedUser && JSON.stringify(cachedUser) !== JSON.stringify(user)) {
      setUser(cachedUser);
    }
  }, [currentUser, user, setUser, queryClient]);

  // Helper function to check if user is an administrator
  const isAdministrator = (user: AuthUser) => {
    // Check explicit admin flags from backend - DO NOT rely on !!user.admin
    // because empty admin objects {} will return true
    // Priority order:
    // 1. Explicit has_admin_access flag from backend (most reliable)
    // 2. Root level is_super_admin flag
    // 3. admin object with actual admin properties set to true
    return (
      user.has_admin_access === true ||
      user.is_super_admin === true ||
      user.admin?.is_super_admin === true ||
      user.admin?.is_platform_admin === true
    );
  };

  // Helper function to check if user needs onboarding
  const needsOnboarding = (user: AuthUser) => {
    // Administrators don't need onboarding (they don't need vendor organizations)
    if (isAdministrator(user)) {
      return false;
    }

    // Only vendor users need organizations for onboarding
    return !user.organizations || user.organizations.length === 0;
  };

  // Helper function to redirect after successful auth
  const redirectAfterAuth = (user: AuthUser, defaultContext?: 'admin' | 'vendor') => {
    const currentPath = window.location.pathname;

    console.log('[redirectAfterAuth] Determining redirect:', {
      userId: user.id,
      email: user.email,
      currentPath,
      defaultContext,
      has_admin_access: user.has_admin_access,
      has_vendor_access: user.has_vendor_access,
      is_super_admin: user.is_super_admin,
      admin: user.admin,
      isAdministrator: isAdministrator(user),
      hasOrganizations: user.organizations && user.organizations.length > 0,
      organizationsCount: user.organizations?.length || 0,
    });

    // Check if user needs to create an organization (vendors only)
    if (needsOnboarding(user)) {
      console.log('[redirectAfterAuth] User needs onboarding, redirecting to /onboarding');
      router.push('/onboarding');
      return;
    }

    // Determine target dashboard
    let targetDashboard: string;

    // Priority 1: Use default_context from login response if provided
    if (defaultContext) {
      targetDashboard = defaultContext === 'admin' ? '/admin/dashboard' : '/vendor/dashboard';
    } else {
      // Priority 2: Check explicit access flags from backend
      // Default to vendor if has_vendor_access is true OR if no admin access
      // This ensures fresh users (who are vendors by default) go to vendor dashboard
      const hasVendorAccess = user.has_vendor_access === true;
      const hasAdminAccess = isAdministrator(user);

      // If user has vendor access, prioritize vendor dashboard (default for new users)
      // Only go to admin if user explicitly has admin access AND no vendor access
      if (hasVendorAccess || !hasAdminAccess) {
        targetDashboard = '/vendor/dashboard';
      } else {
        targetDashboard = '/admin/dashboard';
      }
    }

    // Only redirect if not already on the correct dashboard
    if (!currentPath.startsWith(targetDashboard.replace('/dashboard', ''))) {
      console.log(`[redirectAfterAuth] Redirecting to ${targetDashboard}`);
      router.push(targetDashboard);
    } else {
      console.log(`[redirectAfterAuth] Already on correct dashboard (${currentPath}), skipping redirect`);
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
    onSuccess: async (data, variables) => {
      // 2FA required — hand off to the verify-2fa page before doing anything else
      if (data.two_factor_required) {
        router.push(`/login/verify-2fa?email=${encodeURIComponent(variables.email)}`);
        return;
      }

      console.log('[Login] Login successful, response data:', {
        hasDefaultContext: !!data.default_context,
        defaultContext: data.default_context,
        hasContexts: !!data.contexts,
        contexts: data.contexts,
        userFromLogin: {
          id: data.user?.id,
          has_admin_access: data.user?.has_admin_access,
          has_vendor_access: data.user?.has_vendor_access,
          admin: data.user?.admin,
        },
      });

      console.log('[Login] Fetching fresh user data from /auth/me...');

      // Force fetch fresh user data to ensure we have the latest state
      const freshUser = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.me,
        staleTime: 0, // Force fresh data
      });

      console.log('[Login] Fresh user data from /auth/me:', {
        userId: freshUser.id,
        email: freshUser.email,
        has_admin_access: freshUser.has_admin_access,
        has_vendor_access: freshUser.has_vendor_access,
        is_super_admin: freshUser.is_super_admin,
        admin: freshUser.admin,
        organizationsCount: freshUser.organizations?.length || 0,
      });

      // Update both React Query cache and Zustand store with fresh data
      queryClient.setQueryData(['auth', 'me'], freshUser);
      setUser(freshUser);

      // Store context information from login response
      if (data.contexts && data.default_context) {
        setContext(data.default_context, data.contexts);
        console.log('[Login] Context set:', {
          currentContext: data.default_context,
          availableContexts: data.contexts,
        });
      }

      showSuccess('Welcome back!');

      // Check if user has organization and redirect
      redirectAfterAuth(freshUser, data.default_context);
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

  // Get available contexts mutation
  const getContextsMutation = useMutation({
    mutationFn: authApi.getContexts,
    onSuccess: (data) => {
      // Update store with available contexts
      if (data.contexts && data.default_context) {
        setContext(data.default_context, data.contexts);
      }
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Switch context mutation
  const switchContextMutation = useMutation({
    mutationFn: (request: SwitchContextRequest) => authApi.switchContext(request),
    onSuccess: async (data) => {
      console.log('[SwitchContext] Context switched successfully');

      // Force fetch fresh user data to ensure we have the latest state
      const freshUser = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: authApi.me,
        staleTime: 0, // Force fresh data
      });

      // Update both React Query cache and Zustand store with fresh data
      queryClient.setQueryData(['auth', 'me'], freshUser);
      setUser(freshUser);

      // Update current context in store
      setContext(data.context);

      console.log('[SwitchContext] User data refreshed and context updated:', {
        newContext: data.context,
      });

      showSuccess(`Switched to ${data.context} dashboard`);

      // Redirect to appropriate dashboard
      if (data.context === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/vendor/dashboard');
      }
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Verify password before switch mutation
  const verifyPasswordMutation = useMutation({
    mutationFn: authApi.verifySwitch,
    onError: (error) => {
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

    // Context Management
    currentContext,
    availableContexts,
    canSwitchToContext,
    hasMultipleContexts: hasMultipleContexts(),
    getContexts: getContextsMutation.mutate,
    isGetContextsPending: getContextsMutation.isPending,
    switchContext: switchContextMutation.mutate,
    isSwitchContextPending: switchContextMutation.isPending,
    verifyPassword: verifyPasswordMutation.mutateAsync, // Use mutateAsync for awaitable result
    isVerifyPasswordPending: verifyPasswordMutation.isPending,

    // Permissions (from auth store)
    hasRole,
    hasPermission,
    hasOrganizationPermission,
  };
}

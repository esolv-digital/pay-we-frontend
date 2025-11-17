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
  const { user, setUser, logout: clearAuth, hasRole, hasPermission, hasOrganizationPermission } = useAuthStore();

  // Fetch current user - skip only on login/register, but fetch on all other routes
  const isAuthRoute = typeof window !== 'undefined' &&
    (window.location.pathname === '/login' ||
     window.location.pathname === '/register');

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    enabled: !user && !isAuthRoute,
  });

  // Automatically set user in auth store when query succeeds
  useEffect(() => {
    if (currentUser && !user) {
      setUser(currentUser);
    }
  }, [currentUser, user, setUser]);

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
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);

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
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);

      showSuccess('Welcome back!');

      // Check if user has organization
      redirectAfterAuth(data.user);
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  // Onboarding mutation
  const onboardingMutation = useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: () => {
      showSuccess('Organization setup completed successfully!');

      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      // Redirect to vendor dashboard
      router.push('/vendor/dashboard');
    },
    onError: (error) => {
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

  return {
    user: user || currentUser,
    isLoading,
    isAuthenticated: !!(user || currentUser),

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
    needsOnboarding: !!(user || currentUser) && needsOnboarding((user || currentUser)!),

    // Logout
    logout: logoutMutation.mutate,

    // Permissions (from auth store)
    hasRole,
    hasPermission,
    hasOrganizationPermission,
  };
}

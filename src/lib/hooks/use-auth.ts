import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { AuthUser } from '@/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout: clearAuth } = useAuthStore();

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

      // Always redirect to onboarding after registration
      // User needs to create their organization
      router.push('/onboarding');
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);

      // Check if user has organization
      redirectAfterAuth(data.user);
    },
  });

  // Onboarding mutation
  const onboardingMutation = useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: () => {
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      // Redirect to vendor dashboard
      router.push('/vendor/dashboard');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
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

    // Logout
    logout: logoutMutation.mutate,
  };
}

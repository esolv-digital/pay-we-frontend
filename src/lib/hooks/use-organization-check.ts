'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './use-auth';

/**
 * Hook to ensure authenticated users have an organization.
 * Redirects to onboarding page if user doesn't belong to any organization.
 *
 * This implements the organization check as per Agent.md BFF pattern:
 * - Users must complete onboarding and create/join an organization
 * - Protected routes should verify organization membership
 * - Redirects to /onboarding if no organization found
 */
export function useOrganizationCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't check if still loading
    if (isLoading) return;

    // Don't check if not authenticated
    if (!isAuthenticated || !user) return;

    // Don't redirect if already on onboarding page
    if (pathname === '/onboarding') return;

    // Check if user is an administrator
    const isAdministrator = user.is_super_admin || user.has_admin_access || !!user.admin?.is_super_admin || !!user.admin?.is_platform_admin || !!user.admin;

    // Administrators don't need onboarding (they don't need vendor organizations)
    if (isAdministrator) {
      console.log('User is an administrator. Skipping onboarding check.');
      return;
    }

    // Check if user has any organizations (only for non-admin users)
    const hasOrganization = user.organizations && user.organizations.length > 0;

    // If user doesn't have an organization, redirect to onboarding
    if (!hasOrganization) {
      console.log('User has no organization. Redirecting to onboarding...');
      router.push('/onboarding');
    }
  }, [user, isLoading, isAuthenticated, pathname, router]);

  // Check if user is an administrator
  const isAdministrator = user?.is_super_admin || user?.has_admin_access || !!user?.admin?.is_super_admin || !!user?.admin?.is_platform_admin || !!user?.admin;

  // Return organization check status
  const hasOrganization = user?.organizations && user.organizations.length > 0;

  return {
    hasOrganization,
    isLoading,
    needsOnboarding: !isAdministrator && !hasOrganization && isAuthenticated,
  };
}

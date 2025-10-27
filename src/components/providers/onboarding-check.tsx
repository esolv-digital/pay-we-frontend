'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';

/**
 * OnboardingCheck component
 * Checks if the authenticated user has an organization
 * If not, redirects them to the onboarding page
 * BLOCKS rendering of protected content until check is complete
 */
export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip checks while loading user data
    if (isLoading) {
      setIsChecking(true);
      return;
    }

    // Skip if no user (middleware will handle redirect to login)
    if (!user) {
      setIsChecking(false);
      return;
    }

    // Skip if already on onboarding page
    if (pathname.startsWith('/onboarding')) {
      setIsChecking(false);
      return;
    }

    // Check if user has organizations
    const hasOrganization = user.organizations && user.organizations.length > 0;

    // If user doesn't have organization, redirect to onboarding
    if (!hasOrganization) {
      console.log('[OnboardingCheck] No organization found. Redirecting to /onboarding');
      router.push('/onboarding');
      return;
    }

    // User has organization, allow access
    console.log('[OnboardingCheck] Organization found. Access granted.');
    setIsChecking(false);
  }, [user, isLoading, pathname, router]);

  // Show loading state while checking organization
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking organization...</p>
        </div>
      </div>
    );
  }

  // Check one more time before rendering - extra safety
  if (user && !pathname.startsWith('/onboarding')) {
    const hasOrganization = user.organizations && user.organizations.length > 0;
    if (!hasOrganization) {
      return null; // Don't render anything while redirecting
    }
  }

  return <>{children}</>;
}

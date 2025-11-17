'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useOrganizationCheck } from '@/lib/hooks/use-organization-check';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoading: isOrgCheckLoading, needsOnboarding } = useOrganizationCheck();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication or organization
  if (isLoading || isOrgCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Organization check hook will handle redirect to /onboarding
  // Don't render children if user needs onboarding
  if (needsOnboarding) {
    return null;
  }

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from '@/components/onboarding/progress-indicator';
import { ProfileReviewCard } from '@/components/onboarding/profile-review-card';
import { LogOut, CheckCircle } from 'lucide-react';

/**
 * Onboarding Step 2: Profile Review
 *
 * Displays user and organization information for review
 * This is a read-only confirmation step
 */
export default function ProfileReviewPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { completeProfileReview, isProfileReviewPending, status } = useOnboarding();

  // Redirect if user doesn't have organization yet
  useEffect(() => {
    if (user && (!user.organizations || user.organizations.length === 0)) {
      router.push('/onboarding');
    }
  }, [user, router]);

  // Redirect to dashboard if onboarding is complete
  useEffect(() => {
    if (status?.is_complete) {
      router.push('/vendor/dashboard');
    }
  }, [status, router]);

  if (!user || !user.organizations || user.organizations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const organization = user.organizations[0];
  const vendor = organization.vendors?.[0];

  const handleContinue = () => {
    completeProfileReview({});
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      {/* Header with Logout */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Confirm your information before continuing
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={2}
        totalSteps={4}
        completedSteps={[1]}
      />

      {/* Completed Step Indicator */}
      <div className="flex items-center gap-2 mb-6 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span>Organization Created Successfully</span>
      </div>

      {/* Profile Review Card */}
      <ProfileReviewCard
        user={{
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name,
          email: user.email,
          phone: user.phone,
        }}
        organization={{
          name: organization.name,
          type: organization.type as 'individual' | 'corporate',
          country_code: organization.country_code,
          country_name: organization.country_code,
        }}
      />

      {/* Info Box */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>What's next?</strong>
          <br />
          We'll help you set up KYC verification and configure your payout account. Both
          steps are optional and can be completed later.
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={isProfileReviewPending}
          className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isProfileReviewPending ? 'Processing...' : 'Continue →'}
        </Button>
      </div>
    </div>
  );
}

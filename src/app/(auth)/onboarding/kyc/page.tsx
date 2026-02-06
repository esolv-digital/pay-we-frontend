'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from '@/components/onboarding/progress-indicator';
import { KYCUploadForm } from '@/components/onboarding/kyc-upload-form';
import { LogOut, CheckCircle } from 'lucide-react';

/**
 * Onboarding Step 3: KYC Upload
 *
 * Allows users to upload KYC documents
 * This step is optional and can be skipped
 */
export default function KYCUploadPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { uploadKYC, isKYCUploadPending, status } = useOnboarding();

  // Redirect if user doesn't have organization
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

  const handleSubmit = (data: { documentType: string; file: File }) => {
    uploadKYC({
      document_type: data.documentType,
      file: data.file,
    });
  };

  const handleSkip = () => {
    uploadKYC({ skip: true });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      {/* Header with Logout */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload KYC Documents</h1>
          <p className="text-gray-600 mt-2">
            Optional: Verify your identity to unlock all features
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
        currentStep={3}
        totalSteps={4}
        completedSteps={[1, 2]}
      />

      {/* Completed Steps Indicator */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Organization Created</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Profile Reviewed</span>
        </div>
      </div>

      {/* KYC Upload Form */}
      <KYCUploadForm
        onSubmit={handleSubmit}
        onSkip={handleSkip}
        isLoading={isKYCUploadPending}
      />

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Why verify your identity?</h4>
        <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
          <li>Increase transaction limits</li>
          <li>Build trust with your customers</li>
          <li>Faster dispute resolution</li>
          <li>Access to premium features</li>
        </ul>
      </div>
    </div>
  );
}

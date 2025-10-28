'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';

export function KYCBanner() {
  const { user } = useAuth();

  // Get user's organization
  const organization = user?.organizations?.[0];

  if (!organization) return null;

  const kycStatus = organization.kyc_status;

  // Don't show banner if KYC is approved
  if (kycStatus === 'approved') return null;

  // Render different banners based on KYC status
  if (kycStatus === 'not_submitted') {
    return (
      <Alert className="border-l-4 border-l-orange-500 bg-orange-50">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <AlertTitle className="text-orange-900 font-semibold">
          Complete Your KYC Verification
        </AlertTitle>
        <AlertDescription className="text-orange-800 mt-2">
          <p className="mb-3">
            To start accepting payments and unlock all features, please complete your KYC (Know Your Customer) verification.
          </p>
          <Link href="/vendor/kyc">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              Complete KYC Now
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <Alert className="border-l-4 border-l-blue-500 bg-blue-50">
        <Clock className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 font-semibold">
          KYC Verification In Progress
        </AlertTitle>
        <AlertDescription className="text-blue-800 mt-2">
          <p className="mb-3">
            Your KYC documents are being reviewed. This typically takes 1-2 business days. We'll notify you once the review is complete.
          </p>
          <Link href="/vendor/kyc">
            <Button size="sm" variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-100">
              View Submission
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (kycStatus === 'rejected') {
    return (
      <Alert className="border-l-4 border-l-red-500 bg-red-50">
        <XCircle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-900 font-semibold">
          KYC Verification Rejected
        </AlertTitle>
        <AlertDescription className="text-red-800 mt-2">
          <p className="mb-3">
            Unfortunately, your KYC submission was rejected. Please review the feedback and submit updated documents.
          </p>
          <Link href="/vendor/kyc">
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              Resubmit KYC
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

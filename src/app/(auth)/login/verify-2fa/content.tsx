'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TwoFactorChallenge } from '@/components/auth/two-factor-challenge';
import { RecoveryCodeLogin } from '@/components/auth/recovery-code-login';
import { useVerify2FALogin } from '@/lib/hooks/use-two-factor';
import { useAuth } from '@/lib/hooks/use-auth';

type VerificationMode = 'code' | 'recovery';

export function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<VerificationMode>('code');
  const [error, setError] = useState<string | null>(null);

  const verify2FA = useVerify2FALogin();
  const { user } = useAuth();

  // Get email from query params (passed from login page)
  const email = searchParams.get('email');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/vendor/dashboard');
    }
  }, [user, router]);

  // Redirect to login if no email in params
  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleVerifyCode = (code: string) => {
    setError(null);
    verify2FA.mutate(code, {
      onSuccess: () => {
        // Session is now fully authenticated. Navigate to dashboard —
        // useAuth there will fetch the fresh user on mount.
        router.push('/vendor/dashboard');
      },
      onError: (err: any) => {
        setError(err?.message || 'Invalid verification code. Please try again.');
      },
    });
  };

  const handleCancel = () => {
    router.push('/login');
  };

  const handleUseRecoveryCode = () => {
    setMode('recovery');
    setError(null);
  };

  const handleBackToCode = () => {
    setMode('code');
    setError(null);
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {mode === 'code' ? (
        <TwoFactorChallenge
          onVerify={handleVerifyCode}
          onUseRecoveryCode={handleUseRecoveryCode}
          onCancel={handleCancel}
          isVerifying={verify2FA.isPending}
          error={error}
          userEmail={email}
        />
      ) : (
        <RecoveryCodeLogin
          onVerify={handleVerifyCode}
          onBack={handleBackToCode}
          isVerifying={verify2FA.isPending}
          error={error}
          userEmail={email}
        />
      )}
    </div>
  );
}

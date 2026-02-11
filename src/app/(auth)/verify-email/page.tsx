'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVerifyEmail, useResendVerification } from '@/lib/hooks/use-email-verification';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

type VerificationState = 'loading' | 'success' | 'already_verified' | 'expired' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const [state, setState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const id = searchParams.get('id');
  const hash = searchParams.get('hash');
  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');

  useEffect(() => {
    if (!id || !hash || !expires) {
      setState('error');
      setErrorMessage('Invalid verification link. Missing required parameters.');
      return;
    }

    verifyEmail.mutate(
      { id, hash, expires, signature: signature || undefined },
      {
        onSuccess: (data) => {
          if (data?.already_verified) {
            setState('already_verified');
          } else {
            setState('success');
          }
        },
        onError: (error: unknown) => {
          const apiError = error as {
            response?: { data?: { message?: string }; status?: number };
          };
          const status = apiError.response?.status;
          const message = apiError.response?.data?.message || 'Verification failed.';

          if (status === 403 && message.toLowerCase().includes('expired')) {
            setState('expired');
            setErrorMessage(message);
          } else {
            setState('error');
            setErrorMessage(message);
          }
        },
      }
    );
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = () => {
    resendVerification.mutate();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-center">
      {state === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-6">
            Your email address has been verified successfully. You can now access all features.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Continue to Login
          </Link>
        </>
      )}

      {state === 'already_verified' && (
        <>
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Verified</h1>
          <p className="text-gray-600 mb-6">
            Your email address has already been verified.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Continue to Login
          </Link>
        </>
      )}

      {state === 'expired' && (
        <>
          <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'Your verification link has expired. Please request a new one.'}
          </p>
          <button
            onClick={handleResend}
            disabled={resendVerification.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            {resendVerification.isPending ? 'Sending...' : 'Resend Verification Email'}
          </button>
          {resendVerification.isSuccess && (
            <p className="mt-3 text-sm text-green-600">
              Verification email sent! Check your inbox.
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            You must be{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              logged in
            </Link>{' '}
            to resend the verification email.
          </p>
        </>
      )}

      {state === 'error' && (
        <>
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'Something went wrong while verifying your email.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resendVerification.isPending}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {resendVerification.isPending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            {resendVerification.isSuccess && (
              <p className="text-sm text-green-600">
                Verification email sent! Check your inbox.
              </p>
            )}
            <p className="text-sm text-gray-500">
              You must be{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                logged in
              </Link>{' '}
              to resend the verification email.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

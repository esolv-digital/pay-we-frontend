/**
 * Two-Factor Challenge Component
 *
 * Single Responsibility: Handle 2FA verification during login
 * Reusable component for login 2FA challenge
 * Follows DRY by reusing verification input logic
 */

'use client';

import { useState } from 'react';
import { Shield, Key, ArrowLeft, AlertCircle } from 'lucide-react';
import { VerificationInput } from '@/components/settings/two-factor/verification-input';

interface TwoFactorChallengeProps {
  onVerify: (code: string) => void;
  onUseRecoveryCode: () => void;
  onCancel: () => void;
  isVerifying?: boolean;
  error?: string | null;
  userEmail?: string;
}

export function TwoFactorChallenge({
  onVerify,
  onUseRecoveryCode,
  onCancel,
  isVerifying = false,
  error = null,
  userEmail,
}: TwoFactorChallengeProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
        </div>

        {userEmail && (
          <p className="text-sm text-gray-600">
            Logging in as <span className="font-medium">{userEmail}</span>
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          Open your authenticator app and enter the 6-digit verification code to complete your login.
        </p>
      </div>

      {/* Verification Input */}
      <div className="mb-6">
        <VerificationInput
          onVerify={onVerify}
          onCancel={onCancel}
          isVerifying={isVerifying}
          error={error}
        />
      </div>

      {/* Recovery Code Option */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Lost access to your authenticator app?
          </p>
          <button
            type="button"
            onClick={onUseRecoveryCode}
            disabled={isVerifying}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            Use a recovery code instead
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Having trouble?</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Make sure your device's time is synchronized</li>
          <li>• Check that you're using the correct account in your authenticator app</li>
          <li>• Try closing and reopening your authenticator app</li>
        </ul>
      </div>
    </div>
  );
}

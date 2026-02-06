/**
 * Two-Factor Authentication Settings Component
 *
 * Main component that orchestrates 2FA setup, verification, and management
 * Follows SOLID principles:
 * - Single Responsibility: Manage 2FA state and flow
 * - Open/Closed: Extensible through sub-components
 * - Dependency Inversion: Depends on hooks (abstractions)
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  use2FAStatus,
  useEnable2FA,
  useConfirm2FA,
  useDisable2FA,
  useRegenerateRecoveryCodes,
} from '@/lib/hooks/use-two-factor';
import { QRCodeSetup } from './two-factor/qr-code-setup';
import { VerificationInput } from './two-factor/verification-input';
import { RecoveryCodesDisplay } from './two-factor/recovery-codes-display';
import { Shield, ShieldCheck, ShieldOff, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema for disable 2FA
const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required to disable 2FA'),
});

type Disable2FAFormData = z.infer<typeof disable2FASchema>;

/**
 * Setup flow states (Finite State Machine pattern)
 */
type SetupState = 'idle' | 'qr-display' | 'verification' | 'recovery-codes';

export function TwoFactorSettings() {
  // Hooks
  const { data: status, isLoading } = use2FAStatus();
  const enable2FA = useEnable2FA();
  const confirm2FA = useConfirm2FA();
  const disable2FA = useDisable2FA();
  const regenerateCodes = useRegenerateRecoveryCodes();

  // State management
  const [setupState, setSetupState] = useState<SetupState>('idle');
  const [setupData, setSetupData] = useState<{ secret: string; qr_code_url: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showDisableForm, setShowDisableForm] = useState(false);

  // Form for disabling 2FA
  const disableForm = useForm<Disable2FAFormData>({
    resolver: zodResolver(disable2FASchema),
    defaultValues: {
      password: '',
    },
  });

  // Handlers

  /**
   * Start 2FA setup flow
   */
  const handleStartSetup = async () => {
    setVerificationError(null);
    enable2FA.mutate(undefined, {
      onSuccess: (data) => {
        setSetupData(data);
        setSetupState('qr-display');
      },
    });
  };

  /**
   * Cancel setup and return to idle
   */
  const handleCancelSetup = () => {
    setSetupState('idle');
    setSetupData(null);
    setVerificationError(null);
  };

  /**
   * Move from QR display to verification
   */
  const handleProceedToVerification = () => {
    setSetupState('verification');
  };

  /**
   * Verify 2FA code
   */
  const handleVerifyCode = (code: string) => {
    setVerificationError(null);
    confirm2FA.mutate(
      { code },
      {
        onSuccess: (data) => {
          setRecoveryCodes(data.recovery_codes);
          setSetupState('recovery-codes');
          setSetupData(null);
        },
        onError: (error: any) => {
          setVerificationError(error?.message || 'Invalid verification code. Please try again.');
        },
      }
    );
  };

  /**
   * Close recovery codes display
   */
  const handleCloseRecoveryCodes = () => {
    setSetupState('idle');
    setRecoveryCodes(null);
  };

  /**
   * Disable 2FA
   */
  const handleDisable2FA = (data: Disable2FAFormData) => {
    disable2FA.mutate(data, {
      onSuccess: () => {
        setShowDisableForm(false);
        disableForm.reset();
      },
    });
  };

  /**
   * Regenerate recovery codes
   */
  const handleRegenerateCodes = () => {
    if (confirm('Regenerating codes will invalidate your current recovery codes. Continue?')) {
      regenerateCodes.mutate(undefined, {
        onSuccess: (data) => {
          setRecoveryCodes(data.recovery_codes);
          setSetupState('recovery-codes');
        },
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const is2FAEnabled = status?.enabled && status?.confirmed;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600">
          Add an extra layer of security to your account by requiring a verification code in addition to your password.
        </p>
      </div>

      {/* Current Status */}
      <div className={cn(
        'mb-6 p-4 rounded-lg border-2 flex items-start gap-3',
        is2FAEnabled
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-200'
      )}>
        {is2FAEnabled ? (
          <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <ShieldOff className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {is2FAEnabled ? 'Two-Factor Authentication is Enabled' : 'Two-Factor Authentication is Disabled'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {is2FAEnabled
              ? 'Your account is protected with two-factor authentication.'
              : 'Enable two-factor authentication to enhance your account security.'
            }
          </p>
          {is2FAEnabled && status?.recovery_codes_count !== undefined && (
            <p className="text-sm text-gray-600 mt-2">
              <Key className="w-4 h-4 inline mr-1" />
              Recovery codes available: {status.recovery_codes_count}
            </p>
          )}
        </div>
      </div>

      {/* Setup Flow */}
      {setupState === 'qr-display' && setupData && (
        <div className="mb-6">
          <QRCodeSetup
            qrCodeUrl={setupData.qr_code_url}
            secret={setupData.secret}
            onCancel={handleCancelSetup}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleProceedToVerification}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              I've Scanned the QR Code
            </button>
          </div>
        </div>
      )}

      {setupState === 'verification' && (
        <div className="mb-6">
          <VerificationInput
            onVerify={handleVerifyCode}
            onCancel={handleCancelSetup}
            isVerifying={confirm2FA.isPending}
            error={verificationError}
          />
        </div>
      )}

      {setupState === 'recovery-codes' && recoveryCodes && (
        <div className="mb-6">
          <RecoveryCodesDisplay
            codes={recoveryCodes}
            onClose={handleCloseRecoveryCodes}
            isNewSetup={!is2FAEnabled}
          />
        </div>
      )}

      {/* Actions */}
      {setupState === 'idle' && (
        <div className="space-y-4">
          {!is2FAEnabled ? (
            /* Enable 2FA Button */
            <div>
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={enable2FA.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield className="w-5 h-5" />
                {enable2FA.isPending ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </button>
            </div>
          ) : (
            /* Manage 2FA */
            <div className="space-y-4">
              {/* Regenerate Recovery Codes */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">Recovery Codes</h3>
                    <p className="text-sm text-gray-600">
                      Generate new recovery codes. This will invalidate your current codes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateCodes}
                    disabled={regenerateCodes.isPending}
                    className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {regenerateCodes.isPending ? 'Generating...' : 'Regenerate Codes'}
                  </button>
                </div>
              </div>

              {/* Disable 2FA */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">Disable Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">
                      Remove two-factor authentication from your account. This will make your account less secure.
                    </p>
                  </div>
                  {!showDisableForm && (
                    <button
                      type="button"
                      onClick={() => setShowDisableForm(true)}
                      className="ml-4 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-100"
                    >
                      Disable 2FA
                    </button>
                  )}
                </div>

                {showDisableForm && (
                  <form onSubmit={disableForm.handleSubmit(handleDisable2FA)} className="mt-4 pt-4 border-t border-red-200">
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        Enter your password to confirm you want to disable two-factor authentication.
                      </p>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="disable-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        id="disable-password"
                        type="password"
                        {...disableForm.register('password')}
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                          disableForm.formState.errors.password ? 'border-red-500' : 'border-gray-300'
                        )}
                        placeholder="Enter your password"
                      />
                      {disableForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">{disableForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisableForm(false);
                          disableForm.reset();
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={disable2FA.isPending}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {disable2FA.isPending ? 'Disabling...' : 'Confirm Disable'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      {setupState === 'idle' && !is2FAEnabled && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What is Two-Factor Authentication?</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Adds an extra layer of security to your account</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Requires a code from your phone in addition to your password</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Protects your account even if your password is compromised</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Works with popular authenticator apps like Google Authenticator and Authy</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useChangePassword } from '@/lib/hooks/use-profile';
import { useEnable2FA, useConfirm2FA, useDisable2FA, useRegenerateRecoveryCodes } from '@/lib/hooks/use-two-factor';
import { useSocialAuth } from '@/lib/hooks/use-social-auth';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  new_password_confirmation: z.string(),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Passwords don't match",
  path: ['new_password_confirmation'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SecuritySettings() {
  const { data: profile } = useProfile();
  const changePassword = useChangePassword();
  const enable2FA = useEnable2FA();
  const confirm2FA = useConfirm2FA();
  const disable2FA = useDisable2FA();
  const regenerateCodes = useRegenerateRecoveryCodes();
  const { isGoogleConnected, hasPassword, linkGoogle, unlinkGoogle, isUnlinking } = useSocialAuth();

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; provisioning_uri: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  };

  const handleSetup2FA = async () => {
    enable2FA.mutate(undefined, {
      onSuccess: (data) => {
        setSetupData(data);
        setShow2FASetup(true);
      },
    });
  };

  const handleVerify2FA = () => {
    confirm2FA.mutate({ code: verificationCode }, {
      onSuccess: (data) => {
        setShow2FASetup(false);
        setSetupData(null);
        setVerificationCode('');
        setRecoveryCodes(data.recovery_codes);
        setShowRecoveryCodes(true);
      },
    });
  };

  const handleDisable2FA = () => {
    if (!disablePassword) {
      alert('Please enter your password');
      return;
    }
    disable2FA.mutate({ password: disablePassword }, {
      onSuccess: () => {
        setDisablePassword('');
      },
    });
  };

  const handleRegenerateCodes = async () => {
    regenerateCodes.mutate(undefined, {
      onSuccess: (data) => {
        setRecoveryCodes(data.recovery_codes);
        setShowRecoveryCodes(true);
      },
    });
  };

  const handleUnlinkGoogle = () => {
    if (!hasPassword) {
      alert('You must set a password before unlinking your Google account.');
      return;
    }
    if (confirm('Are you sure you want to unlink your Google account?')) {
      unlinkGoogle();
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Password Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="max-w-md space-y-4">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="current_password"
              type="password"
              {...passwordForm.register('current_password')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                passwordForm.formState.errors.current_password ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {passwordForm.formState.errors.current_password && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="new_password"
              type="password"
              {...passwordForm.register('new_password')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                passwordForm.formState.errors.new_password ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {passwordForm.formState.errors.new_password && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="new_password_confirmation"
              type="password"
              {...passwordForm.register('new_password_confirmation')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                passwordForm.formState.errors.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {passwordForm.formState.errors.new_password_confirmation && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.new_password_confirmation.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {changePassword.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Two-Factor Authentication Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>

        {profile?.two_factor_enabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-green-700 font-medium">Two-factor authentication is enabled</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <h4 className="font-medium mb-2">Disable 2FA</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Enter your password to disable two-factor authentication.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="password"
                    placeholder="Password"
                    aria-label="Password to disable 2FA"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={disable2FA.isPending}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {disable2FA.isPending ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={handleRegenerateCodes}
                  disabled={regenerateCodes.isPending}
                  className="text-blue-600 text-sm hover:underline"
                >
                  {regenerateCodes.isPending ? 'Regenerating...' : 'Regenerate recovery codes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>

            {!show2FASetup ? (
              <button
                type="button"
                onClick={handleSetup2FA}
                disabled={enable2FA.isPending}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {enable2FA.isPending ? 'Setting up...' : 'Enable 2FA'}
              </button>
            ) : setupData && (
              <div className="bg-gray-50 p-6 rounded-lg max-w-md">
                <h3 className="font-medium mb-4">Scan QR Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>

                <div className="flex justify-center mb-4">
                  <QRCodeSVG value={setupData.provisioning_uri} size={192} level="M" />
                </div>

                <p className="text-xs text-gray-500 mb-4 text-center">
                  Or enter this code manually: <code className="bg-gray-200 px-2 py-1 rounded">{setupData.secret}</code>
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    aria-label="6-digit verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-xl tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerify2FA}
                    disabled={confirm2FA.isPending || verificationCode.length !== 6}
                    className="w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {confirm2FA.isPending ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShow2FASetup(false);
                      setSetupData(null);
                    }}
                    className="w-full px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recovery Codes Modal */}
        {showRecoveryCodes && recoveryCodes && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Save Your Recovery Codes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono">{code}</code>
                ))}
              </div>

              <p className="text-xs text-red-600 mb-4">
                Each code can only be used once. Once you close this dialog, you won't see these codes again.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryCodes.join('\n'));
                    alert('Recovery codes copied to clipboard');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Copy Codes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryCodes(false);
                    setRecoveryCodes(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  I've Saved Them
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Connected Accounts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>

        <div className="space-y-4">
          {/* Google */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div>
                <p className="font-medium">Google</p>
                {isGoogleConnected ? (
                  <p className="text-sm text-green-600">Connected</p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>

            {isGoogleConnected ? (
              <button
                type="button"
                onClick={handleUnlinkGoogle}
                disabled={isUnlinking}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {isUnlinking ? 'Unlinking...' : 'Unlink'}
              </button>
            ) : (
              <button
                type="button"
                onClick={linkGoogle}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

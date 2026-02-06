/**
 * Recovery Code Login Component
 *
 * Single Responsibility: Handle login with recovery code
 * Alternative login method when authenticator is unavailable
 */

'use client';

import { useState } from 'react';
import { Key, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecoveryCodeLoginProps {
  onVerify: (code: string) => void;
  onBack: () => void;
  isVerifying?: boolean;
  error?: string | null;
  userEmail?: string;
}

export function RecoveryCodeLogin({
  onVerify,
  onBack,
  isVerifying = false,
  error = null,
  userEmail,
}: RecoveryCodeLoginProps) {
  const [recoveryCode, setRecoveryCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryCode.trim()) {
      onVerify(recoveryCode.trim());
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to 2FA verification
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Key className="w-6 h-6 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Use Recovery Code</h1>
        </div>

        {userEmail && (
          <p className="text-sm text-gray-600">
            Logging in as <span className="font-medium">{userEmail}</span>
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">
              Recovery Code Authentication
            </p>
            <p className="text-sm text-yellow-800">
              Enter one of your recovery codes. Each code can only be used once.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="recovery-code" className="block text-sm font-medium text-gray-700 mb-2">
            Recovery Code
          </label>
          <input
            id="recovery-code"
            type="text"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            disabled={isVerifying}
            placeholder="Enter your recovery code"
            className={cn(
              'w-full px-4 py-3 border-2 rounded-lg font-mono text-center tracking-wider uppercase focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500',
              error ? 'border-red-500' : 'border-gray-300',
              isVerifying && 'bg-gray-100 cursor-not-allowed'
            )}
            autoComplete="off"
            autoFocus
          />
          <p className="mt-2 text-xs text-gray-500">
            Recovery codes are case-insensitive and may contain hyphens
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Verification Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isVerifying || !recoveryCode.trim()}
          className="w-full px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isVerifying ? 'Verifying...' : 'Verify Recovery Code'}
        </button>
      </form>

      {/* Warning */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Important Notes</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Each recovery code can only be used once</li>
          <li>• After using all codes, you'll need to regenerate new ones</li>
          <li>• Keep your remaining codes in a safe place</li>
          <li>• Consider re-enabling your authenticator app in settings</li>
        </ul>
      </div>

      {/* Help Link */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Can't access your recovery codes?{' '}
          <a href="/support" className="text-blue-600 hover:text-blue-700">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

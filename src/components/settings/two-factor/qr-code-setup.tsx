/**
 * QR Code Setup Component
 *
 * Single Responsibility: Display QR code and setup instructions for 2FA
 * Reusable sub-component following SRP
 */

'use client';

import { useState } from 'react';
import { Smartphone, Copy, Check } from 'lucide-react';

interface QRCodeSetupProps {
  qrCodeUrl: string;
  secret: string;
  onCancel: () => void;
}

export function QRCodeSetup({ qrCodeUrl, secret, onCancel }: QRCodeSetupProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy secret:', err);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Set Up Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-600">
            Scan the QR code with your authenticator app to link your account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1: Install App */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Step 1: Install Authenticator App</h4>
          <p className="text-sm text-gray-600">
            If you haven't already, install an authenticator app like:
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
            <li>Google Authenticator</li>
            <li>Microsoft Authenticator</li>
            <li>Authy</li>
            <li>1Password</li>
          </ul>
        </div>

        {/* Step 2: Scan QR Code */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Step 2: Scan QR Code</h4>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
              <img
                src={qrCodeUrl}
                alt="2FA QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Open your authenticator app and scan this QR code to add your account
            </p>
          </div>
        </div>

        {/* Step 3: Manual Entry */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            Alternative: Enter Code Manually
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            If you can't scan the QR code, enter this code manually:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 px-3 py-2 rounded border border-gray-300 font-mono text-sm">
              {secret}
            </code>
            <button
              type="button"
              onClick={handleCopySecret}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Copy secret"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel Setup
        </button>
      </div>
    </div>
  );
}

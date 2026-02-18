/**
 * Recovery Codes Display Component
 *
 * Single Responsibility: Display and manage recovery codes
 * Reusable component for showing backup codes
 */

'use client';

import { useState } from 'react';
import { Download, Copy, Check, AlertTriangle, Printer } from 'lucide-react';

interface RecoveryCodesDisplayProps {
  codes: string[];
  onClose: () => void;
  isNewSetup?: boolean;
}

export function RecoveryCodesDisplay({
  codes,
  onClose,
  isNewSetup = false,
}: RecoveryCodesDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCodes = async () => {
    try {
      const codesText = codes.join('\n');
      await navigator.clipboard.writeText(codesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy codes:', err);
    }
  };

  const handleDownload = () => {
    const codesText = codes.join('\n');
    const blob = new Blob([`PayWe Two-Factor Authentication Recovery Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${codesText}\n\nKeep these codes secure. Each code can only be used once.`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paywe-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PayWe Recovery Codes</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 600px;
                margin: 0 auto;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
              }
              .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
              .codes {
                background: #f3f4f6;
                padding: 20px;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 16px;
                line-height: 2;
              }
              .code {
                display: block;
                padding: 5px;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <h1>PayWe Two-Factor Authentication Recovery Codes</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <div class="warning">
              <strong>Important:</strong> Store these codes in a safe place. Each code can only be used once.
            </div>
            <div class="codes">
              ${codes.map(code => `<span class="code">${code}</span>`).join('')}
            </div>
            <div class="footer">
              <p>Keep these codes secure and do not share them with anyone.</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isNewSetup ? 'Two-Factor Authentication Enabled!' : 'New Recovery Codes Generated'}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          {isNewSetup
            ? 'Your account is now protected with two-factor authentication.'
            : 'Your previous recovery codes are now invalid.'
          }
        </p>
      </div>

      {/* Warning */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-900 mb-1">
            Save These Recovery Codes
          </p>
          <p className="text-sm text-yellow-800">
            Store these codes in a safe place. You'll need them to access your account if you lose your authenticator device. Each code can only be used once.
          </p>
        </div>
      </div>

      {/* Recovery Codes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Recovery Codes ({codes.length} codes)
        </label>
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {codes.map((code, index) => (
              <div
                key={index}
                className="bg-gray-50 px-3 py-2 rounded border border-gray-200"
              >
                {code}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={handleCopyCodes}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Codes
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Close Button */}
      <div className="pt-4 border-t border-green-200">
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          I've Saved My Recovery Codes
        </button>
      </div>
    </div>
  );
}

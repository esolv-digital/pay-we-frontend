'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePayoutAccounts, useRequestPayout } from '@/lib/hooks/use-payouts';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface RequestPayoutDialogProps {
  availableBalance: number;
  currency: string;
  minimumPayoutAmount?: number;
  onClose: () => void;
}

export function RequestPayoutDialog({ availableBalance, currency, minimumPayoutAmount, onClose }: RequestPayoutDialogProps) {
  const { data: accounts } = usePayoutAccounts();
  const requestPayout = useRequestPayout();

  const [step, setStep] = useState<'form' | 'confirm'>('form');

  // Use API-provided minimum or fallback to default (100 GHS = 10000 pesewas)
  const MIN_PAYOUT = minimumPayoutAmount || 10000;
  const MAX_PAYOUT = availableBalance;

  const payoutSchema = z.object({
    payout_account_id: z.string().min(1, 'Please select an account'),
    amount: z
      .number()
      .min(MIN_PAYOUT, `Minimum payout is ${formatCurrency(MIN_PAYOUT, currency)}`)
      .max(MAX_PAYOUT, `Maximum payout is ${formatCurrency(MAX_PAYOUT, currency)}`),
    description: z.string().optional(),
  });

  type PayoutFormData = z.infer<typeof payoutSchema>;

  const form = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      payout_account_id: accounts?.find((a) => a.is_default)?.id || '',
      amount: 0,
      description: '',
    },
  });

  const selectedAccountId = form.watch('payout_account_id');
  const amount = form.watch('amount');
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId);

  // Calculate fee (1% for example)
  const feePercentage = 0.01;
  const fee = Math.round(amount * feePercentage);
  const netAmount = amount - fee;

  // Get display name for the account
  const getAccountDisplayName = (account: typeof selectedAccount) => {
    if (!account) return '';
    return account.type === 'bank'
      ? account.bank_name || 'Bank Account'
      : account.network_name || account.network?.toUpperCase() || 'Mobile Money';
  };

  const getAccountNumber = (account: typeof selectedAccount) => {
    if (!account) return '';
    return account.type === 'bank'
      ? account.account_number
      : account.phone_number;
  };

  const handleContinue = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setStep('confirm');
    }
  };

  const handleSubmit = () => {
    const values = form.getValues();

    requestPayout.mutate(
      {
        payout_account_id: values.payout_account_id,
        amount: values.amount,
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleAmountPreset = (percentage: number) => {
    const presetAmount = Math.floor(availableBalance * percentage);
    form.setValue('amount', presetAmount, { shouldValidate: true });
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 text-center">
          <span className="text-6xl block mb-4">🏦</span>
          <h2 className="text-xl font-semibold mb-2">No Payout Account</h2>
          <p className="text-gray-600 mb-6">
            You need to add a payout account before requesting a payout.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Request Payout</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'form' && (
            <div className="space-y-4">
              {/* Available Balance Display */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(availableBalance, currency)}
                </p>
              </div>

              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payout Account
                </label>
                <select
                  {...form.register('payout_account_id')}
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                    form.formState.errors.payout_account_id ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {getAccountDisplayName(account)} - {getAccountNumber(account)}
                      {account.is_default ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
                {form.formState.errors.payout_account_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.payout_account_id.message}
                  </p>
                )}
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  {...form.register('amount', { valueAsNumber: true })}
                  placeholder="Enter amount"
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                    form.formState.errors.amount ? 'border-red-500' : 'border-gray-300'
                  )}
                />
                {form.formState.errors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.amount.message}
                  </p>
                )}

                {/* Quick Amount Presets */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleAmountPreset(0.25)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountPreset(0.5)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountPreset(0.75)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmountPreset(1)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  {...form.register('description')}
                  placeholder="e.g., Weekly payout"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fee Breakdown */}
              {amount > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span>{formatCurrency(amount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee (1%)</span>
                    <span className="text-red-600">-{formatCurrency(fee, currency)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>You'll receive</span>
                    <span className="text-green-600">{formatCurrency(netAmount, currency)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && selectedAccount && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600 mb-1">You're requesting</p>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(amount, currency)}
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">To Account</span>
                  <span className="font-medium">{getAccountDisplayName(selectedAccount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {selectedAccount.type === 'bank' ? 'Account Number' : 'Phone Number'}
                  </span>
                  <span className="font-medium">{getAccountNumber(selectedAccount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name</span>
                  <span className="font-medium">{selectedAccount.account_name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Transfer Fee</span>
                  <span className="text-red-600">-{formatCurrency(fee, currency)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Net Amount</span>
                  <span className="text-green-600">{formatCurrency(netAmount, currency)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Payouts typically arrive within 24 hours for bank transfers and instantly for mobile money.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          {step === 'form' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={amount <= 0}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={requestPayout.isPending}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {requestPayout.isPending ? 'Processing...' : 'Confirm Payout'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

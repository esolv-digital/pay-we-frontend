'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVerifyAccount, useCreatePayoutAccount } from '@/lib/hooks/use-payouts';
import { useProviders } from '@/lib/hooks/use-providers';
import { useCountry } from '@/lib/hooks/use-countries';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { PayoutAccountType, Provider } from '@/types';

const accountSchema = z.object({
  account_type: z.enum(['bank', 'mobile_money']),
  provider_code: z.string().min(1, 'Please select a provider'),
  account_number: z.string().optional(),
  phone_number: z.string().optional(),
  is_default: z.boolean(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AddPayoutAccountDialogProps {
  onClose: () => void;
}

export function AddPayoutAccountDialog({ onClose }: AddPayoutAccountDialogProps) {
  const { user } = useAuth();
  // Get country code from organization or default to Ghana
  const countryCode = user?.organizations?.[0]?.country_code || 'GH';
  // Get currency from the vendor's currency_code
  const currency = user?.vendors?.[0]?.currency_code || 'GHS';

  // Fetch country details to get the country name for the providers API
  const { data: countryData, isLoading: countryLoading } = useCountry(countryCode);
  // Convert to lowercase country name for the providers API (e.g., 'Ghana' -> 'ghana')
  const countryName = countryData?.name?.toLowerCase() || 'ghana';

  // Fetch all providers (banks + mobile money) from the gateway-aware backend
  const { data: providersData, isLoading: providersDataLoading } = useProviders({
    country: countryName,
    currency: currency,
  });

  // Combined loading state for both country and providers
  const providersLoading = countryLoading || providersDataLoading;

  const verifyAccount = useVerifyAccount();
  const createAccount = useCreatePayoutAccount();

  // Extract banks and mobile money providers from response
  const banks: Provider[] = providersData?.banks ?? [];
  const mobileMoneyProviders: Provider[] = providersData?.mobile_money ?? [];

  const [step, setStep] = useState<'form' | 'verify' | 'confirm'>('form');
  const [verifiedData, setVerifiedData] = useState<{
    account_name: string;
    provider_name: string;
  } | null>(null);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account_type: 'bank',
      provider_code: '',
      account_number: '',
      phone_number: '',
      is_default: false,
    },
  });

  const accountType = form.watch('account_type') as PayoutAccountType;
  const providerCode = form.watch('provider_code');

  // Get selected provider based on account type
  const selectedProvider = accountType === 'bank'
    ? banks.find((b) => b.code === providerCode)
    : mobileMoneyProviders.find((m) => m.code === providerCode);

  // Get current providers list based on account type
  const currentProviders = accountType === 'bank' ? banks : mobileMoneyProviders;

  const handleVerify = async () => {
    const values = form.getValues();

    if (accountType === 'mobile_money') {
      // Validate mobile money fields
      const isValid = await form.trigger(['provider_code', 'phone_number']);
      if (!isValid) return;

      // Verify mobile money account with backend
      verifyAccount.mutate(
        {
          account_type: 'mobile_money',
          provider_code: values.provider_code,
          phone_number: values.phone_number || '',
        },
        {
          onSuccess: (data) => {
            setVerifiedData({
              account_name: data.account_name || 'Mobile Money Account',
              provider_name: selectedProvider?.name || 'Unknown Network',
            });
            setStep('confirm');
          },
        }
      );
      return;
    }

    // Bank account - verify with backend
    const isValid = await form.trigger(['provider_code', 'account_number']);
    if (!isValid) return;

    verifyAccount.mutate(
      {
        account_type: 'bank',
        provider_code: values.provider_code,
        account_number: values.account_number || '',
      },
      {
        onSuccess: (data) => {
          setVerifiedData({
            account_name: data.account_name,
            provider_name: selectedProvider?.name || 'Unknown Bank',
          });
          setStep('confirm');
        },
      }
    );
  };

  const handleSubmit = () => {
    if (!verifiedData) return;

    const values = form.getValues();

    if (accountType === 'bank') {
      createAccount.mutate(
        {
          account_type: 'bank',
          account_name: verifiedData.account_name,
          account_number: values.account_number || '',
          provider_code: values.provider_code,
          provider_name: verifiedData.provider_name,
          is_default: values.is_default,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createAccount.mutate(
        {
          account_type: 'mobile_money',
          account_name: verifiedData.account_name,
          phone_number: values.phone_number || '',
          provider_code: values.provider_code,
          provider_name: verifiedData.provider_name,
          is_default: values.is_default,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Add Payout Account</h2>
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
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('account_type', 'bank');
                      form.setValue('provider_code', '');
                    }}
                    className={cn(
                      'p-4 border-2 rounded-lg text-center transition-colors',
                      accountType === 'bank'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl block mb-1">🏦</span>
                    <span className="font-medium">Bank Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('account_type', 'mobile_money');
                      form.setValue('provider_code', '');
                    }}
                    className={cn(
                      'p-4 border-2 rounded-lg text-center transition-colors',
                      accountType === 'mobile_money'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl block mb-1">📱</span>
                    <span className="font-medium">Mobile Money</span>
                  </button>
                </div>
              </div>

              {/* Provider Selection (Banks or Mobile Money Networks) */}
              <div>
                <label htmlFor="provider_code" className="block text-sm font-medium text-gray-700 mb-1">
                  {accountType === 'bank' ? 'Select Bank' : 'Select Network'}
                </label>
                <select
                  id="provider_code"
                  {...form.register('provider_code')}
                  disabled={providersLoading}
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                    form.formState.errors.provider_code ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <option value="">
                    {providersLoading
                      ? 'Loading...'
                      : accountType === 'bank'
                        ? 'Select a bank'
                        : 'Select a network'}
                  </option>
                  {currentProviders.map((provider) => (
                    <option key={provider.code} value={provider.code}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.provider_code && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.provider_code.message}
                  </p>
                )}
                {!providersLoading && currentProviders.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No {accountType === 'bank' ? 'banks' : 'mobile money providers'} available for your region.
                  </p>
                )}
              </div>

              {/* Account Number (Bank only) */}
              {accountType === 'bank' && (
                <div>
                  <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    id="account_number"
                    type="text"
                    {...form.register('account_number')}
                    placeholder="Enter account number"
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                      form.formState.errors.account_number ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  {form.formState.errors.account_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.account_number.message}
                    </p>
                  )}
                </div>
              )}

              {/* Phone Number (Mobile Money only) */}
              {accountType === 'mobile_money' && (
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone_number"
                    type="tel"
                    {...form.register('phone_number')}
                    placeholder="e.g., 0241234567"
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                      form.formState.errors.phone_number ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  {form.formState.errors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>
              )}

              {/* Set as Default */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  {...form.register('is_default')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_default" className="text-sm text-gray-700">
                  Set as default payout account
                </label>
              </div>
            </div>
          )}

          {step === 'confirm' && verifiedData && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <span className="text-xl">✓</span>
                  <span className="font-medium">
                    {accountType === 'bank' ? 'Account Verified' : 'Ready to Add'}
                  </span>
                </div>
                <p className="text-sm text-green-600">
                  {accountType === 'bank'
                    ? 'We found your account details. Please confirm they are correct.'
                    : 'Please confirm your mobile money details.'}
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Account Name</p>
                  <p className="font-medium">{verifiedData.account_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {accountType === 'bank' ? 'Bank' : 'Network'}
                  </p>
                  <p className="font-medium">{verifiedData.provider_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {accountType === 'bank' ? 'Account Number' : 'Phone Number'}
                  </p>
                  <p className="font-medium">
                    {accountType === 'bank'
                      ? form.getValues('account_number')
                      : form.getValues('phone_number')}
                  </p>
                </div>
              </div>
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
                onClick={handleVerify}
                disabled={verifyAccount.isPending || !providerCode}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {verifyAccount.isPending
                  ? 'Verifying...'
                  : accountType === 'bank'
                    ? 'Verify Account'
                    : 'Continue'}
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
                disabled={createAccount.isPending}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createAccount.isPending ? 'Adding...' : 'Add Account'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

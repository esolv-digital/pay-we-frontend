'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/use-auth';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressIndicator } from '@/components/onboarding/progress-indicator';
import { LogOut, CheckCircle } from 'lucide-react';

/**
 * Onboarding Step 4: Payout Account Setup
 *
 * Allows users to configure their payout account
 * This step is optional and can be skipped
 */

const payoutAccountSchema = z.object({
  payment_method: z.enum(['bank', 'mobile_money']),
  account_number: z.string().optional(),
  bank_code: z.string().optional(),
  account_name: z.string().optional(),
  mobile_number: z.string().optional(),
  mobile_provider: z.string().optional(),
});

type PayoutAccountFormData = z.infer<typeof payoutAccountSchema>;

export default function PayoutAccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { createPayoutAccount, isPayoutAccountPending, status } = useOnboarding();
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mobile_money'>('bank');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PayoutAccountFormData>({
    resolver: zodResolver(payoutAccountSchema),
    defaultValues: {
      payment_method: 'bank',
    },
  });

  // Redirect if user doesn't have organization
  useEffect(() => {
    if (user && (!user.organizations || user.organizations.length === 0)) {
      router.push('/onboarding');
    }
  }, [user, router]);

  // Redirect to dashboard if onboarding is complete
  useEffect(() => {
    if (status?.is_complete) {
      router.push('/vendor/dashboard');
    }
  }, [status, router]);

  if (!user || !user.organizations || user.organizations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const organization = user.organizations[0];
  const countryCode = organization.country_code;

  // Available payment methods based on country
  // TODO: Fetch this from API based on country
  const availablePaymentMethods = {
    bank: true,
    mobile_money: ['GH', 'NG', 'KE', 'UG'].includes(countryCode),
  };

  const onSubmit = (data: PayoutAccountFormData) => {
    const accountDetails: Record<string, string> = {};

    if (paymentMethod === 'bank') {
      if (data.account_number) accountDetails.account_number = data.account_number;
      if (data.bank_code) accountDetails.bank_code = data.bank_code;
      if (data.account_name) accountDetails.account_name = data.account_name;
    } else {
      if (data.mobile_number) accountDetails.mobile_number = data.mobile_number;
      if (data.mobile_provider) accountDetails.mobile_provider = data.mobile_provider;
      if (data.account_name) accountDetails.account_name = data.account_name;
    }

    createPayoutAccount({
      payment_method: paymentMethod,
      account_details: accountDetails,
    });
  };

  const handleSkip = () => {
    createPayoutAccount({ payment_method: 'bank', account_details: {}, skip: true });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      {/* Header with Logout */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Set Up Payout Account</h1>
          <p className="text-gray-600 mt-2">
            Optional: Configure where you'll receive your earnings
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={4}
        totalSteps={4}
        completedSteps={[1, 2, 3]}
      />

      {/* Completed Steps Indicator */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Organization Created</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Profile Reviewed</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>KYC Submitted</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <Label>Payment Method *</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label
              className={`
                flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
                ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                ${!availablePaymentMethods.bank ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value as 'bank')}
                disabled={!availablePaymentMethods.bank}
                className="sr-only"
              />
              <span className="text-2xl mb-2">🏦</span>
              <span className="font-medium text-gray-900">Bank Account</span>
            </label>

            <label
              className={`
                flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
                ${paymentMethod === 'mobile_money' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                ${!availablePaymentMethods.mobile_money ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                value="mobile_money"
                checked={paymentMethod === 'mobile_money'}
                onChange={(e) => setPaymentMethod(e.target.value as 'mobile_money')}
                disabled={!availablePaymentMethods.mobile_money}
                className="sr-only"
              />
              <span className="text-2xl mb-2">📱</span>
              <span className="font-medium text-gray-900">Mobile Money</span>
            </label>
          </div>
        </div>

        {/* Bank Account Fields */}
        {paymentMethod === 'bank' && (
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900">Bank Account Details</h3>

            <div>
              <Label htmlFor="bank_code">Bank *</Label>
              <select
                {...register('bank_code')}
                id="bank_code"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select bank</option>
                <option value="GCB">GCB Bank</option>
                <option value="ADB">Agricultural Development Bank</option>
                <option value="CBG">Consolidated Bank Ghana</option>
                <option value="ECOBANK">Ecobank</option>
                <option value="ZENITH">Zenith Bank</option>
              </select>
              {errors.bank_code && (
                <p className="text-red-600 text-sm mt-1">{errors.bank_code.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                {...register('account_number')}
                id="account_number"
                type="text"
                placeholder="0123456789"
                className="mt-2"
              />
              {errors.account_number && (
                <p className="text-red-600 text-sm mt-1">{errors.account_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                {...register('account_name')}
                id="account_name"
                type="text"
                placeholder="John Doe"
                className="mt-2"
              />
              {errors.account_name && (
                <p className="text-red-600 text-sm mt-1">{errors.account_name.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Mobile Money Fields */}
        {paymentMethod === 'mobile_money' && (
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900">Mobile Money Details</h3>

            <div>
              <Label htmlFor="mobile_provider">Mobile Money Provider *</Label>
              <select
                {...register('mobile_provider')}
                id="mobile_provider"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select provider</option>
                <option value="MTN">MTN Mobile Money</option>
                <option value="VODAFONE">Vodafone Cash</option>
                <option value="AIRTELTIGO">AirtelTigo Money</option>
              </select>
              {errors.mobile_provider && (
                <p className="text-red-600 text-sm mt-1">{errors.mobile_provider.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile_number">Mobile Number *</Label>
              <Input
                {...register('mobile_number')}
                id="mobile_number"
                type="tel"
                placeholder="+233 24 123 4567"
                className="mt-2"
              />
              {errors.mobile_number && (
                <p className="text-red-600 text-sm mt-1">{errors.mobile_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile_account_name">Account Name *</Label>
              <Input
                {...register('account_name')}
                id="mobile_account_name"
                type="text"
                placeholder="John Doe"
                className="mt-2"
              />
              {errors.account_name && (
                <p className="text-red-600 text-sm mt-1">{errors.account_name.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                💡 You can skip this step and add your payout account later. Payouts will remain
                pending until you configure an account in{' '}
                <strong>Dashboard → Disbursements</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isPayoutAccountPending}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button
            type="submit"
            disabled={isPayoutAccountPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isPayoutAccountPending ? 'Setting up...' : 'Complete Setup →'}
          </Button>
        </div>
      </form>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Why add a payout account?</h4>
        <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
          <li>Receive automatic payouts when customers pay</li>
          <li>Withdraw your earnings anytime</li>
          <li>Faster access to your funds</li>
          <li>Track all your payouts in one place</li>
        </ul>
      </div>
    </div>
  );
}

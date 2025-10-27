'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentPageSchema, type PaymentPageFormData } from '@/lib/utils/validators';
import { useCreatePaymentPage } from '@/lib/hooks/use-payment-pages';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreatePaymentPagePage() {
  const router = useRouter();
  const { mutate: createPage, isPending } = useCreatePaymentPage();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentPageFormData>({
    resolver: zodResolver(paymentPageSchema),
    defaultValues: {
      amount_type: 'fixed',
      currency_code: 'USD',
      collect_customer_info: true,
      collect_shipping_address: false,
      allow_quantity: false,
    },
  });

  const amountType = watch('amount_type');

  const onSubmit = (data: PaymentPageFormData) => {
    createPage(data, {
      onSuccess: () => {
        router.push('/vendor/payment-pages');
      },
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/vendor/payment-pages"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Payment Pages
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Payment Page</h1>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Premium Membership"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Slug * (URL-friendly)
            </label>
            <input
              {...register('slug')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., premium-membership"
            />
            {errors.slug && (
              <p className="text-red-600 text-sm mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of what this payment is for"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Type *
            </label>
            <select
              {...register('amount_type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="flexible">Flexible Amount</option>
              <option value="donation">Donation</option>
            </select>
            {errors.amount_type && (
              <p className="text-red-600 text-sm mt-1">{errors.amount_type.message}</p>
            )}
          </div>

          {amountType === 'fixed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Amount *
              </label>
              <input
                {...register('fixed_amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100.00"
              />
              {errors.fixed_amount && (
                <p className="text-red-600 text-sm mt-1">{errors.fixed_amount.message}</p>
              )}
            </div>
          )}

          {amountType === 'flexible' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Amount
                </label>
                <input
                  {...register('min_amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10.00"
                />
                {errors.min_amount && (
                  <p className="text-red-600 text-sm mt-1">{errors.min_amount.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Amount
                </label>
                <input
                  {...register('max_amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000.00"
                />
                {errors.max_amount && (
                  <p className="text-red-600 text-sm mt-1">{errors.max_amount.message}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              {...register('currency_code')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="NGN">NGN - Nigerian Naira</option>
            </select>
            {errors.currency_code && (
              <p className="text-red-600 text-sm mt-1">{errors.currency_code.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                {...register('collect_customer_info')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Collect customer information</span>
            </label>

            <label className="flex items-center">
              <input
                {...register('collect_shipping_address')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Collect shipping address</span>
            </label>

            <label className="flex items-center">
              <input
                {...register('allow_quantity')}
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Allow quantity selection</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? 'Creating...' : 'Create Payment Page'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentPageSchema, type PaymentPageFormData } from '@/lib/utils/validators';
import { useCreatePaymentPage } from '@/lib/hooks/use-payment-pages';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PaymentPagePreview } from '@/components/payment/payment-page-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Settings } from 'lucide-react';
import type { PaymentPageCustomization, PaymentPage } from '@/types';

export default function CreatePaymentPagePage() {
  const router = useRouter();
  const { mutate: createPage, isPending } = useCreatePaymentPage();
  const [customization, setCustomization] = useState<PaymentPageCustomization>({
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    button_text: 'Pay Now',
    show_vendor_info: true,
    theme: 'light',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const formValues = watch();
  const amountType = watch('amount_type');
  const titleValue = watch('title');

  // Auto-generate slug from title
  const generateSlug = (title: string): string => {
    if (!title) return '';

    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .substring(0, 50); // Limit to 50 characters
  };

  // Auto-update slug when title changes
  useEffect(() => {
    if (titleValue) {
      const slug = generateSlug(titleValue);
      setValue('slug', slug);
    }
  }, [titleValue, setValue]);

  const onSubmit = (data: PaymentPageFormData) => {
    createPage(
      {
        ...data,
        metadata: {
          customization,
        }
      },
      {
        onSuccess: () => {
          router.push('/vendor/payment-pages');
        },
      }
    );
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="basic">
                <Settings className="h-4 w-4 mr-2" />
                Basic Settings
              </TabsTrigger>
              <TabsTrigger value="customization">
                <Eye className="h-4 w-4 mr-2" />
                Customization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
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
                    Page Slug (Auto-generated)
                  </label>
                  <input
                    {...register('slug')}
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-generated from title..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be automatically generated from the page title
                  </p>
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
                        Minimum Amount *
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

                {amountType === 'donation' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Donation Amount *
                    </label>
                    <input
                      {...register('min_amount', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set to 0 to allow any donation amount, or specify a minimum
                    </p>
                    {errors.min_amount && (
                      <p className="text-red-600 text-sm mt-1">{errors.min_amount.message}</p>
                    )}
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
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? 'Creating...' : 'Create Payment Page'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="customization">
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    id="primary-color"
                    type="color"
                    value={customization.primary_color}
                    onChange={(e) =>
                      setCustomization({ ...customization, primary_color: e.target.value })
                    }
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>

                <div>
                  <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <input
                    id="bg-color"
                    type="color"
                    value={customization.background_color}
                    onChange={(e) =>
                      setCustomization({ ...customization, background_color: e.target.value })
                    }
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>

                <div>
                  <label htmlFor="bg-image" className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image URL
                  </label>
                  <input
                    id="bg-image"
                    type="url"
                    value={customization.background_image_url || ''}
                    onChange={(e) =>
                      setCustomization({ ...customization, background_image_url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label htmlFor="logo-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    id="logo-url"
                    type="url"
                    value={customization.logo_url || ''}
                    onChange={(e) =>
                      setCustomization({ ...customization, logo_url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label htmlFor="button-text" className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    id="button-text"
                    type="text"
                    value={customization.button_text}
                    onChange={(e) =>
                      setCustomization({ ...customization, button_text: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pay Now"
                  />
                </div>

                <div>
                  <label htmlFor="success-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Success Message
                  </label>
                  <input
                    id="success-message"
                    type="text"
                    value={customization.success_message || ''}
                    onChange={(e) =>
                      setCustomization({ ...customization, success_message: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Thank you for your payment!"
                  />
                </div>

                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={customization.theme}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        theme: e.target.value as 'light' | 'dark' | 'auto',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.show_vendor_info}
                    onChange={(e) =>
                      setCustomization({ ...customization, show_vendor_info: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show vendor information</span>
                </label>

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
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isPending}
                    className="flex-1"
                  >
                    {isPending ? 'Creating...' : 'Create Payment Page'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Section */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Live Preview</h2>
              </div>
            </div>
            <div className="bg-gray-100">
              <PaymentPagePreview
                paymentPage={formValues as Partial<PaymentPage>}
                customization={customization}
                previewAmount={
                  formValues.amount_type === 'fixed'
                    ? formValues.fixed_amount
                    : formValues.min_amount
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

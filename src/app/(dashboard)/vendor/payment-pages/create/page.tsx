'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { CurrencySelect } from '@/components/forms/currency-select';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCountry } from '@/lib/hooks/use-countries';

export default function CreatePaymentPagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const organization = user?.organizations?.[0];
  const { mutate: createPage, isPending } = useCreatePaymentPage();
  const [customization, setCustomization] = useState<PaymentPageCustomization>({
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    button_text: 'Pay Now',
    show_vendor_info: true,
    theme: 'light',
  });

  // Fetch organization's country to get default currency
  const { data: organizationCountry } = useCountry(organization?.country_code || '');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentPageFormData>({
    resolver: zodResolver(paymentPageSchema),
    defaultValues: {
      amount_type: 'fixed',
      currency_code: organizationCountry?.currency_code || 'USD',
      collect_customer_info: true,
      collect_shipping_address: false,
      allow_quantity: false,
      include_fees_in_amount: false, // Default: vendor pays fees (deducted from amount)
    },
  });

  // Auto-set currency when organization country loads
  useEffect(() => {
    if (organizationCountry?.currency_code) {
      setValue('currency_code', organizationCountry.currency_code);
    }
  }, [organizationCountry, setValue]);

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
    // Strip amount fields not relevant to the selected amount_type
    // Backend rejects fields prohibited for the current amount_type
    const { fixed_amount, min_amount, max_amount, ...rest } = data;
    let amountFields = {};
    if (data.amount_type === 'fixed') {
      amountFields = { fixed_amount };
    } else if (data.amount_type === 'flexible') {
      amountFields = { min_amount, max_amount };
    } else if (data.amount_type === 'donation') {
      amountFields = { min_amount };
    }
    createPage(
      {
        ...rest,
        ...amountFields,
        include_fees_in_amount: data.include_fees_in_amount ?? false,
        metadata: {
          customization,
        },
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
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title *
                  </label>
                  <input
                    id="title"
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
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    Page Slug (Auto-generated)
                  </label>
                  <input
                    id="slug"
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
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
                  <label htmlFor="amount_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Type *
                  </label>
                  <select
                    id="amount_type"
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
                    <label htmlFor="fixed_amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Fixed Amount *
                    </label>
                    <input
                      id="fixed_amount"
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
                      <label htmlFor="min_amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Amount *
                      </label>
                      <input
                        id="min_amount"
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
                      <label htmlFor="max_amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Amount
                      </label>
                      <input
                        id="max_amount"
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
                    <label htmlFor="min_donation_amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Donation Amount *
                    </label>
                    <input
                      id="min_donation_amount"
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
                  <Controller
                    name="currency_code"
                    control={control}
                    render={({ field }) => (
                      <CurrencySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        label="Currency *"
                        placeholder="Select currency"
                        error={errors.currency_code?.message}
                        restrictToOrganization={true}
                        autoSetDefault={true}
                      />
                    )}
                  />
                </div>

                {/* Fee Handling Mode */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Service Fee Handling
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Choose who pays the platform service fees
                    {organizationCountry?.platform_fee_percentage && Number(organizationCountry.platform_fee_percentage) > 0 && (
                      <span className="ml-1 font-medium text-blue-600">
                        (Platform fee: {organizationCountry.platform_fee_percentage}%)
                      </span>
                    )}
                  </p>
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 p-3 border-2 rounded-lg bg-white cursor-pointer transition-colors ${!formValues.include_fees_in_amount ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <input
                        type="radio"
                        checked={!formValues.include_fees_in_amount}
                        onChange={() => setValue('include_fees_in_amount', false)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">Deduct fee from amount (Vendor pays)</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Customer pays the exact amount you set. Fee is deducted from your earnings.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 border-2 rounded-lg bg-white cursor-pointer transition-colors ${formValues.include_fees_in_amount ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                      <input
                        type="radio"
                        checked={formValues.include_fees_in_amount === true}
                        onChange={() => setValue('include_fees_in_amount', true)}
                        className="mt-1 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">Add fee to amount (Customer pays)</span>
                        <p className="text-xs text-gray-500 mt-1">
                          Fee is added on top. Customer pays more, you receive the full amount.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Fee Calculation Preview */}
                  {(() => {
                    const rawAmount = formValues.fixed_amount;
                    const feePercentage = organizationCountry?.platform_fee_percentage;
                    if (typeof rawAmount !== 'number' || !Number.isFinite(rawAmount) || rawAmount <= 0 || !feePercentage || Number(feePercentage) <= 0) {
                      return null;
                    }
                    const amount = rawAmount;
                    const feeAmount = amount * Number(feePercentage) / 100;
                    return (
                      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Breakdown Preview</h4>
                        {!formValues.include_fees_in_amount ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Amount you set:</span>
                              <span className="font-medium">{formValues.currency_code} {amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Platform fee ({feePercentage}%):</span>
                              <span className="text-red-600">- {formValues.currency_code} {feeAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">Customer pays:</span>
                                <span className="font-bold text-gray-900">{formValues.currency_code} {amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-700 font-medium">You receive:</span>
                                <span className="font-bold text-blue-600">{formValues.currency_code} {(amount - feeAmount).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Amount you set:</span>
                              <span className="font-medium">{formValues.currency_code} {amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Platform fee ({feePercentage}%):</span>
                              <span className="text-gray-500">+ {formValues.currency_code} {feeAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">Customer pays:</span>
                                <span className="font-bold text-gray-900">{formValues.currency_code} {(amount + feeAmount).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-700 font-medium">You receive:</span>
                                <span className="font-bold text-green-600">{formValues.currency_code} {amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                  <label htmlFor="store-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Store URL (Optional)
                  </label>
                  <input
                    id="store-url"
                    type="url"
                    value={customization.store_url || ''}
                    onChange={(e) =>
                      setCustomization({ ...customization, store_url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourstore.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    After successful payment, customers will see a button to visit your store
                  </p>
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

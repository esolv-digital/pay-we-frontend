'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { CreateTransactionData } from '@/lib/api/public';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/format';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { getDefaultCountryCode, isWipayPaymentPage, requiresCountrySelection } from '@/lib/utils/payment';
import { WIPAY_COUNTRIES, WIPAY_COUNTRY_LABELS } from '@/lib/config/constants';
import { Building2, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PaymentPage, PaymentPageCustomization } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const paymentFormSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  quantity: z.number().min(1).optional(),
  customer_name: z.string().min(1, 'Name is required').optional(),
  customer_email: z.string().email('Invalid email address').optional(),
  customer_phone: z.string().optional(),
  country_code: z.string().optional(), // Required for Wipay payments (TT, JM, BB, GY)
  shipping_street: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_country: z.string().optional(),
  shipping_postal_code: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentPageFormProps {
  paymentPage: PaymentPage;
  onSubmit: (data: CreateTransactionData) => Promise<unknown>;
}

/**
 * Payment Page Form Component
 *
 * Single Responsibility: Display payment form and collect payment information
 * Open/Closed: Open for extension via customization props, closed for modification
 * Liskov Substitution: Can be used with any payment page configuration
 * Interface Segregation: Clean interface with only required props
 * Dependency Inversion: Depends on PaymentPage abstraction, not concrete implementation
 *
 * DRY: Shared component used by both short URL and SEO URL payment pages
 */
export function PaymentPageForm({ paymentPage, onSubmit }: PaymentPageFormProps) {
  const [transactionCreated, setTransactionCreated] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      quantity: 1,
      amount: paymentPage?.amount_type === 'fixed'
        ? Number(paymentPage.fixed_amount)
        : Number(paymentPage?.min_amount) || 0,
      country_code: getDefaultCountryCode(paymentPage), // Auto-set country for Wipay
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const shippingAddress = paymentPage.collect_shipping_address
        ? {
            street: data.shipping_street || '',
            city: data.shipping_city || '',
            state: data.shipping_state || '',
            country: data.shipping_country || '',
            postal_code: data.shipping_postal_code || '',
          }
        : undefined;

      return onSubmit({
        amount: data.amount,
        quantity: data.quantity,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        country_code: data.country_code, // Wipay requires this field
        shipping_address: shippingAddress,
      });
    },
    onSuccess: (data: unknown) => {
      setTransactionCreated(true);

      // Extract transaction data from response
      // Backend returns: { success: true, data: { ...transaction, metadata: { authorization_url } } }
      const responseData = data as {
        data?: {
          metadata?: {
            authorization_url?: string;
            access_code?: string;
          };
          reference?: string;
        }
      };
      const transaction = responseData.data || (data as { metadata?: { authorization_url?: string } });

      // CRITICAL: Extract authorization_url from metadata (backend stores it there)
      const authorizationUrl = transaction.metadata?.authorization_url;

      if (authorizationUrl) {
        showSuccess('Redirecting to payment gateway...');
        // Redirect to payment gateway (Paystack/WePay)
        setTimeout(() => {
          window.location.href = authorizationUrl;
        }, 1000);
      } else {
        // Fallback: If no payment URL, show success and redirect to custom URL
        showSuccess(customization?.success_message || 'Payment initiated successfully!');
        if (paymentPage?.redirect_url) {
          setTimeout(() => {
            window.location.href = paymentPage.redirect_url!;
          }, 2000);
        }
      }
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  const handleFormSubmit = (data: PaymentFormData) => {
    createTransactionMutation.mutate(data);
  };

  if (!paymentPage.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 text-yellow-600">
              <Loader2 className="h-8 w-8" />
              <CardTitle>Payment Page Inactive</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This payment page is currently inactive. Please contact the merchant for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customization = (paymentPage.metadata?.customization as PaymentPageCustomization | undefined) || {};
  const {
    primary_color = '#3b82f6',
    background_color = '#ffffff',
    background_image_url,
    logo_url,
    button_text = 'Pay Now',
    show_vendor_info = true,
    theme = 'light',
  } = customization;

  const isDark = theme === 'dark';
  const defaultBg = isDark ? '#1f2937' : '#ffffff';
  const defaultText = isDark ? '#f9fafb' : '#111827';
  const defaultMutedText = isDark ? '#9ca3af' : '#6b7280';

  const containerStyle: React.CSSProperties = {
    backgroundColor: background_color || defaultBg,
    backgroundImage: background_image_url ? `url(${background_image_url})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: defaultText,
  };

  const cardOverlayStyle: React.CSSProperties = background_image_url
    ? {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
      }
    : {};

  const amountValue = watch('amount') || 0;
  const quantityValue = watch('quantity') || 1;

  // Calculate fee and display amounts based on fee_mode
  const feePercentage = Number(paymentPage.platform_fee_percentage) || 0;
  const baseAmount = paymentPage.amount_type === 'fixed'
    ? Number(paymentPage.fixed_amount) || 0
    : amountValue;

  // If fee_mode is 'included', customer pays base + fee
  // If fee_mode is 'excluded', customer pays just the base amount
  const feeAmount = paymentPage.fee_mode === 'included' && feePercentage > 0
    ? baseAmount * (feePercentage / 100)
    : 0;
  const displayAmount = baseAmount + feeAmount;
  const totalAmount = displayAmount * quantityValue;

  if (transactionCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={containerStyle}>
        <Card className="max-w-md w-full" style={cardOverlayStyle}>
          <CardHeader>
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <CardTitle className="text-2xl" style={{ color: defaultText }}>
                {customization.success_message || 'Payment Initiated!'}
              </CardTitle>
              <CardDescription style={{ color: defaultMutedText }}>
                Please complete the payment process to finalize your transaction.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            {paymentPage.redirect_url && (
              <p className="text-sm" style={{ color: defaultMutedText }}>
                Redirecting you to complete payment...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={containerStyle}>
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl" style={cardOverlayStyle}>
          <CardHeader className="space-y-4">
            {logo_url && (
              <div className="flex justify-center mb-4">
                <img src={logo_url} alt="Logo" className="h-16 w-auto object-contain" />
              </div>
            )}

            <div className="text-center">
              <CardTitle className="text-2xl mb-2" style={{ color: defaultText }}>
                {paymentPage.title}
              </CardTitle>
              {paymentPage.description && (
                <CardDescription style={{ color: defaultMutedText }}>
                  {paymentPage.description}
                </CardDescription>
              )}
            </div>

            {show_vendor_info && paymentPage.vendor && (
              <div
                className="flex items-center gap-2 justify-center text-sm border-t pt-4"
                style={{
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                  color: defaultMutedText,
                }}
              >
                <Building2 className="h-4 w-4" />
                <span>{paymentPage.vendor.business_name}</span>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" style={{ color: defaultText }}>
                  Amount
                </Label>
                {paymentPage.amount_type === 'fixed' ? (
                  <>
                    <input type="hidden" {...register('amount', { valueAsNumber: true })} value={Number(paymentPage.fixed_amount)} />
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold" style={{ color: primary_color }}>
                        {formatCurrency(displayAmount, paymentPage.currency_code)}
                      </div>
                      {/* Fee breakdown for transparency */}
                      {feePercentage > 0 && (
                        <div className="mt-3 p-3 rounded-lg text-sm" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                          <div className="flex justify-between mb-1" style={{ color: defaultMutedText }}>
                            <span>Item price:</span>
                            <span>{formatCurrency(baseAmount, paymentPage.currency_code)}</span>
                          </div>
                          <div className="flex justify-between mb-1" style={{ color: defaultMutedText }}>
                            <span>Service fee ({feePercentage}%):</span>
                            {paymentPage.fee_mode === 'included' ? (
                              <span>{formatCurrency(feeAmount, paymentPage.currency_code)}</span>
                            ) : (
                              <span className="text-green-600">Covered by vendor</span>
                            )}
                          </div>
                          <div className="flex justify-between font-medium border-t pt-2 mt-2" style={{ color: defaultText, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                            <span>You pay:</span>
                            <span>{formatCurrency(displayAmount, paymentPage.currency_code)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold"
                      style={{ color: defaultMutedText }}
                    >
                      {paymentPage.currency_code}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder={paymentPage.amount_type === 'donation' ? 'Enter any amount' : `Min: ${paymentPage.min_amount || 0}`}
                      className="pl-16 text-xl h-14"
                      {...register('amount', { valueAsNumber: true })}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: errors.amount ? '#ef4444' : isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                    )}
                    {/* Fee breakdown for flexible/donation amounts - show for transparency */}
                    {feePercentage > 0 && amountValue > 0 && (
                      <div className="mt-3 p-3 rounded-lg text-sm" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                        <div className="flex justify-between mb-1" style={{ color: defaultMutedText }}>
                          <span>Amount:</span>
                          <span>{formatCurrency(amountValue, paymentPage.currency_code)}</span>
                        </div>
                        <div className="flex justify-between mb-1" style={{ color: defaultMutedText }}>
                          <span>Service fee ({feePercentage}%):</span>
                          {paymentPage.fee_mode === 'included' ? (
                            <span>{formatCurrency(feeAmount, paymentPage.currency_code)}</span>
                          ) : (
                            <span className="text-green-600">Covered by vendor</span>
                          )}
                        </div>
                        <div className="flex justify-between font-medium border-t pt-2 mt-2" style={{ color: defaultText, borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                          <span>You pay:</span>
                          <span>{formatCurrency(displayAmount, paymentPage.currency_code)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {paymentPage.amount_type === 'flexible' && (
                  <p className="text-sm" style={{ color: defaultMutedText }}>
                    Min: {formatCurrency(paymentPage.min_amount || 0, paymentPage.currency_code)}
                    {paymentPage.max_amount && ` • Max: ${formatCurrency(paymentPage.max_amount, paymentPage.currency_code)}`}
                  </p>
                )}
              </div>

              {/* Quantity */}
              {paymentPage.allow_quantity && (
                <div className="space-y-2">
                  <Label htmlFor="quantity" style={{ color: defaultText }}>
                    Quantity
                  </Label>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" style={{ color: defaultMutedText }} />
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      className="flex-1"
                      {...register('quantity', { valueAsNumber: true })}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                  </div>
                  {quantityValue > 1 && (
                    <div className="text-sm" style={{ color: defaultMutedText }}>
                      <p>Total: {formatCurrency(totalAmount, paymentPage.currency_code)}</p>
                      {paymentPage.fee_mode === 'included' && feePercentage > 0 && (
                        <p className="text-xs">
                          (includes {formatCurrency(feeAmount * quantityValue, paymentPage.currency_code)} service fee)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Customer Information */}
              {paymentPage.collect_customer_info && (
                <div className="space-y-4 border-t pt-4" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <div className="space-y-2">
                    <Label htmlFor="customer_name" style={{ color: defaultText }}>
                      Full Name *
                    </Label>
                    <Input
                      id="customer_name"
                      {...register('customer_name')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: errors.customer_name ? '#ef4444' : isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                    {errors.customer_name && (
                      <p className="text-sm text-red-600">{errors.customer_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_email" style={{ color: defaultText }}>
                      Email *
                    </Label>
                    <Input
                      id="customer_email"
                      type="email"
                      {...register('customer_email')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: errors.customer_email ? '#ef4444' : isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                    {errors.customer_email && (
                      <p className="text-sm text-red-600">{errors.customer_email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_phone" style={{ color: defaultText }}>
                      Phone (Optional)
                    </Label>
                    <Input
                      id="customer_phone"
                      type="tel"
                      {...register('customer_phone')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Country Selection for Wipay */}
              {isWipayPaymentPage(paymentPage) && requiresCountrySelection(paymentPage) && (
                <div className="space-y-2 border-t pt-4" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <Label htmlFor="country_code" style={{ color: defaultText }}>
                    Country *
                  </Label>
                  <Select
                    value={watch('country_code') || ''}
                    onValueChange={(value) => setValue('country_code', value)}
                  >
                    <SelectTrigger
                      id="country_code"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    >
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentPage.allowed_countries?.map((countryCode) => (
                        <SelectItem key={countryCode} value={countryCode}>
                          {WIPAY_COUNTRY_LABELS[countryCode as keyof typeof WIPAY_COUNTRY_LABELS] || countryCode}
                        </SelectItem>
                      )) || Object.entries(WIPAY_COUNTRIES).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {WIPAY_COUNTRY_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs" style={{ color: defaultMutedText }}>
                    Payment will be processed via WiPay for {paymentPage.currency_code}
                  </p>
                </div>
              )}

              {/* Shipping Address */}
              {paymentPage.collect_shipping_address && (
                <div className="space-y-4 border-t pt-4" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  <h3 className="font-semibold" style={{ color: defaultText }}>
                    Shipping Address
                  </h3>
                  <div className="space-y-2">
                    <Input
                      placeholder="Street Address"
                      {...register('shipping_street')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="City"
                      {...register('shipping_city')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                    <Input
                      placeholder="State"
                      {...register('shipping_state')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Country"
                      {...register('shipping_country')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                    <Input
                      placeholder="Postal Code"
                      {...register('shipping_postal_code')}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                        color: defaultText,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: primary_color,
                  color: '#ffffff',
                }}
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  button_text
                )}
              </Button>

              {/* Security Badge */}
              <p className="text-xs text-center" style={{ color: defaultMutedText }}>
                🔒 Secure payment powered by PayWe
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/format';
import type { PaymentPage, PaymentPageCustomization } from '@/types';
import { Building2, ShoppingCart } from 'lucide-react';

interface PaymentPagePreviewProps {
  paymentPage: Partial<PaymentPage>;
  customization?: PaymentPageCustomization;
  previewAmount?: number;
}

/**
 * PaymentPagePreview Component
 *
 * Single Responsibility: Renders a live preview of how the payment page will appear to customers
 * Open/Closed: Open for extension through customization props, closed for modification
 * Liskov Substitution: Can be used anywhere a preview component is needed
 * Interface Segregation: Only requires minimal payment page data
 * Dependency Inversion: Depends on abstractions (PaymentPage type) not concrete implementations
 */
export function PaymentPagePreview({
  paymentPage,
  customization,
  previewAmount
}: PaymentPagePreviewProps) {
  // Get customization from metadata or use provided customization prop
  const customizationData = customization || paymentPage.metadata?.customization || {};

  const {
    primary_color = '#3b82f6',
    background_color = '#ffffff',
    background_image_url,
    logo_url,
    button_text = 'Pay Now',
    show_vendor_info = true,
    theme = 'light',
  } = customizationData;

  const isDark = theme === 'dark';
  const defaultBg = isDark ? '#1f2937' : '#ffffff';
  const defaultText = isDark ? '#f9fafb' : '#111827';
  const defaultMutedText = isDark ? '#9ca3af' : '#6b7280';

  // Calculate display amount based on payment page type
  const displayAmount = useMemo(() => {
    if (paymentPage.amount_type === 'fixed' && paymentPage.fixed_amount) {
      return paymentPage.fixed_amount;
    }
    if (previewAmount) {
      return previewAmount;
    }
    if (paymentPage.amount_type === 'flexible' && paymentPage.min_amount) {
      return paymentPage.min_amount;
    }
    return 0;
  }, [paymentPage, previewAmount]);

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

  return (
    <div
      className="min-h-[600px] w-full flex items-center justify-center p-6 transition-all duration-300"
      style={containerStyle}
    >
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl" style={cardOverlayStyle}>
          <CardHeader className="space-y-4">
            {logo_url && (
              <div className="flex justify-center mb-4">
                <img
                  src={logo_url}
                  alt="Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}

            <div className="text-center">
              <CardTitle className="text-2xl mb-2" style={{ color: defaultText }}>
                {paymentPage.title || 'Payment Page Title'}
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
                  color: defaultMutedText
                }}
              >
                <Building2 className="h-4 w-4" />
                <span>{paymentPage.vendor.business_name}</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Amount Display/Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" style={{ color: defaultText }}>
                Amount
              </Label>
              {paymentPage.amount_type === 'fixed' ? (
                <div
                  className="text-4xl font-bold text-center py-4"
                  style={{ color: primary_color }}
                >
                  {formatCurrency(displayAmount, paymentPage.currency_code || 'USD')}
                </div>
              ) : (
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold"
                    style={{ color: defaultMutedText }}
                  >
                    {paymentPage.currency_code || 'USD'}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={
                      paymentPage.amount_type === 'donation'
                        ? 'Enter any amount'
                        : `Min: ${paymentPage.min_amount || 0}`
                    }
                    className="pl-16 text-xl h-14"
                    value={displayAmount || ''}
                    readOnly
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      borderColor: isDark ? '#4b5563' : '#e5e7eb',
                      color: defaultText,
                    }}
                  />
                </div>
              )}
              {paymentPage.amount_type === 'flexible' && (
                <p className="text-sm" style={{ color: defaultMutedText }}>
                  Min: {formatCurrency(paymentPage.min_amount || 0, paymentPage.currency_code || 'USD')}
                  {paymentPage.max_amount && ` • Max: ${formatCurrency(paymentPage.max_amount, paymentPage.currency_code || 'USD')}`}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
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
                    defaultValue="1"
                    className="flex-1"
                    readOnly
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      borderColor: isDark ? '#4b5563' : '#e5e7eb',
                      color: defaultText,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Customer Information */}
            {paymentPage.collect_customer_info && (
              <div className="space-y-4 border-t pt-4" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                <div className="space-y-2">
                  <Label htmlFor="customer_name" style={{ color: defaultText }}>
                    Full Name
                  </Label>
                  <Input
                    id="customer_name"
                    placeholder="John Doe"
                    readOnly
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      borderColor: isDark ? '#4b5563' : '#e5e7eb',
                      color: defaultText,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email" style={{ color: defaultText }}>
                    Email
                  </Label>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder="john@example.com"
                    readOnly
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      borderColor: isDark ? '#4b5563' : '#e5e7eb',
                      color: defaultText,
                    }}
                  />
                </div>
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
                    readOnly
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
                    readOnly
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      borderColor: isDark ? '#4b5563' : '#e5e7eb',
                      color: defaultText,
                    }}
                  />
                  <Input
                    placeholder="State"
                    readOnly
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f9fafb',
                      borderColor: isDark ? '#4b5563' : '#e5e7eb',
                      color: defaultText,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Pay Button */}
            <Button
              className="w-full h-12 text-lg font-semibold transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: primary_color,
                color: '#ffffff',
              }}
              disabled
            >
              {button_text}
            </Button>

            {/* Security Badge */}
            <p
              className="text-xs text-center"
              style={{ color: defaultMutedText }}
            >
              🔒 Secure payment powered by PayWe
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

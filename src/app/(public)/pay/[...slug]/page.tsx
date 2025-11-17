'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { PaymentPageForm } from '@/components/payment/payment-page-form';

/**
 * Unified Public Payment Page
 *
 * Handles both URL formats:
 * 1. Short URL: /pay/{short_url} (e.g., /pay/Xorp2Pto)
 * 2. SEO URL: /pay/{vendor_slug}/{payment_page_slug} (e.g., /pay/qqq-YM2D/product-purchase)
 *
 * SOLID Principles:
 * - SRP: Single responsibility of displaying payment pages
 * - OCP: Open for extension via new payment methods
 * - DIP: Depends on publicApi abstraction
 *
 * DRY: Uses shared PaymentPageForm component
 */
export default function PublicPaymentPage() {
  const params = useParams();
  const slugParts = params.slug as string[];

  // Determine if it's a short URL (1 segment) or SEO URL (2 segments)
  const isShortUrl = slugParts.length === 1;
  const shortUrl = isShortUrl ? slugParts[0] : null;
  const vendorSlug = !isShortUrl ? slugParts[0] : null;
  const paymentPageSlug = !isShortUrl ? slugParts[1] : null;

  // Fetch payment page based on URL type
  const { data: paymentPage, isLoading, error } = useQuery({
    queryKey: isShortUrl
      ? ['public-payment-page', shortUrl]
      : ['public-payment-page-seo', vendorSlug, paymentPageSlug],
    queryFn: () => {
      if (isShortUrl && shortUrl) {
        return publicApi.getPaymentPageByShortUrl(shortUrl);
      } else if (vendorSlug && paymentPageSlug) {
        return publicApi.getPaymentPageBySeoUrl(vendorSlug, paymentPageSlug);
      }
      throw new Error('Invalid URL format');
    },
    retry: 1,
  });

  // Handle transaction creation based on URL type
  const handleCreateTransaction = async (
    data: Parameters<typeof publicApi.createTransaction>[1]
  ) => {
    if (isShortUrl && shortUrl) {
      return publicApi.createTransaction(shortUrl, data);
    } else if (vendorSlug && paymentPageSlug) {
      return publicApi.createTransactionBySeoUrl(vendorSlug, paymentPageSlug, data);
    }
    throw new Error('Invalid URL format');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !paymentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-8 w-8" />
              <CardTitle>Payment Page Not Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The payment page you&apos;re looking for doesn&apos;t exist or has been disabled.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PaymentPageForm paymentPage={paymentPage} onSubmit={handleCreateTransaction} />;
}

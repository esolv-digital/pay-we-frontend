'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api/public';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { PaymentPageForm } from '@/components/payment/payment-page-form';

/**
 * SEO-Friendly Public Payment Page
 *
 * Single Responsibility: Handle SEO-friendly public payment page display
 * Open/Closed: Open for extension via payment gateway integration
 * Liskov Substitution: Can replace short URL page without breaking functionality
 * Interface Segregation: Separates concerns between URL structure and payment logic
 * Dependency Inversion: Depends on abstractions (publicApi) not concrete implementations
 *
 * DRY: Uses shared PaymentPageForm component to avoid code duplication
 *
 * SEO Benefits:
 * - Readable URLs: /pay/{vendor-slug}/{payment-page-slug}
 * - Better crawlability for search engines
 * - More descriptive URLs for sharing
 */
export default function SeoPaymentPage() {
  const params = useParams();
  const vendorSlug = params.vendor_slug as string;
  const paymentPageSlug = params.payment_page_slug as string;

  const { data: paymentPage, isLoading, error } = useQuery({
    queryKey: ['public-payment-page-seo', vendorSlug, paymentPageSlug],
    queryFn: () => publicApi.getPaymentPageBySeoUrl(vendorSlug, paymentPageSlug),
    retry: 1,
  });

  const handleCreateTransaction = async (data: Parameters<typeof publicApi.createTransactionBySeoUrl>[2]) => {
    return publicApi.createTransactionBySeoUrl(vendorSlug, paymentPageSlug, data);
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
              The payment page you're looking for doesn't exist or has been disabled.
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

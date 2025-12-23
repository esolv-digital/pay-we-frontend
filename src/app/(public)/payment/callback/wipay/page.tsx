'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentCallbackService } from '@/lib/services/payment-callback.service';

/**
 * Wipay Callback Handler
 *
 * This page handles the Wipay payment gateway callback.
 * It processes Wipay-specific parameters and forwards them to the backend webhook,
 * then redirects to the generic verification page.
 *
 * Flow:
 * 1. Wipay redirects here with callback parameters
 * 2. Extract all callback data
 * 3. Send to backend webhook /api/v1/webhooks/wipay/callback
 * 4. Backend processes and validates
 * 5. Redirect to /payment/verification?reference={transaction_id}
 *
 * Wipay Callback Parameters:
 * - status: Payment status (success, failed, cancelled, incomplete)
 * - transaction_id: Wipay's transaction ID
 * - order_id: Our transaction reference
 * - total: Payment amount
 * - hash: MD5 signature for verification
 * - date: Payment date and time
 * - currency: Currency code (TTD, JMD, BBD, GYD)
 * - card: Masked card number
 * - message: Status message
 * - data: Additional data
 */
function WipayCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Validate we have the minimum required data
        const orderId = searchParams.get('order_id');
        if (!orderId) {
          throw new Error('Missing transaction reference (order_id)');
        }

        // Process callback using service (SOLID: Dependency Inversion, DRY: Reusable logic)
        const result = await paymentCallbackService.processWipayCallback(searchParams);

        // Extract transaction reference from response
        const reference = paymentCallbackService.extractTransactionReference(result) || orderId;

        // Small delay to ensure backend processing is complete
        setTimeout(() => {
          router.push(`/payment/verification?reference=${reference}`);
        }, 500);

      } catch (err) {
        console.error('[Wipay Callback] Error processing callback:', err);
        setError(err instanceof Error ? err.message : 'Failed to process payment callback');
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-8 w-8" />
              Callback Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg">
                We encountered an error processing your payment callback
              </p>
              <p className="text-sm text-muted-foreground">
                {error}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
              <p className="text-yellow-900 font-medium mb-2">What you can do:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 text-xs">
                <li>Contact support with your transaction details</li>
                <li>Check your email for payment confirmation</li>
                <li>Try the payment again if no charge was made</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push('/')} className="w-full">
                Go to Homepage
              </Button>
            </div>

            {searchParams.get('order_id') && (
              <p className="text-xs text-center text-muted-foreground">
                Transaction Reference: <span className="font-mono">{searchParams.get('order_id')}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            Processing Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg">
              Processing your Wipay payment...
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your payment with Wipay
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-center">
            <p className="text-blue-900">
              Do not close this page or press the back button
            </p>
          </div>

          {searchParams.get('order_id') && (
            <p className="text-xs text-center text-muted-foreground">
              Reference: <span className="font-mono">{searchParams.get('order_id')}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Wipay Callback Page
 * Wrapper component with Suspense boundary
 */
export default function WipayCallback() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-md mx-auto py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Please wait...
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <WipayCallbackContent />
    </Suspense>
  );
}

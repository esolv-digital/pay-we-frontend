'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { paymentVerificationService } from '@/lib/services/payment-verification.service';
import { paymentRedirectService } from '@/lib/services/payment-redirect.service';
import type { PaymentVerificationResult } from '@/lib/services/payment-verification.service';

/**
 * Payment Verification Content Component
 * Handles redirects from payment gateways (Paystack, Wipay)
 *
 * Features:
 * - Continuous polling for pending transactions
 * - Real-time progress updates
 * - Automatic redirects on success/failure
 * - User-friendly messaging
 * - Retry functionality
 *
 * Query Parameters:
 * - reference: Transaction reference
 * - status: Payment status (success, failed, cancelled)
 * - trxref: Alternative reference parameter
 */
function PaymentVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get reference from various parameter names used by different gateways
  // Priority: reference (standard) → trxref (Paystack) → order_id (Wipay)
  const reference = searchParams.get('reference') ||
                    searchParams.get('trxref') ||
                    searchParams.get('order_id');

  // State management
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationProgress, setVerificationProgress] = useState({
    attempt: 0,
    maxAttempts: 30,
    nextDelay: 2000,
  });
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [redirectCancelled, setRedirectCancelled] = useState(false);

  // Refs for cleanup
  const verificationAbortRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start redirect countdown
   * On success: redirects to homepage (user can click store button if they want)
   * On failure: redirects to payment page for retry
   */
  const startRedirectCountdown = useCallback((result: PaymentVerificationResult) => {
    if (!result.transaction) return;

    let destination;
    let countdown = 10; // Default 10 seconds

    if (result.status === 'success') {
      // On success, always redirect to homepage
      // User can manually click store URL button if they want
      destination = {
        url: '/',
        label: 'Go to homepage',
        type: 'homepage' as const,
      };

      // If store URL is configured, give user more time (30 seconds)
      const hasStoreUrl = !!result.transaction.payment_page?.metadata?.customization?.store_url;
      if (hasStoreUrl) {
        countdown = 30; // 30 seconds when store URL is available
      }
    } else {
      // On failure, redirect back to payment page for retry
      destination = paymentRedirectService.getFailureRedirect(result.transaction);
    }

    setRedirectCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown--;
      setRedirectCountdown(countdown);

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        if (!redirectCancelled) {
          window.location.href = destination.url;
        }
      }
    }, 1000);

    redirectTimeoutRef.current = countdownInterval as unknown as NodeJS.Timeout;
  }, [redirectCancelled]);

  /**
   * Start payment verification with polling
   */
  useEffect(() => {
    if (!reference) return;

    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        verificationAbortRef.current = false;

        // Log verification parameters for debugging (helps identify gateway-specific issues)
        if (process.env.NODE_ENV === 'development') {
          console.log('[Payment Verification] Gateway verification received:', {
            reference,
            status: searchParams.get('status'),
            gateway_tx_id: searchParams.get('transaction_id'),
            order_id: searchParams.get('order_id'),
            currency: searchParams.get('currency'),
          });
        }

        const result = await paymentVerificationService.verifyPayment(
          reference,
          (attempt, maxAttempts, nextDelay) => {
            // Update progress
            if (!verificationAbortRef.current) {
              setVerificationProgress({
                attempt,
                maxAttempts,
                nextDelay,
              });
            }
          }
        );

        if (!verificationAbortRef.current) {
          setVerificationResult(result);
          setIsVerifying(false);

          // Start redirect countdown on success or failure
          if (result.status === 'success' || result.status === 'failed') {
            startRedirectCountdown(result);
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        if (!verificationAbortRef.current) {
          setVerificationResult({
            transaction: null,
            status: 'pending',
            attempts: 0,
            error: error as Error,
          });
          setIsVerifying(false);
        }
      }
    };

    verifyPayment();

    // Cleanup function
    return () => {
      verificationAbortRef.current = true;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [reference, searchParams, startRedirectCountdown]);

  /**
   * Cancel automatic redirect
   */
  const handleCancelRedirect = () => {
    setRedirectCancelled(true);
    setRedirectCountdown(null);
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
  };

  /**
   * Manual redirect
   * Cancels auto-redirect and immediately redirects to chosen destination
   */
  const handleManualRedirect = (url: string) => {
    // Cancel auto-redirect
    setRedirectCancelled(true);
    setRedirectCountdown(null);
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    // Redirect immediately
    window.location.href = url;
  };

  /**
   * Retry verification
   */
  const handleRetry = () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setRedirectCountdown(null);
    setRedirectCancelled(false);
    window.location.reload();
  };

  // Calculate progress percentage
  const progressPercentage = verificationProgress.maxAttempts > 0
    ? (verificationProgress.attempt / verificationProgress.maxAttempts) * 100
    : 0;

  // No reference provided
  if (!reference) {
    return (
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Invalid Payment Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              No payment reference was provided. Please try again.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => router.push('/')}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifying payment
  if (isVerifying) {
    return (
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Verifying Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Please wait while we verify your payment with the payment gateway...
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {verificationProgress.attempt} / {verificationProgress.maxAttempts} attempts
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-mono text-xs">{reference}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;re checking with the payment gateway to confirm your transaction.
                This usually takes a few seconds but may take up to a minute if the network is busy.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p className="text-center">
                Please don&apos;t close this page. We&apos;ll automatically update once verification is complete.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment verified successfully - Thank You Page
  if (verificationResult?.status === 'success' && verificationResult.transaction) {
    const transaction = verificationResult.transaction;
    const paymentPage = transaction.payment_page;
    const storeUrl = paymentPage?.metadata?.customization?.store_url;
    const hasStoreUrl = !!storeUrl;
    const hasRedirectUrl = !!paymentPage?.redirect_url;

    return (
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex flex-col items-center justify-center gap-3 text-green-600">
              <CheckCircle className="h-16 w-16" />
              <span className="text-2xl">Thank You!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-xl font-semibold">
                Your payment was successful
              </p>
              {transaction.amount && transaction.currency_code && (
                <div className="text-4xl font-bold text-green-600">
                  {transaction.currency_code} {transaction.amount.toLocaleString()}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Payment completed successfully
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-mono font-medium">{transaction.reference}</span>
              </div>
              {transaction.customer_email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{transaction.customer_email}</span>
                </div>
              )}
              {transaction.payment_method && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                </div>
              )}
              {transaction.completed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(transaction.completed_at).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-center">
              <p className="text-blue-900 font-medium">
                ✓ A confirmation email has been sent to {transaction.customer_email || 'your email'}
              </p>
            </div>

            {/* Success message from customization */}
            {paymentPage?.metadata?.customization?.success_message && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-sm text-center">
                <p className="text-purple-900">
                  {paymentPage.metadata.customization.success_message}
                </p>
              </div>
            )}

            {/* Redirect countdown - Only if user hasn't interacted */}
            {redirectCountdown !== null && !redirectCancelled && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>Redirecting to homepage in {redirectCountdown} seconds...</span>
                </div>
                <Progress
                  value={(() => {
                    const maxTime = hasStoreUrl ? 30 : 10;
                    return ((maxTime - redirectCountdown) / maxTime) * 100;
                  })()}
                  className="h-1"
                />
                <p className="text-xs text-center text-muted-foreground">
                  Click any button below to stay on this page
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Store URL button (if configured) */}
              {hasStoreUrl && storeUrl && (
                <Button
                  onClick={() => handleManualRedirect(storeUrl)}
                  className="w-full"
                  size="lg"
                >
                  Visit Our Store
                </Button>
              )}

              {/* Custom redirect URL button (if configured and different from store) */}
              {hasRedirectUrl && paymentPage?.redirect_url && paymentPage.redirect_url !== storeUrl && (
                <Button
                  onClick={() => handleManualRedirect(paymentPage.redirect_url!)}
                  variant={hasStoreUrl ? 'outline' : 'default'}
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              )}

              {/* Go to homepage button */}
              <Button
                variant="outline"
                onClick={() => handleManualRedirect('/')}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Keep your reference number for future inquiries
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment failed
  if (verificationResult?.status === 'failed' && verificationResult.transaction) {
    const transaction = verificationResult.transaction;
    const redirectDestination = paymentRedirectService.getFailureRedirect(transaction);

    return (
      <div className="container max-w-md mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
              <XCircle className="h-8 w-8" />
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg">
                We couldn&apos;t process your payment
              </p>
              <p className="text-sm text-muted-foreground">
                {transaction.failure_reason || 'The payment was declined by your bank or payment provider'}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-mono font-medium">{transaction.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize text-red-600">{transaction.status}</span>
              </div>
              {transaction.customer_email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{transaction.customer_email}</span>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
              <p className="text-yellow-900 font-medium mb-2">Common reasons for payment failure:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 text-xs">
                <li>Insufficient funds in your account</li>
                <li>Card limit exceeded</li>
                <li>Incorrect card details or expired card</li>
                <li>Bank declined the transaction</li>
                <li>Network or connectivity issues</li>
              </ul>
            </div>

            {/* Redirect countdown */}
            {redirectCountdown !== null && !redirectCancelled && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>Redirecting to retry in {redirectCountdown} seconds...</span>
                </div>
                <Progress value={((10 - redirectCountdown) / 10) * 100} className="h-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelRedirect}
                  className="w-full"
                >
                  Cancel Auto-Redirect
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleManualRedirect(redirectDestination.url)}
                className="w-full"
                size="lg"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Go Home
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Need help? Contact support with your reference number
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verification error or timeout
  return (
    <div className="container max-w-md mx-auto py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2 text-orange-600">
            <AlertCircle className="h-8 w-8" />
            Verification Taking Longer Than Expected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg">
              We&apos;re still processing your payment
            </p>
            <p className="text-sm text-muted-foreground">
              Your payment may have been successful, but we&apos;re having trouble confirming it right now.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-mono font-medium">{reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attempts Made:</span>
              <span className="font-medium">{verificationResult?.attempts || 0}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm space-y-2">
            <p className="text-blue-900 font-medium">What you can do:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs">
              <li>Wait a few minutes and try verifying again</li>
              <li>Check your email for payment confirmation</li>
              <li>Check your bank statement for charges</li>
              <li>Contact support with your reference number if needed</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full" size="lg">
              <Loader2 className="h-4 w-4 mr-2" />
              Try Verifying Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go Home
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Save your reference number: <span className="font-mono font-medium">{reference}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Payment Verification Page
 * Wrapper component with Suspense boundary
 */
export default function PaymentVerification() {
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
      <PaymentVerificationContent />
    </Suspense>
  );
}

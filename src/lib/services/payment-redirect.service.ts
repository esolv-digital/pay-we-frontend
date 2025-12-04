import type { Transaction, PaymentPage } from '@/types';

/**
 * Redirect Configuration
 */
export interface RedirectConfig {
  /** Delay before redirect (in seconds) */
  delaySeconds: number;
  /** Default homepage URL */
  homepageUrl: string;
}

/**
 * Redirect Destination
 */
export interface RedirectDestination {
  /** URL to redirect to */
  url: string;
  /** Display label for the destination */
  label: string;
  /** Type of destination */
  type: 'custom' | 'store' | 'homepage' | 'payment-page';
  /** Whether this is a fallback destination */
  isFallback?: boolean;
}

/**
 * Payment Redirect Service
 *
 * Single Responsibility: Handle post-payment redirects
 * Open/Closed: Open for extension (can add new redirect strategies), closed for modification
 * Liskov Substitution: Can be substituted with mock implementations for testing
 * Interface Segregation: Provides focused redirect interface
 * Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations
 *
 * DRY: Centralizes all redirect logic for payment flows
 */
export class PaymentRedirectService {
  private config: RedirectConfig;

  constructor(config?: Partial<RedirectConfig>) {
    this.config = {
      delaySeconds: config?.delaySeconds ?? 10,
      homepageUrl: config?.homepageUrl ?? '/',
    };
  }

  /**
   * Get redirect destination for successful payment
   *
   * Priority order:
   * 1. Payment page redirect_url (if provided)
   * 2. Store URL from customization (if provided)
   * 3. Homepage (fallback)
   *
   * @param transaction - Transaction object
   * @returns RedirectDestination
   */
  getSuccessRedirect(transaction: Transaction): RedirectDestination {
    const paymentPage = transaction.payment_page;

    // Priority 1: Custom redirect URL from payment page root level
    if (paymentPage?.redirect_url) {
      return {
        url: paymentPage.redirect_url,
        label: 'Continue to destination',
        type: 'custom',
      };
    }

    // Priority 2: Store URL from customization
    const storeUrl = paymentPage?.metadata?.customization?.store_url;
    if (storeUrl) {
      return {
        url: storeUrl,
        label: 'Visit our store',
        type: 'store',
      };
    }

    // Fallback: Homepage
    return {
      url: this.config.homepageUrl,
      label: 'Go to homepage',
      type: 'homepage',
      isFallback: true,
    };
  }

  /**
   * Get redirect destination for failed payment
   *
   * Priority order:
   * 1. Back to payment page (to allow retry)
   * 2. Homepage (fallback if payment page info not available)
   *
   * @param transaction - Transaction object
   * @returns RedirectDestination
   */
  getFailureRedirect(transaction: Transaction | null): RedirectDestination {
    const paymentPage = transaction?.payment_page;

    // Priority 1: Back to payment page using short_url
    if (paymentPage?.short_url) {
      return {
        url: `/pay/${paymentPage.short_url}`,
        label: 'Try again',
        type: 'payment-page',
      };
    }

    // Priority 2: Back to payment page using public_url
    if (paymentPage?.public_url) {
      return {
        url: paymentPage.public_url,
        label: 'Try again',
        type: 'payment-page',
      };
    }

    // Priority 3: Back to payment page using vendor slug and page slug
    if (paymentPage?.vendor?.slug && paymentPage?.slug) {
      return {
        url: `/pay/${paymentPage.vendor.slug}/${paymentPage.slug}`,
        label: 'Try again',
        type: 'payment-page',
      };
    }

    // Fallback: Homepage (should rarely happen)
    return {
      url: this.config.homepageUrl,
      label: 'Go to homepage',
      type: 'homepage',
      isFallback: true,
    };
  }

  /**
   * Get all available redirect options for user choice
   *
   * @param transaction - Transaction object
   * @returns Array of RedirectDestination
   */
  getAvailableRedirects(transaction: Transaction): RedirectDestination[] {
    const destinations: RedirectDestination[] = [];
    const paymentPage = transaction.payment_page;

    // Add custom redirect URL if available (highest priority)
    if (paymentPage?.redirect_url) {
      destinations.push({
        url: paymentPage.redirect_url,
        label: 'Continue to destination',
        type: 'custom',
      });
    }

    // Add store URL if available
    const storeUrl = paymentPage?.metadata?.customization?.store_url;
    if (storeUrl) {
      destinations.push({
        url: storeUrl,
        label: 'Visit our store',
        type: 'store',
      });
    }

    // Always add homepage as final option
    destinations.push({
      url: this.config.homepageUrl,
      label: 'Go to homepage',
      type: 'homepage',
    });

    return destinations;
  }

  /**
   * Check if payment page has store URL configured
   *
   * @param paymentPage - Payment page object
   * @returns boolean
   */
  hasStoreUrl(paymentPage?: PaymentPage): boolean {
    return !!paymentPage?.metadata?.customization?.store_url;
  }

  /**
   * Get store URL from payment page
   *
   * @param paymentPage - Payment page object
   * @returns string | null
   */
  getStoreUrl(paymentPage?: PaymentPage): string | null {
    return paymentPage?.metadata?.customization?.store_url || null;
  }

  /**
   * Get payment page URL for retry
   *
   * @param paymentPage - Payment page object
   * @returns string
   */
  getPaymentPageUrl(paymentPage?: PaymentPage): string {
    if (!paymentPage) return this.config.homepageUrl;

    // Try short_url first
    if (paymentPage.short_url) {
      return `/pay/${paymentPage.short_url}`;
    }

    // Try public_url
    if (paymentPage.public_url) {
      return paymentPage.public_url;
    }

    // Try vendor slug + page slug
    if (paymentPage.vendor?.slug && paymentPage.slug) {
      return `/pay/${paymentPage.vendor.slug}/${paymentPage.slug}`;
    }

    // Fallback to homepage
    return this.config.homepageUrl;
  }

  /**
   * Perform redirect with delay
   *
   * @param destination - Redirect destination
   * @param onCountdown - Optional callback for countdown updates
   * @returns Promise that resolves when redirect happens
   */
  async redirectWithDelay(
    destination: RedirectDestination,
    onCountdown?: (secondsRemaining: number) => void
  ): Promise<void> {
    let secondsRemaining = this.config.delaySeconds;

    // Countdown
    while (secondsRemaining > 0) {
      if (onCountdown) {
        onCountdown(secondsRemaining);
      }
      await this.delay(1000);
      secondsRemaining--;
    }

    // Perform redirect
    window.location.href = destination.url;
  }

  /**
   * Redirect immediately
   *
   * @param destination - Redirect destination
   */
  redirectImmediately(destination: RedirectDestination): void {
    window.location.href = destination.url;
  }

  /**
   * Cancel redirect (useful for user interaction)
   */
  cancelRedirect(): void {
    // This method would be used with a countdown timer
    // In practice, the component should clear its interval/timeout
  }

  /**
   * Delay helper using Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance with default config
export const paymentRedirectService = new PaymentRedirectService();

import { WIPAY_CURRENCY_COUNTRY_MAP } from '@/lib/config/constants';
import type { PaymentPage } from '@/types';

/**
 * Payment Utility Functions
 *
 * SOLID Principles:
 * - SRP: Each function has a single, well-defined responsibility
 * - OCP: Open for extension with new payment gateway logic
 * - DRY: Centralized payment logic to avoid duplication
 */

/**
 * Check if a currency is a Wipay currency
 *
 * @param currencyCode - Currency code to check (e.g., 'TTD', 'JMD')
 * @returns boolean - True if currency is supported by Wipay
 */
export function isWipayCurrency(currencyCode: string): boolean {
  const wipayCurrencies = Object.keys(WIPAY_CURRENCY_COUNTRY_MAP);
  return wipayCurrencies.includes(currencyCode);
}

/**
 * Get country code from Wipay currency
 *
 * @param currencyCode - Wipay currency code (TTD, JMD, BBD, GYD)
 * @returns string | null - Country code (TT, JM, BB, GY) or null if not a Wipay currency
 */
export function getCountryCodeFromCurrency(currencyCode: string): string | null {
  return WIPAY_CURRENCY_COUNTRY_MAP[currencyCode as keyof typeof WIPAY_CURRENCY_COUNTRY_MAP] || null;
}

/**
 * Check if payment page uses Wipay
 *
 * @param paymentPage - Payment page object
 * @returns boolean - True if payment page uses a Wipay currency
 */
export function isWipayPaymentPage(paymentPage: PaymentPage): boolean {
  return isWipayCurrency(paymentPage.currency_code);
}

/**
 * Get default country code for a payment page
 * Automatically determines country from Wipay currency
 *
 * @param paymentPage - Payment page object
 * @returns string | undefined - Country code if Wipay currency, undefined otherwise
 */
export function getDefaultCountryCode(paymentPage: PaymentPage): string | undefined {
  if (isWipayPaymentPage(paymentPage)) {
    return getCountryCodeFromCurrency(paymentPage.currency_code) || undefined;
  }
  return undefined;
}

/**
 * Check if payment page requires country code input
 *
 * This is needed when:
 * - Payment page uses Wipay (TTD, JMD, BBD, GYD)
 * - AND payment page allows multiple countries
 *
 * @param paymentPage - Payment page object
 * @returns boolean - True if country selector should be shown
 */
export function requiresCountrySelection(paymentPage: PaymentPage): boolean {
  // If not Wipay, no country selection needed
  if (!isWipayPaymentPage(paymentPage)) {
    return false;
  }

  // If allowed_countries is specified with multiple countries, show selector
  if (paymentPage.allowed_countries && paymentPage.allowed_countries.length > 1) {
    return true;
  }

  // Otherwise, country is auto-determined from currency
  return false;
}

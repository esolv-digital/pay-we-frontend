/**
 * Application Constants
 */

// Payment Gateways
export const PAYMENT_GATEWAYS = {
  FLUTTERWAVE: 'flutterwave',
  PAYSTACK: 'paystack',
  WIPAY: 'wipay',
} as const;

export const PAYMENT_GATEWAY_LABELS = {
  [PAYMENT_GATEWAYS.FLUTTERWAVE]: 'Flutterwave',
  [PAYMENT_GATEWAYS.PAYSTACK]: 'Paystack',
  [PAYMENT_GATEWAYS.WIPAY]: 'WiPay',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
  BANK_TRANSFER: 'bank_transfer',
  CRYPTO: 'crypto',
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHODS.MOBILE_MONEY]: 'Mobile Money',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.CRYPTO]: 'Cryptocurrency',
} as const;

// Transaction Statuses
// Flow: initiated → pending → processing → successful → completed
export const TRANSACTION_STATUSES = {
  INITIATED: 'initiated',     // Transaction created, customer on payment page
  PENDING: 'pending',         // Customer at payment gateway (Paystack)
  PROCESSING: 'processing',   // Payment being processed by gateway
  SUCCESSFUL: 'successful',   // Payment confirmed, instant payout triggered
  COMPLETED: 'completed',     // Full lifecycle done (payout completed)
  FAILED: 'failed',           // Payment failed
  CANCELLED: 'cancelled',     // Payment cancelled
  EXPIRED: 'expired',         // Payment link expired
  REFUNDED: 'refunded',       // Money returned to customer
  CHARGEBACK: 'chargeback',   // Customer disputed payment
  REVERSED: 'reversed',       // Bank reversed the transaction
  ON_HOLD: 'on_hold',         // Under investigation
} as const;

export const TRANSACTION_STATUS_LABELS = {
  [TRANSACTION_STATUSES.INITIATED]: 'Initiated',
  [TRANSACTION_STATUSES.PENDING]: 'Pending',
  [TRANSACTION_STATUSES.PROCESSING]: 'Processing',
  [TRANSACTION_STATUSES.SUCCESSFUL]: 'Successful',
  [TRANSACTION_STATUSES.COMPLETED]: 'Completed',
  [TRANSACTION_STATUSES.FAILED]: 'Failed',
  [TRANSACTION_STATUSES.CANCELLED]: 'Cancelled',
  [TRANSACTION_STATUSES.EXPIRED]: 'Expired',
  [TRANSACTION_STATUSES.REFUNDED]: 'Refunded',
  [TRANSACTION_STATUSES.CHARGEBACK]: 'Disputed',
  [TRANSACTION_STATUSES.REVERSED]: 'Reversed',
  [TRANSACTION_STATUSES.ON_HOLD]: 'Under Review',
} as const;

export const TRANSACTION_STATUS_COLORS = {
  [TRANSACTION_STATUSES.INITIATED]: 'bg-gray-100 text-gray-800',
  [TRANSACTION_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [TRANSACTION_STATUSES.PROCESSING]: 'bg-blue-100 text-blue-800',
  [TRANSACTION_STATUSES.SUCCESSFUL]: 'bg-green-100 text-green-800',
  [TRANSACTION_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [TRANSACTION_STATUSES.FAILED]: 'bg-red-100 text-red-800',
  [TRANSACTION_STATUSES.CANCELLED]: 'bg-gray-100 text-gray-800',
  [TRANSACTION_STATUSES.EXPIRED]: 'bg-gray-100 text-gray-800',
  [TRANSACTION_STATUSES.REFUNDED]: 'bg-purple-100 text-purple-800',
  [TRANSACTION_STATUSES.CHARGEBACK]: 'bg-red-100 text-red-800',
  [TRANSACTION_STATUSES.REVERSED]: 'bg-orange-100 text-orange-800',
  [TRANSACTION_STATUSES.ON_HOLD]: 'bg-orange-100 text-orange-800',
} as const;

// User Statuses
export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.SUSPENDED]: 'Suspended',
  [USER_STATUSES.INACTIVE]: 'Inactive',
} as const;

// KYC Statuses
export const KYC_STATUSES = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NOT_SUBMITTED: 'not_submitted',
} as const;

export const KYC_STATUS_LABELS = {
  [KYC_STATUSES.PENDING]: 'Pending',
  [KYC_STATUSES.IN_REVIEW]: 'In Review',
  [KYC_STATUSES.APPROVED]: 'Approved',
  [KYC_STATUSES.REJECTED]: 'Rejected',
  [KYC_STATUSES.NOT_SUBMITTED]: 'Not Submitted',
} as const;

export const KYC_STATUS_COLORS = {
  [KYC_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [KYC_STATUSES.IN_REVIEW]: 'bg-blue-100 text-blue-800',
  [KYC_STATUSES.APPROVED]: 'bg-green-100 text-green-800',
  [KYC_STATUSES.REJECTED]: 'bg-red-100 text-red-800',
  [KYC_STATUSES.NOT_SUBMITTED]: 'bg-red-100 text-red-800',
} as const;

// Organization Types
export const ORGANIZATION_TYPES = {
  INDIVIDUAL: 'individual',
  CORPORATE: 'corporate',
} as const;

export const ORGANIZATION_TYPE_LABELS = {
  [ORGANIZATION_TYPES.INDIVIDUAL]: 'Individual',
  [ORGANIZATION_TYPES.CORPORATE]: 'Corporate',
} as const;

// Payment Page Amount Types
export const AMOUNT_TYPES = {
  FIXED: 'fixed',
  FLEXIBLE: 'flexible',
  DONATION: 'donation',
} as const;

export const AMOUNT_TYPE_LABELS = {
  [AMOUNT_TYPES.FIXED]: 'Fixed Amount',
  [AMOUNT_TYPES.FLEXIBLE]: 'Flexible Amount',
  [AMOUNT_TYPES.DONATION]: 'Donation',
} as const;

/**
 * DEPRECATED: Hard-coded currencies and countries
 *
 * ⚠️ WARNING: Do not use these constants for new code!
 *
 * Currency and country data should be fetched dynamically from the backend API.
 * Use the following instead:
 * - For countries: use `countryApi.getAllCountries()` from '@/lib/api/country'
 * - For currencies: use `countryApi.getAllCurrencies()` from '@/lib/api/country'
 * - For payment methods: use `countryApi.getPaymentMethods(countryCode)` from '@/lib/api/country'
 *
 * See /backend/COUNTRY_API.md for full API documentation.
 *
 * These constants are kept temporarily for backward compatibility with existing code
 * that references Wipay-specific functionality. They will be removed in a future version.
 */

// DEPRECATED: Use countryApi.getPaymentMethods() instead
export const WIPAY_COUNTRIES = {
  TT: 'TT', // Trinidad & Tobago
  JM: 'JM', // Jamaica
  BB: 'BB', // Barbados
  GY: 'GY', // Guyana
} as const;

// DEPRECATED: Use country data from API instead
export const WIPAY_COUNTRY_LABELS = {
  [WIPAY_COUNTRIES.TT]: 'Trinidad & Tobago',
  [WIPAY_COUNTRIES.JM]: 'Jamaica',
  [WIPAY_COUNTRIES.BB]: 'Barbados',
  [WIPAY_COUNTRIES.GY]: 'Guyana',
} as const;

// DEPRECATED: Use country.currency_code from API instead
export const WIPAY_CURRENCY_COUNTRY_MAP = {
  TTD: 'TT',
  JMD: 'JM',
  BBD: 'BB',
  GYD: 'GY',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

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
export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHARGEBACK: 'chargeback',
  EXPIRED: 'expired',
  PROCESSING: 'processing',
  ON_HOLD: 'on_hold',
  EXCHANGE: 'exchange',
  TRANSFER: 'transfer',
  PAID: 'paid',
  REFUND: 'refund',
  GIFT: 'gift',
  SUCCESS: 'success', // Legacy - maps to completed
} as const;

export const TRANSACTION_STATUS_LABELS = {
  [TRANSACTION_STATUSES.PENDING]: 'Pending',
  [TRANSACTION_STATUSES.APPROVED]: 'Approved',
  [TRANSACTION_STATUSES.COMPLETED]: 'Completed',
  [TRANSACTION_STATUSES.FAILED]: 'Failed',
  [TRANSACTION_STATUSES.CANCELLED]: 'Cancelled',
  [TRANSACTION_STATUSES.REFUNDED]: 'Refunded',
  [TRANSACTION_STATUSES.CHARGEBACK]: 'Chargeback',
  [TRANSACTION_STATUSES.EXPIRED]: 'Expired',
  [TRANSACTION_STATUSES.PROCESSING]: 'Processing',
  [TRANSACTION_STATUSES.ON_HOLD]: 'On Hold',
  [TRANSACTION_STATUSES.EXCHANGE]: 'Exchange',
  [TRANSACTION_STATUSES.TRANSFER]: 'Transfer',
  [TRANSACTION_STATUSES.PAID]: 'Paid',
  [TRANSACTION_STATUSES.REFUND]: 'Refund',
  [TRANSACTION_STATUSES.GIFT]: 'Gift',
  [TRANSACTION_STATUSES.SUCCESS]: 'Success',
} as const;

export const TRANSACTION_STATUS_COLORS = {
  [TRANSACTION_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [TRANSACTION_STATUSES.APPROVED]: 'bg-green-100 text-green-800',
  [TRANSACTION_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [TRANSACTION_STATUSES.FAILED]: 'bg-red-100 text-red-800',
  [TRANSACTION_STATUSES.CANCELLED]: 'bg-gray-100 text-gray-800',
  [TRANSACTION_STATUSES.REFUNDED]: 'bg-purple-100 text-purple-800',
  [TRANSACTION_STATUSES.CHARGEBACK]: 'bg-red-100 text-red-800',
  [TRANSACTION_STATUSES.EXPIRED]: 'bg-gray-100 text-gray-800',
  [TRANSACTION_STATUSES.PROCESSING]: 'bg-blue-100 text-blue-800',
  [TRANSACTION_STATUSES.ON_HOLD]: 'bg-orange-100 text-orange-800',
  [TRANSACTION_STATUSES.EXCHANGE]: 'bg-indigo-100 text-indigo-800',
  [TRANSACTION_STATUSES.TRANSFER]: 'bg-indigo-100 text-indigo-800',
  [TRANSACTION_STATUSES.PAID]: 'bg-green-100 text-green-800',
  [TRANSACTION_STATUSES.REFUND]: 'bg-purple-100 text-purple-800',
  [TRANSACTION_STATUSES.GIFT]: 'bg-pink-100 text-pink-800',
  [TRANSACTION_STATUSES.SUCCESS]: 'bg-green-100 text-green-800',
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

// Currency Codes
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  NGN: 'NGN',
  GHS: 'GHS',
  KES: 'KES',
  ZAR: 'ZAR',
  TTD: 'TTD',
  JMD: 'JMD',
  BBD: 'BBD',
  GYD: 'GYD',
} as const;

export const CURRENCY_LABELS = {
  [CURRENCIES.USD]: 'US Dollar',
  [CURRENCIES.EUR]: 'Euro',
  [CURRENCIES.GBP]: 'British Pound',
  [CURRENCIES.NGN]: 'Nigerian Naira',
  [CURRENCIES.GHS]: 'Ghanaian Cedi',
  [CURRENCIES.KES]: 'Kenyan Shilling',
  [CURRENCIES.ZAR]: 'South African Rand',
  [CURRENCIES.TTD]: 'Trinidad & Tobago Dollar',
  [CURRENCIES.JMD]: 'Jamaican Dollar',
  [CURRENCIES.BBD]: 'Barbados Dollar',
  [CURRENCIES.GYD]: 'Guyanese Dollar',
} as const;

// Country Codes (Wipay Supported Countries)
export const WIPAY_COUNTRIES = {
  TT: 'TT', // Trinidad & Tobago
  JM: 'JM', // Jamaica
  BB: 'BB', // Barbados
  GY: 'GY', // Guyana
} as const;

export const WIPAY_COUNTRY_LABELS = {
  [WIPAY_COUNTRIES.TT]: 'Trinidad & Tobago',
  [WIPAY_COUNTRIES.JM]: 'Jamaica',
  [WIPAY_COUNTRIES.BB]: 'Barbados',
  [WIPAY_COUNTRIES.GY]: 'Guyana',
} as const;

// Currency to Country Mapping (for Wipay)
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

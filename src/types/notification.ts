/**
 * Notification Types
 * Matches backend API: /notifications/preferences endpoints
 */

export type NotificationChannel = 'email' | 'sms' | 'push';

export type NotificationType =
  // Transaction events
  | 'transaction_successful'
  | 'transaction_failed'
  | 'transaction_refunded'
  | 'transaction_disputed'
  // Payout events
  | 'payout_initiated'
  | 'payout_processing'
  | 'payout_completed'
  | 'payout_failed'
  // Balance events
  | 'balance_funds_available'
  | 'balance_low'
  | 'balance_threshold_reached'
  // Account events
  | 'account_payout_added'
  | 'account_payout_removed'
  | 'account_default_changed'
  // KYC events
  | 'kyc_approved'
  | 'kyc_rejected'
  // Security events
  | 'security_alert'
  // Legacy (keep for backward compatibility)
  | 'payment_received'
  | 'payment_failed';

export interface NotificationPreference {
  type: NotificationType;
  label: string;
  description: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  is_optional: boolean;
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
}

export interface UpdateNotificationPreferenceRequest {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface BulkUpdateNotificationPreferencesRequest {
  preferences: UpdateNotificationPreferenceRequest[];
}

export interface TestNotificationRequest {
  channel: 'email' | 'sms';
}

// Notification categories for UI grouping
export type NotificationCategory =
  | 'transactions'
  | 'payouts'
  | 'balance'
  | 'account'
  | 'kyc'
  | 'security';

export interface NotificationTypeMetadata {
  label: string;
  description: string;
  category: NotificationCategory;
  critical: boolean;
  defaultEnabled: boolean;
}

// Notification type metadata for UI display
export const NOTIFICATION_TYPE_INFO: Record<NotificationType, NotificationTypeMetadata> = {
  // Transaction events
  transaction_successful: {
    label: 'Payment Received',
    description: 'When a customer successfully completes a payment',
    category: 'transactions',
    critical: false,
    defaultEnabled: true,
  },
  transaction_failed: {
    label: 'Payment Failed',
    description: 'When a customer payment attempt fails',
    category: 'transactions',
    critical: false,
    defaultEnabled: true,
  },
  transaction_refunded: {
    label: 'Payment Refunded',
    description: 'When a payment is refunded to customer',
    category: 'transactions',
    critical: false,
    defaultEnabled: true,
  },
  transaction_disputed: {
    label: 'Payment Disputed',
    description: 'When a customer initiates a dispute/chargeback',
    category: 'transactions',
    critical: true,
    defaultEnabled: true,
  },

  // Payout events
  payout_initiated: {
    label: 'Payout Initiated',
    description: 'When a payout to your account is initiated',
    category: 'payouts',
    critical: false,
    defaultEnabled: true,
  },
  payout_processing: {
    label: 'Payout Processing',
    description: 'When your payout is being processed by the bank',
    category: 'payouts',
    critical: false,
    defaultEnabled: false,
  },
  payout_completed: {
    label: 'Payout Completed',
    description: 'When funds are successfully transferred to your account',
    category: 'payouts',
    critical: false,
    defaultEnabled: true,
  },
  payout_failed: {
    label: 'Payout Failed',
    description: 'When a payout transfer fails',
    category: 'payouts',
    critical: true,
    defaultEnabled: true,
  },

  // Balance events
  balance_funds_available: {
    label: 'Funds Available',
    description: 'When new funds are available for withdrawal',
    category: 'balance',
    critical: false,
    defaultEnabled: true,
  },
  balance_low: {
    label: 'Low Balance Alert',
    description: 'When your balance falls below a set threshold',
    category: 'balance',
    critical: false,
    defaultEnabled: false,
  },
  balance_threshold_reached: {
    label: 'Balance Threshold Reached',
    description: 'When your balance reaches a custom threshold',
    category: 'balance',
    critical: false,
    defaultEnabled: false,
  },

  // Account events
  account_payout_added: {
    label: 'Payout Account Added',
    description: 'When a new payout account is added',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },
  account_payout_removed: {
    label: 'Payout Account Removed',
    description: 'When a payout account is removed',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },
  account_default_changed: {
    label: 'Default Account Changed',
    description: 'When your default payout account is changed',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },

  // KYC events
  kyc_approved: {
    label: 'KYC Approved',
    description: 'When your verification is approved',
    category: 'kyc',
    critical: false,
    defaultEnabled: true,
  },
  kyc_rejected: {
    label: 'KYC Rejected',
    description: 'When your verification is rejected',
    category: 'kyc',
    critical: true,
    defaultEnabled: true,
  },

  // Security events
  security_alert: {
    label: 'Security Alerts',
    description: 'Important security notifications (cannot be disabled)',
    category: 'security',
    critical: true,
    defaultEnabled: true,
  },

  // Legacy (backward compatibility)
  payment_received: {
    label: 'Payment Received (Legacy)',
    description: 'When a payment is received',
    category: 'transactions',
    critical: false,
    defaultEnabled: true,
  },
  payment_failed: {
    label: 'Payment Failed (Legacy)',
    description: 'When a payment fails',
    category: 'transactions',
    critical: false,
    defaultEnabled: true,
  },
};

// Category labels for UI grouping
export const NOTIFICATION_CATEGORY_INFO: Record<
  NotificationCategory,
  { label: string; description: string }
> = {
  transactions: {
    label: 'Transactions',
    description: 'Notifications about customer payments',
  },
  payouts: {
    label: 'Payouts',
    description: 'Notifications about disbursements to your account',
  },
  balance: {
    label: 'Balance',
    description: 'Notifications about your available balance',
  },
  account: {
    label: 'Account',
    description: 'Notifications about payout account changes',
  },
  kyc: {
    label: 'Verification',
    description: 'Notifications about KYC verification status',
  },
  security: {
    label: 'Security',
    description: 'Important security notifications',
  },
};

// Legacy type aliases for backward compatibility
export type NotificationEvent = NotificationType;
export interface NotificationPreferences {
  preferences: NotificationPreference[];
}

/**
 * Notification Types
 * Matches backend API: /api/v1/notifications endpoints
 */

// ============================================================================
// NOTIFICATION CHANNELS & TYPES
// ============================================================================

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'database';

// Channel type for notification preferences (uses 'push' instead of 'database')
export type NotificationPreferenceChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export type NotificationType =
  // Payment events
  | 'payment_received'
  | 'payment_pending'
  | 'payment_failed'
  // Payout events
  | 'payout_initiated'
  | 'payout_processing'
  | 'payout_completed'
  | 'payout_failed'
  | 'payout_reversed'
  // Balance events
  | 'balance_credited'
  | 'balance_debited'
  | 'auto_payout_triggered'
  | 'settlement_completed'
  // Account events
  | 'payout_account_added'
  | 'payout_account_removed'
  | 'payout_account_set_default'
  // Refund events
  | 'refund_initiated'
  | 'refund_completed'
  | 'refund_failed'
  // Security events (non-optional)
  | 'security_alert'
  | 'account_verification'
  // Legacy (backward compatibility)
  | 'transaction_successful'
  | 'transaction_failed'
  | 'transaction_refunded'
  | 'transaction_disputed'
  | 'balance_funds_available'
  | 'balance_low'
  | 'balance_threshold_reached'
  | 'account_payout_added'
  | 'account_payout_removed'
  | 'account_default_changed'
  | 'kyc_approved'
  | 'kyc_rejected';

export type NotificationLogStatus = 'pending' | 'sent' | 'delivered' | 'failed';

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface NotificationPreference {
  notification_type: NotificationType;
  label: string;
  description: string;
  is_optional: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  notification_type: NotificationType;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  whatsapp_enabled?: boolean;
  push_enabled?: boolean;
}

export interface BulkUpdateNotificationPreferencesRequest {
  preferences: UpdateNotificationPreferenceRequest[];
}

export interface NotificationTypeInfo {
  value: NotificationType;
  label: string;
  description: string;
  is_optional: boolean;
}

// ============================================================================
// NOTIFICATION HISTORY
// ============================================================================

export interface NotificationLog {
  id: string;
  user_id: string;
  channel: NotificationChannel;
  provider: string;
  notification_type: NotificationType;
  recipient: string;
  subject?: string;
  status: NotificationLogStatus;
  provider_message_id?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationHistoryFilters {
  channel?: NotificationChannel;
  status?: NotificationLogStatus;
  notification_type?: NotificationType;
  per_page?: number;
  page?: number;
}

export interface NotificationHistoryResponse {
  notifications: NotificationLog[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

// ============================================================================
// DEVICE MANAGEMENT
// ============================================================================

export interface UserDevice {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string;
  browser: string;
  os: string;
  last_ip: string;
  last_country: string;
  is_trusted: boolean;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface TestNotificationRequest {
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
}

export interface TestNotificationResponse {
  channel: string;
  recipient: string;
  sent_at: string;
}

// ============================================================================
// ADMIN: MESSAGING PROVIDERS
// ============================================================================

export type MessagingProviderChannel = 'email' | 'sms' | 'whatsapp';

export type MessagingProviderDriver = 'resend' | 'maileroo' | 'twilio';

export interface MessagingProviderCredentials {
  api_key?: string;
  from_email?: string;
  from_name?: string;
  account_sid?: string;
  auth_token?: string;
  from?: string;
}

export interface MessagingProvider {
  id: string;
  name: string;
  driver: MessagingProviderDriver;
  channel: MessagingProviderChannel;
  is_active: boolean;
  is_primary: boolean;
  priority: number;
  last_failure_at?: string;
  failure_count: number;
  is_healthy: boolean;
  credentials: MessagingProviderCredentials;
  countries?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MessagingProviderFilters {
  channel?: MessagingProviderChannel;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

export interface MessagingProviderListResponse {
  providers: MessagingProvider[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface MessagingProviderStatistics {
  total: number;
  active: number;
  inactive: number;
  by_channel: {
    email: { total: number; active: number };
    sms: { total: number; active: number };
    whatsapp: { total: number; active: number };
  };
  health: {
    healthy: number;
    degraded: number;
    failing: number;
  };
}

export interface CreateMessagingProviderRequest {
  name: string;
  driver: string;
  channel: MessagingProviderChannel;
  is_active?: boolean;
  is_primary?: boolean;
  priority?: number;
  credentials: MessagingProviderCredentials;
  countries?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateMessagingProviderRequest {
  name?: string;
  driver?: string;
  channel?: MessagingProviderChannel;
  is_active?: boolean;
  is_primary?: boolean;
  priority?: number;
  credentials?: MessagingProviderCredentials;
  countries?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// ADMIN: NOTIFICATION LOGS
// ============================================================================

export interface AdminNotificationLog extends NotificationLog {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AdminNotificationLogFilters {
  user_id?: string;
  channel?: NotificationChannel;
  status?: NotificationLogStatus;
  notification_type?: NotificationType;
  provider?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

export interface AdminNotificationLogListResponse {
  logs: AdminNotificationLog[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface NotificationStatistics {
  period: {
    from: string;
    to: string;
  };
  totals: {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  by_channel: {
    email: { sent: number; delivered: number; failed: number; pending: number };
    sms: { sent: number; delivered: number; failed: number; pending: number };
    whatsapp: { sent: number; delivered: number; failed: number; pending: number };
    database: { sent: number; delivered: number; failed: number; pending: number };
  };
  by_type: Record<string, number>;
  delivery_rate: number;
}

export interface DailyNotificationData {
  [date: string]: {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  };
}

// ============================================================================
// ADMIN: LOGIN ATTEMPTS & SECURITY
// ============================================================================

export type SuspiciousReason = 'new_device' | 'new_country' | 'impossible_travel' | 'multiple_failures';

export interface LoginAttempt {
  id: string;
  user_id?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  email: string;
  ip_address: string;
  user_agent: string;
  device_fingerprint?: string;
  country_code?: string;
  city?: string;
  location?: string;
  successful: boolean;
  is_suspicious: boolean;
  suspicious_reasons?: SuspiciousReason[];
  notification_sent: boolean;
  created_at: string;
}

export interface LoginAttemptFilters {
  user_id?: string;
  email?: string;
  ip_address?: string;
  country_code?: string;
  successful?: boolean;
  is_suspicious?: boolean;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  page?: number;
}

export interface LoginAttemptListResponse {
  attempts: LoginAttempt[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface LoginStatistics {
  period: {
    from: string;
    to: string;
  };
  totals: {
    total: number;
    successful: number;
    failed: number;
    suspicious: number;
  };
  by_country: Record<string, number>;
  suspicious_reasons: Record<SuspiciousReason, number>;
  unique_ips: number;
  unique_users: number;
}

export interface DailyLoginData {
  [date: string]: {
    successful: number;
    failed: number;
    suspicious: number;
  };
}

export interface AdminUserDevice extends UserDevice {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface AdminDeviceFilters {
  user_id?: string;
  is_trusted?: boolean;
  per_page?: number;
  page?: number;
}

export interface AdminDeviceListResponse {
  devices: AdminUserDevice[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

// ============================================================================
// NOTIFICATION CATEGORIES (UI GROUPING)
// ============================================================================

export type NotificationCategory =
  | 'payments'
  | 'payouts'
  | 'balance'
  | 'account'
  | 'refunds'
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
  // Payment events
  payment_received: {
    label: 'Payment Received',
    description: 'When you receive a payment',
    category: 'payments',
    critical: false,
    defaultEnabled: true,
  },
  payment_pending: {
    label: 'Payment Pending',
    description: 'When a payment is pending confirmation',
    category: 'payments',
    critical: false,
    defaultEnabled: true,
  },
  payment_failed: {
    label: 'Payment Failed',
    description: 'When a payment fails',
    category: 'payments',
    critical: false,
    defaultEnabled: true,
  },

  // Payout events
  payout_initiated: {
    label: 'Payout Initiated',
    description: 'When a payout is started',
    category: 'payouts',
    critical: false,
    defaultEnabled: true,
  },
  payout_processing: {
    label: 'Payout Processing',
    description: 'When a payout is being processed',
    category: 'payouts',
    critical: false,
    defaultEnabled: false,
  },
  payout_completed: {
    label: 'Payout Completed',
    description: 'When a payout completes successfully',
    category: 'payouts',
    critical: false,
    defaultEnabled: true,
  },
  payout_failed: {
    label: 'Payout Failed',
    description: 'When a payout fails',
    category: 'payouts',
    critical: true,
    defaultEnabled: true,
  },
  payout_reversed: {
    label: 'Payout Reversed',
    description: 'When a payout is reversed',
    category: 'payouts',
    critical: true,
    defaultEnabled: true,
  },

  // Balance events
  balance_credited: {
    label: 'Balance Credited',
    description: 'When balance is added',
    category: 'balance',
    critical: false,
    defaultEnabled: true,
  },
  balance_debited: {
    label: 'Balance Debited',
    description: 'When balance is deducted',
    category: 'balance',
    critical: false,
    defaultEnabled: true,
  },
  auto_payout_triggered: {
    label: 'Auto Payout Triggered',
    description: 'When automatic payout is triggered',
    category: 'balance',
    critical: false,
    defaultEnabled: true,
  },
  settlement_completed: {
    label: 'Settlement Completed',
    description: 'When settlement is completed',
    category: 'balance',
    critical: false,
    defaultEnabled: true,
  },

  // Account events
  payout_account_added: {
    label: 'Payout Account Added',
    description: 'When a new payout account is added',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },
  payout_account_removed: {
    label: 'Payout Account Removed',
    description: 'When a payout account is removed',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },
  payout_account_set_default: {
    label: 'Default Payout Account Changed',
    description: 'When default account changes',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },

  // Refund events
  refund_initiated: {
    label: 'Refund Initiated',
    description: 'When a refund is started',
    category: 'refunds',
    critical: false,
    defaultEnabled: true,
  },
  refund_completed: {
    label: 'Refund Completed',
    description: 'When a refund completes',
    category: 'refunds',
    critical: false,
    defaultEnabled: true,
  },
  refund_failed: {
    label: 'Refund Failed',
    description: 'When a refund fails',
    category: 'refunds',
    critical: true,
    defaultEnabled: true,
  },

  // Security events (non-optional)
  security_alert: {
    label: 'Security Alert',
    description: 'Important security notifications (cannot be disabled)',
    category: 'security',
    critical: true,
    defaultEnabled: true,
  },
  account_verification: {
    label: 'Account Verification',
    description: 'Account verification codes (cannot be disabled)',
    category: 'security',
    critical: true,
    defaultEnabled: true,
  },

  // Legacy types (backward compatibility)
  transaction_successful: {
    label: 'Transaction Successful',
    description: 'When a transaction is successful',
    category: 'payments',
    critical: false,
    defaultEnabled: true,
  },
  transaction_failed: {
    label: 'Transaction Failed',
    description: 'When a transaction fails',
    category: 'payments',
    critical: false,
    defaultEnabled: true,
  },
  transaction_refunded: {
    label: 'Transaction Refunded',
    description: 'When a transaction is refunded',
    category: 'refunds',
    critical: false,
    defaultEnabled: true,
  },
  transaction_disputed: {
    label: 'Transaction Disputed',
    description: 'When a transaction is disputed',
    category: 'payments',
    critical: true,
    defaultEnabled: true,
  },
  balance_funds_available: {
    label: 'Funds Available',
    description: 'When funds become available',
    category: 'balance',
    critical: false,
    defaultEnabled: true,
  },
  balance_low: {
    label: 'Low Balance',
    description: 'When balance is low',
    category: 'balance',
    critical: false,
    defaultEnabled: false,
  },
  balance_threshold_reached: {
    label: 'Balance Threshold Reached',
    description: 'When balance threshold is reached',
    category: 'balance',
    critical: false,
    defaultEnabled: false,
  },
  account_payout_added: {
    label: 'Payout Account Added',
    description: 'When a payout account is added',
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
    description: 'When default account changes',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },
  kyc_approved: {
    label: 'KYC Approved',
    description: 'When verification is approved',
    category: 'account',
    critical: false,
    defaultEnabled: true,
  },
  kyc_rejected: {
    label: 'KYC Rejected',
    description: 'When verification is rejected',
    category: 'account',
    critical: true,
    defaultEnabled: true,
  },
};

// Category labels for UI grouping
export const NOTIFICATION_CATEGORY_INFO: Record<
  NotificationCategory,
  { label: string; description: string }
> = {
  payments: {
    label: 'Payments',
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
    description: 'Notifications about account changes',
  },
  refunds: {
    label: 'Refunds',
    description: 'Notifications about refund activities',
  },
  security: {
    label: 'Security',
    description: 'Important security notifications',
  },
};

// ============================================================================
// STATUS STYLES (UI)
// ============================================================================

export const NOTIFICATION_STATUS_STYLES: Record<
  NotificationLogStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  database: 'In-App',
};

export const PROVIDER_HEALTH_STYLES = {
  healthy: { bg: 'bg-green-100', text: 'text-green-800', label: 'Healthy' },
  degraded: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Degraded' },
  failing: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failing' },
};

// ============================================================================
// LEGACY TYPES (Backward Compatibility)
// ============================================================================

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
}

export type NotificationEvent = NotificationType;

export interface NotificationPreferences {
  preferences: NotificationPreference[];
}

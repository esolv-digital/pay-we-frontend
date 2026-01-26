'use client';

import { useMemo } from 'react';
import {
  useNotificationPreferences,
  useToggleNotificationPreference,
  useSendTestNotification,
} from '@/lib/hooks/use-notifications';
import type {
  NotificationType,
  NotificationCategory,
  NotificationPreference,
} from '@/types';
import {
  NOTIFICATION_TYPE_INFO,
  NOTIFICATION_CATEGORY_INFO,
} from '@/types/notification';
import { cn } from '@/lib/utils';

// Category order for display
const CATEGORY_ORDER: NotificationCategory[] = [
  'payments',
  'payouts',
  'balance',
  'account',
  'refunds',
  'security',
];

// Toggle switch component
function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
  label?: string;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        aria-label={label || 'Toggle notification'}
      />
      <div
        className={cn(
          'w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      ></div>
    </label>
  );
}

export function NotificationSettings() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const togglePreference = useToggleNotificationPreference();
  const sendTest = useSendTestNotification();

  const handleToggle = (
    notification_type: NotificationType,
    channel: 'email' | 'sms' | 'whatsapp' | 'push',
    currentValue: boolean
  ) => {
    togglePreference.mutate({
      notification_type,
      channel,
      enabled: !currentValue,
    });
  };

  // Group preferences by category
  const groupedPreferences = useMemo(() => {
    if (!preferences) return new Map<NotificationCategory, NotificationPreference[]>();

    const grouped = new Map<NotificationCategory, NotificationPreference[]>();

    // Initialize all categories
    CATEGORY_ORDER.forEach((cat) => grouped.set(cat, []));

    // Group preferences
    preferences.forEach((pref) => {
      const typeInfo = NOTIFICATION_TYPE_INFO[pref.notification_type];
      if (typeInfo) {
        const category = typeInfo.category;
        const existing = grouped.get(category) || [];
        existing.push(pref);
        grouped.set(category, existing);
      }
    });

    return grouped;
  }, [preferences]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-6 text-center text-gray-500">
        Unable to load notification preferences
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
      <p className="text-gray-600 mb-6">
        Choose how you want to receive notifications for different events.
      </p>

      {/* Test Notification Buttons */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">Test Notifications</h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => sendTest.mutate('email')}
            disabled={sendTest.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <span>@</span>
            <span>Test Email</span>
          </button>
          <button
            type="button"
            onClick={() => sendTest.mutate('sms')}
            disabled={sendTest.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <span>SMS</span>
          </button>
          <button
            type="button"
            onClick={() => sendTest.mutate('whatsapp')}
            disabled={sendTest.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <span className="text-green-600 font-medium">WA</span>
            <span>Test WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => sendTest.mutate('push')}
            disabled={sendTest.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <span>Test Push</span>
          </button>
        </div>
      </div>

      {/* Grouped Notification Settings */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const prefs = groupedPreferences.get(category) || [];
          if (prefs.length === 0) return null;

          const categoryInfo = NOTIFICATION_CATEGORY_INFO[category];

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-900">{categoryInfo.label}</h3>
                <p className="text-xs text-gray-500">{categoryInfo.description}</p>
              </div>

              {/* Preferences Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Event
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">
                        Email
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">
                        SMS
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">
                        WhatsApp
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">
                        Push
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prefs.map((pref) => {
                      const typeInfo = NOTIFICATION_TYPE_INFO[pref.notification_type];
                      const isCritical = typeInfo?.critical || !pref.is_optional;

                      return (
                        <tr key={pref.notification_type} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isCritical && (
                                <span
                                  className="text-red-500 text-xs flex-shrink-0"
                                  title="Critical notification (cannot be disabled)"
                                >
                                  *
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{pref.label}</p>
                                <p className="text-xs text-gray-500 truncate">{pref.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ToggleSwitch
                              checked={pref.email_enabled}
                              onChange={() =>
                                handleToggle(pref.notification_type, 'email', pref.email_enabled)
                              }
                              disabled={!pref.is_optional || togglePreference.isPending}
                              label={`${pref.label} email notification`}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ToggleSwitch
                              checked={pref.sms_enabled}
                              onChange={() =>
                                handleToggle(pref.notification_type, 'sms', pref.sms_enabled)
                              }
                              disabled={!pref.is_optional || togglePreference.isPending}
                              label={`${pref.label} SMS notification`}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ToggleSwitch
                              checked={pref.whatsapp_enabled}
                              onChange={() =>
                                handleToggle(pref.notification_type, 'whatsapp', pref.whatsapp_enabled)
                              }
                              disabled={!pref.is_optional || togglePreference.isPending}
                              label={`${pref.label} WhatsApp notification`}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ToggleSwitch
                              checked={pref.push_enabled}
                              onChange={() =>
                                handleToggle(pref.notification_type, 'push', pref.push_enabled)
                              }
                              disabled={!pref.is_optional || togglePreference.isPending}
                              label={`${pref.label} push notification`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Note:</span> Critical notifications (marked with{' '}
          <span className="text-red-500 font-bold">*</span>) cannot be disabled to ensure
          account security and important updates reach you.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { SecuritySettings } from '@/components/settings/security-settings';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { NotificationHistory } from '@/components/settings/notification-history';
import { DeviceManagement } from '@/components/settings/device-management';

type SettingsTab = 'profile' | 'security' | 'notifications';
type NotificationSubTab = 'preferences' | 'history';
type SecuritySubTab = 'settings' | 'devices';

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
];

export default function VendorSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [notificationSubTab, setNotificationSubTab] = useState<NotificationSubTab>('preferences');
  const [securitySubTab, setSecuritySubTab] = useState<SecuritySubTab>('settings');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'profile' && <ProfileSettings />}

        {activeTab === 'security' && (
          <div>
            {/* Security Sub-tabs */}
            <div className="border-b border-gray-200 px-6">
              <nav className="flex gap-6 -mb-px">
                <button
                  onClick={() => setSecuritySubTab('settings')}
                  className={cn(
                    'py-3 text-sm font-medium border-b-2 transition-colors',
                    securitySubTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  Security Settings
                </button>
                <button
                  onClick={() => setSecuritySubTab('devices')}
                  className={cn(
                    'py-3 text-sm font-medium border-b-2 transition-colors',
                    securitySubTab === 'devices'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  Devices
                </button>
              </nav>
            </div>
            {securitySubTab === 'settings' && <SecuritySettings />}
            {securitySubTab === 'devices' && <DeviceManagement />}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            {/* Notification Sub-tabs */}
            <div className="border-b border-gray-200 px-6">
              <nav className="flex gap-6 -mb-px">
                <button
                  onClick={() => setNotificationSubTab('preferences')}
                  className={cn(
                    'py-3 text-sm font-medium border-b-2 transition-colors',
                    notificationSubTab === 'preferences'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  Preferences
                </button>
                <button
                  onClick={() => setNotificationSubTab('history')}
                  className={cn(
                    'py-3 text-sm font-medium border-b-2 transition-colors',
                    notificationSubTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  History
                </button>
              </nav>
            </div>
            {notificationSubTab === 'preferences' && <NotificationSettings />}
            {notificationSubTab === 'history' && <NotificationHistory />}
          </div>
        )}
      </div>
    </div>
  );
}

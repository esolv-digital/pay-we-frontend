/**
 * Admin Settings Page
 *
 * Platform-wide settings management with:
 * - General settings
 * - Payment gateway configuration
 * - Email settings
 * - KYC/KYB settings
 * - Security settings
 * - API configuration
 */

'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import { Settings, CreditCard, Mail, CheckCircle, Lock, Plug, DollarSign } from 'lucide-react';

type SettingTab = 'general' | 'payment' | 'email' | 'kyc' | 'security' | 'api';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('general');

  const tabs: { id: SettingTab; label: string; icon: LucideIcon }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'kyc', label: 'KYC/KYB', icon: CheckCircle },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'api', label: 'API', icon: Plug },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.MANAGE_SETTINGS}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage platform-wide settings and configurations
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Platform Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="platform-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <Input id="platform-name" type="text" defaultValue="PayWe" />
                </div>
                <div>
                  <label htmlFor="support-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <Input id="support-email" type="email" defaultValue="support@paywe.com" />
                </div>
                <div>
                  <label htmlFor="support-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Support Phone
                  </label>
                  <Input id="support-phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Regional Settings</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="default-currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select id="default-currency" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="default-timezone" className="block text-sm font-medium text-gray-700 mb-2">
                    Default Timezone
                  </label>
                  <select id="default-timezone" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Africa/Lagos">Lagos (WAT)</option>
                  </select>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        )}

        {/* Payment Gateway Settings */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Gateway Configuration</h2>
              <p className="text-gray-600 mb-6">
                Configure payment gateways for processing transactions
              </p>

              <div className="space-y-6">
                {/* Stripe */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Stripe</h3>
                        <p className="text-sm text-gray-600">Global payment processing</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="stripe-publishable-key" className="block text-sm font-medium text-gray-700 mb-1">
                        Publishable Key
                      </label>
                      <Input id="stripe-publishable-key" type="text" placeholder="pk_live_..." />
                    </div>
                    <div>
                      <label htmlFor="stripe-secret-key" className="block text-sm font-medium text-gray-700 mb-1">
                        Secret Key
                      </label>
                      <Input id="stripe-secret-key" type="password" placeholder="sk_live_..." />
                    </div>
                  </div>
                </div>

                {/* Paystack */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Paystack</h3>
                        <p className="text-sm text-gray-600">African payment processing</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="paystack-public-key" className="block text-sm font-medium text-gray-700 mb-1">
                        Public Key
                      </label>
                      <Input id="paystack-public-key" type="text" placeholder="pk_live_..." />
                    </div>
                    <div>
                      <label htmlFor="paystack-secret-key" className="block text-sm font-medium text-gray-700 mb-1">
                        Secret Key
                      </label>
                      <Input id="paystack-secret-key" type="password" placeholder="sk_live_..." />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>Save Configuration</Button>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email-provider" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Provider
                  </label>
                  <select id="email-provider" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="from-email" className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <Input id="from-email" type="email" defaultValue="noreply@paywe.com" />
                </div>
                <div>
                  <label htmlFor="from-name" className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <Input id="from-name" type="text" defaultValue="PayWe" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Email Templates</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Welcome Email</p>
                    <p className="text-sm text-gray-600">Sent when a new user signs up</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">KYC Approval</p>
                    <p className="text-sm text-gray-600">Sent when KYC is approved</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Transaction Receipt</p>
                    <p className="text-sm text-gray-600">Sent after successful transaction</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </div>
        )}

        {/* KYC/KYB Settings */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">KYC Requirements</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require KYC for all vendors</p>
                    <p className="text-sm text-gray-600">All vendors must complete KYC</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked aria-label="Require KYC for all vendors" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-approve verified documents</p>
                    <p className="text-sm text-gray-600">Automatically approve verified IDs</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" aria-label="Auto-approve verified documents" />
                </div>
                <div>
                  <label htmlFor="doc-expiry-warning" className="block text-sm font-medium text-gray-700 mb-2">
                    Document Expiry Warning (days)
                  </label>
                  <Input id="doc-expiry-warning" type="number" defaultValue="30" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">KYB Requirements</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require business verification</p>
                    <p className="text-sm text-gray-600">Require KYB for business accounts</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked aria-label="Require business verification" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Documents
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Business Registration Certificate</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Tax Identification Number</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Articles of Incorporation</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Financial Statements</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Authentication Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require two-factor authentication</p>
                    <p className="text-sm text-gray-600">Force 2FA for all admin users</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" aria-label="Require two-factor authentication" />
                </div>
                <div>
                  <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
                <div>
                  <label htmlFor="password-min-length" className="block text-sm font-medium text-gray-700 mb-2">
                    Password Minimum Length
                  </label>
                  <Input id="password-min-length" type="number" defaultValue="8" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rate limiting enabled</p>
                    <p className="text-sm text-gray-600">Limit API requests per minute</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked aria-label="Rate limiting enabled" />
                </div>
                <div>
                  <label htmlFor="rate-limit" className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limit (requests per minute)
                  </label>
                  <Input id="rate-limit" type="number" defaultValue="100" />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </div>
        )}

        {/* API Settings */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="api-version" className="block text-sm font-medium text-gray-700 mb-2">
                    API Version
                  </label>
                  <select id="api-version" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value="v1">v1 (Current)</option>
                    <option value="v2">v2 (Beta)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <Input id="webhook-url" type="url" placeholder="https://your-domain.com/webhooks" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <p className="text-gray-600 mb-4">Manage API keys for system integrations</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium font-mono text-sm">pk_live_••••••••••••</p>
                    <p className="text-xs text-gray-600">Created 2024-01-15</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                </div>
              </div>
              <Button className="mt-4" variant="outline">
                Generate New API Key
              </Button>
            </Card>

            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useMessagingProviders,
  useMessagingProviderStatistics,
  useToggleMessagingProvider,
  useResetProviderFailures,
  useDeleteMessagingProvider,
} from '@/lib/hooks/use-admin-notifications';
import type {
  MessagingProviderChannel,
  MessagingProviderFilters,
} from '@/types';
import { PROVIDER_HEALTH_STYLES } from '@/types/notification';
import { CreateProviderDialog } from '@/components/admin/create-provider-dialog';

const CHANNEL_TABS: { id: MessagingProviderChannel | 'all'; label: string }[] = [
  { id: 'all', label: 'All Channels' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

function getHealthStatus(provider: { is_healthy: boolean; failure_count: number }) {
  if (!provider.is_healthy) return 'failing';
  if (provider.failure_count > 0) return 'degraded';
  return 'healthy';
}

export default function AdminMessagingProvidersPage() {
  const [activeChannel, setActiveChannel] = useState<MessagingProviderChannel | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filters: MessagingProviderFilters = {
    channel: activeChannel === 'all' ? undefined : activeChannel,
    per_page: 50,
  };

  const { data, isLoading, isError } = useMessagingProviders(filters);
  const { data: stats } = useMessagingProviderStatistics();
  const toggleProvider = useToggleMessagingProvider();
  const resetFailures = useResetProviderFailures();
  const deleteProvider = useDeleteMessagingProvider();

  const providers = data?.providers || [];

  const handleDelete = (providerId: string, providerName: string) => {
    if (confirm(`Are you sure you want to delete "${providerName}"? This action cannot be undone.`)) {
      deleteProvider.mutate(providerId);
    }
  };

  const statCards = [
    {
      label: 'Total Providers',
      value: stats?.total || 0,
      subtext: `${stats?.active || 0} active`,
      color: 'bg-blue-50',
    },
    {
      label: 'Healthy',
      value: stats?.health?.healthy || 0,
      subtext: 'Operating normally',
      color: 'bg-green-50',
    },
    {
      label: 'Degraded',
      value: stats?.health?.degraded || 0,
      subtext: 'Has failures but working',
      color: 'bg-yellow-50',
    },
    {
      label: 'Failing',
      value: stats?.health?.failing || 0,
      subtext: 'Requires attention',
      color: 'bg-red-50',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messaging Providers</h1>
          <p className="text-gray-600 mt-1">
            Manage email, SMS, and WhatsApp provider configurations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <span className="mr-2">+</span>
          Add Provider
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className={cn('p-6', stat.color)}>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Channel Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 -mb-px">
          {CHANNEL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChannel(tab.id)}
              className={cn(
                'py-3 text-sm font-medium border-b-2 transition-colors',
                activeChannel === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Providers List */}
      {isError ? (
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Providers</h2>
          <p className="text-gray-600">Failed to load messaging providers. Please try again.</p>
        </Card>
      ) : isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      ) : providers.length === 0 ? (
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Providers Found</h2>
          <p className="text-gray-600 mb-4">
            {activeChannel === 'all'
              ? 'No messaging providers have been configured yet.'
              : `No ${activeChannel} providers have been configured.`}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>Add Provider</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Health
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Failure
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => {
                  const healthStatus = getHealthStatus(provider);
                  const healthStyle = PROVIDER_HEALTH_STYLES[healthStatus];

                  return (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{provider.name}</p>
                          <p className="text-sm text-gray-500">Driver: {provider.driver}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {provider.channel}
                        </Badge>
                        {provider.is_primary && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800">Primary</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            provider.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {provider.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(healthStyle.bg, healthStyle.text)}>
                            {healthStyle.label}
                          </Badge>
                          {provider.failure_count > 0 && (
                            <span className="text-xs text-gray-500">
                              ({provider.failure_count} failures)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{provider.priority}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {provider.last_failure_at
                          ? formatDistanceToNow(new Date(provider.last_failure_at), {
                              addSuffix: true,
                            })
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleProvider.mutate(provider.id)}
                            disabled={toggleProvider.isPending}
                            className={cn(
                              'text-sm',
                              provider.is_active
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            )}
                          >
                            {provider.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          {provider.failure_count > 0 && (
                            <button
                              onClick={() => resetFailures.mutate(provider.id)}
                              disabled={resetFailures.isPending}
                              className="text-sm text-blue-600 hover:text-blue-900"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(provider.id, provider.name)}
                            disabled={deleteProvider.isPending}
                            className="text-sm text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Provider Dialog */}
      {showCreateDialog && (
        <CreateProviderDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
}

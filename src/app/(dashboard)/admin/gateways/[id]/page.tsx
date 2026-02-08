/**
 * Admin Gateway Detail Page
 *
 * Aligned with backend Postman B2 contract.
 */

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { formatDate } from '@/lib/utils/format';
import { useAdminGateway, useToggleGateway } from '@/lib/hooks/use-admin-gateways';

export default function GatewayDetailPage() {
  const params = useParams();
  const gatewayId = params?.id as string;

  const { data: response, isLoading, error } = useAdminGateway(gatewayId);
  const { mutate: toggleGateway } = useToggleGateway();
  const gateway = response?.data;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <Card className="p-6"><div className="space-y-4"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div></Card>
        </div>
      </div>
    );
  }

  if (error || !gateway) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-semibold mb-2">Gateway Not Found</h2>
          <p className="text-gray-600 mb-4">The requested gateway could not be found.</p>
          <Link href={ADMIN_ROUTES.GATEWAYS}><Button>Back to Gateways</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_GATEWAYS}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.GATEWAYS} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">
            ← Back to Gateways
          </Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">{gateway.gateway}</h1>
              <p className="text-gray-600 mt-1">Region: {gateway.region} | {gateway.is_test_mode ? 'Test Mode' : 'Live Mode'}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={gateway.is_test_mode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                {gateway.is_test_mode ? 'Test' : 'Live'}
              </Badge>
              <Badge className={gateway.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {gateway.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Gateway Configuration */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gateway Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Gateway</dt><dd className="font-medium text-gray-900 capitalize">{gateway.gateway}</dd></div>
              <div><dt className="text-sm text-gray-500">Region</dt><dd className="font-medium text-gray-900 capitalize">{gateway.region.replace('_', ' ')}</dd></div>
              <div><dt className="text-sm text-gray-500">Mode</dt><dd><Badge variant={gateway.is_test_mode ? 'outline' : 'default'}>{gateway.is_test_mode ? 'Test' : 'Live'}</Badge></dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Public Key</dt><dd className="font-medium text-gray-900 font-mono text-xs truncate">{gateway.public_key ? `${gateway.public_key.substring(0, 20)}...` : 'N/A'}</dd></div>
              <div><dt className="text-sm text-gray-500">Webhook Secret</dt><dd className="font-medium text-gray-900 font-mono text-xs">{gateway.webhook_secret ? '••••••••' : 'Not set'}</dd></div>
              <div><dt className="text-sm text-gray-500">Vendor</dt><dd className="font-medium text-gray-900">{gateway.vendor_id || 'Platform-level'}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Merchant ID</dt><dd className="font-medium text-gray-900">{gateway.merchant_id || 'N/A'}</dd></div>
              <div><dt className="text-sm text-gray-500">Encryption Key</dt><dd className="font-medium text-gray-900">{gateway.encryption_key ? '••••••••' : 'Not set'}</dd></div>
              <div><dt className="text-sm text-gray-500">Created</dt><dd className="font-medium text-gray-900">{formatDate(gateway.created_at)}</dd></div>
            </dl>
          </div>
        </Card>

        {/* Supported Currencies & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Supported Currencies</h2>
            <div className="flex flex-wrap gap-2">
              {gateway.supported_currencies.map((c) => (
                <Badge key={c} variant="outline">{c}</Badge>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Supported Payment Methods</h2>
            <div className="flex flex-wrap gap-2">
              {gateway.supported_payment_methods.map((m) => (
                <Badge key={m} variant="outline" className="capitalize">{m.replace('_', ' ')}</Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Metadata */}
        {gateway.metadata && Object.keys(gateway.metadata).length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 overflow-auto">
              {JSON.stringify(gateway.metadata, null, 2)}
            </pre>
          </Card>
        )}

        {/* Actions */}
        <Can permission={PERMISSIONS.ADMIN_MANAGE_GATEWAYS}>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex gap-3">
              <Button
                variant={gateway.is_active ? 'destructive' : 'default'}
                onClick={() => toggleGateway(gatewayId)}
              >
                {gateway.is_active ? 'Disable Gateway' : 'Enable Gateway'}
              </Button>
            </div>
          </Card>
        </Can>
      </div>
    </PermissionGuard>
  );
}

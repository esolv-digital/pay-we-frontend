/**
 * Admin Country Detail Page
 *
 * Displays country configuration including:
 * - Country information
 * - Payment methods
 * - Assigned gateways
 */

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { useAdminCountry } from '@/lib/hooks/use-admin-countries';

export default function CountryDetailPage() {
  const params = useParams();
  const countryId = params?.id as string;

  const { data: response, isLoading, error } = useAdminCountry(countryId);
  const country = response?.data;

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

  if (error || !country) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-semibold mb-2">Country Not Found</h2>
          <p className="text-gray-600 mb-4">The requested country could not be found.</p>
          <Link href={ADMIN_ROUTES.COUNTRIES}><Button>Back to Countries</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.COUNTRIES} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">
            ← Back to Countries
          </Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{country.name}</h1>
              <p className="text-gray-600 mt-1">Code: {country.code}</p>
            </div>
            <Badge className={country.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {country.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Country Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Country Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Name</dt><dd className="font-medium text-gray-900">{country.name}</dd></div>
              <div><dt className="text-sm text-gray-500">Code</dt><dd className="font-medium text-gray-900">{country.code}</dd></div>
              <div><dt className="text-sm text-gray-500">Region</dt><dd className="font-medium text-gray-900">{country.region}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Currency</dt><dd className="font-medium text-gray-900">{country.currency_symbol} ({country.currency_code})</dd></div>
              <div><dt className="text-sm text-gray-500">Phone Code</dt><dd className="font-medium text-gray-900">{country.phone_code}</dd></div>
              <div>
                <dt className="text-sm text-gray-500">Capabilities</dt>
                <dd className="flex gap-2 mt-1">
                  <Badge variant={country.can_send ? 'default' : 'outline'}>{country.can_send ? 'Can Send' : 'Cannot Send'}</Badge>
                  <Badge variant={country.can_receive ? 'default' : 'outline'}>{country.can_receive ? 'Can Receive' : 'Cannot Receive'}</Badge>
                </dd>
              </div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Platform Fee</dt><dd className="font-medium text-gray-900">{country.platform_fee_percentage}%</dd></div>
              <div><dt className="text-sm text-gray-500">Min Transaction</dt><dd className="font-medium text-gray-900">{country.currency_symbol}{country.min_transaction_amount}</dd></div>
              <div><dt className="text-sm text-gray-500">Max Transaction</dt><dd className="font-medium text-gray-900">{country.currency_symbol}{country.max_transaction_amount}</dd></div>
            </dl>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
            {country.payment_methods && country.payment_methods.length > 0 ? (
              <div className="space-y-3">
                {country.payment_methods.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{pm.payment_method.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">Fee: {pm.additional_fee_percentage}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={pm.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {pm.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {pm.is_default && <Badge variant="outline">Default</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No payment methods configured</p>
            )}
          </Card>

          {/* Gateways */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assigned Gateways</h2>
            {country.gateways && country.gateways.length > 0 ? (
              <div className="space-y-3">
                {country.gateways.map((gw) => (
                  <div key={gw.gateway} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{gw.gateway}</p>
                      <p className="text-sm text-gray-500">Priority: {gw.priority}</p>
                    </div>
                    <Badge className={gw.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {gw.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No gateways assigned</p>
            )}
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}

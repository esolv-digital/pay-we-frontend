/**
 * Admin Vendor Detail Page
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
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { useAdminVendor, useSuspendVendor, useActivateVendor } from '@/lib/hooks/use-admin-vendors';
import type { AdminVendorStatus } from '@/lib/api/admin-vendors';

const STATUS_COLORS: Record<AdminVendorStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params?.id as string;

  const { data: vendor, isLoading, error } = useAdminVendor(vendorId);
  const { mutate: suspendVendor } = useSuspendVendor();
  const { mutate: activateVendor } = useActivateVendor();

  const handleSuspend = () => {
    const reason = prompt('Reason for suspension:');
    if (reason) suspendVendor({ id: vendorId, reason });
  };

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

  if (error || !vendor) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-semibold mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-4">The requested vendor could not be found.</p>
          <Link href={ADMIN_ROUTES.VENDORS}><Button>Back to Vendors</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_VENDORS}>
      <div className="p-8">
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.VENDORS} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">
            ← Back to Vendors
          </Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vendor.business_name}</h1>
              <p className="text-gray-600 mt-1">{vendor.business_email} | {vendor.business_phone}</p>
            </div>
            <Badge className={STATUS_COLORS[vendor.status]}>{vendor.status}</Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6 bg-blue-50">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(vendor.total_revenue, vendor.currency_code)}</p>
          </Card>
          <Card className="p-6 bg-green-50">
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(vendor.balance, vendor.currency_code)}</p>
          </Card>
          <Card className="p-6 bg-purple-50">
            <p className="text-sm text-gray-600">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{vendor.total_transactions.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-indigo-50">
            <p className="text-sm text-gray-600">Fee Rate</p>
            <p className="text-2xl font-bold text-gray-900">{vendor.fee_percentage}%</p>
          </Card>
        </div>

        {/* Vendor Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Business Name</dt><dd className="font-medium text-gray-900">{vendor.business_name}</dd></div>
              <div><dt className="text-sm text-gray-500">Slug</dt><dd className="font-medium text-gray-900">{vendor.slug}</dd></div>
              <div><dt className="text-sm text-gray-500">Organization</dt><dd className="font-medium text-gray-900">{vendor.organization.name}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Country</dt><dd className="font-medium text-gray-900">{vendor.country}</dd></div>
              <div><dt className="text-sm text-gray-500">Currency</dt><dd className="font-medium text-gray-900">{vendor.currency_code}</dd></div>
              <div><dt className="text-sm text-gray-500">Payout Method</dt><dd className="font-medium text-gray-900 capitalize">{vendor.payout_method.replace('_', ' ')}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Owner</dt><dd className="font-medium text-gray-900">{vendor.owner.name}</dd></div>
              <div><dt className="text-sm text-gray-500">Owner Email</dt><dd className="font-medium text-gray-900">{vendor.owner.email}</dd></div>
              <div><dt className="text-sm text-gray-500">Auto Payout</dt><dd><Badge variant={vendor.auto_payout_enabled ? 'default' : 'outline'}>{vendor.auto_payout_enabled ? 'Enabled' : 'Disabled'}</Badge></dd></div>
            </dl>
          </div>
        </Card>

        {/* Actions */}
        <Can permission={PERMISSIONS.ADMIN_MANAGE_VENDORS}>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex gap-3">
              {vendor.status === 'active' && (
                <Button variant="destructive" onClick={handleSuspend}>Suspend Vendor</Button>
              )}
              {vendor.status === 'suspended' && (
                <Button onClick={() => activateVendor(vendorId)}>Activate Vendor</Button>
              )}
            </div>
          </Card>
        </Can>
      </div>
    </PermissionGuard>
  );
}

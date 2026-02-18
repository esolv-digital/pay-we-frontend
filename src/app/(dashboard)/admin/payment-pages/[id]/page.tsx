/**
 * Admin Payment Page Detail
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
import { useAdminPaymentPage, useSuspendPaymentPage, useActivatePaymentPage } from '@/lib/hooks/use-admin-payment-pages';
import type { AdminPaymentPageStatus } from '@/lib/api/admin-payment-pages';
import { AlertTriangle } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

const STATUS_COLORS: Record<AdminPaymentPageStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

export default function PaymentPageDetailPage() {
  const params = useParams();
  const pageId = params?.id as string;

  const { data: page, isLoading, error } = useAdminPaymentPage(pageId);
  const { mutate: suspendPage } = useSuspendPaymentPage();
  const { mutate: activatePage } = useActivatePaymentPage();

  const handleSuspend = () => {
    const reason = prompt('Reason for suspension:');
    if (reason) suspendPage({ id: pageId, reason });
  };

  if (isLoading) {
    return (
      <div className="p-8"><div className="animate-pulse space-y-6"><div className="h-8 bg-gray-200 rounded w-1/4" /><Card className="p-6"><div className="space-y-4"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div></Card></div></div>
    );
  }

  if (error || !page) {
    return (
      <div className="p-8"><Card className="p-12 text-center"><IconBadge icon={AlertTriangle} variant="empty-state" color="red" /><h2 className="text-2xl font-semibold mb-2">Payment Page Not Found</h2><p className="text-gray-600 mb-4">The requested payment page could not be found.</p><Link href={ADMIN_ROUTES.PAYMENT_PAGES}><Button>Back to Payment Pages</Button></Link></Card></div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_PAYMENT_PAGES}>
      <div className="p-8">
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.PAYMENT_PAGES} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">← Back to Payment Pages</Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
              <p className="text-gray-600 mt-1">{page.description}</p>
            </div>
            <Badge className={STATUS_COLORS[page.status]}>{page.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6 bg-blue-50">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {page.amount_type === 'fixed' && page.amount ? formatCurrency(page.amount, page.currency_code) : 'Flexible'}
            </p>
          </Card>
          <Card className="p-6 bg-green-50">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(page.total_revenue, page.currency_code)}</p>
          </Card>
          <Card className="p-6 bg-purple-50">
            <p className="text-sm text-gray-600">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{page.total_transactions.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-indigo-50">
            <p className="text-sm text-gray-600">Platform Fee</p>
            <p className="text-2xl font-bold text-gray-900">{page.platform_fee_percentage}%</p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Page Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Slug</dt><dd className="font-medium text-gray-900">{page.slug}</dd></div>
              <div><dt className="text-sm text-gray-500">Amount Type</dt><dd className="font-medium text-gray-900 capitalize">{page.amount_type}</dd></div>
              <div><dt className="text-sm text-gray-500">Currency</dt><dd className="font-medium text-gray-900">{page.currency_code}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Vendor</dt><dd className="font-medium text-gray-900">{page.vendor.business_name}</dd></div>
              <div><dt className="text-sm text-gray-500">Organization</dt><dd className="font-medium text-gray-900">{page.organization.name}</dd></div>
              <div><dt className="text-sm text-gray-500">Created</dt><dd className="font-medium text-gray-900">{formatDate(page.created_at)}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Gateway Fee</dt><dd className="font-medium text-gray-900">{page.gateway_fee_percentage}%</dd></div>
              <div><dt className="text-sm text-gray-500">Flat Fee</dt><dd className="font-medium text-gray-900">${page.flat_fee_amount}</dd></div>
              <div><dt className="text-sm text-gray-500">URL</dt><dd className="font-medium text-blue-600 truncate">{page.url}</dd></div>
            </dl>
          </div>
        </Card>

        <Can permission={PERMISSIONS.ADMIN_MANAGE_PAYMENT_PAGES}>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex gap-3">
              {page.status === 'active' && <Button variant="destructive" onClick={handleSuspend}>Suspend Page</Button>}
              {page.status === 'suspended' && <Button onClick={() => activatePage(pageId)}>Activate Page</Button>}
            </div>
          </Card>
        </Can>
      </div>
    </PermissionGuard>
  );
}

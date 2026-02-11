/**
 * Admin Disbursement Detail Page
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
import { useAdminDisbursement, useApproveDisbursement, useRejectDisbursement } from '@/lib/hooks/use-admin-disbursements';
import type { AdminDisbursementStatus } from '@/lib/api/admin-disbursements';

const STATUS_COLORS: Record<AdminDisbursementStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function DisbursementDetailPage() {
  const params = useParams();
  const disbursementId = params?.id as string;

  const { data: disbursement, isLoading, error } = useAdminDisbursement(disbursementId);
  const { mutate: approveDisbursement } = useApproveDisbursement();
  const { mutate: rejectDisbursement } = useRejectDisbursement();

  const handleReject = () => {
    const reason = prompt('Reason for rejection:');
    if (reason) rejectDisbursement({ id: disbursementId, reason });
  };

  if (isLoading) {
    return (
      <div className="p-8"><div className="animate-pulse space-y-6"><div className="h-8 bg-gray-200 rounded w-1/4" /><Card className="p-6"><div className="space-y-4"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div></Card></div></div>
    );
  }

  if (error || !disbursement) {
    return (
      <div className="p-8"><Card className="p-12 text-center"><span className="text-6xl mb-4 block">⚠️</span><h2 className="text-2xl font-semibold mb-2">Disbursement Not Found</h2><p className="text-gray-600 mb-4">The requested disbursement could not be found.</p><Link href={ADMIN_ROUTES.DISBURSEMENTS}><Button>Back to Disbursements</Button></Link></Card></div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_DISBURSEMENTS}>
      <div className="p-8">
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.DISBURSEMENTS} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">← Back to Disbursements</Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Disbursement {disbursement.batch_reference}</h1>
              <p className="text-gray-600 mt-1">Vendor: {disbursement.vendor.business_name} | {disbursement.transaction_count} transactions</p>
            </div>
            <Badge className={STATUS_COLORS[disbursement.status]}>{disbursement.status}</Badge>
          </div>
        </div>

        {/* Amount Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-blue-50">
            <p className="text-sm text-gray-600">Gross Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(disbursement.gross_amount, disbursement.currency_code)}</p>
          </Card>
          <Card className="p-6 bg-red-50">
            <p className="text-sm text-gray-600">Fees</p>
            <p className="text-2xl font-bold text-red-600">-{formatCurrency(disbursement.fees, disbursement.currency_code)}</p>
          </Card>
          <Card className="p-6 bg-green-50">
            <p className="text-sm text-gray-600">Net Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(disbursement.net_amount, disbursement.currency_code)}</p>
          </Card>
        </div>

        {/* Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Disbursement Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Batch Reference</dt><dd className="font-medium text-gray-900">{disbursement.batch_reference}</dd></div>
              <div><dt className="text-sm text-gray-500">Payout Method</dt><dd className="font-medium text-gray-900 capitalize">{disbursement.payout_method.replace('_', ' ')}</dd></div>
              <div><dt className="text-sm text-gray-500">Transaction Count</dt><dd className="font-medium text-gray-900">{disbursement.transaction_count}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Vendor</dt><dd className="font-medium text-gray-900">{disbursement.vendor.business_name}</dd></div>
              <div><dt className="text-sm text-gray-500">Organization</dt><dd className="font-medium text-gray-900">{disbursement.organization.name}</dd></div>
              <div><dt className="text-sm text-gray-500">Currency</dt><dd className="font-medium text-gray-900">{disbursement.currency_code}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Initiated</dt><dd className="font-medium text-gray-900">{formatDate(disbursement.initiated_at)}</dd></div>
              <div><dt className="text-sm text-gray-500">Completed</dt><dd className="font-medium text-gray-900">{disbursement.completed_at ? formatDate(disbursement.completed_at) : 'N/A'}</dd></div>
              {disbursement.failed_reason && (
                <div><dt className="text-sm text-gray-500">Failure Reason</dt><dd className="font-medium text-red-600">{disbursement.failed_reason}</dd></div>
              )}
            </dl>
          </div>
        </Card>

        {/* Payout Account */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payout Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><dt className="text-sm text-gray-500">Account Name</dt><dd className="font-medium text-gray-900">{disbursement.payout_account.account_name}</dd></div>
            <div><dt className="text-sm text-gray-500">Account Number</dt><dd className="font-medium text-gray-900">{disbursement.payout_account.account_number}</dd></div>
            {disbursement.payout_account.bank_name && (
              <div><dt className="text-sm text-gray-500">Bank</dt><dd className="font-medium text-gray-900">{disbursement.payout_account.bank_name}</dd></div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {disbursement.status === 'pending' && (
          <Can permission={PERMISSIONS.ADMIN_MANAGE_DISBURSEMENTS}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="flex gap-3">
                <Button onClick={() => approveDisbursement(disbursementId)}>Approve Disbursement</Button>
                <Button variant="destructive" onClick={handleReject}>Reject Disbursement</Button>
              </div>
            </Card>
          </Can>
        )}
      </div>
    </PermissionGuard>
  );
}

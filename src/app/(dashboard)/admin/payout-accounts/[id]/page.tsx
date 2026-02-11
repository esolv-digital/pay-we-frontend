/**
 * Admin Payout Account Detail Page
 *
 * Aligned with backend Postman B7 contract.
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
import { useAdminPayoutAccount, useVerifyPayoutAccount, useFlagPayoutAccount } from '@/lib/hooks/use-admin-payout-accounts';

export default function PayoutAccountDetailPage() {
  const params = useParams();
  const accountId = params?.id as string;

  const { data: account, isLoading, error } = useAdminPayoutAccount(accountId);
  const { mutate: verifyAccount } = useVerifyPayoutAccount();
  const { mutate: flagAccount } = useFlagPayoutAccount();

  const handleFlag = () => {
    const reason = prompt('Reason for flagging:');
    if (reason) flagAccount({ id: accountId, reason });
  };

  if (isLoading) {
    return (
      <div className="p-8"><div className="animate-pulse space-y-6"><div className="h-8 bg-gray-200 rounded w-1/4" /><Card className="p-6"><div className="space-y-4"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div></Card></div></div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-8"><Card className="p-12 text-center"><span className="text-6xl mb-4 block">⚠️</span><h2 className="text-2xl font-semibold mb-2">Payout Account Not Found</h2><p className="text-gray-600 mb-4">The requested payout account could not be found.</p><Link href={ADMIN_ROUTES.PAYOUT_ACCOUNTS}><Button>Back to Payout Accounts</Button></Link></Card></div>
    );
  }

  const isVerified = account.status === 'active';

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW_PAYOUT_ACCOUNTS}>
      <div className="p-8">
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.PAYOUT_ACCOUNTS} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">← Back to Payout Accounts</Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{account.account_name}</h1>
              <p className="text-gray-600 mt-1">
                {account.account_type === 'bank'
                  ? `${account.bank_name || 'Bank'} - ${account.account_number}`
                  : `${account.mobile_money_network || 'Mobile Money'} - ${account.mobile_money_phone}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {account.status === 'active' ? 'Active' : account.status === 'pending_verification' ? 'Pending Verification' : 'Inactive'}
              </Badge>
              {account.is_flagged && <Badge className="bg-red-100 text-red-800">Flagged</Badge>}
              {account.is_primary && <Badge variant="outline">Primary</Badge>}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Account Name</dt><dd className="font-medium text-gray-900">{account.account_name}</dd></div>
              <div><dt className="text-sm text-gray-500">Account Number</dt><dd className="font-medium text-gray-900">{account.account_number}</dd></div>
              <div><dt className="text-sm text-gray-500">Type</dt><dd className="font-medium text-gray-900 capitalize">{account.account_type.replace('_', ' ')}</dd></div>
            </dl>
            <dl className="space-y-3">
              {account.account_type === 'bank' ? (
                <>
                  <div><dt className="text-sm text-gray-500">Bank Name</dt><dd className="font-medium text-gray-900">{account.bank_name || 'N/A'}</dd></div>
                  <div><dt className="text-sm text-gray-500">Bank Code</dt><dd className="font-medium text-gray-900">{account.bank_code || 'N/A'}</dd></div>
                  <div><dt className="text-sm text-gray-500">Branch Code</dt><dd className="font-medium text-gray-900">{account.branch_code || 'N/A'}</dd></div>
                </>
              ) : (
                <>
                  <div><dt className="text-sm text-gray-500">Mobile Network</dt><dd className="font-medium text-gray-900">{account.mobile_money_network || 'N/A'}</dd></div>
                  <div><dt className="text-sm text-gray-500">Phone Number</dt><dd className="font-medium text-gray-900">{account.mobile_money_phone || 'N/A'}</dd></div>
                </>
              )}
              <div><dt className="text-sm text-gray-500">Country</dt><dd className="font-medium text-gray-900">{account.country_code}</dd></div>
            </dl>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Currency</dt><dd className="font-medium text-gray-900">{account.currency_code}</dd></div>
              <div><dt className="text-sm text-gray-500">Vendor</dt><dd className="font-medium text-gray-900">{account.vendor?.business_name ?? '—'}</dd></div>
              <div><dt className="text-sm text-gray-500">Organization</dt><dd className="font-medium text-gray-900">{account.organization?.name ?? '—'}</dd></div>
            </dl>
          </div>
        </Card>

        {/* Flag Info */}
        {account.is_flagged && account.flag_reason && (
          <Card className="p-6 mb-6 border-red-200 bg-red-50">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Flagged Account</h2>
            <p className="text-red-700">{account.flag_reason}</p>
          </Card>
        )}

        {/* Meta */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><dt className="text-sm text-gray-500">Created</dt><dd className="font-medium text-gray-900">{formatDate(account.created_at)}</dd></div>
            <div><dt className="text-sm text-gray-500">Last Updated</dt><dd className="font-medium text-gray-900">{formatDate(account.updated_at)}</dd></div>
          </div>
        </Card>

        {/* Actions */}
        <Can permission={PERMISSIONS.ADMIN_MANAGE_PAYOUT_ACCOUNTS}>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex gap-3">
              {account.status === 'pending_verification' && <Button onClick={() => verifyAccount(accountId)}>Verify Account</Button>}
              {!account.is_flagged && <Button variant="destructive" onClick={handleFlag}>Flag Account</Button>}
            </div>
          </Card>
        </Can>
      </div>
    </PermissionGuard>
  );
}

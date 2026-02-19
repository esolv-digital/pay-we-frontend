'use client';

import { use } from 'react';
import { useTransaction } from '@/lib/hooks/use-transactions';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { TRANSACTION_STATUS_COLORS } from '@/lib/config/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminTransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: transaction, isLoading } = useTransaction(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">Transaction not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/admin/transactions"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Transactions
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
          <p className="text-gray-500 mt-1">{transaction.reference}</p>
        </div>
        <span
          className={cn(
            'px-3 py-1 text-sm font-medium rounded-full',
            TRANSACTION_STATUS_COLORS[transaction.status]
          )}
        >
          {transaction.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Transaction Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Amount</dt>
              <dd className="text-lg font-semibold">
                {formatCurrency(transaction.amount, transaction.currency_code)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Gateway Fee</dt>
              <dd className="font-medium">
                {formatCurrency(transaction.gateway_fee, transaction.currency_code)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Platform Fee</dt>
              <dd className="font-medium">
                {formatCurrency(transaction.platform_fee, transaction.currency_code)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Net Amount</dt>
              <dd className="text-lg font-semibold text-green-600">
                {formatCurrency(transaction.net_amount, transaction.currency_code)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Payment Gateway</dt>
              <dd className="capitalize">{transaction.gateway}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Payment Method</dt>
              <dd className="capitalize">{transaction.payment_method.replace('_', ' ')}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="font-medium">{transaction.customer_name || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="font-medium">{transaction.customer_email || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="font-medium">{transaction.customer_phone || 'N/A'}</dd>
            </div>
          </dl>

          <h3 className="text-lg font-semibold mt-6 mb-4">Timeline</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Initiated</dt>
              <dd className="text-sm">{formatDateTime(transaction.initiated_at)}</dd>
            </div>
            {transaction.completed_at && (
              <div>
                <dt className="text-sm text-gray-500">Completed</dt>
                <dd className="text-sm">{formatDateTime(transaction.completed_at)}</dd>
              </div>
            )}
            {transaction.failed_at && (
              <div>
                <dt className="text-sm text-gray-500">Failed</dt>
                <dd className="text-sm">{formatDateTime(transaction.failed_at)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

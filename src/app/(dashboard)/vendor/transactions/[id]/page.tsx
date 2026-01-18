'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@/lib/api/vendor';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
  failed: { bg: 'bg-red-100', text: 'text-red-800' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' },
  refunded: { bg: 'bg-purple-100', text: 'text-purple-800' },
};

export default function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => vendorApi.getTransaction(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl block mb-2">❌</span>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Transaction Not Found</h2>
          <p className="text-red-600 mb-4">
            The transaction you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            href="/vendor/transactions"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[transaction.status] || STATUS_STYLES.pending;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/vendor/transactions"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Transactions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
        </div>
        <span className={cn(
          'px-4 py-2 text-sm font-medium rounded-full capitalize',
          statusStyle.bg,
          statusStyle.text
        )}>
          {transaction.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-1">Transaction Amount</p>
              <p className="text-4xl font-bold text-gray-900">
                {formatCurrency(transaction.amount, transaction.currency_code)}
              </p>
              {transaction.total_fees > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Fee: {formatCurrency(transaction.total_fees, transaction.currency_code)} •
                  Net: {formatCurrency(transaction.net_amount, transaction.currency_code)}
                </p>
              )}
            </div>
          </div>

          {/* Transaction Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Transaction Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-mono">{transaction.reference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="capitalize">{transaction.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="capitalize">{transaction.payment_method?.replace('_', ' ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gateway</p>
                <p className="capitalize">{transaction.gateway || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p>{new Date(transaction.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Settlement Status</p>
                <p className={transaction.settled ? 'text-green-600' : 'text-yellow-600'}>
                  {transaction.settled ? 'Settled' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{transaction.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{transaction.customer_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{transaction.customer_phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Payment Page Info */}
          {transaction.payment_page && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Page</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{transaction.payment_page.title}</p>
                  <p className="text-sm text-gray-500">{transaction.payment_page.slug}</p>
                </div>
                <Link
                  href={`/vendor/payment-pages/${transaction.payment_page.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Page →
                </Link>
              </div>
            </div>
          )}

          {/* Metadata */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(transaction.reference);
                  alert('Reference copied to clipboard');
                }}
                className="w-full px-4 py-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                📋 Copy Reference
              </button>
              {transaction.status === 'completed' && (
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => alert('Refund functionality coming soon')}
                >
                  ↩️ Initiate Refund
                </button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium text-sm">Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {transaction.updated_at && transaction.updated_at !== transaction.created_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium text-sm">Updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {transaction.settled_at && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-sm">Settled</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.settled_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gateway Response */}
          {transaction.external_reference && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Gateway Details</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">External Reference</p>
                  <p className="font-mono text-xs">{transaction.external_reference}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

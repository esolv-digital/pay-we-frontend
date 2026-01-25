'use client';

import { useState } from 'react';
import { usePayouts } from '@/lib/hooks/use-payouts';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { PayoutStatus } from '@/types';

const STATUS_STYLES: Record<PayoutStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
};

export function PayoutHistoryTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | ''>('');

  const { data, isLoading } = usePayouts({
    page,
    per_page: 10,
    status: statusFilter || undefined,
  });

  const payouts = data?.data || [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-100 rounded w-48"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as PayoutStatus | '');
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      {payouts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-2">📭</span>
          <p>No payouts found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Account</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payouts.map((payout) => {
                  const statusStyle = STATUS_STYLES[payout.status];
                  const accountName = payout.payout_details?.bank_name ||
                    payout.payout_details?.network_name ||
                    payout.payout_account?.account_name ||
                    'Unknown';
                  const accountNumber = payout.payout_details?.account_number ||
                    payout.payout_details?.phone_number ||
                    payout.payout_account?.account_number ||
                    '';

                  return (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm">{payout.batch_reference}</p>
                        {payout.description && (
                          <p className="text-xs text-gray-500">{payout.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{accountName}</p>
                        <p className="text-xs text-gray-500">{accountNumber}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{formatCurrency(payout.gross_amount, payout.currency_code)}</p>
                        {payout.fees_amount > 0 && (
                          <p className="text-xs text-gray-500">
                            Net: {formatCurrency(payout.net_amount, payout.currency_code)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          statusStyle.bg,
                          statusStyle.text
                        )}>
                          {payout.status_label || statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            payout.is_automatic
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {payout.is_automatic ? 'Auto' : 'Manual'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <p>{new Date(payout.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(payout.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {meta.from || 1} to {meta.to || meta.per_page} of {meta.total} payouts
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  usePayoutAccounts,
  usePayouts,
  useDisbursementStatistics,
  useToggleAutoPayout,
} from '@/lib/hooks/use-payouts';
import { formatCurrency } from '@/lib/utils/format';
import { PayoutAccountsList } from '@/components/disbursements/payout-accounts-list';
import { AddPayoutAccountDialog } from '@/components/disbursements/add-payout-account-dialog';
import { RequestPayoutDialog } from '@/components/disbursements/request-payout-dialog';
import { PayoutHistoryTable } from '@/components/disbursements/payout-history-table';
import { cn } from '@/lib/utils';

type TabType = 'overview' | 'accounts' | 'history';

export default function VendorDisbursementsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showRequestPayout, setShowRequestPayout] = useState(false);

  const { data: stats, isLoading: statsLoading } = useDisbursementStatistics();
  const { data: accounts, isLoading: accountsLoading } = usePayoutAccounts();
  const { data: payoutsData, isLoading: payoutsLoading } = usePayouts({ per_page: 5 });
  const toggleAutoPayout = useToggleAutoPayout();

  const hasAccounts = accounts && accounts.length > 0;
  const recentPayouts = payoutsData?.data || [];
  const currency = stats?.currency || 'GHS';

  const handleAutoPayoutToggle = () => {
    if (!stats) return;

    // If trying to enable but no default account, show warning
    if (!stats.auto_payout_enabled && !stats.has_default_payout_account) {
      setShowAddAccount(true);
      return;
    }

    toggleAutoPayout.mutate(!stats.auto_payout_enabled);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'accounts' as TabType, label: 'Payout Accounts', icon: '🏦' },
    { id: 'history' as TabType, label: 'Payout History', icon: '📜' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disbursements</h1>
        <button
          type="button"
          onClick={() => setShowRequestPayout(true)}
          disabled={!hasAccounts || (stats?.withdrawable_balance || 0) <= 0}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Request Payout
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            {statsLoading ? '...' : formatCurrency(stats?.available_balance || 0, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total funds in wallet</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
          <p className="text-3xl font-bold text-yellow-600">
            {statsLoading ? '...' : formatCurrency(stats?.pending_payouts || 0, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Processing or awaiting transfer</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Withdrawable Balance</p>
          <p className="text-3xl font-bold text-green-600">
            {statsLoading ? '...' : formatCurrency(stats?.withdrawable_balance || 0, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Available for withdrawal</p>
        </div>
      </div>

      {/* Auto-Payout Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Auto-Payout</h3>
              <p className="text-sm text-gray-500">
                {stats?.auto_payout_enabled
                  ? 'Payments are automatically transferred to your default account'
                  : 'Enable to automatically transfer payments to your default account'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoPayoutToggle}
            disabled={toggleAutoPayout.isPending || statsLoading}
            aria-label={stats?.auto_payout_enabled ? 'Disable auto-payout' : 'Enable auto-payout'}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              stats?.auto_payout_enabled ? 'bg-blue-600' : 'bg-gray-200',
              (toggleAutoPayout.isPending || statsLoading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                stats?.auto_payout_enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Default Account Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Default Account</p>
              {stats?.default_payout_account ? (
                <p className="text-sm text-gray-600">
                  {stats.default_payout_account.display_name}
                </p>
              ) : (
                <p className="text-sm text-yellow-600">No default account set</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('accounts')}
              className="text-sm text-blue-600 hover:underline"
            >
              {stats?.default_payout_account ? 'Change' : 'Set Default'}
            </button>
          </div>

          {stats?.minimum_payout_amount && stats.minimum_payout_amount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Minimum payout: {formatCurrency(stats.minimum_payout_amount, currency)}
            </p>
          )}
        </div>
      </div>

      {/* Unsettled Transactions Card */}
      {stats && stats.unsettled_transaction_count > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-medium text-blue-800">Unsettled Transactions</p>
                <p className="text-sm text-blue-700">
                  {stats.unsettled_transaction_count} transactions worth{' '}
                  {formatCurrency(stats.unsettled_amount, currency)} pending settlement
                </p>
              </div>
            </div>
            {stats.auto_payout_enabled && stats.has_default_payout_account ? (
              <span className="text-sm text-blue-600">Auto-payout enabled</span>
            ) : (
              <button
                type="button"
                onClick={() => setShowRequestPayout(true)}
                disabled={(stats.withdrawable_balance || 0) <= 0}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Request Payout
              </button>
            )}
          </div>
        </div>
      )}

      {/* No Accounts Warning */}
      {!accountsLoading && !hasAccounts && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">No payout account added</p>
              <p className="text-sm text-yellow-700">
                Add a bank or mobile money account to receive your payouts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddAccount(true)}
            className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700"
          >
            Add Account
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Completed This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : formatCurrency(stats?.completed_this_month || 0, currency)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : formatCurrency(stats?.total_completed || 0, currency)}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(true)}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-left"
                  >
                    <span className="text-2xl block mb-2">➕</span>
                    <span className="font-medium">Add Payout Account</span>
                    <p className="text-sm text-gray-500 mt-1">
                      Add a bank or mobile money account
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRequestPayout(true)}
                    disabled={!hasAccounts || (stats?.withdrawable_balance || 0) <= 0}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl block mb-2">💸</span>
                    <span className="font-medium">Request Payout</span>
                    <p className="text-sm text-gray-500 mt-1">
                      Withdraw funds to your account
                    </p>
                  </button>
                </div>
              </div>

              {/* Recent Payouts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Recent Settlements</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all →
                  </button>
                </div>

                {payoutsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded"></div>
                    ))}
                  </div>
                ) : recentPayouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-2">📭</span>
                    <p>No payouts yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                          <th className="pb-3">Reference</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Fees</th>
                          <th className="pb-3">Net</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentPayouts.slice(0, 5).map((payout) => (
                          <tr key={payout.id}>
                            <td className="py-3">
                              <span className="text-sm font-medium text-gray-900">
                                {payout.batch_reference?.slice(0, 12) || payout.id.slice(0, 8)}...
                              </span>
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {formatCurrency(payout.gross_amount, payout.currency_code)}
                            </td>
                            <td className="py-3 text-sm text-gray-500">
                              {formatCurrency(payout.fees_amount, payout.currency_code)}
                            </td>
                            <td className="py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(payout.net_amount, payout.currency_code)}
                            </td>
                            <td className="py-3">
                              <span
                                className={cn(
                                  'px-2 py-1 text-xs font-medium rounded-full',
                                  payout.status === 'completed' && 'bg-green-100 text-green-800',
                                  payout.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                                  payout.status === 'processing' && 'bg-blue-100 text-blue-800',
                                  payout.status === 'failed' && 'bg-red-100 text-red-800'
                                )}
                              >
                                {payout.status_label || payout.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                {payout.is_automatic && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                    Auto
                                  </span>
                                )}
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                  {payout.payout_method === 'bank' ? 'Bank' : 'Mobile'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <PayoutAccountsList onAddAccount={() => setShowAddAccount(true)} />
          )}

          {activeTab === 'history' && (
            <PayoutHistoryTable />
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showAddAccount && (
        <AddPayoutAccountDialog onClose={() => setShowAddAccount(false)} />
      )}

      {showRequestPayout && (
        <RequestPayoutDialog
          availableBalance={stats?.withdrawable_balance || 0}
          currency={currency}
          minimumPayoutAmount={stats?.minimum_payout_amount}
          onClose={() => setShowRequestPayout(false)}
        />
      )}
    </div>
  );
}

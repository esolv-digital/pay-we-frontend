'use client';

import { useState } from 'react';
import { usePayoutAccounts, usePayouts, useVendorBalance } from '@/lib/hooks/use-payouts';
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

  const { data: balance, isLoading: balanceLoading } = useVendorBalance();
  const { data: accounts, isLoading: accountsLoading } = usePayoutAccounts();
  const { data: payoutsData, isLoading: payoutsLoading } = usePayouts({ per_page: 5 });

  const hasAccounts = accounts && accounts.length > 0;
  const defaultAccount = accounts?.find(acc => acc.is_default);
  const recentPayouts = payoutsData?.data || [];
  const currency = balance?.currency_code || 'GHS';

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
          disabled={!hasAccounts || (balance?.balance || 0) <= 0}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Request Payout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            {balanceLoading ? '...' : balance?.formatted_balance || formatCurrency(balance?.balance || 0, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {defaultAccount ? 'Auto-settles to default account' : 'Add default account for auto-settlement'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Default Payout Account</p>
          {accountsLoading ? (
            <p className="text-xl font-medium text-gray-400">...</p>
          ) : defaultAccount ? (
            <>
              <p className="text-lg font-bold text-gray-900 truncate">
                {defaultAccount.bank_name || defaultAccount.network_name}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {defaultAccount.account_number || defaultAccount.phone_number}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-yellow-600">Not Set</p>
              <p className="text-xs text-gray-500">Set a default for auto-payouts</p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Payout Accounts</p>
          <p className="text-3xl font-bold text-gray-900">
            {accountsLoading ? '...' : accounts?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hasAccounts ? 'Active accounts' : 'No accounts added'}
          </p>
        </div>
      </div>

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
                    disabled={!hasAccounts || (balance?.balance || 0) <= 0}
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
                  <h3 className="text-lg font-medium">Recent Payouts</h3>
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
                  <div className="space-y-3">
                    {recentPayouts.slice(0, 3).map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            payout.status === 'completed' && 'bg-green-100 text-green-600',
                            payout.status === 'pending' && 'bg-yellow-100 text-yellow-600',
                            payout.status === 'processing' && 'bg-blue-100 text-blue-600',
                            payout.status === 'failed' && 'bg-red-100 text-red-600'
                          )}>
                            {payout.status === 'completed' && '✓'}
                            {payout.status === 'pending' && '⏳'}
                            {payout.status === 'processing' && '⟳'}
                            {payout.status === 'failed' && '✕'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {payout.payout_details?.bank_name ||
                                payout.payout_details?.network_name ||
                                payout.payout_account?.account_name ||
                                'Unknown'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payout.payout_details?.account_number ||
                                payout.payout_details?.phone_number ||
                                payout.payout_account?.account_number ||
                                ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(payout.gross_amount, payout.currency_code)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
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
          availableBalance={balance?.balance || 0}
          currency={currency}
          onClose={() => setShowRequestPayout(false)}
        />
      )}
    </div>
  );
}

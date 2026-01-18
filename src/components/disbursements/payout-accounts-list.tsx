'use client';

import { usePayoutAccounts, useDeletePayoutAccount, useSetDefaultPayoutAccount } from '@/lib/hooks/use-payouts';
import { cn } from '@/lib/utils';

interface PayoutAccountsListProps {
  onAddAccount: () => void;
}

export function PayoutAccountsList({ onAddAccount }: PayoutAccountsListProps) {
  const { data: accounts, isLoading } = usePayoutAccounts();
  const deleteAccount = useDeletePayoutAccount();
  const setDefault = useSetDefaultPayoutAccount();

  const handleDelete = (accountId: string, accountName: string) => {
    if (confirm(`Are you sure you want to remove "${accountName}"? This action cannot be undone.`)) {
      deleteAccount.mutate(accountId);
    }
  };

  const handleSetDefault = (accountId: string) => {
    setDefault.mutate(accountId);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🏦</span>
        <h3 className="text-xl font-semibold mb-2">No payout accounts</h3>
        <p className="text-gray-600 mb-6">
          Add a bank or mobile money account to receive your payouts.
        </p>
        <button
          type="button"
          onClick={onAddAccount}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Add Payout Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Your Payout Accounts</h3>
        <button
          type="button"
          onClick={onAddAccount}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
        >
          + Add Account
        </button>
      </div>

      {accounts.map((account) => {
        const displayName = account.type === 'bank'
          ? account.bank_name
          : account.network_name || account.network?.toUpperCase();
        const displayNumber = account.type === 'bank'
          ? account.account_number
          : account.phone_number;

        return (
          <div
            key={account.id}
            className={cn(
              'border rounded-lg p-4',
              account.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                  account.type === 'bank' ? 'bg-gray-100' : 'bg-yellow-100'
                )}>
                  {account.type === 'bank' ? '🏦' : '📱'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{displayName}</p>
                    {account.is_default && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{account.account_name}</p>
                  <p className="text-sm text-gray-500">{displayNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!account.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(account.id)}
                    disabled={setDefault.isPending}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(account.id, displayName || 'this account')}
                  disabled={deleteAccount.isPending}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
              <span>Type: {account.type === 'bank' ? 'Bank Account' : 'Mobile Money'}</span>
              {account.network && <span>Network: {account.network.toUpperCase()}</span>}
              <span>Added: {new Date(account.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

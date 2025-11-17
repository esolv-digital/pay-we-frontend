'use client';

import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@/lib/api/vendor';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export default function VendorDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendor', 'dashboard'],
    queryFn: vendorApi.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Available Balance',
      value: formatCurrency(stats?.balance || 0, 'USD'),
      icon: '💵',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue || 0, 'USD'),
      icon: '💰',
    },
    {
      label: 'Total Transactions',
      value: stats?.total_transactions?.toLocaleString() || '0',
      icon: '💳',
    },
    {
      label: 'Pending Disbursements',
      value: stats?.pending_disbursements || 0,
      icon: '⏳',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <span className="text-3xl">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/vendor/payment-pages/create"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <span className="text-3xl block mb-2">➕</span>
            <span className="font-medium">Create Payment Page</span>
          </Link>
          <a
            href="/vendor/transactions"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <span className="text-3xl block mb-2">📊</span>
            <span className="font-medium">View Transactions</span>
          </a>
          <a
            href="/vendor/disbursements"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <span className="text-3xl block mb-2">💸</span>
            <span className="font-medium">Request Payout</span>
          </a>
        </div>
      </div>
    </div>
  );
}

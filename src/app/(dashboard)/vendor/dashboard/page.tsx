'use client';

import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@/lib/api/vendor';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { VENDOR_ROUTES } from '@/lib/config/routes';
import { Wallet, DollarSign, CreditCard, Clock, PlusCircle, BarChart3, Banknote } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

export default function VendorDashboardPage() {
  const { user } = useAuth();

  // Get the vendor slug from the user's first organization's first vendor
  const vendorSlug = user?.organizations?.[0]?.vendors?.[0]?.slug;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendor', 'dashboard', vendorSlug],
    queryFn: () => vendorApi.getDashboardStats(vendorSlug!),
    enabled: !!vendorSlug,
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
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
      icon: Wallet,
      color: 'green',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue || 0, 'USD'),
      icon: DollarSign,
      color: 'emerald',
    },
    {
      label: 'Total Transactions',
      value: stats?.total_transactions?.toLocaleString() || '0',
      icon: CreditCard,
      color: 'blue',
    },
    {
      label: 'Pending Disbursements',
      value: stats?.pending_disbursements || 0,
      icon: Clock,
      color: 'yellow',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <IconBadge icon={metric.icon} color={metric.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={VENDOR_ROUTES.PAYMENT_PAGE_CREATE}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <PlusCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <span className="font-medium">Create Payment Page</span>
          </Link>
          <Link
            href={VENDOR_ROUTES.TRANSACTIONS}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <span className="font-medium">View Transactions</span>
          </Link>
          <Link
            href={VENDOR_ROUTES.DISBURSEMENTS}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <Banknote className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <span className="font-medium">Request Payout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

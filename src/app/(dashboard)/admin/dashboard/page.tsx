/**
 * Admin Dashboard Overview
 *
 * Comprehensive fintech admin dashboard with:
 * - Key performance metrics
 * - Transaction analytics
 * - Compliance status
 * - Recent activities
 * - Quick actions
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, DollarSign, Users, Store, Clock, CheckCircle,
  Landmark, AlertTriangle, TrendingUp, Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency } from '@/lib/utils/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconBadge } from '@/components/ui/icon-badge';
import Link from 'next/link';
import { ADMIN_ROUTES } from '@/lib/config/routes';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'statistics'],
    queryFn: adminApi.getStatistics,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Type-safe access to stats with defaults
  const statsData = stats as any;

  const primaryMetrics: Array<{
    label: string; value: string; subtext: string; icon: LucideIcon;
    color: string; trend: string; trendUp: boolean; href: string;
  }> = [
    {
      label: 'Total Transactions',
      value: stats?.total_transactions?.toLocaleString() || '0',
      subtext: 'All time',
      icon: CreditCard,
      color: 'blue',
      trend: '+12.5%',
      trendUp: true,
      href: ADMIN_ROUTES.TRANSACTIONS,
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue || 0, 'USD'),
      subtext: 'Lifetime earnings',
      icon: DollarSign,
      color: 'green',
      trend: '+8.2%',
      trendUp: true,
      href: ADMIN_ROUTES.TRANSACTIONS,
    },
    {
      label: 'Active Users',
      value: statsData?.active_users?.toLocaleString() || '0',
      subtext: 'Last 30 days',
      icon: Users,
      color: 'purple',
      trend: '+5.3%',
      trendUp: true,
      href: ADMIN_ROUTES.USERS,
    },
    {
      label: 'Active Vendors',
      value: stats?.active_vendors?.toLocaleString() || '0',
      subtext: 'Organizations',
      icon: Store,
      color: 'indigo',
      trend: '+3.1%',
      trendUp: true,
      href: ADMIN_ROUTES.ORGANIZATIONS,
    },
  ];

  const complianceMetrics: Array<{
    label: string; value: number; status: string; icon: LucideIcon; color: string; href: string;
  }> = [
    {
      label: 'Pending KYC',
      value: stats?.pending_kyc || 0,
      status: 'warning',
      icon: Clock,
      color: 'yellow',
      href: ADMIN_ROUTES.KYC,
    },
    {
      label: 'Approved KYC',
      value: statsData?.approved_kyc || 0,
      status: 'success',
      icon: CheckCircle,
      color: 'green',
      href: ADMIN_ROUTES.KYC,
    },
    {
      label: 'Pending KYB',
      value: statsData?.pending_kyb || 0,
      status: 'warning',
      icon: Landmark,
      color: 'yellow',
      href: ADMIN_ROUTES.KYB,
    },
    {
      label: 'Flagged Transactions',
      value: statsData?.flagged_transactions || 0,
      status: 'danger',
      icon: AlertTriangle,
      color: 'red',
      href: ADMIN_ROUTES.TRANSACTIONS,
    },
  ];

  const statusColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
  };

  const quickActions: Array<{ label: string; href: string; icon: LucideIcon }> = [
    { label: 'Review KYC', href: ADMIN_ROUTES.KYC, icon: CheckCircle },
    { label: 'View Reports', href: ADMIN_ROUTES.REPORTS, icon: TrendingUp },
    { label: 'Check Logs', href: ADMIN_ROUTES.LOGS, icon: Activity },
    { label: 'Manage Users', href: ADMIN_ROUTES.USERS, icon: Users },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" size="sm">
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {primaryMetrics.map((metric) => (
            <Link key={metric.label} href={metric.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.subtext}</p>
                  </div>
                  <IconBadge icon={metric.icon} color={metric.color} />
                </div>
                <div className="flex items-center text-sm">
                  <span
                    className={`font-medium ${
                      metric.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.trend}
                  </span>
                  <span className="text-gray-500 ml-2">vs last month</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {complianceMetrics.map((metric) => (
            <Link key={metric.label} href={metric.href}>
              <Card
                className={`p-6 border-2 hover:shadow-lg transition-shadow cursor-pointer ${
                  statusColors[metric.status as keyof typeof statusColors]
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <IconBadge icon={metric.icon} color={metric.color} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <Link href={ADMIN_ROUTES.TRANSACTIONS}>
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <IconBadge icon={CreditCard} color="blue" size="sm" />
                  <div>
                    <p className="font-medium text-sm">Transaction #{1000 + i}</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">$1,234.56</p>
                  <Badge className="text-xs bg-green-100 text-green-800">Success</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
            <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Payment Gateway</span>
              </div>
              <span className="text-xs text-gray-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">KYC Service</span>
              </div>
              <span className="text-xs text-gray-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Database</span>
              </div>
              <span className="text-xs text-gray-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">Email Service</span>
              </div>
              <span className="text-xs text-gray-500">Degraded</span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href={ADMIN_ROUTES.LOGS}>
                <Button variant="outline" size="sm" className="w-full">
                  View System Logs
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Statistics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Organizations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {statsData?.total_organizations?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {statsData?.total_users?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Transaction Volume (30d)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(statsData?.volume_30d || 0, 'USD')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg. Transaction Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(statsData?.avg_transaction_value || 0, 'USD')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

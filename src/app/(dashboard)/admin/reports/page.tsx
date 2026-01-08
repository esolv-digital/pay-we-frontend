/**
 * Admin Reports & Analytics Page
 *
 * Comprehensive reporting and analytics with:
 * - Financial reports
 * - Transaction analytics
 * - User growth metrics
 * - Compliance reports
 * - Custom report generation
 * - Export functionality
 */

'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type ReportCategory = 'all' | 'financial' | 'transactions' | 'users' | 'compliance';

export default function AdminReportsPage() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('all');

  const categories: { id: ReportCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Reports', icon: '📊' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'compliance', label: 'Compliance', icon: '✓' },
  ];

  const reports = [
    {
      id: '1',
      name: 'Revenue Report',
      description: 'Comprehensive revenue breakdown and trends',
      category: 'financial',
      icon: '💰',
      lastGenerated: '2 hours ago',
      status: 'ready',
    },
    {
      id: '2',
      name: 'Transaction Volume',
      description: 'Transaction counts and volume analysis',
      category: 'transactions',
      icon: '💳',
      lastGenerated: '5 hours ago',
      status: 'ready',
    },
    {
      id: '3',
      name: 'User Growth Report',
      description: 'User acquisition and retention metrics',
      category: 'users',
      icon: '👥',
      lastGenerated: '1 day ago',
      status: 'ready',
    },
    {
      id: '4',
      name: 'KYC Compliance Report',
      description: 'KYC verification status and compliance tracking',
      category: 'compliance',
      icon: '✓',
      lastGenerated: '3 hours ago',
      status: 'ready',
    },
    {
      id: '5',
      name: 'Payment Gateway Performance',
      description: 'Gateway success rates and performance metrics',
      category: 'financial',
      icon: '🔌',
      lastGenerated: '6 hours ago',
      status: 'ready',
    },
    {
      id: '6',
      name: 'Failed Transactions Report',
      description: 'Analysis of failed and declined transactions',
      category: 'transactions',
      icon: '❌',
      lastGenerated: '4 hours ago',
      status: 'ready',
    },
    {
      id: '7',
      name: 'User Activity Report',
      description: 'User engagement and activity patterns',
      category: 'users',
      icon: '📈',
      lastGenerated: '8 hours ago',
      status: 'ready',
    },
    {
      id: '8',
      name: 'Compliance Audit Trail',
      description: 'Complete audit trail for compliance verification',
      category: 'compliance',
      icon: '📝',
      lastGenerated: '12 hours ago',
      status: 'ready',
    },
  ];

  const quickStats = [
    { label: 'Total Reports', value: reports.length.toString(), icon: '📊', color: 'bg-blue-50' },
    { label: 'Reports Generated Today', value: '12', icon: '✨', color: 'bg-green-50' },
    { label: 'Scheduled Reports', value: '5', icon: '⏰', color: 'bg-purple-50' },
    { label: 'Custom Reports', value: '3', icon: '🎯', color: 'bg-yellow-50' },
  ];

  const filteredReports = reports.filter(
    (report) => activeCategory === 'all' || report.category === activeCategory
  );

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_TRANSACTIONS}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">
              Generate and view comprehensive reports across your platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <span className="mr-2">⏰</span>
              Schedule Report
            </Button>
            <Button>
              <span className="mr-2">+</span>
              Create Custom Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.label} className={`p-6 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredReports.map((report) => (
            <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">{report.icon}</span>
                </div>
                <Badge className="bg-green-100 text-green-800">{report.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Last generated: {report.lastGenerated}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Report
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Analytics Dashboard Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
              <Button variant="ghost" size="sm">View Full Report →</Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-lg font-bold text-gray-900">$124,567</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="text-lg font-bold text-gray-900">$108,234</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm text-gray-600">Growth</span>
                <span className="text-lg font-bold text-green-600">+15.1%</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-600">Year to Date</span>
                <span className="text-lg font-bold text-gray-900">$1,456,789</span>
              </div>
            </div>
          </Card>

          {/* Transaction Statistics */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Transaction Statistics</h2>
              <Button variant="ghost" size="sm">View Full Report →</Button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">98.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Failed Transactions</span>
                  <span className="font-semibold text-red-600">1.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '1.2%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">0.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0.3%' }}></div>
                </div>
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Volume</p>
                    <p className="text-lg font-bold text-gray-900">12,456</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg. Value</p>
                    <p className="text-lg font-bold text-gray-900">$234.56</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* User Metrics */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">User Metrics</h2>
              <Button variant="ghost" size="sm">View Full Report →</Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">2,456</p>
                  <p className="text-xs text-green-600 mt-1">+12% this month</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">1,823</p>
                  <p className="text-xs text-green-600 mt-1">74% of total</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">New Users</p>
                  <p className="text-2xl font-bold text-gray-900">234</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-gray-900">2.1%</p>
                  <p className="text-xs text-red-600 mt-1">+0.3% from last</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Compliance Overview */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Compliance Overview</h2>
              <Button variant="ghost" size="sm">View Full Report →</Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">KYC Approved</p>
                  <p className="text-xs text-gray-600">Fully verified</p>
                </div>
                <span className="text-2xl font-bold text-green-600">186</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Pending Review</p>
                  <p className="text-xs text-gray-600">Awaiting verification</p>
                </div>
                <span className="text-2xl font-bold text-yellow-600">23</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Rejected</p>
                  <p className="text-xs text-gray-600">Failed verification</p>
                </div>
                <span className="text-2xl font-bold text-red-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Not Submitted</p>
                  <p className="text-xs text-gray-600">No documents</p>
                </div>
                <span className="text-2xl font-bold text-gray-600">45</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}

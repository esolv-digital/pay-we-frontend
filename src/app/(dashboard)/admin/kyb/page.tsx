/**
 * Admin KYB Management Page
 *
 * Know Your Business (KYB) management interface with:
 * - Business verification statistics
 * - Advanced filtering and search
 * - Export functionality
 * - Pagination
 * - Permission-based access
 */

'use client';

import { useState } from 'react';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, CheckCircle, XCircle, Landmark } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';
import Link from 'next/link';

type KYBStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_more_info';

const KYB_STATUSES: { label: string; value: KYBStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Needs More Info', value: 'needs_more_info' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const STATUS_COLORS: Record<KYBStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-purple-100 text-purple-800',
  needs_more_info: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminKYBPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '' as KYBStatus | '',
  });

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setFilters((prev) => ({
      ...prev,
      status: (status as KYBStatus) || '',
    }));
  };

  // Mock statistics
  const stats = [
    { label: 'Total Businesses', value: '0', icon: Building2, color: 'blue' },
    { label: 'Pending Review', value: '0', icon: Clock, color: 'yellow' },
    { label: 'Approved', value: '0', icon: CheckCircle, color: 'green' },
    { label: 'Rejected', value: '0', icon: XCircle, color: 'red' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_KYC}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KYB Management</h1>
            <p className="text-gray-600 mt-1">
              Know Your Business verification and compliance management
            </p>
          </div>
          <Can permission={PERMISSIONS.EXPORT_KYC}>
            <div className="flex gap-2">
              <Button variant="outline">Export CSV</Button>
              <Button variant="outline">Export Excel</Button>
            </div>
          </Can>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <IconBadge icon={stat.icon} color={stat.color} />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by business name, registration number..."
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={filters.search}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={handleStatusFilter}
                aria-label="Filter by status"
              >
                {KYB_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                aria-label="Filter by business type"
              >
                <option value="">All Types</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="corporation">Corporation</option>
                <option value="llc">LLC</option>
                <option value="nonprofit">Non-Profit</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Empty State */}
        <Card className="p-12 text-center">
          <IconBadge icon={Landmark} variant="empty-state" color="blue" />
          <h2 className="text-2xl font-semibold mb-2">No Business Verifications Yet</h2>
          <p className="text-gray-600 mb-6">
            Business verification documents will appear here once organizations start submitting
            their KYB information
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>KYB verifications typically include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Business registration documents</li>
              <li>Tax identification numbers</li>
              <li>Articles of incorporation</li>
              <li>Ownership structure</li>
              <li>Beneficial ownership information</li>
              <li>Financial statements</li>
            </ul>
          </div>
        </Card>
      </div>
    </PermissionGuard>
  );
}

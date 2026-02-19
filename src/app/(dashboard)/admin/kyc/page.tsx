/**
 * Admin KYC Management Page
 *
 * Comprehensive KYC management interface with:
 * - Statistics dashboard
 * - Advanced filtering and search
 * - Export functionality
 * - Pagination
 * - Permission-based access
 */

'use client';

import { useState } from 'react';
import { useAdminKYCList, useExportKYC } from '@/lib/hooks/use-admin-kyc';
import { KYCStatistics } from '@/components/admin/kyc-statistics';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { AdminKYCFilters, KYCStatus, KYCExportFormat } from '@/types/kyc';
import { AlertTriangle, FileText } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';
import { format } from 'date-fns';

const KYC_STATUSES: { label: string; value: KYCStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Not Submitted', value: 'not_submitted' },
  { label: 'Pending', value: 'pending' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Needs More Info', value: 'needs_more_info' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const STATUS_COLORS: Record<KYCStatus, string> = {
  not_submitted: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  needs_more_info: 'bg-orange-100 text-orange-800',
  reviewed: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminKYCPage() {
  const [filters, setFilters] = useState<AdminKYCFilters>({
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
  });

  const { data, isLoading, error, isError } = useAdminKYCList(filters);
  const { mutate: exportKYC, isPending: isExporting } = useExportKYC();

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setFilters((prev) => ({
      ...prev,
      status: (status as KYCStatus) || undefined,
    }));
  };

  const handleExport = (format: KYCExportFormat) => {
    exportKYC({ format, filters });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page } as AdminKYCFilters));
  };

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_KYC}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
          <Can permission={PERMISSIONS.EXPORT_KYC}>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('xlsx')}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Excel'}
              </Button>
            </div>
          </Can>
        </div>

        {/* Statistics */}
        <KYCStatistics className="mb-8" />

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by org name, document type..."
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
                {KYC_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.sort_by || 'created_at'}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sort_by: e.target.value as any }))
                }
                aria-label="Sort by field"
              >
                <option value="created_at">Created Date</option>
                <option value="reviewed_at">Review Date</option>
                <option value="organization_name">Organization</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </Card>

        {/* KYC List */}
        {isError ? (
          <Card className="p-12 text-center">
            <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading KYC Documents</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Failed to load KYC documents. Please try again.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </Card>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : !data?.kyc_documents || data.kyc_documents.length === 0 ? (
          <Card className="p-12 text-center">
            <IconBadge icon={FileText} variant="empty-state" color="blue" />
            <h2 className="text-2xl font-semibold mb-2">No KYC Documents Found</h2>
            <p className="text-gray-600">
              {filters.search || filters.status
                ? 'Try adjusting your filters'
                : 'No KYC documents have been submitted yet'}
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {data.kyc_documents.map((kyc) => (
                <Card key={kyc.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {kyc.organization?.name || 'Unknown Organization'}
                        </h3>
                        <Badge className={STATUS_COLORS[kyc.status]}>
                          {kyc.status.replace('_', ' ')}
                        </Badge>
                        {kyc.is_verified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Verified
                          </Badge>
                        )}
                        {kyc.is_expired && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Expired
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Document Type:</span>
                          <p className="font-medium capitalize">
                            {kyc.document_type.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Document Number:</span>
                          <p className="font-medium">
                            {kyc.document_number || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Submitted:</span>
                          <p className="font-medium">
                            {format(new Date(kyc.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {kyc.reviewed_at && (
                          <div>
                            <span className="text-gray-500">Reviewed:</span>
                            <p className="font-medium">
                              {format(new Date(kyc.reviewed_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>

                      {kyc.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {kyc.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/admin/kyc/${kyc.organization_id}`}
                      className="ml-4"
                    >
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.meta && data.meta.last_page > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(data.meta.current_page - 1)}
                  disabled={data.meta.current_page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {data.meta.current_page} of {data.meta.last_page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(data.meta.current_page + 1)}
                  disabled={data.meta.current_page === data.meta.last_page}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}

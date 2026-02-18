/**
 * KYC Review Details Page - Secure & Systematic
 *
 * Features:
 * - Status-based workflow with transition buttons
 * - Super Admin privilege enforcement
 * - Data privacy (hides sensitive info from regular admins)
 * - Clear, systematic information display
 * - Final status protection (approved/rejected)
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useUpdateKYCStatus } from '@/lib/hooks/use-admin-kyc';
import { adminApi } from '@/lib/api/admin';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import Link from 'next/link';
import { XCircle, Lock, AlertTriangle } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';
import type {
  KYCStatus,
  KYCStatusUpdateRequest,
} from '@/types/kyc';
import {
  STATUS_LABELS,
  getAvailableStatuses,
  requiresReason,
  canModifyKYC,
  isFinalStatus,
} from '@/types/kyc';

const STATUS_BADGE_COLORS: Record<KYCStatus, string> = {
  not_submitted: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  needs_more_info: 'bg-orange-100 text-orange-800',
  reviewed: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function KYCReviewPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params?.organizationId as string;
  const { isSuperAdmin } = usePermissions();

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<KYCStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  const { data: kycReview, isLoading } = useQuery({
    queryKey: ['admin', 'kyc', organizationId],
    queryFn: () => adminApi.getKYCDetails(organizationId),
    enabled: !!organizationId,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateKYCStatus({
    onSuccess: () => {
      setShowStatusDialog(false);
      setSelectedStatus(null);
      setNotes('');
      setReason('');
      router.push('/admin/kyc');
    },
  });

  const handleStatusChange = (newStatus: KYCStatus) => {
    setSelectedStatus(newStatus);
    setShowStatusDialog(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedStatus) return;

    const needsReasonCheck = requiresReason(selectedStatus);
    if (needsReasonCheck && !reason.trim()) {
      alert('Please provide a reason for this status change');
      return;
    }

    const data: KYCStatusUpdateRequest = {
      status: selectedStatus,
      notes: notes || undefined,
      reason: needsReasonCheck ? reason : undefined,
    };

    updateStatus({ organizationId, data });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!kycReview) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <IconBadge icon={XCircle} variant="empty-state" color="red" />
          <h2 className="text-2xl font-semibold mb-2">KYC Not Found</h2>
          <p className="text-gray-600 mb-4">
            The requested KYC review could not be found
          </p>
          <Link href="/admin/kyc">
            <Button>Back to KYC List</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentStatus = kycReview.kyc_status as KYCStatus;
  const availableStatuses = getAvailableStatuses(currentStatus, isSuperAdmin);
  const canModify = canModifyKYC(currentStatus, isSuperAdmin);
  const isLocked = isFinalStatus(currentStatus);

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_KYC}>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/kyc"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to KYC List
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KYC Review</h1>
              <p className="text-gray-600 mt-1">{kycReview.organization.name}</p>
            </div>
            <div className="text-right">
              <Badge className={STATUS_BADGE_COLORS[currentStatus]}>
                {STATUS_LABELS[currentStatus]}
              </Badge>
              {isLocked && !isSuperAdmin && (
                <p className="text-xs text-gray-500 mt-2">
                  <Lock className="inline h-3 w-3 mr-1" /> Status Locked
                </p>
              )}
              {isLocked && isSuperAdmin && (
                <p className="text-xs text-orange-600 mt-2">
                  <AlertTriangle className="inline h-3 w-3 mr-1" /> Super Admin Override Available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Lock Warning */}
        {isLocked && !canModify && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              This KYC status is locked and cannot be modified. Only Super Admins can make changes to {currentStatus} KYCs.
            </AlertDescription>
          </Alert>
        )}

        {/* Organization Details - PUBLIC INFORMATION ONLY */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Organization Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Organization Name</label>
              <p className="text-base font-medium text-gray-900">{kycReview.organization.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Organization Type</label>
              <p className="text-base font-medium text-gray-900 capitalize">
                {kycReview.organization.type}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">KYC Status</label>
              <p className="text-base font-medium text-gray-900">
                {STATUS_LABELS[currentStatus]}
              </p>
            </div>
            {kycReview.submitted_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted On</label>
                <p className="text-base font-medium text-gray-900">
                  {format(new Date(kycReview.submitted_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
            {kycReview.waiting_time && (
              <div>
                <label className="text-sm font-medium text-gray-500">Waiting Time</label>
                <p className="text-base font-medium text-orange-600">
                  {kycReview.waiting_time}
                </p>
              </div>
            )}
            {/* SECURITY: Only show owner name, NOT email or sensitive data */}
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted By</label>
              <p className="text-base font-medium text-gray-900">
                {kycReview.owner.first_name} {kycReview.owner.last_name}
              </p>
              {isSuperAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  {kycReview.owner.email}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Documents */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            KYC Documents ({kycReview.documents.length})
          </h2>

          {kycReview.documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No documents submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {kycReview.documents.map((document) => (
                <div
                  key={document.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-base font-semibold capitalize">
                          {document.document_type.replace(/_/g, ' ')}
                        </h3>
                        <Badge
                          className={
                            document.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : document.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {document.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {document.document_number && (
                          <div>
                            <span className="text-gray-500">Document Number:</span>
                            <p className="font-medium">{document.document_number}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Uploaded:</span>
                          <p className="font-medium">
                            {format(new Date(document.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {document.reviewed_at && (
                          <div>
                            <span className="text-gray-500">Reviewed:</span>
                            <p className="font-medium">
                              {format(new Date(document.reviewed_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>

                      {document.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {document.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {document.document_url && (
                      <a
                        href={document.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Button variant="outline" size="sm">
                          View Document
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Status Actions */}
        {canModify && availableStatuses.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Update KYC Status</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the next status for this KYC review:
            </p>
            <div className="flex flex-wrap gap-3">
              {availableStatuses.map((status) => (
                <Button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  variant={
                    status === 'approved'
                      ? 'default'
                      : status === 'rejected'
                      ? 'destructive'
                      : 'outline'
                  }
                  disabled={isUpdating}
                >
                  {STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Status Update Dialog */}
        <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Update KYC Status to "{selectedStatus && STATUS_LABELS[selectedStatus]}"
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to update the KYC status for {kycReview.organization.name}.
                {selectedStatus && requiresReason(selectedStatus) && (
                  <span className="block mt-2 text-orange-600 font-medium">
                    <AlertTriangle className="inline h-3 w-3 mr-1" /> A reason is required for this status change.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              {selectedStatus && requiresReason(selectedStatus) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Required) <span className="text-red-600">*</span>
                  </label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      selectedStatus === 'rejected'
                        ? 'Explain why the KYC is being rejected...'
                        : 'Explain what additional information is needed...'
                    }
                    rows={4}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any internal notes about this status change..."
                  rows={3}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmStatusChange}
                disabled={
                  isUpdating ||
                  Boolean(selectedStatus && requiresReason(selectedStatus) && !reason.trim())
                }
              >
                {isUpdating ? 'Updating...' : 'Confirm Update'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}

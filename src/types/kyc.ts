import type { Organization } from './auth';
import type { User } from './user';

/**
 * KYC Document statuses matching backend
 *
 * Status Flow:
 * - not_submitted → pending → submitted
 * - submitted → in_review → reviewed → approved
 * - At any point: → needs_more_info → submitted (resubmit)
 * - At any point: → rejected → submitted (resubmit)
 */
export type KYCStatus =
  | 'not_submitted'
  | 'pending'
  | 'submitted'
  | 'in_review'
  | 'needs_more_info'
  | 'reviewed'
  | 'approved'
  | 'rejected';

/**
 * Document types for KYC
 */
export type KYCDocumentType =
  | 'business_registration'
  | 'tax_certificate'
  | 'directors_id'
  | 'proof_of_address'
  | 'bank_statement'
  | 'memorandum_of_association'
  | 'passport'
  | 'national_id'
  | 'drivers_license'
  | 'voters_card'
  | 'selfie';

/**
 * Sort fields for KYC listing
 */
export type KYCSortBy =
  | 'created_at'
  | 'updated_at'
  | 'reviewed_at'
  | 'status'
  | 'organization_name';

/**
 * KYC Document (Basic - for vendor submission)
 */
export interface KYCDocument {
  id: string;
  organization_id: string;
  document_type: string;
  document_number?: string;
  file_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  document_url?: string;
}

/**
 * Admin KYC Document (Comprehensive - for admin management)
 */
export interface AdminKYCDocument {
  id: string;
  organization_id: string;
  document_type: KYCDocumentType;
  document_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  status: KYCStatus;
  is_verified: boolean;
  is_expired: boolean;
  reviewed_at: string | null;
  rejection_reason: string | null;
  document_url: string;
  created_at: string;
  updated_at: string;
  organization: Organization | null;
  uploader: User | null;
  reviewer: User | null;
}

/**
 * KYC Review (for admin pending queue)
 */
export interface KYCReview {
  id: string;
  organization: Organization;
  documents: KYCDocument[];
  kyc_status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submitted_at?: string;
  waiting_time?: string;
  owner: User;
}

/**
 * KYC Filter Parameters for admin listing
 */
export interface AdminKYCFilters {
  search?: string;
  status?: KYCStatus;
  document_type?: KYCDocumentType;
  organization_id?: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  reviewed_from?: string; // YYYY-MM-DD
  reviewed_to?: string; // YYYY-MM-DD
  is_verified?: boolean;
  is_expired?: boolean;
  sort_by?: KYCSortBy;
  sort_direction?: 'asc' | 'desc';
  per_page?: number; // 1-100
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
}

/**
 * Admin KYC List Response
 */
export interface AdminKYCListResponse {
  kyc_documents: AdminKYCDocument[];
  meta: PaginationMeta;
  filters: AdminKYCFilters;
}

/**
 * KYC Statistics
 */
export interface KYCStatistics {
  total: number;
  pending: number;
  submitted: number;
  in_review: number;
  approved: number;
  rejected: number;
  average_review_time_hours: number;
  status_breakdown: {
    pending: number;
    submitted: number;
    in_review: number;
    approved: number;
    rejected: number;
  };
}

/**
 * KYC Statistics Response
 */
export interface KYCStatisticsResponse {
  statistics: KYCStatistics;
  period: {
    from: string;
    to: string;
  };
}

/**
 * KYC Status Update Request (NEW - Recommended)
 */
export interface KYCStatusUpdateRequest {
  status: KYCStatus;
  notes?: string;
  reason?: string; // Required for 'rejected' and 'needs_more_info' statuses
}

/**
 * KYC Approve Request (DEPRECATED - Use KYCStatusUpdateRequest instead)
 * @deprecated Use updateStatus with status='approved' instead
 */
export interface KYCApproveRequest {
  notes?: string;
  approved_documents: string[];
}

/**
 * KYC Reject Request (DEPRECATED - Use KYCStatusUpdateRequest instead)
 * @deprecated Use updateStatus with status='rejected' instead
 */
export interface KYCRejectRequest {
  reason: string;
  rejected_documents: string[];
}

/**
 * KYC Action Response
 */
export interface KYCActionResponse {
  id: string;
  status: KYCStatus;
  reviewed_at: string;
  reviewed_by: string;
  organization: Organization;
  reviewer: User;
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

/**
 * Valid status transitions mapping for REGULAR ADMINS
 * Based on backend business logic
 *
 * IMPORTANT BUSINESS RULES:
 * - approved: FINAL - Regular admins cannot change (only Super Admin can override)
 * - rejected: Vendors can resubmit to 'submitted', but admins cannot change (only Super Admin can override)
 */
export const STATUS_TRANSITIONS: Record<KYCStatus, KYCStatus[]> = {
  not_submitted: ['pending', 'submitted'],
  pending: ['submitted'],
  submitted: ['in_review', 'needs_more_info', 'rejected'],
  in_review: ['needs_more_info', 'reviewed', 'rejected'],
  needs_more_info: ['submitted', 'in_review', 'rejected'],
  reviewed: ['approved', 'rejected', 'in_review'],
  approved: [], // FINAL - No admin changes allowed (except Super Admin)
  rejected: ['submitted'], // Vendors can resubmit; admins cannot change (except Super Admin)
};

/**
 * Super Admin status transitions (can override final statuses)
 * Super Admins have full control over all status transitions
 */
export const SUPER_ADMIN_STATUS_TRANSITIONS: Record<KYCStatus, KYCStatus[]> = {
  not_submitted: ['pending', 'submitted'],
  pending: ['submitted'],
  submitted: ['in_review', 'needs_more_info', 'rejected'],
  in_review: ['needs_more_info', 'reviewed', 'rejected'],
  needs_more_info: ['submitted', 'in_review', 'rejected'],
  reviewed: ['approved', 'rejected', 'in_review'],
  approved: ['in_review', 'rejected'], // Super Admin can revert approved status
  rejected: ['submitted', 'in_review'], // Super Admin can revert rejected status
};

/**
 * Status labels for display
 */
export const STATUS_LABELS: Record<KYCStatus, string> = {
  not_submitted: 'Not Submitted',
  pending: 'Pending',
  submitted: 'Submitted',
  in_review: 'In Review',
  needs_more_info: 'Needs More Info',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
};

/**
 * Status descriptions for tooltips/help text
 */
export const STATUS_DESCRIPTIONS: Record<KYCStatus, string> = {
  not_submitted: 'KYC documents have not been submitted',
  pending: 'KYC documents are pending submission',
  submitted: 'KYC documents have been submitted for review',
  in_review: 'KYC documents are currently being reviewed',
  needs_more_info: 'Additional information or documents are required',
  reviewed: 'KYC documents have been reviewed and are pending final approval',
  approved: 'KYC documents have been approved',
  rejected: 'KYC documents have been rejected',
};

/**
 * Check if a status is final (locked)
 * Final statuses can only be changed by Super Admins
 */
export function isFinalStatus(status: KYCStatus): boolean {
  return status === 'approved' || status === 'rejected';
}

/**
 * Check if a status transition is valid
 *
 * @param currentStatus - Current KYC status
 * @param newStatus - Desired new status
 * @param isSuperAdmin - Whether the user is a Super Admin
 * @returns Whether the transition is allowed
 */
export function isValidStatusTransition(
  currentStatus: KYCStatus,
  newStatus: KYCStatus,
  isSuperAdmin: boolean = false
): boolean {
  // Super Admins can make any transition
  if (isSuperAdmin) {
    return SUPER_ADMIN_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
  }

  // Regular admins follow standard transitions
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Get available next statuses for a given status
 *
 * @param currentStatus - Current KYC status
 * @param isSuperAdmin - Whether the user is a Super Admin
 * @returns Array of allowed next statuses
 */
export function getAvailableStatuses(
  currentStatus: KYCStatus,
  isSuperAdmin: boolean = false
): KYCStatus[] {
  if (isSuperAdmin) {
    return SUPER_ADMIN_STATUS_TRANSITIONS[currentStatus] || [];
  }
  return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if user can modify KYC based on status and role
 *
 * @param currentStatus - Current KYC status
 * @param isSuperAdmin - Whether the user is a Super Admin
 * @returns Whether the user can modify the KYC
 */
export function canModifyKYC(
  currentStatus: KYCStatus,
  isSuperAdmin: boolean = false
): boolean {
  // Super Admins can always modify
  if (isSuperAdmin) {
    return true;
  }

  // Regular admins cannot modify final statuses
  return !isFinalStatus(currentStatus);
}

/**
 * Check if reason is required for a status
 */
export function requiresReason(status: KYCStatus): boolean {
  return status === 'rejected' || status === 'needs_more_info';
}

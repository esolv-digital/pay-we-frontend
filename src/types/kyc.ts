import type { Organization } from './auth';
import type { User } from './user';

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

export interface KYCReview {
  id: string;
  organization: Organization;
  documents: KYCDocument[];
  kyc_status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submitted_at?: string;
  waiting_time?: string;
  owner: User;
}

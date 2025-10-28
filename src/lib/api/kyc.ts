import { apiClient } from './client';

export interface KYCDocumentSubmission {
  document_type: 'passport' | 'national_id' | 'drivers_license' | 'business_registration' | 'tax_certificate' | 'proof_of_address';
  document_number: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  document_file: File;
}

export interface KYCDocument {
  id: string;
  organization_id: string;
  document_type: string;
  document_number: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  is_expired: boolean;
  reviewed_at?: string;
  rejection_reason?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export const kycApi = {
  // Submit KYC document
  submitDocument: async (organizationId: string, data: KYCDocumentSubmission) => {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('document_number', data.document_number);
    if (data.issue_date) formData.append('issue_date', data.issue_date);
    if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
    if (data.issuing_authority) formData.append('issuing_authority', data.issuing_authority);
    formData.append('document', data.document_file);

    return apiClient.post<KYCDocument>(
      `/organizations/${organizationId}/kyc/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Get KYC documents for organization
  getDocuments: async (organizationId: string) => {
    return apiClient.get<KYCDocument[]>(`/organizations/${organizationId}/kyc/documents`);
  },

  // Get single KYC document
  getDocument: async (organizationId: string, documentId: string) => {
    return apiClient.get<KYCDocument>(`/organizations/${organizationId}/kyc/documents/${documentId}`);
  },

  // Delete KYC document
  deleteDocument: async (organizationId: string, documentId: string) => {
    return apiClient.delete(`/organizations/${organizationId}/kyc/documents/${documentId}`);
  },
};

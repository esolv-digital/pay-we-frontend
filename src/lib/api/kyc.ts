import { apiClient } from './client';

export interface KYCDocumentSubmission {
  document_type: 'passport' | 'national_id' | 'drivers_license' | 'voters_card' | 'proof_of_address' | 'selfie' | 'business_registration' | 'tax_certificate' | 'directors_id';
  document_number: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  document_file: File;
  proof_of_address_file?: File;
}

export interface KYCBulkSubmission {
  id_document: File;
  proof_of_address: File;
  registration_certificate?: File;
  tax_id?: string;
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
    formData.append('document_file', data.document_file);
    if (data.proof_of_address_file) {
      formData.append('proof_of_address', data.proof_of_address_file);
    }

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

  // Submit all KYC documents at once (matches Laravel API)
  submitKYCDocuments: async (organizationId: string, data: KYCBulkSubmission) => {
    const formData = new FormData();
    formData.append('id_document', data.id_document);
    formData.append('proof_of_address', data.proof_of_address);
    if (data.registration_certificate) {
      formData.append('registration_certificate', data.registration_certificate);
    }
    if (data.tax_id) {
      formData.append('tax_id', data.tax_id);
    }

    return apiClient.post(
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

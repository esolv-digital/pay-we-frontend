'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';
import { KYCDocument } from '@/types/kyc';
import { CheckCircle2, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';

interface KYCStatusViewProps {
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  documents: KYCDocument[];
  submittedAt?: string;
}

export function KYCStatusView({ status, documents, submittedAt }: KYCStatusViewProps) {
  const getStatusIcon = (docStatus: string) => {
    switch (docStatus) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
      case 'in_review':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (docStatus: string) => {
    switch (docStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      passport: 'Passport',
      national_id: 'National ID',
      drivers_license: "Driver's License",
      voters_card: "Voter's Card",
      proof_of_address: 'Proof of Address',
      selfie: 'Selfie Verification',
      business_registration: 'Business Registration',
      tax_certificate: 'Tax Certificate',
      directors_id: "Director's ID",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Status Header Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {status === 'approved' ? (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            ) : status === 'rejected' ? (
              <XCircle className="h-12 w-12 text-red-600" />
            ) : (
              <Clock className="h-12 w-12 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {status === 'approved' && 'KYC Verification Approved'}
              {status === 'rejected' && 'KYC Verification Rejected'}
              {(status === 'pending' || status === 'in_review') && 'KYC Verification In Review'}
            </h2>
            <p className="text-gray-600 mb-3">
              {status === 'approved' && 'Your KYC verification has been successfully approved. You can now access all platform features.'}
              {status === 'rejected' && 'Your KYC verification has been rejected. Please review the feedback below and resubmit with updated documents.'}
              {(status === 'pending' || status === 'in_review') && 'Your KYC documents are currently being reviewed by our team. This typically takes 1-2 business days.'}
            </p>
            {submittedAt && (
              <p className="text-sm text-gray-500">
                Submitted on {formatDate(submittedAt)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>
        <div className="space-y-3">
          {documents.length === 0 ? (
            <Card className="p-6">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No documents submitted yet.</p>
              </div>
            </Card>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h4 className="font-medium">{getDocumentTypeLabel(doc.document_type)}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded {formatDate(doc.created_at)}
                        {doc.reviewed_at && ` • Reviewed ${formatDate(doc.reviewed_at)}`}
                      </p>
                      {doc.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">
                            <span className="font-semibold">Rejection Reason:</span> {doc.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Additional Info for Pending/In Review */}
      {(status === 'pending' || status === 'in_review') && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Our compliance team is reviewing your documents</li>
                <li>You will receive an email notification once the review is complete</li>
                <li>If approved, you&apos;ll have full access to all platform features</li>
                <li>If any documents are rejected, you&apos;ll be able to resubmit them</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useKYCStatus } from '@/lib/hooks/use-kyc-status';
import { kycApi } from '@/lib/api/kyc';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { KYCStatusView } from '@/components/kyc/kyc-status-view';

const kycSchema = z.object({
  document_type: z.enum([
    'passport',
    'national_id',
    'drivers_license',
    'voters_card',
    'proof_of_address',
    'selfie',
    'business_registration',
    'tax_certificate',
    'directors_id'
  ]),
  document_number: z.string().min(1, 'Document number is required'),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
});

type KYCFormData = z.infer<typeof kycSchema>;

export default function KYCPage() {
  const queryClient = useQueryClient();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');

  // Enable polling to get real-time KYC status updates while on this page
  const { organization } = useKYCStatus({
    enablePolling: true,
    pollingInterval: 10000 // Poll every 10 seconds
  });

  const organizationId = organization?.id;
  const isCorporate = organization?.type === 'corporate';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
  });

  const documentType = watch('document_type');

  // Fetch existing KYC documents
  const { data: documents } = useQuery({
    queryKey: ['kyc', 'documents', organizationId],
    queryFn: () => kycApi.getDocuments(organizationId!),
    enabled: !!organizationId,
  });

  // Submit KYC mutation
  const submitMutation = useMutation({
    mutationFn: async (data: KYCFormData) => {
      if (!documentFile) {
        throw new Error('Please select a document file');
      }
      if (!organizationId) {
        throw new Error('Organization not found');
      }

      return kycApi.submitDocument(organizationId, {
        ...data,
        document_file: documentFile,
        proof_of_address_file: proofOfAddressFile || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setDocumentFile(null);
      setProofOfAddressFile(null);
      reset();
      showSuccess('KYC document submitted successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) return;

    // Validate file size (max 2MB per Laravel API)
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size must be less than 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    setter(file);
  };

  const onSubmit = (data: KYCFormData) => {
    if (!documentFile) {
      setFileError('Please select a document file');
      return;
    }
    submitMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const getOrgStatusAlert = () => {
    const status = organization?.kyc_status;

    if (status === 'approved') {
      return (
        <Alert className="border-l-4 border-l-green-500 bg-green-50 mb-6">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            Your KYC verification is complete and approved. You can now accept payments.
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'pending') {
      return (
        <Alert className="border-l-4 border-l-blue-500 bg-blue-50 mb-6">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Your KYC documents are under review. This typically takes 1-2 business days.
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'rejected') {
      return (
        <Alert className="border-l-4 border-l-red-500 bg-red-50 mb-6">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Your KYC submission was rejected. Please review the feedback below and submit updated documents.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-l-4 border-l-orange-500 bg-orange-50 mb-6">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Please complete your KYC verification to start accepting payments and unlock all features.
          {isCorporate
            ? ' As a corporate organization, you need to submit: business registration, tax certificate, and directors ID documents.'
            : ' Please submit your ID document (passport, national ID, or drivers license) and proof of address.'}
        </AlertDescription>
      </Alert>
    );
  };

  // Helper to check which documents are still needed
  const getRequiredDocuments = () => {
    if (!documents || !Array.isArray(documents)) return [];

    const submittedTypes = documents.map(doc => doc.document_type);

    if (isCorporate) {
      const required = ['business_registration', 'tax_certificate', 'directors_id'];
      return required.filter(type => !submittedTypes.includes(type));
    } else {
      const hasIdDoc = submittedTypes.some(type =>
        ['passport', 'national_id', 'drivers_license', 'voters_card'].includes(type)
      );
      const hasProofOfAddress = submittedTypes.includes('proof_of_address');

      const needed = [];
      if (!hasIdDoc) needed.push('ID Document (passport/national_id/drivers_license)');
      if (!hasProofOfAddress) needed.push('proof_of_address');
      return needed;
    }
  };

  const requiredDocs = getRequiredDocuments();
  const kycStatus = organization?.kyc_status;

  // If KYC is pending (in review), show the status view instead of the form
  if (kycStatus === 'pending') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-2">
            Your KYC submission status
          </p>
        </div>
        <KYCStatusView
          status={kycStatus}
          documents={Array.isArray(documents) ? documents : []}
          submittedAt={organization?.kyc_submitted_at}
        />
      </div>
    );
  }

  // For approved status, show a simple success message
  if (kycStatus === 'approved') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-2">
            Your verification is complete
          </p>
        </div>
        <KYCStatusView
          status={kycStatus}
          documents={Array.isArray(documents) ? documents : []}
          submittedAt={organization?.kyc_submitted_at}
        />
      </div>
    );
  }

  // For rejected or not_submitted status, show the form
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-600 mt-2">
          Submit your identification documents for verification
        </p>
      </div>

      {getOrgStatusAlert()}

      {requiredDocs.length > 0 && (
        <Alert className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Still needed:</strong> {requiredDocs.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Existing Documents */}
      {Array.isArray(documents) && documents.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
            <CardDescription>View your previously submitted KYC documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">Document #: {doc.document_number}</p>
                      <p className="text-xs text-gray-500">Submitted: {new Date(doc.created_at).toLocaleDateString()}</p>
                      {doc.rejection_reason && (
                        <p className="text-sm text-red-600 mt-1">Reason: {doc.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit New Document */}
      <Card>
        <CardHeader>
          <CardTitle>Submit KYC Document</CardTitle>
          <CardDescription>
            Upload one document at a time. You can submit multiple documents by filling out this form multiple times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Document Type */}
            <div>
              <Label htmlFor="document_type">Document Type *</Label>
              <Select
                onValueChange={(value) => setValue('document_type', value as KYCFormData['document_type'])}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                  <SelectItem value="voters_card">Voter&apos;s Card</SelectItem>
                  <SelectItem value="proof_of_address">Proof of Address</SelectItem>
                  {!isCorporate && <SelectItem value="selfie">Selfie</SelectItem>}
                  {isCorporate && (
                    <>
                      <SelectItem value="business_registration">Business Registration</SelectItem>
                      <SelectItem value="tax_certificate">Tax Certificate</SelectItem>
                      <SelectItem value="directors_id">Director&apos;s ID</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.document_type && (
                <p className="text-red-600 text-sm mt-1">{errors.document_type.message}</p>
              )}
            </div>

            {/* Document Number */}
            <div>
              <Label htmlFor="document_number">Document Number *</Label>
              <Input
                {...register('document_number')}
                type="text"
                id="document_number"
                placeholder="Enter document number"
                className="mt-2"
              />
              {errors.document_number && (
                <p className="text-red-600 text-sm mt-1">{errors.document_number.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Issue Date */}
              <div>
                <Label htmlFor="issue_date">Issue Date (Optional)</Label>
                <Input
                  {...register('issue_date')}
                  type="date"
                  id="issue_date"
                  className="mt-2"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                <Input
                  {...register('expiry_date')}
                  type="date"
                  id="expiry_date"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Document File Upload */}
            <div>
              <Label htmlFor="document_file">Upload Document *</Label>
              <div className="mt-2">
                <label
                  htmlFor="document_file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 2MB)</p>
                  </div>
                  <input
                    id="document_file"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => handleFileChange(e, setDocumentFile)}
                  />
                </label>
                {documentFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>

            {/* Proof of Address Upload (Optional) */}
            {documentType !== 'proof_of_address' && (
              <div>
                <Label htmlFor="proof_of_address_file">
                  Additional Proof of Address (Optional)
                </Label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  You can optionally attach a proof of address document with this submission
                </p>
                <div className="mt-2">
                  <label
                    htmlFor="proof_of_address_file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 2MB)</p>
                    </div>
                    <input
                      id="proof_of_address_file"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={(e) => handleFileChange(e, setProofOfAddressFile)}
                    />
                  </label>
                  {proofOfAddressFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {proofOfAddressFile.name} ({(proofOfAddressFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>
            )}

            {fileError && (
              <p className="text-red-600 text-sm">{fileError}</p>
            )}

            <Button
              type="submit"
              disabled={submitMutation.isPending || !documentFile}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit KYC Document'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrganization, useUpdateOrganization } from '@/lib/hooks/use-organization';
import { cn } from '@/lib/utils';
import { Building2, Globe, FileText, Shield, CheckCircle2, XCircle, Clock } from 'lucide-react';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  short_name: z.string().optional(),
  legal_name: z.string().optional(),
  type: z.enum(['individual', 'corporate']),
  industry: z.string().optional(),
  tax_id: z.string().optional(),
  registration_number: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export function OrganizationSettings() {
  const { data: organization, isLoading } = useOrganization();
  const updateOrganization = useUpdateOrganization();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      short_name: '',
      legal_name: '',
      type: 'individual',
      industry: '',
      tax_id: '',
      registration_number: '',
    },
    values: organization ? {
      name: organization.name,
      short_name: organization.short_name || '',
      legal_name: organization.legal_name || '',
      type: organization.type,
      industry: organization.industry || '',
      tax_id: organization.tax_id || '',
      registration_number: organization.registration_number || '',
    } : undefined,
  });

  const onSubmit = (data: OrganizationFormData) => {
    updateOrganization.mutate({
      name: data.name,
      short_name: data.short_name || undefined,
      legal_name: data.legal_name || undefined,
      type: data.type,
      industry: data.industry || undefined,
      tax_id: data.tax_id || undefined,
      registration_number: data.registration_number || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Found</h3>
          <p className="text-sm text-gray-600">
            You need to complete onboarding to create an organization.
          </p>
        </div>
      </div>
    );
  }

  const getKycStatusIcon = () => {
    switch (organization.kyc_status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getKycStatusText = () => {
    switch (organization.kyc_status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending Review';
      default:
        return 'Not Submitted';
    }
  };

  const getStatusColor = () => {
    switch (organization.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Organization Information</h2>
        <p className="text-sm text-gray-600">
          Manage your organization details and settings
        </p>
      </div>

      {/* Status Overview */}
      <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Organization Status */}
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <span className={cn(
                'inline-block px-2 py-1 text-xs font-medium rounded-full mt-1',
                getStatusColor()
              )}>
                {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
              </span>
            </div>
          </div>

          {/* KYC Status */}
          <div className="flex items-center gap-3">
            {getKycStatusIcon()}
            <div>
              <p className="text-xs text-gray-600">KYC Status</p>
              <p className="text-sm font-medium text-gray-900">{getKycStatusText()}</p>
            </div>
          </div>

          {/* Region */}
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Region</p>
              <p className="text-sm font-medium text-gray-900">
                {organization.region.charAt(0).toUpperCase() + organization.region.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <input
              id="name"
              type="text"
              {...form.register('name')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                form.formState.errors.name ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Short Name */}
          <div>
            <label htmlFor="short_name" className="block text-sm font-medium text-gray-700 mb-1">
              Short Name
            </label>
            <input
              id="short_name"
              type="text"
              {...form.register('short_name')}
              placeholder="Abbreviation or short form"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Legal Name */}
          <div>
            <label htmlFor="legal_name" className="block text-sm font-medium text-gray-700 mb-1">
              Legal Name
            </label>
            <input
              id="legal_name"
              type="text"
              {...form.register('legal_name')}
              placeholder="Official registered name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Organization Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Type *
            </label>
            <select
              id="type"
              {...form.register('type')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                form.formState.errors.type ? 'border-red-500' : 'border-gray-300'
              )}
            >
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
            </select>
            {form.formState.errors.type && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.type.message}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              {...form.register('industry')}
              placeholder="e.g., E-commerce, Education"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Country (Read-only) */}
          <div>
            <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              id="country_code"
              type="text"
              value={organization.country_code}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Contact support to change your country.
            </p>
          </div>

          {/* Tax ID */}
          <div>
            <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / VAT Number
            </label>
            <input
              id="tax_id"
              type="text"
              {...form.register('tax_id')}
              placeholder="Enter tax identification number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Registration Number */}
          <div>
            <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              id="registration_number"
              type="text"
              {...form.register('registration_number')}
              placeholder="Business registration number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* KYC Information */}
        {organization.kyc_status !== 'not_submitted' && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              KYC Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {organization.kyc_submitted_at && (
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(organization.kyc_submitted_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {organization.kyc_approved_at && (
                <div>
                  <span className="text-gray-600">Approved:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(organization.kyc_approved_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {organization.kyc_rejected_at && (
                <div>
                  <span className="text-gray-600">Rejected:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(organization.kyc_rejected_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {organization.kyc_expiry_date && (
                <div>
                  <span className="text-gray-600">Expires:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(organization.kyc_expiry_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Organization Timestamps */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(organization.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(organization.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Organization ID:</span>
              <span className="ml-2 font-mono text-xs text-gray-900">{organization.id}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={updateOrganization.isPending || !form.formState.isDirty}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateOrganization.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

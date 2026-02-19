/**
 * Payment Page Details View
 *
 * Displays comprehensive information about a payment page including:
 * - Basic details (title, description, status)
 * - Payment configuration (amount type, currency)
 * - Customization preview
 * - URLs and sharing options
 * - Actions (edit, toggle status, delete)
 *
 * Follows SOLID principles:
 * - SRP: Focused solely on displaying payment page details
 * - DRY: Reuses PaymentPagePreview component for customization display
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentPage, useDeletePaymentPage, useTogglePaymentPage } from '@/lib/hooks/use-payment-pages';
import { PaymentPagePreview } from '@/components/payment/payment-page-preview';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { ShareButton } from '@/components/shared/share-button';
import { QRCodeModal } from '@/components/shared/qr-code-modal';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Edit, Trash2, Copy, Check, QrCode } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPageDetailsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data: paymentPage, isLoading } = usePaymentPage(resolvedParams.id);
  const deletePage = useDeletePaymentPage();
  const toggleStatus = useTogglePaymentPage();

  const handleDelete = async () => {
    await deletePage.mutateAsync(resolvedParams.id);
    setDeleteDialogOpen(false);
    router.push('/vendor/payment-pages');
  };

  const handleToggleStatus = async () => {
    await toggleStatus.mutateAsync(resolvedParams.id);
  };

  const copyToClipboard = async (url: string, type: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentPage) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h2 className="text-2xl font-semibold mb-2">Payment Page Not Found</h2>
          <p className="text-gray-600 mb-6">The payment page you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/vendor/payment-pages">
            <Button>Back to Payment Pages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const publicUrl = paymentPage.vendor
    ? `${window.location.origin}/pay/${paymentPage.vendor.slug}/${paymentPage.slug}`
    : `${window.location.origin}/pay/${paymentPage.short_url}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/vendor/payment-pages"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payment Pages
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{paymentPage.title}</h1>
            {paymentPage.description && (
              <p className="text-gray-600 mt-2">{paymentPage.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                paymentPage.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {paymentPage.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Type</label>
                <p className="text-gray-900 capitalize">{paymentPage.amount_type.replace('_', ' ')}</p>
              </div>

              {paymentPage.amount_type === 'fixed' && paymentPage.fixed_amount != null && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fixed Amount</label>
                  <p className="text-gray-900 text-2xl font-bold">
                    {formatCurrency(paymentPage.fixed_amount, paymentPage.currency_code)}
                  </p>
                </div>
              )}

              {paymentPage.amount_type === 'flexible' && (
                <>
                  {paymentPage.min_amount != null && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Minimum Amount</label>
                      <p className="text-gray-900">
                        {formatCurrency(paymentPage.min_amount, paymentPage.currency_code)}
                      </p>
                    </div>
                  )}
                  {paymentPage.max_amount != null && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Maximum Amount</label>
                      <p className="text-gray-900">
                        {formatCurrency(paymentPage.max_amount, paymentPage.currency_code)}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Currency</label>
                <p className="text-gray-900">{paymentPage.currency_code}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Page Slug</label>
                <p className="text-gray-900 font-mono">{paymentPage.slug}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Short URL Code</label>
                <p className="text-gray-900 font-mono">{paymentPage.short_url}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDate(paymentPage.created_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDate(paymentPage.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Public URLs & Sharing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Share & Promote</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Payment Page URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    aria-label="Payment page public URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(publicUrl, 'public')}
                  >
                    {copiedUrl === 'public' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Share Options */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Share Options
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <ShareButton
                    url={publicUrl}
                    title={paymentPage.title}
                    description={paymentPage.description || `Payment page for ${paymentPage.title}`}
                    variant="outline"
                    size="default"
                    showLabel={true}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setQrModalOpen(true)}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <Link href={`/vendor/payment-pages/${paymentPage.id}/edit`} className="block">
                <Button className="w-full" variant="default">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Payment Page
                </Button>
              </Link>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleToggleStatus}
                disabled={toggleStatus.isPending}
              >
                {toggleStatus.isPending
                  ? 'Updating...'
                  : paymentPage.is_active
                    ? 'Deactivate Page'
                    : 'Activate Page'}
              </Button>

              <Button
                className="w-full"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Payment Page
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <PaymentPagePreview paymentPage={paymentPage} />
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={paymentPage.title}
        isDeleting={deletePage.isPending}
        description="This will permanently delete this payment page and all associated data. This action cannot be undone."
      />

      <QRCodeModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        url={publicUrl}
        title={paymentPage.title}
        description={paymentPage.description || `Scan to access ${paymentPage.title}`}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { usePaymentPages, useDeletePaymentPage } from '@/lib/hooks/use-payment-pages';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { ExternalLink, Trash2, QrCode, FileText } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { ShareButton } from '@/components/shared/share-button';
import { QRCodeModal } from '@/components/shared/qr-code-modal';
import { Button } from '@/components/ui/button';
import { VENDOR_ROUTES } from '@/lib/config/routes';

export default function PaymentPagesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string } | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPageForQR, setSelectedPageForQR] = useState<{
    url: string;
    title: string;
    description?: string;
  } | null>(null);

  const { data: response, isLoading } = usePaymentPages({
    page: currentPage,
    per_page: 12,
  });

  const deletePage = useDeletePaymentPage();

  // Extract pages array and meta from paginated response
  const pages = response?.data || [];
  const meta = response?.meta;

  const handleDeleteClick = (id: string, title: string) => {
    setPageToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;

    await deletePage.mutateAsync(pageToDelete.id);
    setDeleteDialogOpen(false);
    setPageToDelete(null);
  };

  const handleQRClick = (url: string, title: string, description?: string) => {
    setSelectedPageForQR({ url, title, description });
    setQrModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Pages</h1>
        <Link
          href={VENDOR_ROUTES.PAYMENT_PAGE_CREATE}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Page
        </Link>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <IconBadge icon={FileText} variant="empty-state" color="blue" />
          <h2 className="text-2xl font-semibold mb-2">No payment pages yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first payment page to start accepting payments
          </p>
          <Link
            href={VENDOR_ROUTES.PAYMENT_PAGE_CREATE}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Payment Page
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      page.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {page.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {page.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{page.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium capitalize">{page.amount_type}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        page.include_fees_in_amount
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={
                        page.include_fees_in_amount
                          ? 'Customer pays the service fee'
                          : 'Fee deducted from your earnings'
                      }
                    >
                      {page.include_fees_in_amount ? 'Customer pays fee' : 'Vendor pays fee'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2">{formatDate(page.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Short URL:</span>
                    <span className="ml-2 font-mono text-blue-600">{page.short_url}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href={page.vendor ? `/pay/${page.vendor.slug}/${page.slug}` : `/pay/${page.short_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview Page
                  </Link>

                  {/* Share and QR Code Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <ShareButton
                      url={
                        page.vendor
                          ? `${window.location.origin}/pay/${page.vendor.slug}/${page.slug}`
                          : `${window.location.origin}/pay/${page.short_url}`
                      }
                      title={page.title}
                      description={page.description || `Payment page for ${page.title}`}
                      variant="outline"
                      size="sm"
                      showLabel={true}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQRClick(
                          page.vendor
                            ? `${window.location.origin}/pay/${page.vendor.slug}/${page.slug}`
                            : `${window.location.origin}/pay/${page.short_url}`,
                          page.title,
                          page.description || `Scan to access ${page.title}`
                        )
                      }
                    >
                      <QrCode className="h-4 w-4" />
                      <span className="ml-2">QR Code</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Link
                      href={`/vendor/payment-pages/${page.id}`}
                      className="text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/vendor/payment-pages/${page.id}/edit`}
                      className="text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(page.id, page.title)}
                      className="text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, current page, and pages around current
                return (
                  page === 1 ||
                  page === meta.last_page ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, index, array) => {
                // Add ellipsis if there's a gap
                const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                return (
                  <div key={page} className="flex items-center gap-2">
                    {showEllipsisBefore && (
                      <span className="text-gray-500 px-2">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className="min-w-10"
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(meta.last_page, prev + 1))}
            disabled={currentPage === meta.last_page}
          >
            Next
          </Button>
        </div>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={pageToDelete?.title}
        isDeleting={deletePage.isPending}
        description="This will permanently delete this payment page and all associated data. This action cannot be undone."
      />

      {selectedPageForQR && (
        <QRCodeModal
          open={qrModalOpen}
          onOpenChange={setQrModalOpen}
          url={selectedPageForQR.url}
          title={selectedPageForQR.title}
          description={selectedPageForQR.description}
        />
      )}
    </div>
  );
}

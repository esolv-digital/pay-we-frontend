'use client';

import { usePaymentPages } from '@/lib/hooks/use-payment-pages';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';

export default function PaymentPagesPage() {
  const { data: pages, isLoading } = usePaymentPages();

  if (isLoading) {
    return (
      <div className="p-8">
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Pages</h1>
        <Link
          href="/vendor/payment-pages/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Page
        </Link>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <span className="text-6xl mb-4 block">📄</span>
          <h2 className="text-2xl font-semibold mb-2">No payment pages yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first payment page to start accepting payments
          </p>
          <Link
            href="/vendor/payment-pages/create"
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
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{page.amount_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2">{formatDate(page.created_at)}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Link
                    href={`/vendor/payment-pages/${page.id}`}
                    className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    View
                  </Link>
                  <Link
                    href={`/vendor/payment-pages/${page.id}/edit`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

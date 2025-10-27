'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { KYC_STATUS_COLORS } from '@/lib/config/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminKYCPage() {
  const { data: kycReviews, isLoading } = useQuery({
    queryKey: ['admin', 'kyc', 'pending'],
    queryFn: adminApi.getPendingKYC,
  });

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">KYC Reviews</h1>

      {!kycReviews || kycReviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <span className="text-6xl mb-4 block">✓</span>
          <h2 className="text-2xl font-semibold mb-2">All caught up!</h2>
          <p className="text-gray-600">No pending KYC reviews at this time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kycReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.organization.name}
                  </h3>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      KYC_STATUS_COLORS[review.kyc_status]
                    )}
                  >
                    {review.kyc_status}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{review.organization.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner:</span>
                    <span className="ml-2">{review.owner.first_name} {review.owner.last_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Documents:</span>
                    <span className="ml-2 font-medium">{review.documents.length}</span>
                  </div>
                  {review.waiting_time && (
                    <div>
                      <span className="text-gray-500">Waiting:</span>
                      <span className="ml-2 text-orange-600 font-medium">{review.waiting_time}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/admin/kyc/${review.organization.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

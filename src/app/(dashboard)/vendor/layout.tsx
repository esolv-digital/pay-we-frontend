'use client';

import { VendorSidebar } from '@/components/layouts/vendor-sidebar';
import { MobileHeader } from '@/components/layouts/mobile-header';
import { KYCBanner } from '@/components/kyc/kyc-banner';
import { useAuth } from '@/lib/hooks/use-auth';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, user } = useAuth();

  // Show loading while checking auth or user data not loaded
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has vendor access
  // Users with vendor access should have has_vendor_access flag or organizations
  const hasVendorAccess =
    user.has_vendor_access === true ||
    (user.organizations && user.organizations.length > 0) ||
    (user.vendors && user.vendors.length > 0);

  // If not a vendor, show access denied
  if (!hasVendorAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access the vendor dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <VendorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader title="PayWe" />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            <KYCBanner />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

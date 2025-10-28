'use client';

import { VendorSidebar } from '@/components/layouts/vendor-sidebar';
import { KYCBanner } from '@/components/kyc/kyc-banner';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <VendorSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          <KYCBanner />
        </div>
        {children}
      </main>
    </div>
  );
}

'use client';

import { AdminSidebar } from '@/components/layouts/admin-sidebar';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasRole(['super_admin', 'platform_admin'])) {
      router.push('/vendor/dashboard');
    }
  }, [hasRole, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (!hasRole(['super_admin', 'platform_admin'])) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}

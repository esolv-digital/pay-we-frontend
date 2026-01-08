'use client';

import { AdminSidebar } from '@/components/layouts/admin-sidebar';
import { useAuth } from '@/lib/hooks/use-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasRole, isLoading, user } = useAuth();

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

  // Multiple ways to check if user is admin - comprehensive check
  const isAdmin =
    user.is_super_admin ||
    user.has_admin_access ||
    !!user.admin?.is_super_admin ||
    !!user.admin?.is_platform_admin ||
    !!user.admin || // If admin object exists at all
    hasRole(['super_admin', 'platform_admin']);

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
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

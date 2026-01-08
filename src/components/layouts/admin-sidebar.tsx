'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { useAuth } from '@/lib/hooks/use-auth';
import { ContextSwitcher } from '@/components/context-switcher';
import { Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import type { PermissionName } from '@/types/permissions';

const navigation: Array<{
  name: string;
  href: string;
  icon: string;
  permission?: PermissionName;
}> = [
  { name: 'Dashboard', href: ADMIN_ROUTES.DASHBOARD, icon: '📊' },
  {
    name: 'Transactions',
    href: ADMIN_ROUTES.TRANSACTIONS,
    icon: '💳',
    permission: PERMISSIONS.VIEW_TRANSACTIONS,
  },
  {
    name: 'KYC Reviews',
    href: ADMIN_ROUTES.KYC,
    icon: '✓',
    permission: PERMISSIONS.VIEW_KYC,
  },
  { name: 'Users', href: ADMIN_ROUTES.USERS, icon: '👥' },
  { name: 'Organizations', href: ADMIN_ROUTES.ORGANIZATIONS, icon: '🏢' },
  {
    name: 'Roles & Permissions',
    href: ADMIN_ROUTES.ROLES,
    icon: '🔐',
    permission: PERMISSIONS.VIEW_ROLES,
  },
  {
    name: 'Settings',
    href: ADMIN_ROUTES.SETTINGS,
    icon: '⚙️',
    permission: PERMISSIONS.MANAGE_SETTINGS,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">PayWe Admin</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.full_name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          );

          // If item has permission requirement, wrap with Can component
          if (item.permission) {
            return (
              <Can key={item.name} permission={item.permission}>
                {linkContent}
              </Can>
            );
          }

          // Otherwise render without permission check
          return <div key={item.name}>{linkContent}</div>;
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <ContextSwitcher />
        <button
          type="button"
          onClick={() => logout()}
          className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

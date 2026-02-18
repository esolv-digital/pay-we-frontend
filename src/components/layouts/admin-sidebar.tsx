'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, CreditCard, Banknote, CheckCircle, Users, Building2,
  Store, FileText, Lock, ShieldCheck, Globe, Activity, TrendingUp, Settings,
} from 'lucide-react';
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
  icon: LucideIcon;
  permission?: PermissionName;
  category?: string;
}> = [
  // Overview
  { name: 'Dashboard', href: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard, category: 'overview' },

  // Financial
  {
    name: 'Transactions',
    href: ADMIN_ROUTES.TRANSACTIONS,
    icon: CreditCard,
    permission: PERMISSIONS.VIEW_TRANSACTIONS,
    category: 'financial',
  },
  {
    name: 'Disbursements',
    href: ADMIN_ROUTES.DISBURSEMENTS,
    icon: Banknote,
    permission: PERMISSIONS.ADMIN_VIEW_DISBURSEMENTS,
    category: 'financial',
  },
  // {
  //   name: 'Payout Accounts',
  //   href: ADMIN_ROUTES.PAYOUT_ACCOUNTS,
  //   icon: Landmark,
  //   permission: PERMISSIONS.ADMIN_VIEW_PAYOUT_ACCOUNTS,
  //   category: 'financial',
  // },

  // Compliance
  {
    name: 'KYC Reviews',
    href: ADMIN_ROUTES.KYC,
    icon: CheckCircle,
    permission: PERMISSIONS.VIEW_KYC,
    category: 'compliance',
  },
  // {
  //   name: 'KYB Reviews',
  //   href: ADMIN_ROUTES.KYB,
  //   icon: Landmark,
  //   permission: PERMISSIONS.VIEW_KYC,
  //   category: 'compliance',
  // },

  // Management
  { name: 'Users', href: ADMIN_ROUTES.USERS, icon: Users, category: 'management' },
  { name: 'Organizations', href: ADMIN_ROUTES.ORGANIZATIONS, icon: Building2, category: 'management' },
  {
    name: 'Vendors',
    href: ADMIN_ROUTES.VENDORS,
    icon: Store,
    permission: PERMISSIONS.ADMIN_VIEW_VENDORS,
    category: 'management',
  },
  {
    name: 'Payment Pages',
    href: ADMIN_ROUTES.PAYMENT_PAGES,
    icon: FileText,
    permission: PERMISSIONS.ADMIN_VIEW_PAYMENT_PAGES,
    category: 'management',
  },
  {
    name: 'Roles & Permissions',
    href: ADMIN_ROUTES.ROLES,
    icon: Lock,
    permission: PERMISSIONS.VIEW_ROLES,
    category: 'management',
  },
  {
    name: 'Admin Management',
    href: ADMIN_ROUTES.ADMIN_MANAGEMENT,
    icon: ShieldCheck,
    permission: PERMISSIONS.ADMIN_MANAGE_ADMINS,
    category: 'management',
  },

  // Platform
  {
    name: 'Countries',
    href: ADMIN_ROUTES.COUNTRIES,
    icon: Globe,
    permission: PERMISSIONS.ADMIN_MANAGE_COUNTRIES,
    category: 'platform',
  },
  // {
  //   name: 'Gateways',
  //   href: ADMIN_ROUTES.GATEWAYS,
  //   icon: Plug,
  //   permission: PERMISSIONS.ADMIN_MANAGE_GATEWAYS,
  //   category: 'platform',
  // },
  // {
  //   name: 'Fee Management',
  //   href: ADMIN_ROUTES.FEES,
  //   icon: DollarSign,
  //   permission: PERMISSIONS.ADMIN_MANAGE_FEES,
  //   category: 'platform',
  // },

  // System
  {
    name: 'Activity Logs',
    href: ADMIN_ROUTES.LOGS,
    icon: Activity,
    permission: PERMISSIONS.MANAGE_SETTINGS,
    category: 'system',
  },
  {
    name: 'Reports',
    href: ADMIN_ROUTES.REPORTS,
    icon: TrendingUp,
    permission: PERMISSIONS.VIEW_TRANSACTIONS,
    category: 'system',
  },
  {
    name: 'Settings',
    href: ADMIN_ROUTES.SETTINGS,
    icon: Settings,
    permission: PERMISSIONS.MANAGE_SETTINGS,
    category: 'system',
  },
];

const categoryLabels = {
  overview: 'Overview',
  financial: 'Financial',
  compliance: 'Compliance',
  management: 'Management',
  platform: 'Platform',
  system: 'System',
};

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Group navigation items by category
  const groupedNav = navigation.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  const categories = ['overview', 'financial', 'compliance', 'management', 'platform', 'system'];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">PayWe Admin</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.full_name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {categories.map((category) => {
          const items = groupedNav[category];
          if (!items || items.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
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
              </div>
            </div>
          );
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

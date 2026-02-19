'use client';

import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, CreditCard, Banknote, CheckCircle, Users, Building2,
  Store, FileText, Lock, ShieldCheck, Globe, Activity, TrendingUp, Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { useAuth } from '@/lib/hooks/use-auth';
import { ContextSwitcher } from '@/components/context-switcher';
import { Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import type { PermissionName } from '@/types/permissions';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { SidebarShell } from './sidebar-shell';
import { SidebarNavItem } from './sidebar-nav-item';

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

  // Compliance
  {
    name: 'KYC Reviews',
    href: ADMIN_ROUTES.KYC,
    icon: CheckCircle,
    permission: PERMISSIONS.VIEW_KYC,
    category: 'compliance',
  },

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

const categoryLabels: Record<string, string> = {
  overview: 'Overview',
  financial: 'Financial',
  compliance: 'Compliance',
  management: 'Management',
  platform: 'Platform',
  system: 'System',
};

const categories = ['overview', 'financial', 'compliance', 'management', 'platform', 'system'];

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

  return (
    <TooltipProvider>
      <SidebarShell>
        {(isCollapsed) => (
          <>
            {/* Logo/Header */}
            <div
              className={cn(
                'border-b border-gray-800 transition-all duration-300',
                isCollapsed ? 'px-2 py-4 text-center' : 'p-6'
              )}
            >
              <h1
                className={cn(
                  'font-bold transition-all duration-300',
                  isCollapsed ? 'text-sm' : 'text-xl'
                )}
              >
                {isCollapsed ? 'PA' : 'PayWe Admin'}
              </h1>
              {!isCollapsed && (
                <p className="text-sm text-gray-400 mt-1 truncate">
                  {user?.full_name}
                </p>
              )}
            </div>

            {/* Navigation */}
            <nav
              className={cn(
                'flex-1 overflow-y-auto',
                isCollapsed ? 'p-2 space-y-2' : 'p-4 space-y-4'
              )}
            >
              {categories.map((category) => {
                const items = groupedNav[category];
                if (!items || items.length === 0) return null;

                return (
                  <div key={category}>
                    {isCollapsed ? (
                      <div className="mx-2 border-t border-gray-700" />
                    ) : (
                      <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {categoryLabels[category]}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          pathname?.startsWith(item.href + '/');

                        const navItem = (
                          <SidebarNavItem
                            name={item.name}
                            href={item.href}
                            icon={item.icon}
                            isActive={isActive}
                            isCollapsed={isCollapsed}
                          />
                        );

                        if (item.permission) {
                          return (
                            <Can key={item.name} permission={item.permission}>
                              {navItem}
                            </Can>
                          );
                        }

                        return <div key={item.name}>{navItem}</div>;
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Footer */}
            <div
              className={cn(
                'border-t border-gray-800',
                isCollapsed ? 'p-2 space-y-1' : 'p-4 space-y-2'
              )}
            >
              {!isCollapsed && <ContextSwitcher />}
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center justify-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label="Sign Out"
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Sign Out
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </>
        )}
      </SidebarShell>
    </TooltipProvider>
  );
}

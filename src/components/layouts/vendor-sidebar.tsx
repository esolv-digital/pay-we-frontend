'use client';

import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, FileText, CreditCard, Wallet, TrendingUp, Lock, Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VENDOR_ROUTES } from '@/lib/config/routes';
import { useAuth } from '@/lib/hooks/use-auth';
import { useKYCStatus } from '@/lib/hooks/use-kyc-status';
import { ContextSwitcher } from '@/components/context-switcher';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { SidebarShell } from './sidebar-shell';
import { SidebarNavItem } from './sidebar-nav-item';

const baseNavigation: Array<{
  name: string;
  href: string;
  icon: LucideIcon;
  hideWhenApproved?: boolean;
}> = [
  { name: 'Dashboard', href: VENDOR_ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Payment Pages', href: VENDOR_ROUTES.PAYMENT_PAGES, icon: FileText },
  { name: 'Transactions', href: VENDOR_ROUTES.TRANSACTIONS, icon: CreditCard },
  { name: 'Disbursements', href: VENDOR_ROUTES.DISBURSEMENTS, icon: Wallet },
  { name: 'Reports', href: VENDOR_ROUTES.REPORTS, icon: TrendingUp },
  { name: 'KYC Verification', href: VENDOR_ROUTES.KYC, icon: Lock, hideWhenApproved: true },
  { name: 'Settings', href: VENDOR_ROUTES.SETTINGS, icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { organization } = useKYCStatus();

  // Filter out KYC Verification link if KYC is approved
  const navigation = baseNavigation.filter((item) => {
    if (item.hideWhenApproved && organization?.kyc_status === 'approved') {
      return false;
    }
    return true;
  });

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
                {isCollapsed ? 'P' : 'PayWe'}
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
                isCollapsed ? 'p-2 space-y-1' : 'p-4 space-y-1'
              )}
            >
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + '/');
                return (
                  <SidebarNavItem
                    key={item.name}
                    name={item.name}
                    href={item.href}
                    icon={item.icon}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                  />
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

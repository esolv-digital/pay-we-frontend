'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { VENDOR_ROUTES } from '@/lib/config/routes';
import { useAuth } from '@/lib/hooks/use-auth';

const navigation = [
  { name: 'Dashboard', href: VENDOR_ROUTES.DASHBOARD, icon: '📊' },
  { name: 'Payment Pages', href: VENDOR_ROUTES.PAYMENT_PAGES, icon: '📄' },
  { name: 'Transactions', href: VENDOR_ROUTES.TRANSACTIONS, icon: '💳' },
  { name: 'Disbursements', href: VENDOR_ROUTES.DISBURSEMENTS, icon: '💰' },
  { name: 'Settings', href: VENDOR_ROUTES.SETTINGS, icon: '⚙️' },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">PayWe</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.full_name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
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
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => logout()}
          className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

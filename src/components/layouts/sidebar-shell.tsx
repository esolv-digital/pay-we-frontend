'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { useIsMobile, useIsTablet } from '@/lib/hooks/use-media-query';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarShellProps {
  children: (isCollapsed: boolean) => React.ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  // Auto-collapse on tablet
  useEffect(() => {
    if (isTablet) {
      setSidebarCollapsed(true);
    }
  }, [isTablet, setSidebarCollapsed]);

  const isCollapsed = !isMobile && sidebarCollapsed;

  const toggleButton = (
    <div className="p-2 border-t border-gray-800">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className={cn(
              'flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors',
              isCollapsed ? 'w-full p-2' : 'w-full px-4 py-2 gap-3'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={8}>
            Expand sidebar
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );

  const sidebarContent = (collapsed: boolean) => (
    <div
      className={cn(
        'flex flex-col h-full bg-gray-900 text-white transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {children(collapsed)}
      {!isMobile && toggleButton}
    </div>
  );

  // Mobile: render inside Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-gray-900 border-r-0 [&>button]:text-white"
          showCloseButton={true}
        >
          <div className="flex flex-col h-full bg-gray-900 text-white w-64">
            {children(false)}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop/Tablet: render inline
  return <aside className="shrink-0">{sidebarContent(isCollapsed)}</aside>;
}

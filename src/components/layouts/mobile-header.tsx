'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/ui-store';

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title = 'PayWe' }: MobileHeaderProps) {
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 text-white border-b border-gray-800">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggleMobileSidebar}
        className="text-white hover:bg-gray-800"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="w-8" aria-hidden />
    </header>
  );
}

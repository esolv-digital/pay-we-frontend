'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
}

export function SidebarNavItem({
  name,
  href,
  icon: Icon,
  isActive,
  isCollapsed,
}: SidebarNavItemProps) {
  const link = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
        isCollapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-2.5',
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{name}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

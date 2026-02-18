import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-400' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
};

const SIZE_MAP = {
  sm: { container: 'p-2', icon: 'h-4 w-4' },
  md: { container: 'p-3', icon: 'h-6 w-6' },
  lg: { container: 'p-4', icon: 'h-8 w-8' },
  xl: { container: 'p-6', icon: 'h-12 w-12' },
};

interface IconBadgeProps {
  icon: LucideIcon;
  color?: string;
  variant?: 'soft' | 'empty-state';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function IconBadge({
  icon: Icon,
  color = 'blue',
  variant = 'soft',
  size = 'md',
  className,
}: IconBadgeProps) {
  const colors = COLOR_MAP[color] ?? COLOR_MAP.blue;
  const sizeConfig = SIZE_MAP[size];

  if (variant === 'empty-state') {
    const emptyColors = color === 'gray' ? colors : (COLOR_MAP[color] ?? COLOR_MAP.gray);
    return (
      <div
        className={cn(
          'rounded-full mx-auto mb-4 flex items-center justify-center',
          SIZE_MAP.xl.container,
          emptyColors.bg,
          className,
        )}
      >
        <Icon className={cn(SIZE_MAP.xl.icon, emptyColors.text)} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizeConfig.container,
        colors.bg,
        className,
      )}
    >
      <Icon className={cn(sizeConfig.icon, colors.text)} />
    </div>
  );
}

import { getPlatform } from '@/data/platforms';
import type { Platform } from '@/types';
import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'xs' | 'sm' | 'md';
  showName?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { dot: 'w-4 h-4 text-[10px]', text: 'text-[10px]' },
  sm: { dot: 'w-5 h-5 text-[11px]', text: 'text-xs' },
  md: { dot: 'w-7 h-7 text-sm', text: 'text-sm' },
};

export default function PlatformBadge({
  platform,
  size = 'sm',
  showName = false,
  className,
}: PlatformBadgeProps) {
  const meta = getPlatform(platform);
  const sizes = SIZE_MAP[size];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-md font-bold text-white shadow-md',
          sizes.dot
        )}
        style={{
          background: meta.gradient,
          boxShadow: `0 0 8px ${meta.color}66`,
        }}
      >
        {meta.logo}
      </div>
      {showName && (
        <span className={cn('font-medium text-white/80', sizes.text)}>{meta.shortName}</span>
      )}
    </div>
  );
}

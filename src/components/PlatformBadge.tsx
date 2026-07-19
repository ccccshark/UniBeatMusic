import type { Platform } from '@/types';
import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'xs' | 'sm' | 'md';
  showName?: boolean;
  className?: string;
}

const PLATFORM_INFO: Record<Platform, { name: string; short: string; color: string; gradient: string }> = {
  kw: { name: '酷我音乐', short: '酷我', color: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' },
  kg: { name: '酷狗音乐', short: '酷狗', color: '#4ECDC4', gradient: 'linear-gradient(135deg, #4ECDC4, #44A08D)' },
  tx: { name: 'QQ音乐', short: 'QQ', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
  wy: { name: '网易云音乐', short: '网易', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
  mg: { name: '咪咕音乐', short: '咪咕', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  local: { name: '本地音乐', short: '本地', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
};

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
  const info = PLATFORM_INFO[platform] || PLATFORM_INFO.wy;
  const sizes = SIZE_MAP[size];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-md font-bold text-white shadow-md',
          sizes.dot
        )}
        style={{
          background: info.gradient,
          boxShadow: `0 0 8px ${info.color}66`,
        }}
      >
        {info.short.charAt(0)}
      </div>
      {showName && (
        <span className={cn('font-medium text-white/80', sizes.text)}>{info.short}</span>
      )}
    </div>
  );
}

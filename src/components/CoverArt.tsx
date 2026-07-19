import { useMemo } from 'react';
import type { CoverColors } from '@/types';
import { cn } from '@/lib/utils';

interface CoverArtProps {
  colors: CoverColors;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  showText?: boolean;
  shape?: 'square' | 'circle';
}

const SIZE_MAP = {
  sm: 'w-12 h-12 text-sm rounded-md',
  md: 'w-20 h-20 text-base rounded-lg',
  lg: 'w-32 h-32 text-xl rounded-xl',
  xl: 'w-48 h-48 text-2xl rounded-2xl',
  full: 'w-full h-full text-4xl rounded-2xl',
};

// 程序化生成封面：渐变 + 几何图形 + 标题首字
export default function CoverArt({
  colors,
  title = '',
  size = 'md',
  className,
  showText = true,
  shape = 'square',
}: CoverArtProps) {
  // 用标题做种子，生成稳定的几何图案
  const pattern = useMemo(() => {
    const seed = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rotate = seed % 360;
    const blobX = 20 + (seed % 50);
    const blobY = 30 + ((seed * 7) % 40);
    const ringSize = 30 + ((seed * 3) % 25);
    return { rotate, blobX, blobY, ringSize };
  }, [title]);

  const firstChar = title.charAt(0) || '♪';

  return (
    <div
      className={cn(
        'relative overflow-hidden flex items-center justify-center',
        SIZE_MAP[size],
        shape === 'circle' && 'rounded-full',
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
      }}
    >
      {/* 装饰圆 */}
      <div
        className="absolute rounded-full opacity-40 mix-blend-screen"
        style={{
          width: `${pattern.ringSize * 2}%`,
          height: `${pattern.ringSize * 2}%`,
          left: `${pattern.blobX}%`,
          top: `${pattern.blobY}%`,
          background: colors.accent,
          filter: 'blur(8px)',
        }}
      />
      {/* 几何环 */}
      <div
        className="absolute rounded-full border-2 opacity-30"
        style={{
          width: `${pattern.ringSize * 3}%`,
          height: `${pattern.ringSize * 3}%`,
          borderColor: colors.accent,
          transform: `rotate(${pattern.rotate}deg)`,
        }}
      />
      {/* 网格 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />
      {/* 标题首字 */}
      {showText && (
        <span
          className="relative z-10 font-bold text-white"
          style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            fontSize: size === 'full' ? '5rem' : size === 'xl' ? '2.5rem' : size === 'lg' ? '1.75rem' : size === 'md' ? '1.2rem' : '0.9rem',
          }}
        >
          {firstChar}
        </span>
      )}
      {/* 高光 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
        }}
      />
    </div>
  );
}

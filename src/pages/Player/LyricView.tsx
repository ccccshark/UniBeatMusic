import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { LyricLine } from '@/types';
import { cn } from '@/lib/utils';

interface LyricViewProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek?: (time: number) => void;
  className?: string;
}

// 椒盐风格歌词视图：高对比度层级，无霓虹光晕
export default function LyricView({ lyrics, currentTime, onSeek, className }: LyricViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 找到当前歌词索引
  const activeIdx = lyrics.reduce((acc, line, idx) => {
    if (line.time <= currentTime) return idx;
    return acc;
  }, -1);

  // 自动滚动到当前歌词
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-lyric-idx="${activeIdx}"]`) as HTMLElement;
    if (activeEl) {
      const containerRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const offset = elRect.top - containerRect.top - containerRect.height / 2 + elRect.height / 2;
      container.scrollBy({ top: offset, behavior: 'smooth' });
    }
  }, [activeIdx]);

  if (lyrics.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-white/40 text-sm', className)}>
        暂无歌词
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-y-auto no-scrollbar px-6 py-12 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]',
        className
      )}
    >
      <div className="space-y-4 min-h-full flex flex-col justify-center">
        {lyrics.map((line, idx) => {
          const active = idx === activeIdx;
          const distance = Math.abs(idx - activeIdx);
          return (
            <motion.button
              key={idx}
              data-lyric-idx={idx}
              onClick={() => onSeek?.(line.time)}
              className={cn(
                'text-center font-medium transition-all duration-300 cursor-pointer',
                active
                  ? 'text-white text-xl scale-105'
                  : distance === 1
                  ? 'text-white/55 text-base'
                  : 'text-white/25 text-sm'
              )}
              animate={{
                opacity: active ? 1 : Math.max(0.2, 1 - distance * 0.25),
              }}
            >
              {line.text}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Disc3 } from 'lucide-react';
import { useState } from 'react';
import type { Track } from '@/types';
import PlatformBadge from '@/components/PlatformBadge';

interface VinylDiscProps {
  track: Track;
  isPlaying: boolean;
  size?: number;
}

// 3D 旋转唱片
export default function VinylDisc({ track, isPlaying, size = 280 }: VinylDiscProps) {
  const [coverError, setCoverError] = useState(false);
  const showCover = track.coverUrl && !coverError;

  return (
    <div
      className="relative"
      style={{ width: size, height: size, perspective: '800px' }}
    >
      {/* 外层光晕 */}
      <motion.div
        className="absolute -inset-8 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${track.coverColors.accent}66 0%, transparent 70%)`,
        }}
        animate={{ opacity: isPlaying ? [0.4, 0.7, 0.4] : 0.3 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* 唱片主体 */}
      <motion.div
        className="relative w-full h-full rounded-full"
        style={{
          transformStyle: 'preserve-3d',
          background: `
            radial-gradient(circle at 50% 50%, ${track.coverColors.from} 0%, ${track.coverColors.to} 30%, #0A0E1A 60%, #1a1a1a 100%)
          `,
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.5), 0 0 40px ${track.coverColors.accent}44`,
        }}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{
          duration: 20,
          repeat: isPlaying ? Infinity : 0,
          ease: 'linear',
        }}
      >
        {/* 同心圆纹理 */}
        {[0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map((scale, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/5"
            style={{
              width: `${scale * 100}%`,
              height: `${scale * 100}%`,
              top: `${(1 - scale) * 50}%`,
              left: `${(1 - scale) * 50}%`,
            }}
          />
        ))}

        {/* 反光高光 */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.3) 100%)',
          }}
        />

        {/* 中心标签（显示真实封面或程序化封面） */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center overflow-hidden"
          style={{
            width: '38%',
            height: '38%',
            background: showCover
              ? 'transparent'
              : `linear-gradient(135deg, ${track.coverColors.from} 0%, ${track.coverColors.accent} 100%)`,
            boxShadow: `0 0 20px ${track.coverColors.accent}66, inset 0 0 10px rgba(0,0,0,0.3)`,
          }}
        >
          {showCover ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              onError={() => setCoverError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <span className="font-display font-bold text-white text-xl drop-shadow-lg">
                {track.title.charAt(0)}
              </span>
              <span className="text-[8px] text-white/80 mt-0.5 tracking-wider">{track.artist}</span>
            </>
          )}
        </div>

        {/* 中心轴孔 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-space-900 border border-white/20" />
      </motion.div>

      {/* 唱针 */}
      <motion.div
        className="absolute -top-4 -right-4 origin-top-right z-10"
        animate={{ rotate: isPlaying ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 shadow-lg flex items-center justify-center">
            <Disc3 className="w-5 h-5 text-zinc-700" />
          </div>
          <div className="absolute top-1/2 left-1/2 w-1 h-24 bg-gradient-to-b from-zinc-300 to-zinc-500 origin-top rotate-45 rounded-full shadow-md" />
        </div>
      </motion.div>

      {/* 平台徽章浮标 */}
      <div className="absolute -bottom-2 -right-2 z-10">
        <PlatformBadge platform={track.platform} size="md" showName />
      </div>
    </div>
  );
}

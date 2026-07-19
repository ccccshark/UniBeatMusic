import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Track } from '@/types';

interface VinylDiscProps {
  track: Track;
  isPlaying: boolean;
  size?: number;
}

// 椒盐风格唱片：以圆角方形封面为核心，外圈是黑胶唱片纹理
export default function VinylDisc({ track, isPlaying, size = 280 }: VinylDiscProps) {
  const [coverError, setCoverError] = useState(false);
  const showCover = track.coverUrl && !coverError;
  const coverSize = Math.floor(size * 0.7);
  const coverOffset = (size - coverSize) / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 外层柔光 */}
      <motion.div
        className="absolute -inset-6 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${track.coverColors.accent}55 0%, transparent 70%)`,
        }}
        animate={{ opacity: isPlaying ? [0.4, 0.65, 0.4] : 0.3 }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* 黑胶唱片主体（旋转） */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, #2A2D34 0%, #1A1D24 40%, #0F1115 70%, #1a1a1a 100%)
          `,
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.5), 0 0 30px ${track.coverColors.accent}33`,
        }}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{
          duration: 24,
          repeat: isPlaying ? Infinity : 0,
          ease: 'linear',
        }}
      >
        {/* 同心圆纹理（黑胶纹路） */}
        {[0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map((scale, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/4"
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
          className="absolute inset-0 rounded-full opacity-25"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        {/* 中心圆孔 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-salt-bg border border-white/15" />
      </motion.div>

      {/* 中央圆角方形封面（椒盐风格特征 - 不旋转，浮于唱片之上） */}
      <div
        className="absolute rounded-2xl overflow-hidden shadow-xl"
        style={{
          width: coverSize,
          height: coverSize,
          top: coverOffset,
          left: coverOffset,
          background: showCover
            ? 'transparent'
            : `linear-gradient(135deg, ${track.coverColors.from} 0%, ${track.coverColors.to} 100%)`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)`,
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
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
            <span className="font-bold text-white text-2xl drop-shadow-lg">
              {track.title.charAt(0)}
            </span>
            <span className="text-[9px] text-white/75 mt-1 tracking-wider line-clamp-2">
              {track.artist}
            </span>
          </div>
        )}
        {/* 高光遮罩 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </div>
    </div>
  );
}

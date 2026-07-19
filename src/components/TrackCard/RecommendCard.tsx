import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Play, MoreVertical } from 'lucide-react';
import type { Track } from '@/types';
import PlatformBadge from '@/components/PlatformBadge';
import CoverArt from '@/components/CoverArt';
import { formatPlayCount } from '@/lib/format';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';

interface RecommendCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onOpenPlayer: (track: Track) => void;
}

export default function RecommendCard({ track, onPlay, onOpenPlayer }: RecommendCardProps) {
  const { isLiked, toggleLike } = useUserStore();
  const liked = isLiked(track.id);

  return (
    <div
      className="snap-item relative w-full h-full shrink-0 overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${track.coverColors.from} 0%, ${track.coverColors.to} 60%, #0A0E1A 100%)` }}
    >
      {/* 装饰几何 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-30 blur-3xl"
          style={{ background: track.coverColors.accent }}
        />
        <div className="absolute inset-0 grid-bg opacity-20" />
        {/* 扫描线 */}
        <div className="absolute inset-x-0 top-0 h-32 scan-line opacity-40 animate-scan" />
      </div>

      {/* 顶部平台标识 */}
      <div className="absolute top-16 left-4 right-4 flex items-center justify-between z-20">
        <PlatformBadge platform={track.platform} size="md" showName />
        <div className="glass px-2.5 py-1 rounded-full text-[10px] text-white/80 font-mono">
          {track.releaseYear} · {formatPlayCount(track.playCount)} 次播放
        </div>
      </div>

      {/* 中央封面 */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
          onClick={() => onOpenPlayer(track)}
        >
          <CoverArt
            colors={track.coverColors}
            coverUrl={track.coverUrl}
            title={track.title}
            size="xl"
            className="shadow-2xl cursor-pointer hover:scale-105 transition-transform"
            shape="circle"
          />
          {/* 旋转环 */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-spin-slower pointer-events-none" />
          <div className="absolute -inset-3 rounded-full border border-white/10 animate-spin-slow pointer-events-none" />

          {/* 播放按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition-transform shadow-neon-cyan"
          >
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </button>
        </motion.div>
      </div>

      {/* 底部信息 + 互动栏 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-20 pt-32 bg-gradient-to-t from-space-900 via-space-900/80 to-transparent">
        <div className="flex items-end gap-3 px-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate drop-shadow-lg">
              {track.title}
            </h2>
            <p className="text-sm text-white/70 mt-1 truncate">{track.artist} · {track.album}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full glass text-white/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧互动栏 */}
          <div className="flex flex-col items-center gap-4 pb-1">
            <button
              onClick={() => toggleLike(track.id)}
              className="flex flex-col items-center gap-0.5 group"
            >
              <motion.div
                whileTap={{ scale: 1.4 }}
                className={cn(
                  'w-11 h-11 rounded-full glass flex items-center justify-center transition-colors',
                  liked ? 'text-neon-pink' : 'text-white group-hover:text-neon-pink'
                )}
              >
                <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
              </motion.div>
              <span className="text-[10px] text-white/70">
                {formatPlayCount(track.likeCount + (liked ? 1 : 0))}
              </span>
            </button>

            <button className="flex flex-col items-center gap-0.5 group">
              <div className="w-11 h-11 rounded-full glass flex items-center justify-center text-white group-hover:text-neon-cyan">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-white/70">{formatPlayCount(track.playCount / 8)}</span>
            </button>

            <button className="flex flex-col items-center gap-0.5 group">
              <div className="w-11 h-11 rounded-full glass flex items-center justify-center text-white group-hover:text-neon-cyan">
                <Bookmark className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-white/70">收藏</span>
            </button>

            <button className="flex flex-col items-center gap-0.5 group">
              <div className="w-11 h-11 rounded-full glass flex items-center justify-center text-white group-hover:text-neon-cyan">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-white/70">分享</span>
            </button>

            <button className="w-11 h-11 rounded-full glass flex items-center justify-center text-white/70 hover:text-white">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

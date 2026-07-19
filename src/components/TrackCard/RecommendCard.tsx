import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Play, MoreVertical } from 'lucide-react';
import type { Track } from '@/types';
import CoverArt from '@/components/CoverArt';
import { formatPlayCount } from '@/lib/format';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';

interface RecommendCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onOpenPlayer: (track: Track) => void;
}

// 椒盐风格推荐卡片：基于封面色的流光背景 + 简洁的互动栏
export default function RecommendCard({ track, onPlay, onOpenPlayer }: RecommendCardProps) {
  const { isLiked, toggleLike } = useUserStore();
  const liked = isLiked(track.id);

  return (
    <div
      className="snap-item relative w-full h-full shrink-0 overflow-hidden bg-salt-bg"
      style={{
        // 椒盐风格：基于封面色的流光渐变背景
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, ${track.coverColors.from}55 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 90% 90%, ${track.coverColors.to}44 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 50%, ${track.coverColors.accent}22 0%, transparent 60%),
          linear-gradient(180deg, #0F1115 0%, #14171D 100%)
        `,
      }}
    >
      {/* 顶部柔和高光 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full blur-[100px] opacity-30"
          style={{ background: track.coverColors.from }}
        />
      </div>

      {/* 中央封面区 - 椒盐风格大封面 + 圆形旋转 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          className="relative cursor-pointer"
          onClick={() => onOpenPlayer(track)}
        >
          {/* 外层柔光环 */}
          <div
            className="absolute -inset-6 rounded-full blur-2xl opacity-50"
            style={{ background: `radial-gradient(circle, ${track.coverColors.accent}66 0%, transparent 70%)` }}
          />

          {/* 封面主体 - 圆角方形（椒盐风格特征） */}
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            <CoverArt
              colors={track.coverColors}
              coverUrl={track.coverUrl}
              title={track.title}
              size="full"
              className="w-full h-full rounded-3xl shadow-xl"
              shape="square"
            />

            {/* 高光遮罩 */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.25) 100%)',
            }} />

            {/* 播放按钮 - 浮于封面中心 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(track);
              }}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:bg-white/25 transition-all shadow-lg border border-white/20"
            >
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 顶部信息条 - 椒盐风格简洁 */}
      <div className="absolute top-20 left-5 right-5 z-20 flex items-center justify-between">
        <span
          className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/8 backdrop-blur-md text-white/80 border border-white/10"
        >
          {track.tags[0] || '推荐'}
        </span>
        <span className="text-[10px] text-white/45 font-mono">
          {track.releaseYear} · {formatPlayCount(track.playCount)} 次播放
        </span>
      </div>

      {/* 底部信息 + 互动栏 - 椒盐风格 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-24 pt-32 bg-gradient-to-t from-salt-bg via-salt-bg/90 to-transparent">
        <div className="flex items-end gap-4 px-5">
          {/* 左侧歌曲信息 */}
          <div className="flex-1 min-w-0">
            <motion.h2
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white truncate"
            >
              {track.title}
            </motion.h2>
            <p className="text-sm text-white/65 mt-1 truncate">
              {track.artist}
            </p>
            <p className="text-xs text-white/40 mt-0.5 truncate">
              {track.album}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {track.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/65 border border-white/8"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧互动栏 - 椒盐风格垂直排列 */}
          <div className="flex flex-col items-center gap-4 pb-1">
            <ActionButton
              onClick={() => toggleLike(track.id)}
              active={liked}
              activeColor="text-salt-accent"
              count={formatPlayCount(track.likeCount + (liked ? 1 : 0))}
            >
              <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
            </ActionButton>

            <ActionButton count={formatPlayCount(track.playCount / 8)}>
              <MessageCircle className="w-5 h-5" />
            </ActionButton>

            <ActionButton>
              <Bookmark className="w-5 h-5" />
            </ActionButton>

            <ActionButton>
              <Share2 className="w-5 h-5" />
            </ActionButton>

            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/55 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 底部细微分隔线 */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/15" />
    </div>
  );
}

// 互动按钮子组件 - 椒盐风格
function ActionButton({
  children,
  onClick,
  active,
  activeColor = 'text-salt-primary',
  count,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
  count?: string;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 group">
      <motion.div
        whileTap={{ scale: 1.35 }}
        className={cn(
          'w-10 h-10 rounded-full bg-white/8 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors',
          active
            ? activeColor
            : 'text-white/75 group-hover:text-white'
        )}
      >
        {children}
      </motion.div>
      {count && <span className="text-[10px] text-white/55">{count}</span>}
    </button>
  );
}

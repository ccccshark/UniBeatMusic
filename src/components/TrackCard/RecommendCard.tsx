import { Heart, Play, MoreVertical } from 'lucide-react';
import type { Track } from '@/types';
import { getTrackTitle, getTrackArtist, getTrackCover, getTrackCoverColors } from '@/lib/trackUtils';
import { getTrackDuration } from '@/lib/trackUtils';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';

interface RecommendCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onClick?: () => void;
}

export default function RecommendCard({ track, onPlay, onClick }: RecommendCardProps) {
  const { isLiked, toggleLike } = useUserStore();
  const liked = isLiked(track.id);

  const title = getTrackTitle(track);
  const artist = getTrackArtist(track);
  const cover = getTrackCover(track);
  const coverColors = getTrackCoverColors(track);
  const duration = getTrackDuration(track);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onClick}
      style={{
        background: `
          linear-gradient(135deg, ${coverColors.from}22 0%, ${coverColors.to}22 100%),
          rgba(255,255,255,0.04)
        `,
      }}
    >
      <div className="p-3 flex items-center gap-3">
        {/* 封面 + 播放按钮 */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden shadow-lg"
            style={{ backgroundColor: coverColors.from }}
          >
            {cover ? (
              <img
                src={cover}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-6 h-6 text-white/30" />
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl active:scale-90 transition-transform"
          >
            <div className="w-9 h-9 rounded-full bg-salt-primary flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
            </div>
          </button>
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          <p className="text-xs text-white/60 mt-0.5 truncate">{artist}</p>
          <p className="text-xs text-white/40 mt-0.5">{formatDuration(duration)}</p>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track.id);
            }}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform',
              liked ? 'text-salt-accent' : 'text-white/50'
            )}
          >
            <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 active:scale-90 transition-transform"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

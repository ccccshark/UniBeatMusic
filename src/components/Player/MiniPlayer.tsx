import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, ChevronUp, Loader2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import CoverArt from '@/components/CoverArt';
import PlatformBadge from '@/components/PlatformBadge';
import { formatDuration } from '@/lib/format';
import { getTrackTitle, getTrackArtist, getTrackCoverColors } from '@/lib/trackUtils';

interface MiniPlayerProps {
  loading?: boolean;
}

export default function MiniPlayer({ loading = false }: MiniPlayerProps) {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    next,
  } = usePlayerStore();

  if (!currentTrack) return null;

  const progress = duration > 0 ? currentTime / duration : 0;
  const title = getTrackTitle(currentTrack);
  const artist = getTrackArtist(currentTrack);
  const coverColors = getTrackCoverColors(currentTrack);

  const openFullPlayer = () => {
    navigate(`/player/${currentTrack.id}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-16 left-2 right-2 z-30 mx-auto max-w-md"
      >
        <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* 进度条 */}
          <div className="h-0.5 bg-white/10 relative">
            <motion.div
              className="h-full bg-gradient-flow"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-3 p-2.5">
            {/* 封面 */}
            <button
              onClick={openFullPlayer}
              className="relative shrink-0 group"
            >
              <CoverArt
                colors={coverColors}
                title={title}
                size="md"
                className={isPlaying ? 'animate-spin-slow' : ''}
                shape="square"
              />
              <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ChevronUp className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* 信息 */}
            <button
              onClick={openFullPlayer}
              className="flex-1 min-w-0 text-left"
            >
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white truncate">{title}</p>
                <PlatformBadge platform={currentTrack.platform} size="xs" />
              </div>
              <p className="text-xs text-white/60 truncate">
                {artist} · {formatDuration(currentTime)} / {formatDuration(duration)}
              </p>
            </button>

            {/* 控制 */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-white hover:text-salt-accent hover:bg-white/10 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-salt-accent" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-white hover:text-salt-accent hover:bg-white/10 transition-colors"
              >
                <SkipForward className="w-4 h-4" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

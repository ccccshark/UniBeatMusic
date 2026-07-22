import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, ChevronUp, Loader2, Music } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { getTrackTitle, getTrackArtist, getTrackCoverColors } from '@/lib/trackUtils';
import { cn } from '@/lib/utils';

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
        className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-2 right-2 z-40 mx-auto max-w-md"
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
            {/* 播放图标 - 不再显示封面 */}
            <button
              onClick={openFullPlayer}
              className="relative shrink-0"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: coverColors.from + '40' }}
              >
                {isPlaying ? (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center gap-0.5"
                  >
                    <motion.div
                      animate={{ height: ['60%', '100%', '60%'] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-1 bg-salt-primary rounded-full"
                      style={{ height: '60%' }}
                    />
                    <motion.div
                      animate={{ height: ['80%', '40%', '80%'] }}
                      transition={{ duration: 0.4, repeat: Infinity }}
                      className="w-1 bg-salt-primary rounded-full"
                      style={{ height: '80%' }}
                    />
                    <motion.div
                      animate={{ height: ['40%', '90%', '40%'] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-1 bg-salt-primary rounded-full"
                      style={{ height: '40%' }}
                    />
                  </motion.div>
                ) : (
                  <Music className="w-5 h-5 text-white/70" />
                )}
              </div>
            </button>

            {/* 信息 */}
            <button
              onClick={openFullPlayer}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-semibold text-white truncate">{title}</p>
              <p className="text-xs text-white/60 truncate">
                {artist} · {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
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

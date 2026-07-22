import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music, Sparkles, TrendingUp, Clock, Play, SkipForward } from 'lucide-react';
import { TopBar } from '@/components/Layout/AppLayout';
import RecommendCard from '@/components/TrackCard/RecommendCard';
import { recommendApi } from '@/services/musicApi';
import { usePlayerStore } from '@/store/playerStore';
import { getTrackTitle, getTrackArtist, getTrackCover } from '@/lib/trackUtils';
import type { Track } from '@/types';
import { cn } from '@/lib/utils';

export default function Recommend() {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, playlist } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    recommendApi.getRecommendTracks(30).then((data) => {
      if (cancelled) return;
      setTracks(data);
      setLoading(false);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePlay = (track: Track) => {
    playTrack(track, tracks);
  };

  const handleOpenPlayer = (track: Track) => {
    playTrack(track, tracks);
    navigate(`/player/${track.id}`);
  };

  const handlePlayNext = () => {
    if (currentTrack && playlist.length > 0) {
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
      const nextTrack = playlist[(currentIndex + 1) % playlist.length];
      playTrack(nextTrack, playlist);
    }
  };

  return (
    <div>
      <TopBar
        title="UniBeat"
        subtitle="音乐聚合播放器"
      />

      {/* 当前播放条 */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 glass-strong rounded-xl p-3 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/player/${currentTrack.id}`)}
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
            <img src={getTrackCover(currentTrack)} alt="" className="w-full h-full object-cover" />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Play className="w-3 h-3 text-white ml-0.5" />
                </motion.div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{getTrackTitle(currentTrack)}</h4>
            <p className="text-xs text-white/50 truncate">{getTrackArtist(currentTrack)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayNext();
              }}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-salt-primary/20"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 每日推荐入口 */}
      {tracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-6"
        >
          <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-salt-primary/30 via-purple-500/20 to-salt-accent/30">
            <div className="absolute inset-0 flex flex-col items-start justify-end p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-white/70">每日推荐</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">为你精选</h3>
              <p className="text-xs text-white/60">{tracks.length}首好歌</p>
            </div>
            <button
              onClick={() => handlePlay(tracks[0])}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20"
            >
              <Play className="w-5 h-5 text-white ml-0.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 快捷功能 */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, label: '热门', color: 'text-red-400', bg: 'bg-red-400/20' },
            { icon: Sparkles, label: '推荐', color: 'text-blue-400', bg: 'bg-blue-400/20' },
            { icon: Clock, label: '历史', color: 'text-green-400', bg: 'bg-green-400/20' },
            { icon: Music, label: '歌单', color: 'text-purple-400', bg: 'bg-purple-400/20' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', item.bg)}>
                  <Icon className={cn('w-6 h-6', item.color)} />
                </div>
                <span className="text-xs text-white/70">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 推荐歌单 */}
      <div className="px-4 pb-32">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">推荐歌单</h2>
          <button className="text-sm text-white/50 hover:text-white/80">查看更多</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-salt-primary" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/55">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-3">
              <Music className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-sm">暂无推荐内容</p>
            <p className="text-xs text-white/40">请添加音源后重试</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3 max-w-2xl mx-auto">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25, delay: index * 0.03 }}
                >
                  <RecommendCard
                    track={track}
                    onPlay={() => handlePlay(track)}
                    onClick={() => handleOpenPlayer(track)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

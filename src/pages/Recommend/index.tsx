import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music } from 'lucide-react';
import AppLayout, { TopBar } from '@/components/Layout/AppLayout';
import RecommendCard from '@/components/TrackCard/RecommendCard';
import { recommendApi } from '@/services/musicApi';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/types';

export default function Recommend() {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
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

  return (
    <AppLayout>
      <TopBar
        title="UniBeat"
        subtitle="音乐聚合播放器"
      />

      {/* 卡片流容器 */}
      <div
        ref={containerRef}
        className="snap-container h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-4"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/55">
            <Loader2 className="w-7 h-7 animate-spin text-salt-primary" />
            <p className="text-xs">正在加载推荐...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/55">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center">
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
    </AppLayout>
  );
}

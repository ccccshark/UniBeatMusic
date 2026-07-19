import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AppLayout, { TopBar } from '@/components/Layout/AppLayout';
import RecommendCard from '@/components/TrackCard/RecommendCard';
import { mockApi } from '@/services/mockApi';
import { usePlayerStore } from '@/store/playerStore';
import { hasActiveSource } from '@/services/musicApi';
import type { Track, FeedFilter } from '@/types';
import { cn } from '@/lib/utils';

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'netease', label: '网易云' },
  { key: 'qq', label: 'QQ' },
  { key: 'qishui', label: '汽水' },
];

export default function Recommend() {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const hasSource = hasActiveSource();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    mockApi.getRecommendFeed(filter).then((data) => {
      if (cancelled) return;
      setTracks(data);
      setLoading(false);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filter]);

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
        subtitle="沉浸式音乐聚合"
      />

      {/* 平台筛选器 - 椒盐风格胶囊 */}
      <div className="sticky top-[64px] z-20 glass border-b border-white/[0.04] px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'relative px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  active ? 'text-white' : 'text-white/55 hover:text-white/80'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="filter-active"
                    className="absolute inset-0 rounded-full bg-gradient-flow shadow-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 卡片流容器 */}
      <div
        ref={containerRef}
        className="snap-container h-[calc(100vh-152px)] overflow-y-auto overflow-x-hidden no-scrollbar"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/55">
            <Loader2 className="w-7 h-7 animate-spin text-salt-primary" />
            <p className="text-xs">正在聚合推荐流...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tracks.map((track) => (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="h-[calc(100vh-152px)] w-full snap-item"
              >
                <RecommendCard
                  track={track}
                  onPlay={handlePlay}
                  onOpenPlayer={handleOpenPlayer}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* 空态 */}
        {!loading && tracks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-white/55 mb-2">该平台暂无推荐内容</p>
            {!hasSource && (
              <button
                onClick={() => navigate('/music-source')}
                className="text-xs text-salt-primary hover:underline"
              >
                去配置音源 →
              </button>
            )}
          </div>
        )}

        <div className="h-32" />
      </div>
    </AppLayout>
  );
}

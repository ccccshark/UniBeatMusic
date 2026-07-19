import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Volume2 } from 'lucide-react';
import AppLayout, { TopBar } from '@/components/Layout/AppLayout';
import RecommendCard from '@/components/TrackCard/RecommendCard';
import PlatformBadge from '@/components/PlatformBadge';
import { mockApi } from '@/services/mockApi';
import { usePlayerStore } from '@/store/playerStore';
import { PLATFORM_LIST } from '@/data/platforms';
import type { Track, FeedFilter } from '@/types';
import { cn } from '@/lib/utils';

const FILTERS: { key: FeedFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'qq', label: 'QQ音乐' },
  { key: 'netease', label: '网易云' },
  { key: 'qishui', label: '汽水' },
];

export default function Recommend() {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    mockApi.getRecommendFeed(filter).then((data) => {
      if (cancelled) return;
      setTracks(data);
      setLoading(false);
      // 回到顶部
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
      {/* 顶部栏 */}
      <TopBar
        title="UniBeat"
        subtitle="沉浸式音乐聚合"
        right={
          <button className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/70 hover:text-neon-cyan">
            <Volume2 className="w-4 h-4" />
          </button>
        }
      />

      {/* 平台筛选器 */}
      <div className="sticky top-[57px] z-20 glass border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'relative px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 glass'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="filter-active"
                    className="absolute inset-0 rounded-full bg-gradient-neon shadow-neon-purple"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {f.key !== 'all' && (
                    <PlatformBadge platform={f.key as any} size="xs" />
                  )}
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 卡片流容器 */}
      <div
        ref={containerRef}
        className="snap-container h-[calc(100vh-145px)] overflow-y-auto overflow-x-hidden no-scrollbar"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/60">
            <Loader2 className="w-7 h-7 animate-spin text-neon-cyan" />
            <p className="text-xs">正在聚合推荐流...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tracks.map((track, idx) => (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.04, type: 'spring', stiffness: 200, damping: 25 }}
                className="h-[calc(100vh-145px)] w-full snap-item"
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
          <div className="h-full flex flex-col items-center justify-center text-white/50">
            <p>该平台暂无推荐内容</p>
          </div>
        )}

        {/* 底部空间 */}
        <div className="h-32" />
      </div>

      {/* 侧边平台指示器（桌面） */}
      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-20 flex-col gap-2">
        {PLATFORM_LIST.map((p) => (
          <button
            key={p.code}
            onClick={() => setFilter(p.code)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              filter === p.code ? 'scale-150' : 'opacity-40 hover:opacity-80'
            )}
            style={{
              background: p.color,
              boxShadow: filter === p.code ? `0 0 8px ${p.color}` : 'none',
            }}
            title={p.name}
          />
        ))}
      </div>
    </AppLayout>
  );
}

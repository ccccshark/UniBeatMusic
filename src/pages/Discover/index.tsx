import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Play, Search, TrendingUp } from 'lucide-react';
import AppLayout, { TopBar } from '@/components/Layout/AppLayout';
import { usePlayerStore } from '@/store/playerStore';
import { recommendApi } from '@/services/musicApi';
import { getTrackTitle, getTrackArtist, getTrackCover, getTrackCoverColors } from '@/lib/trackUtils';
import type { Track } from '@/types';
import { cn } from '@/lib/utils';

export default function Discover() {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const [hotTracks, setHotTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    recommendApi.getRecommendTracks(20).then((tracks) => {
      if (cancelled) return;
      setHotTracks(tracks);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePlayTrack = (track: Track) => {
    playTrack(track, hotTracks);
  };

  return (
    <AppLayout>
      <TopBar
        title="发现"
        subtitle="发现好音乐"
      />

      {/* 搜索入口 */}
      <div className="px-4 py-3">
        <button
          onClick={() => navigate('/search')}
          className="w-full h-11 px-4 rounded-full glass flex items-center gap-3 text-white/55 hover:text-white/80 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-sm">搜索歌曲、歌手、专辑</span>
        </button>
      </div>

      <div className="px-4 pb-32">
        {/* 热门推荐 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-salt-primary" />
            <h2 className="text-lg font-bold text-white">热门推荐</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-white/55" />
            </div>
          ) : hotTracks.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-sm">
              暂无推荐内容，请先添加音源
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {hotTracks.map((track, index) => {
                const title = getTrackTitle(track);
                const artist = getTrackArtist(track);
                const cover = getTrackCover(track);
                const coverColors = getTrackCoverColors(track);

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="relative rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div
                      className="aspect-square w-full"
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
                          <Play className="w-8 h-8 text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
                      <p className="text-xs text-white/60 truncate mt-0.5">{artist}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(track);
                      }}
                      className={cn(
                        'absolute bottom-3 right-3 w-10 h-10 rounded-full bg-salt-primary flex items-center justify-center shadow-lg',
                        'opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0'
                      )}
                    >
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

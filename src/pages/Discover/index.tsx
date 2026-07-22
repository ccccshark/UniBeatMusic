import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Search, TrendingUp, Clock, Disc, Radio, Headphones, Flame, Star, Music } from 'lucide-react';
import { TopBar } from '@/components/Layout/AppLayout';
import { usePlayerStore } from '@/store/playerStore';
import { recommendApi } from '@/services/musicApi';
import { getTrackTitle, getTrackArtist, getTrackCover, getTrackCoverColors } from '@/lib/trackUtils';
import type { Track } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { icon: Flame, label: '热歌榜', color: 'text-red-400', bg: 'bg-red-400/20' },
  { icon: Star, label: '飙升榜', color: 'text-orange-400', bg: 'bg-orange-400/20' },
  { icon: Disc, label: '新歌榜', color: 'text-blue-400', bg: 'bg-blue-400/20' },
  { icon: Radio, label: '电台', color: 'text-purple-400', bg: 'bg-purple-400/20' },
  { icon: Headphones, label: '歌单', color: 'text-green-400', bg: 'bg-green-400/20' },
  { icon: Clock, label: '历史', color: 'text-gray-400', bg: 'bg-gray-400/20' },
];

const BANNERS = [
  { id: 1, title: '夏日清凉歌单', desc: '30首消暑必备', color: 'from-blue-500/30 to-cyan-500/30' },
  { id: 2, title: '华语金曲回顾', desc: '重温经典旋律', color: 'from-purple-500/30 to-pink-500/30' },
  { id: 3, title: '电子音乐之夜', desc: '燃爆全场节奏', color: 'from-orange-500/30 to-red-500/30' },
];

export default function Discover() {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const [hotTracks, setHotTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayTrack = (track: Track) => {
    playTrack(track, hotTracks);
  };

  return (
    <div>
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

      {/* 轮播 Banner */}
      <div className="px-4 mb-4">
        <div className="relative h-32 rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 bg-gradient-to-br ${BANNERS[bannerIndex].color} flex items-end p-4`}
            >
              <div>
                <h3 className="text-lg font-bold text-white">{BANNERS[bannerIndex].title}</h3>
                <p className="text-sm text-white/70">{BANNERS[bannerIndex].desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setBannerIndex(index)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  index === bannerIndex ? 'bg-white w-4' : 'bg-white/40'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 分类导航 */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-6 gap-3">
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', cat.bg)}>
                  <Icon className={cn('w-6 h-6', cat.color)} />
                </div>
                <span className="text-xs text-white/70">{cat.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-32 space-y-6">
        {/* 热门推荐 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-salt-primary" />
              <h2 className="text-lg font-bold text-white">热门推荐</h2>
            </div>
            <button className="text-sm text-white/50 hover:text-white/80">查看更多</button>
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
              {hotTracks.slice(0, 6).map((track, index) => {
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

        {/* 排行榜入口 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-salt-accent" />
              <h2 className="text-lg font-bold text-white">排行榜</h2>
            </div>
            <button className="text-sm text-white/50 hover:text-white/80">查看全部</button>
          </div>

          <div className="rounded-2xl glass-strong p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-white/55" />
              </div>
            ) : hotTracks.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">暂无数据</div>
            ) : (
              <div className="space-y-3">
                {hotTracks.slice(0, 3).map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold',
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'text-white/50'
                    )}>
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      {getTrackCover(track) ? (
                        <img src={getTrackCover(track)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <Music className="w-5 h-5 text-white/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{getTrackTitle(track)}</h4>
                      <p className="text-xs text-white/50 truncate">{getTrackArtist(track)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(track);
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-salt-primary/20"
                    >
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 猜你喜欢 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">猜你喜欢</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-white/55" />
            </div>
          ) : hotTracks.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">暂无数据</div>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {hotTracks.slice(4, 10).map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 w-24 cursor-pointer"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="relative rounded-xl overflow-hidden mb-2">
                    <div
                      className="aspect-square w-full"
                      style={{ backgroundColor: getTrackCoverColors(track).from }}
                    >
                      {getTrackCover(track) ? (
                        <img src={getTrackCover(track)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-salt-primary flex items-center justify-center">
                      <Play className="w-3 h-3 text-white ml-0.5" />
                    </div>
                  </div>
                  <p className="text-xs text-white/70 truncate">{getTrackTitle(track)}</p>
                  <p className="text-[10px] text-white/40 truncate">{getTrackArtist(track)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

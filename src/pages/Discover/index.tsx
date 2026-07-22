import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Search, TrendingUp, Clock, Disc, Radio, Headphones, Flame, Star, Music, X } from 'lucide-react';
import { TopBar } from '@/components/Layout/AppLayout';
import { usePlayerStore } from '@/store/playerStore';
import { searchApi, recommendApi, hasActiveSource } from '@/services/musicApi';
import { getTrackTitle, getTrackArtist, getTrackCover, getTrackCoverColors, getTrackDuration } from '@/lib/trackUtils';
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

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const result = await searchApi.search(query, 30);
      setSearchResults(result.tracks);
    } catch (e) {
      console.error('搜索失败:', e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    setHasSearched(false);
  };

  const handlePlayTrack = (track: Track, list?: Track[]) => {
    playTrack(track, list || hotTracks);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const sourceActive = hasActiveSource();

  return (
    <div>
      <TopBar
        title="发现"
        subtitle="发现好音乐"
      />

      {/* 搜索栏 */}
      <div className="px-4 py-3 sticky top-0 z-10">
        <div className="flex gap-2">
          <div className="flex-1 h-11 px-4 rounded-full glass flex items-center gap-3">
            <Search className="w-5 h-5 text-white/55 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setShowSearch(true)}
              placeholder="搜索歌曲、歌手、专辑"
              className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="shrink-0 text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showSearch && (
            <button
              onClick={handleSearch}
              className="px-4 h-11 rounded-full bg-salt-primary text-white text-sm font-medium shrink-0"
            >
              搜索
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      {showSearch && hasSearched ? (
        <div className="px-4 pb-32">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">
              搜索结果 {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>
            <button
              onClick={handleClearSearch}
              className="text-sm text-white/50 hover:text-white/80"
            >
              收起
            </button>
          </div>

          {searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-salt-primary" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-sm">
              <Music className="w-12 h-12 mx-auto mb-3 text-white/20" />
              未找到相关歌曲
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((track, index) => (
                <motion.div
                  key={`${track.id}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 cursor-pointer"
                  onClick={() => handlePlayTrack(track, searchResults)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
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
                    <p className="text-xs text-white/50 truncate">
                      {getTrackArtist(track)} · {formatDuration(getTrackDuration(track))}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track, searchResults);
                    }}
                    className="w-9 h-9 rounded-full bg-salt-primary/20 flex items-center justify-center shrink-0"
                  >
                    <Play className="w-4 h-4 text-salt-primary ml-0.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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
                    className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
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
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-white/55" />
                </div>
              ) : hotTracks.length === 0 ? (
                <div className="text-center py-12 text-white/40 text-sm">
                  <Music className="w-12 h-12 mx-auto mb-3 text-white/20" />
                  {sourceActive ? '暂无推荐内容' : '请先添加音源'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {hotTracks.slice(0, 6).map((track, index) => {
                    const title = getTrackTitle(track);
                    const artist = getTrackArtist(track);
                    const cover = getTrackCover(track);
                    const coverColors = getTrackCoverColors(track);

                    return (
                      <div
                        key={track.id}
                        className="relative rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
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
                              <Music className="w-8 h-8 text-white/30" />
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
                          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-salt-primary flex items-center justify-center shadow-lg"
                        >
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </button>
                      </div>
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
                      <div
                        key={track.id}
                        className="flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
                        onClick={() => handlePlayTrack(track)}
                      >
                        <span className={cn(
                          'w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
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
                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"
                        >
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </button>
                      </div>
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
                  {hotTracks.slice(4, 10).map((track) => (
                    <div
                      key={track.id}
                      className="flex-shrink-0 w-24 cursor-pointer active:scale-95 transition-transform"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

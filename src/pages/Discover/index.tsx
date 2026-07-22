import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Search, TrendingUp, Clock, Disc, Radio, Headphones, Flame, Star, Music, X, RefreshCw } from 'lucide-react';
import { TopBar } from '@/components/Layout/AppLayout';
import { usePlayerStore } from '@/store/playerStore';
import { useUserStore } from '@/store/userStore';
import { searchApi, recommendApi, hasActiveSource } from '@/services/musicApi';
import { getTrackTitle, getTrackArtist, getTrackCover, getTrackCoverColors, getTrackDuration } from '@/lib/trackUtils';
import type { Track } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'hot', icon: Flame, label: '热歌榜', color: 'text-red-400', bg: 'bg-red-400/20', playListId: '3778678' },
  { id: 'rise', icon: Star, label: '飙升榜', color: 'text-orange-400', bg: 'bg-orange-400/20', playListId: '19723756' },
  { id: 'new', icon: Disc, label: '新歌榜', color: 'text-blue-400', bg: 'bg-blue-400/20', playListId: '2884035' },
  { id: 'radio', icon: Radio, label: '电台', color: 'text-purple-400', bg: 'bg-purple-400/20', playListId: '' },
  { id: 'playlist', icon: Headphones, label: '歌单', color: 'text-green-400', bg: 'bg-green-400/20', playListId: '' },
  { id: 'history', icon: Clock, label: '历史', color: 'text-gray-400', bg: 'bg-gray-400/20', playListId: '' },
];

interface DailyQuote {
  content: string;
  author: string;
}

export default function Discover() {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const { searchHistory, addSearchHistory, clearSearchHistory } = useUserStore();
  const [hotTracks, setHotTracks] = useState<Track[]>([]);
  const [recommendTracks, setRecommendTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryTracks, setCategoryTracks] = useState<Track[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    recommendApi.getRecommendTracks(30).then((tracks) => {
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
    const fetchQuote = async () => {
      try {
        const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g&c=h');
        const data = await res.json();
        setQuote({
          content: data.hitokoto || '音乐是灵魂的语言',
          author: data.from || '佚名',
        });
      } catch {
        const quotes: DailyQuote[] = [
          { content: '音乐是灵魂的语言', author: '贝多芬' },
          { content: '没有音乐，生活就是一个错误', author: '尼采' },
          { content: '音乐是心灵的迸发', author: '李斯特' },
          { content: '音乐能激发或抚慰情怀', author: '爱因斯坦' },
          { content: '音乐是比一切智慧、一切哲学更高的启示', author: '贝多芬' },
          { content: '音乐是爱的食粮', author: '莎士比亚' },
          { content: '音乐是时间的艺术', author: '德彪西' },
          { content: '音乐是人类共同的语言', author: '塞尚' },
          { content: '音乐是思维着的声音', author: '雨果' },
          { content: '音乐是情感的导师', author: '卢梭' },
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      } finally {
        setQuoteLoading(false);
      }
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    if (searchHistory.length === 0) return;
    
    const fetchRecommendations = async () => {
      try {
        const keywords = searchHistory.slice(0, 3);
        const allResults: Track[] = [];
        
        for (const keyword of keywords) {
          const result = await searchApi.search(keyword, 5);
          allResults.push(...result.tracks);
        }
        
        const uniqueResults = allResults.filter(
          (track, index, self) => index === self.findIndex(t => t.id === track.id)
        );
        
        setRecommendTracks(uniqueResults.slice(0, 10));
      } catch {
        setRecommendTracks([]);
      }
    };
    
    fetchRecommendations();
  }, [searchHistory]);

  const handleCategoryClick = async (category: typeof CATEGORIES[0]) => {
    if (category.id === 'history') {
      return;
    }

    setActiveCategory(category.id);
    setCategoryLoading(true);

    try {
      if (category.playListId) {
        const detail = await recommendApi.getPlaylistDetail(category.playListId);
        setCategoryTracks(detail?.tracks || []);
      } else if (category.id === 'radio') {
        const tracks = await recommendApi.getNewSongs();
        setCategoryTracks(tracks);
      } else if (category.id === 'playlist') {
        const playlists = await recommendApi.getRecommendPlaylists(5);
        const allTracks: Track[] = [];
        for (const pl of playlists) {
          const detail = await recommendApi.getPlaylistDetail(pl.id);
          allTracks.push(...(detail?.tracks || []));
        }
        setCategoryTracks(allTracks.slice(0, 20));
      }
    } catch (e) {
      console.error('获取分类数据失败:', e);
      setCategoryTracks([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) return;

    addSearchHistory(query);
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
  }, [searchQuery, addSearchHistory]);

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

  const refreshQuote = () => {
    setQuoteLoading(true);
    fetch('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g&c=h')
      .then(res => res.json())
      .then(data => {
        setQuote({
          content: data.hitokoto || '音乐是灵魂的语言',
          author: data.from || '佚名',
        });
      })
      .catch(() => {
        const quotes: DailyQuote[] = [
          { content: '音乐是灵魂的语言', author: '贝多芬' },
          { content: '没有音乐，生活就是一个错误', author: '尼采' },
          { content: '音乐是心灵的迸发', author: '李斯特' },
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      })
      .finally(() => setQuoteLoading(false));
  };

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

        {showSearch && !hasSearched && searchHistory.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">搜索历史</span>
              <button onClick={clearSearchHistory} className="text-xs text-white/30 hover:text-white/50">
                清空
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 6).map((query) => (
                <button
                  key={query}
                  onClick={() => {
                    setSearchQuery(query);
                    handleSearch();
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/8 text-white/70 text-xs hover:bg-white/15"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
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
          {/* 每日一言 Banner */}
          <div className="px-4 mb-4">
            <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-salt-primary/30 via-purple-500/20 to-salt-accent/30">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {quoteLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                ) : quote ? (
                  <>
                    <p className="text-lg font-medium text-white leading-relaxed mb-2">
                      "{quote.content}"
                    </p>
                    <p className="text-xs text-white/60">— {quote.author}</p>
                  </>
                ) : null}
              </div>
              <button
                onClick={refreshQuote}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 分类导航 */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-6 gap-3">
              {CATEGORIES.map((cat, index) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      'flex flex-col items-center gap-2 active:scale-95 transition-transform',
                      isActive && 'opacity-100',
                      !isActive && 'opacity-80'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
                      cat.bg,
                      isActive && 'ring-2 ring-salt-primary ring-opacity-50'
                    )}>
                      <Icon className={cn('w-6 h-6', cat.color)} />
                    </div>
                    <span className={cn('text-xs transition-colors', isActive ? 'text-white font-medium' : 'text-white/70')}>
                      {cat.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-32 space-y-6">
            {activeCategory ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-white">
                    {CATEGORIES.find(c => c.id === activeCategory)?.label}
                  </h2>
                  <button
                    onClick={() => {
                      setActiveCategory(null);
                      setCategoryTracks([]);
                    }}
                    className="text-sm text-white/50 hover:text-white/80"
                  >
                    返回
                  </button>
                </div>

                {categoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-salt-primary" />
                  </div>
                ) : categoryTracks.length === 0 ? (
                  <div className="text-center py-12 text-white/40 text-sm">
                    <Music className="w-12 h-12 mx-auto mb-3 text-white/20" />
                    暂无数据
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categoryTracks.slice(0, 50).map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 cursor-pointer active:scale-[0.98] transition-transform"
                        onClick={() => handlePlayTrack(track, categoryTracks)}
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
                            handlePlayTrack(track, categoryTracks);
                          }}
                          className="w-9 h-9 rounded-full bg-salt-primary/20 flex items-center justify-center shrink-0"
                        >
                          <Play className="w-4 h-4 text-salt-primary ml-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
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

                {/* 猜你喜欢 - 基于搜索历史 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-bold text-white">猜你喜欢</h2>
                  </div>

                  {searchHistory.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      <Star className="w-8 h-8 mx-auto mb-2 text-white/20" />
                      搜索歌曲后为您推荐
                    </div>
                  ) : recommendTracks.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">暂无推荐</div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      {recommendTracks.map((track) => (
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
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Play, TrendingUp, Flame, Sparkles, Search } from 'lucide-react';
import AppLayout, { TopBar } from '@/components/Layout/AppLayout';
import PlatformBadge from '@/components/PlatformBadge';
import CoverArt from '@/components/CoverArt';
import { usePlayerStore } from '@/store/playerStore';
import { mockApi } from '@/services/mockApi';
import { recommendApi } from '@/services/musicApi';
import { formatPlayCount } from '@/lib/format';
import type { Playlist, Chart, Track } from '@/types';
import { cn } from '@/lib/utils';

const GENRES = ['全部', '流行', '电子', '国风', '嘻哈', '民谣', '摇滚', 'Lo-Fi', '夏日', '甜系'];
const RANK_ICONS = [
  { color: 'from-yellow-400 to-orange-500', text: 'text-yellow-400' },
  { color: 'from-gray-300 to-gray-500', text: 'text-gray-300' },
  { color: 'from-orange-600 to-orange-800', text: 'text-orange-600' },
];

export default function Discover() {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [onlineTracks, setOnlineTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('全部');
  const [activeChart, setActiveChart] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([mockApi.getDiscoverPlaylists(), mockApi.getCharts()]).then(
      ([pls, chs]) => {
        if (cancelled) return;
        setPlaylists(pls);
        setCharts(chs);
        setLoading(false);
      }
    );
    // 异步加载在线推荐歌曲（不阻塞页面）
    recommendApi.getRecommendTracks().then((tracks) => {
      if (!cancelled && tracks.length > 0) {
        setOnlineTracks(tracks.slice(0, 12));
      }
    }).catch((e) => console.warn('在线推荐加载失败', e));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPlaylists =
    activeGenre === '全部'
      ? playlists
      : playlists.filter((p) => p.description.includes(activeGenre) || p.name.includes(activeGenre));

  return (
    <AppLayout>
      <TopBar
        title="发现"
        subtitle="探索更多音乐"
        right={
          <button
            onClick={() => navigate('/login')}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/70 hover:text-neon-cyan"
          >
            <Search className="w-4 h-4" />
          </button>
        }
      />

      {/* 个性化推荐 Banner */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-strong rounded-2xl p-4 overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-neon-purple/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-neon-cyan/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center shadow-neon-purple shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">为你推荐</p>
              <p className="text-[10px] text-white/60 mt-0.5">
                基于网易云热门榜单智能推荐
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-lg bg-gradient-neon text-white text-xs font-medium shadow-neon-purple"
            >
              查看
            </button>
          </div>
        </motion.div>
      </div>

      {/* 在线推荐歌曲 */}
      {onlineTracks.length > 0 && (
        <section className="px-4 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              在线热歌
            </h3>
            <span className="text-[10px] text-white/50">实时更新</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {onlineTracks.slice(0, 9).map((track, idx) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => {
                  playTrack(track, onlineTracks);
                  navigate(`/player/${track.id}`);
                }}
                className="glass rounded-xl p-2 text-left hover:bg-white/8 transition-colors group"
              >
                <div className="relative mb-1.5">
                  <CoverArt
                    colors={track.coverColors}
                    coverUrl={track.coverUrl}
                    title={track.title}
                    size="full"
                    className="aspect-square"
                  />
                  <div className="absolute inset-0 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-3.5 h-3.5 text-white" fill="white" />
                  </div>
                </div>
                <p className="text-[10px] font-medium text-white truncate">{track.title}</p>
                <p className="text-[9px] text-white/50 truncate">{track.artist}</p>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* 分类导航 */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                activeGenre === g
                  ? 'bg-gradient-neon text-white shadow-neon-purple'
                  : 'glass text-white/60 hover:text-white'
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 歌单广场 */}
      <section className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">精选歌单广场</h3>
          <span className="text-[10px] text-white/50">{filteredPlaylists.length} 个歌单</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-3 animate-pulse">
                <div className="aspect-square rounded-xl bg-white/5 mb-2" />
                <div className="h-3 bg-white/5 rounded mb-1.5" />
                <div className="h-2 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredPlaylists.map((pl, idx) => (
              <motion.button
                key={pl.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate('/')}
                className="glass rounded-2xl p-2.5 text-left hover:bg-white/8 transition-colors group"
              >
                <div className="relative">
                  <CoverArt
                    colors={pl.coverColors}
                    title={pl.name}
                    size="full"
                    className="aspect-square mb-2 group-hover:scale-105 transition-transform"
                  />
                  {/* 播放按钮浮层 */}
                  <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center shadow-neon-purple">
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  {/* 平台标识 */}
                  <div className="absolute top-1.5 right-1.5">
                    {pl.platform === 'mixed' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full glass text-white/80 font-medium">
                        多平台
                      </span>
                    ) : (
                      <PlatformBadge platform={pl.platform} size="xs" />
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                <p className="text-[10px] text-white/50 mt-0.5 line-clamp-1">{pl.description}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-white/40">{pl.trackCount} 首</span>
                  <span className="text-[10px] text-white/40">{formatPlayCount(pl.playCount)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* 榜单区 */}
      <section className="px-4 pb-32">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-neon-cyan" />
          实时榜单
        </h3>

        {/* 榜单切换 */}
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          {charts.map((chart, idx) => {
            const active = activeChart === idx;
            const icons = [Flame, Sparkles, TrendingUp];
            const Icon = icons[idx % 3];
            return (
              <button
                key={chart.name}
                onClick={() => setActiveChart(idx)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  active
                    ? 'bg-gradient-neon text-white shadow-neon-purple'
                    : 'glass text-white/60 hover:text-white'
                )}
              >
                <Icon className="w-3 h-3" />
                {chart.name}
              </button>
            );
          })}
        </div>

        {/* 榜单内容 */}
        <div className="glass rounded-2xl p-2 space-y-1">
          {charts[activeChart]?.tracks.map((track, idx) => (
            <motion.button
              key={track.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => {
                playTrack(track, charts[activeChart].tracks);
                navigate(`/player/${track.id}`);
              }}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
            >
              {/* 排名 */}
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                  idx < 3
                    ? `bg-gradient-to-br ${RANK_ICONS[idx].color} text-white shadow-md`
                    : 'bg-white/5 text-white/60'
                )}
              >
                {idx + 1}
              </div>

              {/* 封面 */}
              <div className="relative shrink-0">
                <CoverArt colors={track.coverColors} coverUrl={track.coverUrl} title={track.title} size="sm" />
                <div className="absolute inset-0 rounded-md bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-3.5 h-3.5 text-white" fill="white" />
                </div>
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{track.title}</p>
                <p className="text-[10px] text-white/50 truncate">{track.artist}</p>
              </div>

              {/* 播放数 */}
              <div className="text-right shrink-0">
                <p className="text-[10px] text-white/60">{formatPlayCount(track.playCount)}</p>
                <div className="mt-0.5">
                  <PlatformBadge platform={track.platform} size="xs" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 text-white/50">
            <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
          </div>
        )}
      </section>
    </AppLayout>
  );
}

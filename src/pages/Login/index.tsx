import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Search,
  Settings,
  Check,
  Loader2,
  ChevronRight,
  Music,
  Code2,
  Server,
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useMusicSourceStore } from '@/store/musicSourceStore';
import { searchApi, hasActiveSource } from '@/services/musicApi';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/types';

type LoginMode = 'menu' | 'search';

export default function Login() {
  const navigate = useNavigate();
  const { loginAsGuest } = useUserStore();
  const { playTrack } = usePlayerStore();
  const { sources, getActiveSource } = useMusicSourceStore();
  const [mode, setMode] = useState<LoginMode>('menu');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);

  const hasSource = hasActiveSource();
  const activeSource = getActiveSource();

  const handleGuest = async () => {
    await loginAsGuest();
    navigate('/');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    if (!hasSource) {
      navigate('/music-source');
      return;
    }
    setSearching(true);
    try {
      const results = await searchApi.search(searchKeyword, 20);
      setSearchResults(results);
    } catch (err) {
      console.error('搜索失败', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track, searchResults);
    if (!useUserStore.getState().isLoggedIn) {
      loginAsGuest().then(() => navigate('/'));
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-salt-bg overflow-hidden flex flex-col">
      {/* 流光背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-salt-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-salt-accent/15 blur-[100px]" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] rounded-full bg-neon-purple/15 blur-[100px]" />
      </div>

      {/* 顶部 Logo */}
      <div className="relative z-10 pt-20 pb-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-flow shadow-xl mb-5 relative"
        >
          <Music className="w-9 h-9 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-4xl font-black tracking-wide text-white"
        >
          UniBeat
        </motion.h1>
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="text-white/55 text-xs mt-2 tracking-wider"
        >
          音源聚合 · 自由播放
        </motion.p>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 px-5 pb-10">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          className="max-w-md mx-auto"
        >
          <AnimatePresence mode="wait">
            {/* 主菜单 */}
            {mode === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-3"
              >
                {/* 音源状态卡片 */}
                <div
                  className={
                    hasSource
                      ? 'p-4 rounded-3xl bg-gradient-to-r from-salt-primary/[0.10] to-salt-primary/[0.04] border border-salt-primary/25'
                      : 'p-4 rounded-3xl bg-gradient-to-r from-salt-accent/[0.10] to-salt-accent/[0.04] border border-salt-accent/25'
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        hasSource
                          ? 'w-11 h-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md'
                          : 'w-11 h-11 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-md'
                      }
                    >
                      {hasSource ? (
                        activeSource?.mode === 'script' ? (
                          <Code2 className="w-5 h-5 text-white" />
                        ) : (
                          <Server className="w-5 h-5 text-white" />
                        )
                      ) : (
                        <Settings className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {hasSource ? '音源已配置' : '请先配置音源'}
                      </p>
                      <p className="text-[11px] text-white/55 mt-0.5 truncate">
                        {hasSource
                          ? `${activeSource?.name} · ${activeSource?.mode === 'script' ? '脚本模式' : 'API 模式'}`
                          : '添加音源后才能搜索和播放音乐'}
                      </p>
                    </div>
                    {hasSource && (
                      <Check className="w-5 h-5 text-salt-primary" />
                    )}
                  </div>
                </div>

                {/* 搜索试听 */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (!hasSource) {
                      navigate('/music-source');
                    } else {
                      setMode('search');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-3xl bg-gradient-to-r from-salt-primary/15 to-salt-primary/5 border border-salt-primary/30 hover:border-salt-primary/50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-md">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">
                      搜索音乐
                    </p>
                    <p className="text-[11px] text-white/55 mt-0.5">
                      {hasSource
                        ? '从音源搜索并播放'
                        : '配置音源后即可搜索播放'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/55" />
                </motion.button>

                {/* 音源管理 */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate('/music-source')}
                  className="w-full flex items-center gap-3 p-4 rounded-3xl glass border border-white/[0.08] hover:border-white/[0.16] transition-colors"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0 shadow-md">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">音源管理</p>
                    <p className="text-[11px] text-white/55 mt-0.5">
                      添加、删除、切换音源
                      {sources.length > 0 && ` · 已配置 ${sources.length} 个`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </motion.button>

                {/* 直接进入 */}
                <button
                  onClick={handleGuest}
                  className="w-full py-3 text-center text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  稍后配置，先以游客身份进入 →
                </button>
              </motion.div>
            )}

            {/* 搜索模式 */}
            {mode === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="glass-strong rounded-3xl p-5 border border-white/[0.08] shadow-xl"
              >
                <div className="text-center mb-4">
                  <p className="text-sm font-semibold text-white">搜索音乐</p>
                  <p className="text-[11px] text-white/45 mt-1">
                    当前音源：{activeSource?.name || '未配置'}
                  </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索歌曲、歌手..."
                    autoFocus
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] focus:border-salt-primary outline-none text-sm text-white placeholder-white/30"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-medium shadow-md disabled:opacity-60 flex items-center gap-1"
                  >
                    {searching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </button>
                </form>

                <div className="max-h-[320px] overflow-y-auto no-scrollbar space-y-1">
                  {searchResults.map((track, idx) => (
                    <motion.button
                      key={track.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handlePlayTrack(track)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="relative shrink-0">
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-11 h-11 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-lg flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${track.coverColors.from}, ${track.coverColors.to})`,
                            }}
                          >
                            <Music className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-[10px] text-white/50 truncate">
                          {track.artist} · {track.album}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                  {!searching && searchResults.length === 0 && searchKeyword && (
                    <div className="py-8 text-center">
                      <p className="text-xs text-white/40">暂无搜索结果</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMode('menu')}
                  className="w-full mt-3 py-2 text-center text-[11px] text-white/45 hover:text-white/75 transition-colors"
                >
                  ← 返回菜单
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

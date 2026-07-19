import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Headphones,
  Search,
  Music,
  Settings,
  Globe,
  Check,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { PLATFORM_LIST } from '@/data/platforms';
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
  const { sources, activeSourceId, getActiveSource } = useMusicSourceStore();
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
    <div className="relative min-h-screen bg-space-900 overflow-hidden flex flex-col">
      <ParticleBackground className="absolute inset-0 w-full h-full" density={70} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-neon-purple/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-neon-pink/15 blur-[100px] pointer-events-none" />

      {/* 顶部 Logo */}
      <div className="relative z-10 pt-16 pb-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-neon shadow-neon-purple mb-5 relative"
        >
          <Headphones className="w-10 h-10 text-white" />
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-neon-cyan"
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-5xl font-black tracking-widest gradient-text"
        >
          UniBeat
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/60 text-sm mt-2 tracking-wider"
        >
          多音源聚合 · 沉浸式音乐宇宙
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-4"
        >
          {PLATFORM_LIST.map((p) => (
            <div
              key={p.code}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full glass text-[10px]"
              style={{ boxShadow: `0 0 8px ${p.color}33` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
              <span className="text-white/70">{p.shortName}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 flex-1 px-6 pb-10">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
          className="max-w-md mx-auto glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {/* 主菜单 */}
            {mode === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {/* 音源状态卡片 */}
                <div
                  className={
                    hasSource
                      ? 'p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                      : 'p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30'
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        hasSource
                          ? 'w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'
                          : 'w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center'
                      }
                    >
                      {hasSource ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Globe className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">
                        {hasSource ? '音源已配置' : '请先配置音源'}
                      </p>
                      <p className="text-[10px] text-white/60 mt-0.5 truncate">
                        {hasSource
                          ? `当前音源：${activeSource?.name}`
                          : '添加音源后才能搜索和播放音乐'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/music-source')}
                      className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 搜索试听 - 主推 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!hasSource) {
                      navigate('/music-source');
                    } else {
                      setMode('search');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-neon-cyan/20 to-blue-500/20 border border-neon-cyan/40 hover:border-neon-cyan/60 transition-colors"
                  style={{ boxShadow: '0 0 20px rgba(0,240,255,0.2)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center shrink-0">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      搜索音乐
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neon-cyan/30 text-neon-cyan">
                        推荐
                      </span>
                    </p>
                    <p className="text-[10px] text-white/60 mt-0.5">
                      {hasSource
                        ? '从配置的音源搜索播放音乐'
                        : '配置音源后即可搜索播放'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/60" />
                </motion.button>

                {/* 音源管理 */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/music-source')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl glass border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">音源管理</p>
                    <p className="text-[10px] text-white/60 mt-0.5">
                      添加、删除、切换音源 {sources.length > 0 && `(已配置 ${sources.length} 个)`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </motion.button>
              </motion.div>
            )}

            {/* 搜索模式 */}
            {mode === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-cyan/30 mb-2">
                    <Search className="w-3 h-3 text-neon-cyan" />
                    <span className="text-[10px] text-neon-cyan font-medium">在线搜索</span>
                  </div>
                  <p className="text-sm font-semibold text-white">搜索音乐</p>
                  <p className="text-[10px] text-white/50 mt-1">
                    当前音源：{activeSource?.name || '未配置'}
                  </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索歌曲、歌手..."
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-neon-cyan outline-none text-sm text-white placeholder:text-white/30"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-4 py-2.5 rounded-xl bg-gradient-neon text-white text-xs font-medium shadow-neon-purple disabled:opacity-60 flex items-center gap-1"
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
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handlePlayTrack(track)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="relative shrink-0">
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-md object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-md flex items-center justify-center"
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
                          {track.artist}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-neon-cyan transition-colors" />
                    </motion.button>
                  ))}

                  {searchResults.length === 0 && !searching && (
                    <div className="text-center py-8 text-white/40">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-[11px]">输入关键词开始搜索</p>
                    </div>
                  )}

                  {searching && (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-neon-cyan mx-auto" />
                      <p className="text-[11px] text-white/50 mt-2">搜索中...</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMode('menu')}
                  className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs transition-colors"
                >
                  返回菜单
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 游客入口 */}
          {mode === 'menu' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-white/40">或</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={handleGuest}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                游客快速体验
              </button>
            </>
          )}
        </motion.div>

        <p className="text-center text-[10px] text-white/30 mt-6 max-w-md mx-auto leading-relaxed">
          本应用仅为音乐播放器，不提供音乐内容
          <br />
          所有音乐数据来自用户自行配置的音源服务
        </p>
      </div>
    </div>
  );
}

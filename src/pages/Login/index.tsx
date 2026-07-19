import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Sparkles,
  Headphones,
  QrCode,
  Search,
  Music,
  ChevronLeft,
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import QrLogin from '@/components/QrLogin';
import { PLATFORM_LIST } from '@/data/platforms';
import { useUserStore } from '@/store/userStore';
import { searchApi } from '@/services/musicApi';
import { usePlayerStore } from '@/store/playerStore';
import type { Platform, Track } from '@/types';

type LoginMode = 'menu' | 'qr' | 'search' | 'email';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithPlatform, loginWithEmail, loginAsGuest, logging } = useUserStore();
  const { playTrack } = usePlayerStore();
  const [mode, setMode] = useState<LoginMode>('menu');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null);

  // 搜索相关
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);

  const handlePlatformLogin = async (platform: Platform) => {
    setPendingPlatform(platform);
    try {
      await loginWithPlatform(platform);
      navigate('/');
    } catch {
      setPendingPlatform(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch {
      // ignore
    }
  };

  const handleGuest = async () => {
    await loginAsGuest();
    navigate('/');
  };

  // 搜索歌曲（免登录可试听）
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
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

  // 播放搜索结果
  const handlePlayTrack = (track: Track) => {
    playTrack(track, searchResults);
    // 如果未登录，自动以游客身份进入
    if (!useUserStore.getState().isLoggedIn) {
      loginAsGuest().then(() => navigate('/'));
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-space-900 overflow-hidden flex flex-col">
      {/* 粒子背景 */}
      <ParticleBackground className="absolute inset-0 w-full h-full" density={70} />

      {/* 顶部装饰光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-neon-purple/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-neon-pink/15 blur-[100px] pointer-events-none" />

      {/* 顶部 Logo */}
      <div className="relative z-10 pt-16 pb-8 px-6 text-center">
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
          聚合三大平台 · 沉浸式音乐宇宙
        </motion.p>

        {/* 平台标签 */}
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

      {/* 登录卡片 */}
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
                {/* 扫码登录 - 主推 */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('qr')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 hover:border-red-500/60 transition-colors"
                  style={{ boxShadow: '0 0 20px rgba(194,12,12,0.2)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      网易云扫码登录
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300">
                        推荐
                      </span>
                    </p>
                    <p className="text-[10px] text-white/60 mt-0.5">
                      扫码同步你的网易云歌单与偏好
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/60" />
                </motion.button>

                {/* 搜索试听 - 免登录 */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('search')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl glass border border-white/10 hover:border-white/20 transition-colors"
                  style={{ boxShadow: '0 0 16px rgba(0,240,255,0.15)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center shrink-0">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">搜索试听</p>
                    <p className="text-[10px] text-white/60 mt-0.5">
                      不登录直接搜索播放真实音乐
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40" />
                </motion.button>

                {/* 邮箱登录 */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('email')}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl glass border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">邮箱登录</p>
                    <p className="text-[10px] text-white/60 mt-0.5">使用邮箱注册或登录</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40" />
                </motion.button>

                {/* 其他平台模拟登录 */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[9px] text-white/40">其他平台（演示）</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORM_LIST.filter((p) => p.code !== 'netease').map((p) => (
                      <button
                        key={p.code}
                        onClick={() => handlePlatformLogin(p.code)}
                        disabled={logging}
                        className="flex items-center gap-2 p-2.5 rounded-xl glass border border-white/10 hover:border-white/20 transition-colors disabled:opacity-60"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                          style={{ background: p.gradient }}
                        >
                          {p.logo}
                        </div>
                        <span className="text-[11px] text-white/80">{p.shortName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 扫码登录 */}
            {mode === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMode('menu')}
                  className="flex items-center gap-1 text-white/60 hover:text-white text-[11px] mb-3"
                >
                  <ChevronLeft className="w-3 h-3" />
                  返回
                </button>
                <QrLogin onSuccess={() => navigate('/')} />
              </motion.div>
            )}

            {/* 搜索试听 */}
            {mode === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMode('menu')}
                  className="flex items-center gap-1 text-white/60 hover:text-white text-[11px] mb-3"
                >
                  <ChevronLeft className="w-3 h-3" />
                  返回
                </button>

                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-cyan/30 mb-2">
                    <Search className="w-3 h-3 text-neon-cyan" />
                    <span className="text-[10px] text-neon-cyan font-medium">在线搜索</span>
                  </div>
                  <p className="text-sm font-semibold text-white">搜索真实音乐</p>
                  <p className="text-[10px] text-white/50 mt-1">
                    数据来源：网易云音乐 · 可直接播放
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

                {/* 搜索结果 */}
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
              </motion.div>
            )}

            {/* 邮箱登录 */}
            {mode === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailLogin}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={() => setMode('menu')}
                  className="flex items-center gap-1 text-white/60 hover:text-white text-[11px]"
                >
                  <ChevronLeft className="w-3 h-3" />
                  返回
                </button>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="邮箱地址"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-neon-cyan focus:bg-white/8 outline-none text-sm text-white placeholder:text-white/30 transition-all focus:shadow-neon-cyan"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-neon-cyan focus:bg-white/8 outline-none text-sm text-white placeholder:text-white/30 transition-all focus:shadow-neon-cyan"
                  />
                </div>
                <button
                  type="submit"
                  disabled={logging}
                  className="w-full py-3 rounded-xl bg-gradient-neon text-white font-semibold text-sm shadow-neon-purple hover:shadow-neon-pink transition-shadow disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {logging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      登录 / 注册
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* 分割线 - 仅在主菜单显示 */}
          {mode === 'menu' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-white/40">或</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* 游客入口 */}
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

        <p className="text-center text-[10px] text-white/30 mt-6 max-w-md mx-auto">
          音源来自网易云音乐公开接口 · 登录后可同步个人歌单
        </p>
      </div>
    </div>
  );
}

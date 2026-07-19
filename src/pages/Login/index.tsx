import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, Headphones } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { PLATFORM_LIST } from '@/data/platforms';
import { useUserStore } from '@/store/userStore';
import type { Platform } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithPlatform, loginWithEmail, loginAsGuest, logging } = useUserStore();
  const [mode, setMode] = useState<'platform' | 'email'>('platform');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null);

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
          {/* 模式切换 */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-5">
            <button
              onClick={() => setMode('platform')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'platform'
                  ? 'bg-gradient-neon text-white shadow-neon-purple'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              第三方账号登录
            </button>
            <button
              onClick={() => setMode('email')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'email'
                  ? 'bg-gradient-neon text-white shadow-neon-purple'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              邮箱登录
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'platform' ? (
              <motion.div
                key="platform"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {PLATFORM_LIST.map((p, idx) => {
                  const isLoading = pendingPlatform === p.code && logging;
                  return (
                    <motion.button
                      key={p.code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlatformLogin(p.code)}
                      disabled={logging}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl glass border border-white/10 hover:border-white/20 transition-colors disabled:opacity-60"
                      style={{ boxShadow: `0 0 16px ${p.color}22` }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shrink-0"
                        style={{ background: p.gradient }}
                      >
                        {p.logo}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white">使用 {p.name} 登录</p>
                        <p className="text-[10px] text-white/50">同步你的歌单与偏好</p>
                      </div>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-white/40" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailLogin}
                className="space-y-3"
              >
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

          {/* 分割线 */}
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
        </motion.div>

        <p className="text-center text-[10px] text-white/30 mt-6 max-w-md mx-auto">
          登录即表示同意 UniBeat 用户协议与隐私政策 · 平台账号仅用于本地演示
        </p>
      </div>
    </div>
  );
}

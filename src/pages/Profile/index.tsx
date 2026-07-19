import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Link2,
  Unlink,
  Rocket,
  Moon,
  Heart,
  Compass,
  Users,
  Play,
  Clock,
  Music,
  LogOut,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import AppLayout, { TopBar } from '@/components/Layout/AppLayout';
import GenreRadar from '@/components/GenreRadar';
import PlatformBadge from '@/components/PlatformBadge';
import CoverArt from '@/components/CoverArt';
import { useUserStore } from '@/store/userStore';
import { usePlayerStore } from '@/store/playerStore';
import { PLATFORM_LIST } from '@/data/platforms';
import { formatListenMinutes, formatPlayCount } from '@/lib/format';
import type { Platform } from '@/types';
import { cn } from '@/lib/utils';

const ACHIEVEMENT_ICONS: Record<string, any> = {
  rocket: Rocket,
  link: Link2,
  moon: Moon,
  heart: Heart,
  compass: Compass,
  users: Users,
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, bindPlatform, unbindPlatform } = useUserStore();
  const { playTrack } = usePlayerStore();
  const [pendingPlatform, setPendingPlatform] = useState<Platform | null>(null);
  const [activeTab, setActiveTab] = useState<'playlists' | 'recent' | 'achievements'>('playlists');

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <TopBar title="我的" subtitle="登录后解锁全部功能" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-6">
          <div className="glass rounded-3xl p-8 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-neon mx-auto mb-4 flex items-center justify-center shadow-neon-purple">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">登录以查看个人中心</h3>
            <p className="text-sm text-white/60 mb-5">同步你的听歌数据、歌单与成就</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-gradient-neon text-white font-semibold text-sm shadow-neon-purple"
            >
              立即登录
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleToggleBind = async (platform: Platform) => {
    setPendingPlatform(platform);
    try {
      if (user.boundPlatforms.includes(platform)) {
        await unbindPlatform(platform);
      } else {
        await bindPlatform(platform);
      }
    } finally {
      setPendingPlatform(null);
    }
  };

  return (
    <AppLayout>
      <TopBar
        title="个人中心"
        subtitle={user.nickname}
        right={
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/70 hover:text-neon-pink"
          >
            <LogOut className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-4 py-5 pb-32 max-w-2xl mx-auto">
        {/* 用户头部卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-5 mb-4 relative overflow-hidden"
        >
          {/* 背景装饰 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-neon-purple/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-neon-cyan/15 blur-3xl" />

          <div className="relative flex items-center gap-4">
            {/* 头像 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-neon p-0.5">
                <div className="w-full h-full rounded-full bg-space-800 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold gradient-text">
                    {user.nickname.charAt(0)}
                  </span>
                </div>
              </div>
              {/* 霓虹环 */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-neon-cyan"
                animate={{ opacity: [0.4, 1, 0.4], rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              {user.vipLevel > 0 && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white truncate">{user.nickname}</h2>
                {user.vipLevel > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium">
                    VIP{user.vipLevel}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                加入于 {user.joinDate} · ID: {user.id}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[11px] text-white/70">
                  <Clock className="w-3 h-3 text-neon-cyan" />
                  {formatListenMinutes(user.totalListenMinutes)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/70">
                  <Music className="w-3 h-3 text-neon-pink" />
                  {user.totalTracks} 首
                </div>
              </div>
            </div>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <StatCard label="听歌时长" value={formatListenMinutes(user.totalListenMinutes)} color="cyan" />
            <StatCard label="听歌数量" value={user.totalTracks.toString()} color="pink" />
            <StatCard label="收藏歌单" value={user.playlists.length.toString()} color="purple" />
          </div>
        </motion.div>

        {/* 第三方账号绑定 */}
        <section className="mb-4">
          <SectionTitle title="已绑定的平台账号" subtitle="同步你的多平台数据" />
          <div className="glass rounded-2xl p-3 space-y-2">
            {PLATFORM_LIST.map((p) => {
              const bound = user.boundPlatforms.includes(p.code);
              const isLoading = pendingPlatform === p.code;
              return (
                <div
                  key={p.code}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                    style={{ background: p.gradient }}
                  >
                    {p.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-white/50">
                      {bound ? '已绑定 · 数据同步中' : '未绑定'}
                    </p>
                  </div>
                  {bound && (
                    <span
                      className="w-2 h-2 rounded-full animate-pulse-glow"
                      style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                    />
                  )}
                  <button
                    onClick={() => handleToggleBind(p.code)}
                    disabled={isLoading}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                      bound
                        ? 'text-white/60 hover:text-neon-pink hover:bg-white/5'
                        : 'bg-gradient-neon text-white shadow-neon-purple'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : bound ? (
                      <>
                        <Unlink className="w-3 h-3" />
                        解绑
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3 h-3" />
                        绑定
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 曲风偏好雷达图 */}
        {user.favoriteGenres.length > 0 && (
          <section className="mb-4">
            <SectionTitle title="曲风偏好" subtitle="基于你的听歌行为生成" />
            <div className="glass rounded-2xl p-4 flex flex-col items-center">
              <GenreRadar data={user.favoriteGenres} size={260} />
              <div className="grid grid-cols-3 gap-2 mt-3 w-full">
                {user.favoriteGenres.slice(0, 3).map((g) => (
                  <div
                    key={g.genre}
                    className="text-center p-2 rounded-xl bg-white/5"
                  >
                    <p className="text-[10px] text-white/50">{g.genre}</p>
                    <p className="text-base font-bold gradient-text">{g.score}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab 切换 */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-3">
          {[
            { key: 'playlists' as const, label: '我的歌单', count: user.playlists.length },
            { key: 'recent' as const, label: '最近播放', count: user.recentPlayed.length },
            { key: 'achievements' as const, label: '成就', count: user.achievements.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-gradient-neon text-white shadow-neon-purple'
                  : 'text-white/60 hover:text-white'
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        {activeTab === 'playlists' && (
          <div className="grid grid-cols-2 gap-3">
            {user.playlists.map((pl, idx) => (
              <motion.button
                key={pl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate('/discover')}
                className="glass rounded-2xl p-3 text-left hover:bg-white/8 transition-colors group"
              >
                <CoverArt
                  colors={pl.coverColors}
                  title={pl.name}
                  size="full"
                  className="aspect-square mb-2 group-hover:scale-105 transition-transform"
                />
                <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-white/50">{pl.trackCount} 首</p>
                  <p className="text-[10px] text-white/40">{formatPlayCount(pl.playCount)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-1.5">
            {user.recentPlayed.map((track, idx) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => {
                  playTrack(track, user.recentPlayed);
                  navigate(`/player/${track.id}`);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="relative shrink-0">
                  <CoverArt colors={track.coverColors} title={track.title} size="md" />
                  <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 text-white" fill="white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{track.title}</p>
                  <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
                <PlatformBadge platform={track.platform} size="xs" />
                <ChevronRight className="w-4 h-4 text-white/30" />
              </motion.button>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-2 gap-3">
            {user.achievements.map((ach, idx) => {
              const Icon = ACHIEVEMENT_ICONS[ach.icon] || Rocket;
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'glass rounded-2xl p-3 relative overflow-hidden',
                    !ach.unlocked && 'opacity-60'
                  )}
                >
                  {ach.unlocked && (
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-yellow-400/20 blur-xl" />
                  )}
                  <div className="relative flex items-start gap-2.5">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        ach.unlocked
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg'
                          : 'bg-white/5 text-white/40'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{ach.title}</p>
                      <p className="text-[10px] text-white/50 mt-0.5 line-clamp-2">{ach.description}</p>
                    </div>
                  </div>
                  {!ach.unlocked && (
                    <div className="mt-2.5">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-neon"
                          style={{ width: `${ach.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">{ach.progress}%</p>
                    </div>
                  )}
                  {ach.unlocked && (
                    <div className="mt-2 text-[10px] text-yellow-400 font-medium">已解锁</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: 'cyan' | 'pink' | 'purple' }) {
  const colorMap = {
    cyan: 'text-neon-cyan',
    pink: 'text-neon-pink',
    purple: 'text-neon-purple',
  };
  return (
    <div className="text-center p-2.5 rounded-xl bg-white/5">
      <p className={cn('text-lg font-bold font-display', colorMap[color])}>{value}</p>
      <p className="text-[10px] text-white/50 mt-0.5">{label}</p>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2.5 px-1">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {subtitle && <p className="text-[10px] text-white/50 mt-0.5">{subtitle}</p>}
    </div>
  );
}

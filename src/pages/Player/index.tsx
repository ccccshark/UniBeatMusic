import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Share2,
  ListMusic,
  Volume2,
  VolumeX,
  Headphones,
} from 'lucide-react';
import PlayerBackground from './PlayerBackground';
import VinylDisc from './VinylDisc';
import LyricView from './LyricView';
import FrequencyBars from '@/components/Visualizer/FrequencyBars';
import RadialProgress from '@/components/Visualizer/RadialProgress';
import PlatformBadge from '@/components/PlatformBadge';
import { usePlayerStore } from '@/store/playerStore';
import { useUserStore } from '@/store/userStore';
import { mockApi } from '@/services/mockApi';
import { getPlatform } from '@/data/platforms';
import { formatDuration } from '@/lib/format';
import type { Track, PlayMode } from '@/types';
import { cn } from '@/lib/utils';

export default function Player() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    audioElement,
    togglePlay,
    next,
    prev,
    setPlayMode,
    setVolume,
    playTrack,
    setCurrentTime,
  } = usePlayerStore();
  const { isLiked, toggleLike } = useUserStore();

  const [track, setTrack] = useState<Track | null>(currentTrack);
  const [view, setView] = useState<'disc' | 'lyric'>('disc');
  const [showQueue, setShowQueue] = useState(false);

  // 如果 URL 指定的 track 与当前播放不同，加载它
  useEffect(() => {
    if (!trackId) return;
    if (currentTrack?.id === trackId) {
      setTrack(currentTrack);
      return;
    }
    mockApi.getTrackById(trackId).then((t) => {
      setTrack(t);
      playTrack(t, playlist.length > 0 ? playlist : [t]);
    });
  }, [trackId, currentTrack, playlist, playTrack]);

  const displayTrack = track ?? currentTrack;
  if (!displayTrack) {
    return (
      <div className="min-h-screen bg-space-900 flex items-center justify-center text-white/60">
        <button onClick={() => navigate('/')} className="underline">
          返回推荐流
        </button>
      </div>
    );
  }

  const liked = isLiked(displayTrack.id);
  const progress = duration > 0 ? currentTime / duration : 0;
  const platform = getPlatform(displayTrack.platform);

  const handleSeek = (time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    handleSeek(ratio * duration);
  };

  const cyclePlayMode = () => {
    const modes: PlayMode[] = ['order', 'repeat-one', 'shuffle'];
    const idx = modes.indexOf(playMode);
    setPlayMode(modes[(idx + 1) % modes.length]);
  };

  return (
    <div className="relative min-h-screen bg-space-900 overflow-hidden">
      <PlayerBackground colors={displayTrack.coverColors} />

      {/* 顶部栏 */}
      <header className="relative z-20 flex items-center justify-between px-5 py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-neon-cyan transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] text-white/50 tracking-wider uppercase">
            正在播放 · {platform.name}
          </p>
          <p className="text-sm font-semibold text-white truncate max-w-[200px]">
            {displayTrack.title}
          </p>
        </div>
        <button
          onClick={() => setShowQueue(true)}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-neon-cyan transition-colors"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </header>

      {/* 主区域 */}
      <div className="relative z-10 px-6 pt-4 pb-32 max-w-2xl mx-auto">
        {/* 视图切换 */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-1 p-1 rounded-full glass">
            <button
              onClick={() => setView('disc')}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
                view === 'disc' ? 'bg-gradient-neon text-white' : 'text-white/60'
              )}
            >
              唱片
            </button>
            <button
              onClick={() => setView('lyric')}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
                view === 'lyric' ? 'bg-gradient-neon text-white' : 'text-white/60'
              )}
            >
              歌词
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'disc' ? (
            <motion.div
              key="disc"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              {/* 唱片 + 环形进度 */}
              <div className="relative my-6">
                <RadialProgress progress={progress} size={320} strokeWidth={3}>
                  <VinylDisc track={displayTrack} isPlaying={isPlaying} size={260} />
                </RadialProgress>
              </div>

              {/* 歌曲信息 */}
              <div className="text-center mb-4">
                <h1 className="font-display text-3xl font-bold text-white drop-shadow-lg">
                  {displayTrack.title}
                </h1>
                <p className="text-sm text-white/70 mt-1.5">
                  {displayTrack.artist} · {displayTrack.album}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                  {displayTrack.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full glass text-white/70"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 频谱可视化 */}
              <div className="w-full mt-2 glass rounded-2xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-white/50 flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    频谱可视化
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>
                <FrequencyBars
                  audioElement={audioElement}
                  isPlaying={isPlaying}
                  barCount={48}
                  color={platform.color}
                  height={70}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="lyric"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-col items-center"
            >
              {/* 小唱片 */}
              <div className="my-4">
                <VinylDisc track={displayTrack} isPlaying={isPlaying} size={140} />
              </div>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">{displayTrack.title}</h2>
                <p className="text-xs text-white/60 mt-1">{displayTrack.artist}</p>
              </div>

              {/* 歌词 */}
              <LyricView
                lyrics={displayTrack.lyrics}
                currentTime={currentTime}
                onSeek={handleSeek}
                className="h-[40vh] w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部控制台 */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        {/* 进度条 */}
        <div className="px-6 mb-2 max-w-2xl mx-auto w-full">
          <div
            className="group relative h-1.5 bg-white/10 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-neon"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-white/50 font-mono">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="glass-strong border-t border-white/10 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
            {/* 左侧：喜欢/分享 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleLike(displayTrack.id)}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  liked ? 'text-neon-pink' : 'text-white/60 hover:text-white'
                )}
              >
                <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* 中央：主控制 */}
            <div className="flex items-center gap-3">
              <button
                onClick={cyclePlayMode}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                  playMode !== 'order' ? 'text-neon-cyan' : 'text-white/60 hover:text-white'
                )}
              >
                {playMode === 'shuffle' ? (
                  <Shuffle className="w-4 h-4" />
                ) : playMode === 'repeat-one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={prev}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:text-neon-cyan transition-colors"
              >
                <SkipBack className="w-5 h-5" fill="currentColor" />
              </button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-neon shadow-neon-purple flex items-center justify-center text-white"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                )}
              </motion.button>
              <button
                onClick={next}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white hover:text-neon-cyan transition-colors"
              >
                <SkipForward className="w-5 h-5" fill="currentColor" />
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white">
                <ListMusic className="w-4 h-4" />
              </button>
            </div>

            {/* 右侧：音量 */}
            <div className="flex items-center gap-2 w-24">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                className="text-white/60 hover:text-white"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none bg-white/10 accent-neon-cyan cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${platform.color} 0%, ${platform.color} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 播放队列抽屉 */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-80 z-50 glass-strong border-l border-white/10 p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-white">播放队列</h3>
              <button
                onClick={() => setShowQueue(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                关闭
              </button>
            </div>
            <div className="space-y-2">
              {playlist.map((t) => {
                const active = t.id === displayTrack.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      playTrack(t, playlist);
                      setShowQueue(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left',
                      active ? 'bg-white/10' : 'hover:bg-white/5'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${t.coverColors.from} 0%, ${t.coverColors.to} 100%)`,
                      }}
                    >
                      {t.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm truncate', active ? 'text-neon-cyan' : 'text-white')}>
                        {t.title}
                      </p>
                      <p className="text-[10px] text-white/50 truncate">{t.artist}</p>
                    </div>
                    <PlatformBadge platform={t.platform} size="xs" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

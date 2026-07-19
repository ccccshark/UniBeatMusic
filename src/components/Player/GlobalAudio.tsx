import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import MiniPlayer from './MiniPlayer';

// 全局音频控制器：管理单一 audio 元素，桥接 playerStore
export default function GlobalAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    setAudioElement,
    setCurrentTime,
    setDuration,
    setPlaying,
    next,
  } = usePlayerStore();

  // 注册 audio 元素到 store
  useEffect(() => {
    setAudioElement(audioRef.current);
    return () => setAudioElement(null);
  }, [setAudioElement]);

  // 播放/暂停控制
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.play().catch((e) => {
        console.warn('play failed', e);
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, setPlaying]);

  // 切歌时重设 src 并播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.audioUrl;
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    }
  }, [currentTrack, isPlaying, setPlaying]);

  // 音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={next}
        crossOrigin="anonymous"
      />
      <MiniPlayer />
    </>
  );
}

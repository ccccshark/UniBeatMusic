import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { searchApi, hasActiveSource } from '@/services/musicApi';
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
  const [loadingUrl, setLoadingUrl] = useState(false);

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

  // 切歌时获取音频URL并播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    let cancelled = false;

    const loadAndPlay = async () => {
      setLoadingUrl(true);

      // 如果 track 已有 audioUrl，直接使用
      let url = currentTrack.audioUrl;

      // 如果没有 audioUrl 且有源配置，动态获取
      if (!url && hasActiveSource() && currentTrack.neteaseId) {
        try {
          url = await searchApi.getSongUrl(currentTrack.neteaseId);
        } catch (e) {
          console.warn('获取音频URL失败', e);
        }
      }

      if (cancelled) return;
      setLoadingUrl(false);

      if (url) {
        audio.src = url;
        audio.load();
        if (isPlaying) {
          audio.play().catch(() => setPlaying(false));
        }
      } else {
        setPlaying(false);
      }
    };

    loadAndPlay();

    return () => {
      cancelled = true;
    };
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
      <MiniPlayer loading={loadingUrl} />
    </>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
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
  const lastTrackIdRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);

  // 注册 audio 元素到 store
  useEffect(() => {
    setAudioElement(audioRef.current);
    return () => setAudioElement(null);
  }, [setAudioElement]);

  // 播放/暂停控制（只在 isPlaying 变化时触发，不重新加载）
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('[GlobalAudio] play failed:', e?.message || e);
          setPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, setPlaying]);

  // 获取备用播放URL（网易云外链）
  const getFallbackUrl = useCallback((track: { neteaseId?: number | null; id: string }): string => {
    if (track.neteaseId) {
      return `https://music.163.com/song/media/outer/url?id=${track.neteaseId}.mp3`;
    }
    // 尝试从id中提取数字
    const match = track.id.match(/\d+/);
    if (match) {
      return `https://music.163.com/song/media/outer/url?id=${match[0]}.mp3`;
    }
    return '';
  }, []);

  // 切歌时获取音频URL并播放（只在 currentTrack 变化时触发）
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    
    // 避免重复加载同一首歌
    if (lastTrackIdRef.current === currentTrack.id) return;
    lastTrackIdRef.current = currentTrack.id;
    retryCountRef.current = 0;

    let cancelled = false;

    const loadAndPlay = async () => {
      setLoadingUrl(true);

      // 收集所有可能的URL来源，按优先级尝试
      const urlCandidates: string[] = [];

      // 1. 如果 track 已有 audioUrl，优先使用
      if (currentTrack.audioUrl) {
        urlCandidates.push(currentTrack.audioUrl);
      }

      // 2. 如果有源配置，通过音源获取
      if (hasActiveSource()) {
        try {
          const sourceUrl = await searchApi.getSongUrl(currentTrack);
          if (sourceUrl) {
            urlCandidates.push(sourceUrl);
            console.log('[GlobalAudio] 音源返回URL:', sourceUrl.substring(0, 80) + '...');
          }
        } catch (e) {
          console.warn('[GlobalAudio] 音源获取URL失败', e);
        }
      }

      // 3. 备用：网易云外链
      const fallbackUrl = getFallbackUrl(currentTrack);
      if (fallbackUrl && !urlCandidates.includes(fallbackUrl)) {
        urlCandidates.push(fallbackUrl);
      }

      if (cancelled) return;
      setLoadingUrl(false);

      // 依次尝试各个URL
      let played = false;
      for (let i = 0; i < urlCandidates.length; i++) {
        const url = urlCandidates[i];
        if (!url) continue;
        
        console.log(`[GlobalAudio] 尝试播放 URL ${i + 1}/${urlCandidates.length}:`, url.substring(0, 60) + '...');
        
        try {
          audio.src = url;
          audio.load();
          
          // 等待canplay事件或超时
          const canPlayPromise = new Promise<void>((resolve, reject) => {
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve();
            };
            const onError = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('audio error'));
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
            // 超时10秒
            setTimeout(() => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('timeout'));
            }, 10000);
          });

          try {
            await canPlayPromise;
          } catch {
            console.warn(`[GlobalAudio] URL ${i + 1} 加载失败，尝试下一个`);
            continue;
          }

          // 尝试播放
          if (isPlaying) {
            try {
              await audio.play();
              played = true;
              console.log(`[GlobalAudio] 使用 URL ${i + 1} 播放成功`);
              break;
            } catch (playErr) {
              console.warn(`[GlobalAudio] URL ${i + 1} 播放失败:`, playErr);
            }
          } else {
            played = true; // 至少加载成功了
            break;
          }
        } catch (e) {
          console.warn(`[GlobalAudio] URL ${i + 1} 异常:`, e);
        }
      }

      if (!played) {
        console.error('[GlobalAudio] 所有URL都无法播放');
        setPlaying(false);
      }
    };

    loadAndPlay();

    return () => {
      cancelled = true;
    };
  }, [currentTrack, isPlaying, setPlaying, getFallbackUrl]);

  // 音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 错误处理
  const handleError = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    console.error('[GlobalAudio] 音频播放错误 code:', audio.error?.code, 'msg:', audio.error?.message);
    // 播放错误时暂停
    setPlaying(false);
  }, [setPlaying]);

  // 加载元数据
  const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    const dur = e.currentTarget.duration || 0;
    if (dur > 0) {
      setDuration(dur);
    }
  }, [setDuration]);

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={next}
        onError={handleError}
        preload="auto"
      />
      <MiniPlayer loading={loadingUrl} />
    </>
  );
}

import type { Track, CoverColors, LyricLine } from '@/types';

// 默认封面配色
const DEFAULT_COVER_COLORS: CoverColors = {
  from: '#1a1a2e',
  to: '#16213e',
  accent: '#3d7aff',
};

// 获取歌曲标题
export function getTrackTitle(track: Track | null | undefined): string {
  if (!track) return '';
  return track.name || '';
}

// 获取歌手名
export function getTrackArtist(track: Track | null | undefined): string {
  if (!track) return '';
  if (Array.isArray(track.artists) && track.artists.length > 0) {
    return track.artists.map((a) => a.name).join(' / ');
  }
  return '';
}

// 获取封面URL
export function getTrackCover(track: Track | null | undefined): string | null {
  if (!track) return null;
  return track.cover || track.album?.cover || null;
}

// 获取封面配色（如果没有则生成默认值）
export function getTrackCoverColors(track: Track | null | undefined): CoverColors {
  if (!track) return DEFAULT_COVER_COLORS;
  if ((track as any).coverColors) return (track as any).coverColors;
  return DEFAULT_COVER_COLORS;
}

// 获取歌曲时长（秒）
export function getTrackDuration(track: Track | null | undefined): number {
  if (!track) return 0;
  return track.duration || 0;
}

// 格式化时长
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 解析 LRC 歌词
export function parseLrc(lrc: string | null | undefined): LyricLine[] {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const text = line.replace(timeRegex, '').trim();
    if (!text) continue;

    let match;
    timeRegex.lastIndex = 0;
    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      const time = minutes * 60 + seconds + ms / 1000;
      result.push({ time, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

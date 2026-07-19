/**
 * 音乐 API 服务 - 音源模式
 *
 * 设计说明：
 * - 软件本身不内置任何音乐 API 地址
 * - 所有音乐数据从用户配置的「音源」地址获取
 * - 音源为用户自行部署的音乐 API 服务（兼容 NeteaseCloudMusicApi 接口风格）
 * - 软件只负责调用音源，不提供音乐内容
 *
 * 音源 API 规范（兼容 NeteaseCloudMusicApi）：
 * - GET /search?keywords=xxx&limit=30    搜索歌曲
 * - GET /song/detail?ids=1,2,3           获取歌曲详情
 * - GET /song/url?id=123                 获取歌曲播放地址
 * - GET /lyric?id=123                    获取歌词
 * - GET /playlist/detail?id=123          获取歌单详情
 * - GET /recommend/songs                 获取推荐歌曲
 * - GET /login/qr/key                    获取扫码登录key
 * - GET /login/qr/check?key=xxx          检查扫码状态
 */

import type { Track, LyricLine, Platform, MusicSource } from '@/types';
import { useMusicSourceStore } from '@/store/musicSourceStore';

// ========== 音源请求基础 ==========

function getActiveSource(): MusicSource | null {
  return useMusicSourceStore.getState().getActiveSource();
}

function getBaseUrl(): string {
  const source = getActiveSource();
  if (!source) throw new Error('未配置音源，请先添加音源');
  return source.baseUrl.endsWith('/')
    ? source.baseUrl.slice(0, -1)
    : source.baseUrl;
}

async function sourceRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`音源请求失败: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ========== 类型定义 ==========

interface SourceSong {
  id: number;
  name: string;
  artists?: { name: string }[];
  ar?: { name: string }[];
  album?: { name: string; picUrl?: string };
  al?: { name: string; picUrl?: string };
  duration?: number;
  dt?: number;
  fee?: number;
  playCount?: number;
}

interface SourceSearchResult {
  result?: {
    songs?: SourceSong[];
    songCount?: number;
  };
  code: number;
}

interface SourceSongDetailResult {
  songs?: SourceSong[];
  code: number;
}

interface SourceSongUrlResult {
  data?: Array<{ id: number; url: string; br: number; size: number }>;
  code: number;
}

interface SourceLyricResult {
  lrc?: { lyric: string };
  code: number;
}

interface SourcePlaylistResult {
  result?: {
    tracks?: SourceSong[];
  };
  playlist?: {
    tracks?: SourceSong[];
  };
  code: number;
}

interface SourceRecommendResult {
  data?: { dailySongs?: SourceSong[] };
  result?: SourceSong[];
  code: number;
}

interface SourceQrKeyResult {
  code: number;
  unikey?: string;
  data?: { unikey: string };
}

interface SourceQrCheckResult {
  code: number;
  nickname?: string;
  avatarUrl?: string;
  message?: string;
  cookie?: string;
}

// ========== 数据转换 ==========

function sourceToTrack(song: SourceSong, sourceId: string): Track {
  const artistList = song.artists || song.ar || [];
  const artist = artistList.map((a) => a.name).join('/') || '未知艺术家';
  const albumInfo = song.album || song.al;
  const cover = albumInfo?.picUrl || '';
  const duration = Math.floor(
    ((song.duration || song.dt || 0) > 1000
      ? song.duration || song.dt || 0
      : (song.duration || song.dt || 0) * 1000) / 1000
  );

  const colors = generateColors(song.name + artist);
  const platform = inferPlatform(sourceId);

  return {
    id: `src-${sourceId}-${song.id}`,
    title: song.name,
    artist,
    album: albumInfo?.name || '未知专辑',
    coverColors: colors,
    coverUrl: cover,
    duration,
    platform,
    audioUrl: '',
    neteaseId: platform === 'netease' ? song.id : undefined,
    lyrics: [],
    tags: [platformLabel(platform)],
    playCount: song.playCount || Math.floor(Math.random() * 5000000) + 100000,
    likeCount: Math.floor(Math.random() * 200000) + 5000,
    releaseYear: new Date().getFullYear(),
  };
}

function inferPlatform(sourceId: string): Platform {
  const source = useMusicSourceStore
    .getState()
    .sources.find((s) => s.id === sourceId);
  if (!source) return 'netease';
  if (source.type === 'qq') return 'qq';
  if (source.type === 'netease') return 'netease';
  return 'netease';
}

function platformLabel(platform: Platform): string {
  const map: Record<Platform, string> = {
    qq: 'QQ音乐',
    netease: '网易云',
    qishui: '汽水',
  };
  return map[platform] || '音乐';
}

function generateColors(seed: string): { from: string; to: string; accent: string } {
  const palettes = [
    { from: '#C20C0C', to: '#FF6B35', accent: '#FBBF24' },
    { from: '#7B2FF7', to: '#00F0FF', accent: '#FF2E9F' },
    { from: '#06B6D4', to: '#3B82F6', accent: '#8B5CF6' },
    { from: '#EC4899', to: '#F59E0B', accent: '#84CC16' },
    { from: '#10B981', to: '#06B6D4', accent: '#FBBF24' },
    { from: '#F43F5E', to: '#8B5CF6', accent: '#00F0FF' },
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return palettes[Math.abs(hash) % palettes.length];
}

function parseLrc(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const text = line.replace(timeReg, '').trim();
    if (!text) continue;
    let match: RegExpExecArray | null;
    timeReg.lastIndex = 0;
    while ((match = timeReg.exec(line)) !== null) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3]);
      const time = min * 60 + sec + ms / 1000;
      result.push({ time, text });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

// ========== 搜索 API ==========

export const searchApi = {
  async search(keyword: string, limit = 30): Promise<Track[]> {
    if (!keyword.trim()) return [];
    const source = getActiveSource();
    if (!source) return [];

    const res = await sourceRequest<SourceSearchResult>(
      `/search?keywords=${encodeURIComponent(keyword)}&limit=${limit}`
    );
    const songs = res.result?.songs || [];
    return songs
      .filter((s) => s.fee !== 4)
      .map((s) => sourceToTrack(s, source.id));
  },

  async getSongDetail(songIds: number[]): Promise<Track[]> {
    if (songIds.length === 0) return [];
    const source = getActiveSource();
    if (!source) return [];

    const res = await sourceRequest<SourceSongDetailResult>(
      `/song/detail?ids=${songIds.join(',')}`
    );
    return (res.songs || []).map((s) => sourceToTrack(s, source.id));
  },

  async getSongUrl(songId: number): Promise<string> {
    const source = getActiveSource();
    if (!source) return '';

    try {
      const res = await sourceRequest<SourceSongUrlResult>(
        `/song/url?id=${songId}`
      );
      return res.data?.[0]?.url || '';
    } catch {
      return '';
    }
  },

  async getLyrics(songId: number): Promise<LyricLine[]> {
    const source = getActiveSource();
    if (!source) return [];

    try {
      const res = await sourceRequest<SourceLyricResult>(
        `/lyric?id=${songId}`
      );
      if (res.lrc?.lyric) {
        return parseLrc(res.lrc.lyric);
      }
    } catch (e) {
      console.warn('获取歌词失败', e);
    }
    return [];
  },
};

// ========== 歌单 API ==========

export const playlistApi = {
  async getPlaylistDetail(playlistId: number | string): Promise<Track[]> {
    const source = getActiveSource();
    if (!source) return [];

    const res = await sourceRequest<SourcePlaylistResult>(
      `/playlist/detail?id=${playlistId}`
    );
    const songs = res.result?.tracks || res.playlist?.tracks || [];
    return songs
      .filter((s) => s.fee !== 4)
      .map((s) => sourceToTrack(s, source.id));
  },
};

// ========== 推荐 API ==========

export const recommendApi = {
  async getRecommendTracks(): Promise<Track[]> {
    const source = getActiveSource();
    if (!source) return [];

    try {
      const res = await sourceRequest<SourceRecommendResult>(
        `/recommend/songs`
      );
      const songs = res.data?.dailySongs || res.result || [];
      return songs.slice(0, 20).map((s) => sourceToTrack(s, source.id));
    } catch (e) {
      console.warn('获取推荐歌曲失败', e);
      return [];
    }
  },
};

// ========== 扫码登录 API ==========

export const qrLoginApi = {
  async getUnikey(): Promise<string> {
    const res = await sourceRequest<SourceQrKeyResult>(`/login/qr/key`);
    const key = res.unikey || res.data?.unikey;
    if (!key) throw new Error('获取扫码 key 失败');
    return key;
  },

  async checkStatus(key: string): Promise<{
    status: 'waiting' | 'scanned' | 'confirmed' | 'expired';
    nickname?: string;
    avatar?: string;
    cookie?: string;
  }> {
    const res = await sourceRequest<SourceQrCheckResult>(
      `/login/qr/check?key=${key}&timestamp=${Date.now()}`
    );

    if (res.code === 801) return { status: 'waiting' };
    if (res.code === 802)
      return { status: 'scanned', nickname: res.nickname, avatar: res.avatarUrl };
    if (res.code === 803) {
      return {
        status: 'confirmed',
        nickname: res.nickname || '音乐用户',
        avatar: res.avatarUrl,
        cookie: res.cookie,
      };
    }
    if (res.code === 800) return { status: 'expired' };
    return { status: 'waiting' };
  },
};

// ========== 工具函数 ==========

export async function checkAudioPlayable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.redirected && res.url.includes('404')) return false;
    return res.ok;
  } catch {
    return false;
  }
}

export function hasActiveSource(): boolean {
  return getActiveSource() !== null;
}

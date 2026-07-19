/**
 * 音乐 API 服务 - 双模式音源
 *
 * 设计说明：
 * - 软件本身不内置任何音乐 API
 * - 支持两种音源模式：
 *   1. api    —— REST API 模式（兼容 NeteaseCloudMusicApi 接口）
 *   2. script —— LX Music 脚本模式（在线导入 JS 脚本获取播放地址）
 * - 脚本模式下：
 *   - 搜索/歌词：通过公共平台 API + CORS 代理
 *   - 播放地址：通过脚本 musicUrl action 获取
 * - 软件只负责调用音源，不提供音乐内容
 */

import type {
  Track,
  LyricLine,
  Platform,
  MusicSource,
  LxPlatform,
  LxMusicInfo,
  MusicQuality,
} from '@/types';
import { useMusicSourceStore } from '@/store/musicSourceStore';
import { getScriptRuntime } from './lxScriptRuntime';

// ========== CORS 代理 ==========

const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function proxiedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let lastErr: Error | null = null;
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy(url), options);
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err as Error;
    }
  }
  // 直连兜底
  try {
    return await fetch(url, options);
  } catch (err) {
    throw lastErr || err;
  }
}

async function proxiedFetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await proxiedFetch(url, options);
  return res.json() as Promise<T>;
}

// ========== 音源访问 ==========

function getActiveSource(): MusicSource | null {
  return useMusicSourceStore.getState().getActiveSource();
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const source = getActiveSource();
  if (!source || source.mode !== 'api') {
    throw new Error('未配置 API 模式音源');
  }
  const base = source.url.endsWith('/') ? source.url.slice(0, -1) : source.url;
  const url = path.startsWith('http') ? path : `${base}${path}`;
  return proxiedFetchJson<T>(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
      ...(options.headers || {}),
    },
  });
}

// ========== 平台映射 ==========

function inferLxPlatform(platform: Platform): LxPlatform {
  // Platform: 'qq' | 'netease' | 'qishui'
  // LxPlatform: 'kw' | 'kg' | 'tx' | 'wy' | 'mg'
  if (platform === 'qq') return 'tx';
  if (platform === 'netease') return 'wy';
  return 'wy';
}

function platformLabel(platform: Platform): string {
  const map: Record<Platform, string> = {
    qq: 'QQ音乐',
    netease: '网易云',
    qishui: '汽水',
  };
  return map[platform] || '音乐';
}

// ========== 数据转换 ==========

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

// ========== 网易云公共 API（脚本模式时使用） ==========

interface NeteaseSong {
  id: number;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl?: string };
  duration: number;
}

async function neteaseSearch(keyword: string, limit = 30): Promise<NeteaseSong[]> {
  const url = `https://music.163.com/api/search/get?s=${encodeURIComponent(keyword)}&type=1&limit=${limit}&offset=0`;
  const data = await proxiedFetchJson<{ result?: { songs?: NeteaseSong[] } }>(url, {
    method: 'GET',
    headers: { Referer: 'https://music.163.com' },
  });
  return data?.result?.songs || [];
}

async function neteaseLyric(songId: number): Promise<LyricLine[]> {
  const url = `https://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`;
  try {
    const data = await proxiedFetchJson<{ lrc?: { lyric: string } }>(url, {
      headers: { Referer: 'https://music.163.com' },
    });
    if (data?.lrc?.lyric) return parseLrc(data.lrc.lyric);
  } catch (e) {
    console.warn('获取歌词失败', e);
  }
  return [];
}

function neteaseToTrack(song: NeteaseSong): Track {
  const artist = song.artists?.map((a) => a.name).join('/') || '未知艺术家';
  const coverUrl = song.album?.picUrl
    ? song.album.picUrl.replace('http://', 'https://')
    : undefined;
  return {
    id: `netease-${song.id}`,
    title: song.name,
    artist,
    album: song.album?.name || '未知专辑',
    coverColors: generateColors(song.name + artist),
    coverUrl,
    duration: Math.floor((song.duration || 0) / 1000),
    platform: 'netease',
    audioUrl: '',
    neteaseId: song.id,
    lyrics: [],
    tags: ['网易云'],
    playCount: 0,
    likeCount: 0,
    releaseYear: new Date().getFullYear(),
  };
}

// ========== 脚本模式：通过 LX Music 脚本获取播放地址 ==========

async function scriptGetMusicUrl(
  track: Track,
  quality: MusicQuality = '320k'
): Promise<string> {
  const source = getActiveSource();
  if (!source || source.mode !== 'script') {
    throw new Error('未配置脚本音源');
  }
  const runtime = await getScriptRuntime(source.id, source.url);
  const lxPlatform = inferLxPlatform(track.platform);
  const musicInfo: LxMusicInfo = {
    songmid: track.neteaseId?.toString() || track.id,
    hash: track.id,
    songId: track.neteaseId?.toString(),
    name: track.title,
    singer: track.artist,
    source: lxPlatform,
    img: track.coverUrl,
    albumName: track.album,
  };
  return runtime.getMusicUrl(lxPlatform, musicInfo, quality);
}

// ========== 搜索 API ==========

export const searchApi = {
  async search(keyword: string, limit = 30): Promise<Track[]> {
    if (!keyword.trim()) return [];
    const source = getActiveSource();
    if (!source) return [];

    // 脚本模式：用网易云公共搜索
    if (source.mode === 'script') {
      try {
        const songs = await neteaseSearch(keyword, limit);
        return songs.map(neteaseToTrack);
      } catch (e) {
        console.error('脚本模式搜索失败', e);
        return [];
      }
    }

    // API 模式：调用 REST API
    try {
      type ApiSong = {
        id: number;
        name: string;
        artists?: Array<{ name: string }>;
        ar?: Array<{ name: string }>;
        album?: { name: string; picUrl?: string };
        al?: { name: string; picUrl?: string };
        duration?: number;
        dt?: number;
        fee?: number;
      };
      type ApiSearchResult = {
        result?: { songs?: Array<ApiSong> };
      };
      const res = await apiRequest<ApiSearchResult>(
        `/search?keywords=${encodeURIComponent(keyword)}&limit=${limit}`
      );
      const songs = res.result?.songs || [];
      return songs
        .filter((s) => s.fee !== 4)
        .map((s) => {
          const artistList = s.artists || s.ar || [];
          const artist = artistList.map((a) => a.name).join('/') || '未知艺术家';
          const albumInfo = s.album || s.al;
          return {
            id: `src-${source.id}-${s.id}`,
            title: s.name,
            artist,
            album: albumInfo?.name || '未知专辑',
            coverColors: generateColors(s.name + artist),
            coverUrl: albumInfo?.picUrl,
            duration: Math.floor((s.duration || s.dt || 0) / 1000),
            platform: 'netease' as Platform,
            audioUrl: '',
            neteaseId: s.id,
            lyrics: [] as LyricLine[],
            tags: ['网易云'],
            playCount: 0,
            likeCount: 0,
            releaseYear: new Date().getFullYear(),
          } as Track;
        });
    } catch (e) {
      console.error('API 模式搜索失败', e);
      return [];
    }
  },

  /** 兼容旧调用：可传入 trackId(number) 或 Track 对象 */
  async getSongUrl(trackOrId: Track | number, quality: MusicQuality = '320k'): Promise<string> {
    const source = getActiveSource();
    if (!source) return '';

    const track: Track | null =
      typeof trackOrId === 'number' ? null : trackOrId;
    const neteaseId = typeof trackOrId === 'number' ? trackOrId : trackOrId.neteaseId;

    // 脚本模式：必须有 Track 对象
    if (source.mode === 'script') {
      if (!track) {
        console.warn('脚本模式需要 Track 对象，无法仅用 songId 获取 URL');
        return '';
      }
      try {
        return await scriptGetMusicUrl(track, quality);
      } catch (e) {
        console.error('脚本获取 URL 失败', e);
        return '';
      }
    }

    // API 模式
    if (!neteaseId) return '';
    try {
      const res = await apiRequest<{
        data?: Array<{ url: string; br: number; size: number }>;
      }>(`/song/url?id=${neteaseId}`);
      return res.data?.[0]?.url || '';
    } catch (e) {
      console.warn('API 获取 URL 失败', e);
      return '';
    }
  },

  async getLyrics(track: Track): Promise<LyricLine[]> {
    if (!track.neteaseId) return [];
    const source = getActiveSource();

    // 脚本模式：用网易云公共 API
    if (source?.mode === 'script') {
      return neteaseLyric(track.neteaseId);
    }

    // API 模式
    if (!source || source.mode !== 'api') return [];
    try {
      const res = await apiRequest<{ lrc?: { lyric: string } }>(
        `/lyric?id=${track.neteaseId}`
      );
      if (res.lrc?.lyric) return parseLrc(res.lrc.lyric);
    } catch (e) {
      console.warn('API 获取歌词失败', e);
    }
    return [];
  },
};

// ========== 歌单 API ==========

export const playlistApi = {
  async getPlaylistDetail(playlistId: number | string): Promise<Track[]> {
    const source = getActiveSource();
    if (!source || source.mode !== 'api') return [];

    try {
      const res = await apiRequest<{
        result?: { tracks?: any[] };
        playlist?: { tracks?: any[] };
      }>(`/playlist/detail?id=${playlistId}`);
      const songs = res.result?.tracks || res.playlist?.tracks || [];
      return songs
        .filter((s: any) => s.fee !== 4)
        .map((s: any) => {
          const artistList = s.artists || s.ar || [];
          const artist = artistList.map((a: any) => a.name).join('/') || '未知艺术家';
          const albumInfo = s.album || s.al;
          return {
            id: `src-${source.id}-${s.id}`,
            title: s.name,
            artist,
            album: albumInfo?.name || '未知专辑',
            coverColors: generateColors(s.name + artist),
            coverUrl: albumInfo?.picUrl,
            duration: Math.floor((s.duration || s.dt || 0) / 1000),
            platform: 'netease' as Platform,
            audioUrl: '',
            neteaseId: s.id,
            lyrics: [] as LyricLine[],
            tags: ['网易云'],
            playCount: 0,
            likeCount: 0,
            releaseYear: new Date().getFullYear(),
          } as Track;
        });
    } catch (e) {
      console.error('获取歌单失败', e);
      return [];
    }
  },
};

// ========== 推荐 API ==========

export const recommendApi = {
  async getRecommendTracks(): Promise<Track[]> {
    // 优先用网易云公共推荐 API（无需登录）
    try {
      const url = 'https://music.163.com/api/personalized/newsong?limit=20';
      const data = await proxiedFetchJson<{ result?: Array<any> }>(url, {
        headers: { Referer: 'https://music.163.com' },
      });
      const list = data?.result || [];
      return list.slice(0, 20).map((item: any) => {
        const song = item.song || item;
        return neteaseToTrack({
          id: song.id,
          name: song.name,
          artists: song.artists || song.ar || [],
          album: song.album || song.al || {},
          duration: song.duration || song.dt || 0,
        });
      });
    } catch (e) {
      console.warn('获取推荐失败', e);
      return [];
    }
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

export { platformLabel };

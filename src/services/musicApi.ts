/**
 * 真实音乐 API 服务
 * 数据源：网易云音乐公开 API
 * 音频源：网易云外链 https://music.163.com/song/media/outer/url?id={id}.mp3
 *
 * 说明：
 * - 开发环境通过 Vite 代理（/netease/*）解决 CORS
 * - 生产 APK 通过 Capacitor WebView allowNavigation 直接请求
 * - 即使不登录也可播放预置歌曲（外链公开可访问）
 */

import type { Track, LyricLine, Platform } from '@/types';

// ========== 基础配置 ==========

// 网易云 API 基地址
// 开发环境使用 Vite 代理 /netease -> https://music.163.com
const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/netease'
    : 'https://music.163.com';

// 网易云音频外链（可直接作为 <audio> src，不受 CORS 限制）
export const getAudioUrl = (songId: number | string): string =>
  `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;

// 网易云扫码登录二维码 URL
export const getQrCodeUrl = (key: string): string =>
  `https://music.163.com/login?codekey=${key}`;

// 统一请求方法
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Referer: 'https://music.163.com',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// POST 表单
async function postForm<T>(path: string, params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(params).toString();
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

// ========== 类型定义 ==========

interface NeteaseSong {
  id: number;
  name: string;
  artists?: { name: string }[];
  artist?: { name: string };
  album?: { name: string; picUrl?: string; id?: number };
  duration: number;
  fee?: number; // 0 免费, 1 VIP, 4 只能试听, 8 无版权
  playCount?: number;
}

interface NeteaseSearchResult {
  result?: {
    songs?: NeteaseSong[];
    songCount?: number;
  };
  code: number;
}

interface NeteaseSongDetailResult {
  songs?: Array<{
    id: number;
    name: string;
    ar?: { name: string }[];
    al?: { name: string; picUrl?: string };
    dt: number;
    fee?: number;
  }>;
  code: number;
}

interface NeteaseLyricResult {
  lrc?: { lyric: string };
  code: number;
}

interface NeteasePlaylistResult {
  result?: {
    tracks?: NeteaseSong[];
  };
  playlist?: {
    tracks?: NeteaseSong[];
  };
  code: number;
}

interface NeteaseQrUnikeyResult {
  code: number;
  unikey: string;
}

interface NeteaseQrCheckResult {
  code: number;
  account?: { id: number; userName?: string };
  nickname?: string;
  avatarUrl?: string;
  message?: string;
}

interface NeteaseUserPlaylistResult {
  playlist?: Array<{
    id: number;
    name: string;
    coverImgUrl?: string;
    trackCount: number;
    playCount?: number;
  }>;
  code: number;
}

// ========== 数据转换 ==========

// 将网易云歌曲转换为应用内 Track 结构
function neteaseToTrack(song: NeteaseSong, platform: Platform = 'netease'): Track {
  const artist =
    song.artists?.map((a) => a.name).join('/') ||
    song.artist?.name ||
    '未知艺术家';
  const cover = song.album?.picUrl || '';
  const duration = Math.floor((song.duration || 0) / 1000);

  // 根据歌曲名生成配色（程序化封面备份）
  const colors = generateColors(song.name + artist);

  return {
    id: `ne-${song.id}`,
    title: song.name,
    artist,
    album: song.album?.name || '未知专辑',
    coverColors: colors,
    coverUrl: cover,
    duration,
    platform,
    audioUrl: getAudioUrl(song.id),
    neteaseId: song.id,
    lyrics: [],
    tags: ['网易云', '流行'],
    playCount: song.playCount || Math.floor(Math.random() * 5000000) + 100000,
    likeCount: Math.floor(Math.random() * 200000) + 5000,
    releaseYear: 2024,
  };
}

// 程序化生成封面配色
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

// 解析 LRC 歌词
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

// ========== 扫码登录 ==========

export const qrLoginApi = {
  // 1. 获取扫码 key
  async getUnikey(): Promise<string> {
    const res = await postForm<NeteaseQrUnikeyResult>(
      '/api/login/qrcode/unikey',
      { type: '1' }
    );
    if (res.code !== 200 || !res.unikey) {
      throw new Error('获取扫码 key 失败');
    }
    return res.unikey;
  },

  // 2. 检查扫码状态
  // 返回值：{ status: 'waiting' | 'scanned' | 'confirmed' | 'expired', user? }
  async checkStatus(key: string): Promise<{
    status: 'waiting' | 'scanned' | 'confirmed' | 'expired';
    nickname?: string;
    avatar?: string;
    cookie?: string;
  }> {
    const res = await request<NeteaseQrCheckResult>(
      `/api/login/qrcode/client/login?key=${key}&type=1`
    );
    // 800=过期, 801=等待扫码, 802=已扫码等待确认, 803=确认登录
    if (res.code === 801) return { status: 'waiting' };
    if (res.code === 802)
      return { status: 'scanned', nickname: res.nickname, avatar: res.avatarUrl };
    if (res.code === 803) {
      return {
        status: 'confirmed',
        nickname: res.nickname || res.account?.userName || '网易云用户',
        avatar: res.avatarUrl,
      };
    }
    if (res.code === 800) return { status: 'expired' };
    return { status: 'waiting' };
  },
};

// ========== 搜索 ==========

export const searchApi = {
  // 搜索歌曲
  async search(keyword: string, limit = 30): Promise<Track[]> {
    if (!keyword.trim()) return [];
    const res = await request<NeteaseSearchResult>(
      `/api/search/get?s=${encodeURIComponent(keyword)}&type=1&limit=${limit}&offset=0`
    );
    const songs = res.result?.songs || [];
    return songs
      .filter((s) => s.fee !== 4 && s.duration > 30000)
      .map((s) => neteaseToTrack(s));
  },

  // 获取歌曲详情（含封面）
  async getSongDetail(songIds: number[]): Promise<Track[]> {
    if (songIds.length === 0) return [];
    const res = await request<NeteaseSongDetailResult>(
      `/api/song/detail?ids=[${songIds.join(',')}]`
    );
    return (res.songs || []).map((s) =>
      neteaseToTrack({
        id: s.id,
        name: s.name,
        artists: s.ar,
        album: s.al,
        duration: s.dt,
        fee: s.fee,
      })
    );
  },

  // 获取歌词
  async getLyrics(songId: number): Promise<LyricLine[]> {
    try {
      const res = await request<NeteaseLyricResult>(
        `/api/song/lyric?os=pc&id=${songId}&lv=-1&kv=-1&tv=-1`
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

// ========== 歌单 ==========

export const playlistApi = {
  // 获取歌单详情（含歌曲列表）
  async getPlaylistDetail(playlistId: number): Promise<Track[]> {
    const res = await request<NeteasePlaylistResult>(
      `/api/playlist/detail?id=${playlistId}`
    );
    const songs =
      res.result?.tracks || res.playlist?.tracks || [];
    return songs
      .filter((s) => s.fee !== 4 && s.duration > 30000)
      .map((s) => neteaseToTrack(s));
  },

  // 获取用户歌单列表
  async getUserPlaylists(uid: number): Promise<
    Array<{
      id: number;
      name: string;
      coverImgUrl?: string;
      trackCount: number;
      playCount?: number;
    }>
  > {
    const res = await request<NeteaseUserPlaylistResult>(
      `/api/user/playlist?uid=${uid}&limit=30`
    );
    return res.playlist || [];
  },

  // 获取热门歌单（使用网易云官方推荐歌单 ID）
  async getHotPlaylists(): Promise<
    Array<{ id: number; name: string; coverUrl: string; description: string }>
  > {
    // 网易云经典热门歌单 ID
    return [
      { id: 3778678, name: '华语金曲榜', coverUrl: '', description: '华语经典金曲榜单' },
      { id: 19723756, name: '飙升榜', coverUrl: '', description: '云音乐飙升榜' },
      { id: 3779629, name: '新歌榜', coverUrl: '', description: '云音乐新歌榜' },
      { id: 2884035, name: '热歌榜', coverUrl: '', description: '云音乐热歌榜' },
      { id: 991319590, name: '电子音乐精选', coverUrl: '', description: '电音爱好者的天堂' },
      { id: 71385702, name: '民谣合集', coverUrl: '', description: '治愈系民谣歌单' },
    ];
  },
};

// ========== 推荐歌曲 ==========

export const recommendApi = {
  // 获取推荐歌曲（从多个热门歌单中随机抽取）
  async getRecommendTracks(): Promise<Track[]> {
    // 使用多个热门歌单
    const playlistIds = [3778678, 19723756, 3779629, 2884035];
    const allTracks: Track[] = [];

    for (const pid of playlistIds) {
      try {
        const tracks = await playlistApi.getPlaylistDetail(pid);
        allTracks.push(...tracks.slice(0, 10));
      } catch (e) {
        console.warn(`获取歌单 ${pid} 失败`, e);
      }
    }

    // 去重
    const seen = new Set<string>();
    const unique = allTracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    // 打乱
    return shuffle(unique).slice(0, 20);
  },
};

// ========== 工具函数 ==========

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 检测音频是否可播放
export async function checkAudioPlayable(songId: number): Promise<boolean> {
  try {
    const url = getAudioUrl(songId);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.redirected && res.url.includes('404')) return false;
    return res.ok;
  } catch {
    return false;
  }
}

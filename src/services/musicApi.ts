import { useMusicSourceStore } from '@/store/musicSourceStore';
import {
  LxScriptRuntime,
  getScriptRuntime,
  setScriptRuntime,
} from './lxScriptRuntime';
import type { Track, Album, Artist, SearchResult, LxMusicInfo, LxPlatform, MusicQuality } from '@/types';

const NETEASE_PUBLIC_API = 'https://api.injahow.cn';

const ALTERNATE_APIS = [
  'https://api.injahow.cn',
  'https://music.api.pub',
];

let currentApiIndex = 0;

function getCurrentApi(): string {
  return ALTERNATE_APIS[currentApiIndex];
}

function switchApi(): void {
  currentApiIndex = (currentApiIndex + 1) % ALTERNATE_APIS.length;
  console.log('[musicApi] 切换API源:', getCurrentApi());
}

async function proxiedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const proxies = [
    (u: string) => u,
    (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  ];

  let lastErr: Error | null = null;
  
  for (let attempt = 0; attempt < ALTERNATE_APIS.length; attempt++) {
    const apiBase = getCurrentApi();
    const fullUrl = url.replace(NETEASE_PUBLIC_API, apiBase);
    
    for (const proxy of proxies) {
      try {
        const resp = await fetch(proxy(fullUrl), {
          ...options,
          signal: AbortSignal.timeout(10000),
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          },
        });
        if (resp.ok) return resp;
        lastErr = new Error(`HTTP ${resp.status}`);
      } catch (e) {
        lastErr = e as Error;
      }
    }
    
    switchApi();
  }
  
  throw lastErr || new Error('All APIs failed');
}

async function proxiedFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const resp = await proxiedFetch(url, options);
  return resp.json() as Promise<T>;
}

export function hasActiveSource(): boolean {
  const state = useMusicSourceStore.getState();
  const source = state.getActiveSource();
  return source !== null && source.enabled;
}

async function getOrCreateRuntime(): Promise<LxScriptRuntime | null> {
  const state = useMusicSourceStore.getState();
  const source = state.getActiveSource();

  if (!source || !source.enabled) return null;
  if (source.mode !== 'script') return null;

  let runtime = getScriptRuntime(source.id);
  if (runtime && runtime.isReady) return runtime;

  runtime = new LxScriptRuntime();
  try {
    await runtime.load(source.url);
    setScriptRuntime(source.id, runtime);

    const meta = runtime.getMeta();
    if (meta) {
      state.updateSource(source.id, { scriptMeta: meta });
    }

    return runtime;
  } catch (e) {
    console.error('[musicApi] 加载脚本失败:', e);
    return null;
  }
}

function trackToLxMusicInfo(track: Track): LxMusicInfo {
  return {
    songmid: track.sourceId || track.id,
    songId: track.id,
    songName: track.name,
    singerName: track.artists.map((a) => a.name).join(' / '),
    singerId: track.artists[0]?.id,
    albumId: track.album?.id,
    albumName: track.album?.name || '',
    img: track.cover,
    interval: track.duration,
  };
}

async function scriptGetMusicUrl(
  track: Track,
  quality: MusicQuality = '320k'
): Promise<string | null> {
  const runtime = await getOrCreateRuntime();
  if (!runtime) return null;

  const state = useMusicSourceStore.getState();
  const source = state.getActiveSource();
  if (!source || !source.scriptMeta || source.scriptMeta.sources.length === 0) {
    return null;
  }

  const platform = source.scriptMeta.sources[0];
  const musicInfo = trackToLxMusicInfo(track);

  try {
    const url = await runtime.getMusicUrl(platform, musicInfo, quality);
    console.log('[musicApi] 脚本返回播放URL:', url ? url.substring(0, 80) + '...' : '空');
    return url;
  } catch (e) {
    console.error('[musicApi] 脚本获取播放URL失败:', e);
    return null;
  }
}

async function neteaseSearch(keyword: string, limit = 30): Promise<SearchResult> {
  try {
    const data = await proxiedFetchJson<any>(
      `${NETEASE_PUBLIC_API}/search?keywords=${encodeURIComponent(keyword)}&limit=${limit}`
    );

    if (!data || !data.result) {
      return { tracks: [], albums: [], artists: [] };
    }

    const result = data.result;

    return {
      tracks: (result.songs || result.data || []).map((s: any) => ({
        id: String(s.id),
        sourceId: String(s.id),
        platform: 'wy' as const,
        name: s.name,
        artists: (s.ar || s.artists || []).map((a: any) => ({
          id: String(a.id),
          name: a.name,
          avatar: null,
        })),
        album: s.al || s.album
          ? {
              id: String(s.al?.id || s.album?.id),
              name: s.al?.name || s.album?.name,
              cover: s.al?.picUrl || s.album?.cover || null,
            }
          : null,
        cover: s.al?.picUrl || s.album?.cover || null,
        duration: s.dt ? Math.floor(s.dt / 1000) : s.duration || 0,
        url: null,
        audioUrl: null,
        lyrics: null,
      })),
      albums: [],
      artists: [],
    };
  } catch (e) {
    console.error('[musicApi] 网易云搜索失败:', e);
    return { tracks: [], albums: [], artists: [] };
  }
}

async function neteaseLyric(songId: string): Promise<string | null> {
  try {
    const data = await proxiedFetchJson<any>(
      `${NETEASE_PUBLIC_API}/lyric?id=${songId}`
    );
    if (data && (data.lrc?.lyric || data.result?.lrc)) {
      return data.lrc?.lyric || data.result?.lrc;
    }
    return null;
  } catch {
    return null;
  }
}

async function neteaseSongUrl(songId: string, quality = '320'): Promise<string | null> {
  try {
    const data = await proxiedFetchJson<any>(
      `${NETEASE_PUBLIC_API}/song/url/v1?id=${songId}&level=${quality}`
    );
    if (data && data.data?.[0]?.url) {
      return data.data[0].url;
    }
    return null;
  } catch {
    return null;
  }
}

async function neteaseRecommendPlaylists(limit = 10) {
  try {
    const data = await proxiedFetchJson<any>(
      `${NETEASE_PUBLIC_API}/personalized?limit=${limit}`
    );
    if (data && data.result) {
      return data.result.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        cover: p.picUrl,
        playCount: p.playCount,
        description: p.copywriter || '',
      }));
    }
    return [];
  } catch {
    return [];
  }
}

async function neteaseNewSongs() {
  try {
    const data = await proxiedFetchJson<any>(
      `${NETEASE_PUBLIC_API}/personalized/newsong?limit=12`
    );
    if (data && data.result) {
      return data.result.map((item: any) => {
        const s = item.song;
        return {
          id: String(s.id),
          sourceId: String(s.id),
          platform: 'wy' as const,
          name: s.name,
          artists: (s.artists || []).map((a: any) => ({
            id: String(a.id),
            name: a.name,
            avatar: null,
          })),
          album: s.album
            ? {
                id: String(s.album.id),
                name: s.album.name,
                cover: s.album.picUrl || null,
              }
            : null,
          cover: s.album?.picUrl || null,
          duration: s.duration ? Math.floor(s.duration / 1000) : 0,
          url: null,
          audioUrl: null,
          lyrics: null,
        };
      });
    }
    return [];
  } catch {
    return [];
  }
}

async function neteasePlaylistDetail(playlistId: string) {
  try {
    const data = await proxiedFetchJson<any>(
      `${NETEASE_PUBLIC_API}/playlist/detail?id=${playlistId}`
    );
    if (data && data.playlist) {
      const pl = data.playlist;
      const trackIds = pl.trackIds?.slice(0, 50).map((t: any) => t.id).join(',') || '';

      let tracks: Track[] = [];
      if (trackIds) {
        const songsData = await proxiedFetchJson<any>(
          `${NETEASE_PUBLIC_API}/song/detail?ids=${trackIds}`
        );
        if (songsData && songsData.songs) {
          tracks = songsData.songs.map((s: any) => ({
            id: String(s.id),
            sourceId: String(s.id),
            platform: 'wy' as const,
            name: s.name,
            artists: (s.ar || []).map((a: any) => ({
              id: String(a.id),
              name: a.name,
              avatar: null,
            })),
            album: s.al
              ? {
                  id: String(s.al.id),
                  name: s.al.name,
                  cover: s.al.picUrl || null,
                }
              : null,
            cover: s.al?.picUrl || null,
            duration: s.dt ? Math.floor(s.dt / 1000) : 0,
            url: null,
            audioUrl: null,
            lyrics: null,
          }));
        }
      }

      return {
        id: String(pl.id),
        name: pl.name,
        cover: pl.coverImgUrl,
        description: pl.description || '',
        playCount: pl.playCount,
        trackCount: pl.trackCount,
        tracks,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const searchApi = {
  async search(keyword: string, limit = 30): Promise<SearchResult> {
    return neteaseSearch(keyword, limit);
  },

  async getSongUrl(
    trackOrId: Track | string,
    quality: MusicQuality = '320k'
  ): Promise<string | null> {
    let track: Track;
    if (typeof trackOrId === 'string') {
      track = {
        id: trackOrId,
        sourceId: trackOrId,
        platform: 'wy',
        name: '',
        artists: [],
        album: null,
        cover: null,
        duration: 0,
        url: null,
        audioUrl: null,
        lyrics: null,
      };
    } else {
      track = trackOrId;
    }

    if (hasActiveSource()) {
      const scriptUrl = await scriptGetMusicUrl(track, quality);
      if (scriptUrl) return scriptUrl;
    }

    const songId = track.sourceId || track.id;
    if (songId && /^\d+$/.test(songId)) {
      const qualityMap: Record<MusicQuality, string> = {
        '128k': 'standard',
        '192k': 'higher',
        '320k': 'exhigh',
        'flac': 'lossless',
        'flac24bit': 'hires',
      };
      const neteaseUrl = await neteaseSongUrl(songId, qualityMap[quality]);
      if (neteaseUrl) return neteaseUrl;
    }

    return null;
  },

  async getLyrics(track: Track): Promise<string | null> {
    const songId = track.sourceId || track.id;

    if (hasActiveSource()) {
      const runtime = await getOrCreateRuntime();
      if (runtime) {
        const state = useMusicSourceStore.getState();
        const source = state.getActiveSource();
        if (source?.scriptMeta?.sources?.[0]) {
          try {
            const lyric = await runtime.getMusicLyric(
              source.scriptMeta.sources[0],
              trackToLxMusicInfo(track)
            );
            if (lyric) return lyric;
          } catch { /* ignore */ }
        }
      }
    }

    if (songId && /^\d+$/.test(songId)) {
      return neteaseLyric(songId);
    }

    return null;
  },
};

export const recommendApi = {
  async getRecommendPlaylists(limit = 10) {
    return neteaseRecommendPlaylists(limit);
  },

  async getNewSongs() {
    return neteaseNewSongs();
  },

  async getPlaylistDetail(playlistId: string) {
    return neteasePlaylistDetail(playlistId);
  },

  async getRecommendTracks(limit = 20): Promise<Track[]> {
    const tasks = [
      neteaseNewSongs(),
      neteaseRecommendPlaylists(1).then(async (playlists) => {
        if (playlists.length > 0) {
          const detail = await neteasePlaylistDetail(playlists[0].id);
          return detail?.tracks || [];
        }
        return [];
      }),
    ];

    try {
      const results = await Promise.allSettled(tasks);
      const allTracks: Track[] = [];
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allTracks.push(...result.value);
        }
      }

      const uniqueTracks = allTracks.filter(
        (track, index, self) => index === self.findIndex(t => t.id === track.id)
      );

      return uniqueTracks.slice(0, limit);
    } catch (e) {
      console.warn('[musicApi] 获取推荐失败:', e);
      return neteaseNewSongs().then((songs) => songs.slice(0, limit));
    }
  },
};

// ==================== 平台类型 ====================
// LX Music 平台代号：kw=酷我, kg=酷狗, tx=QQ, wy=网易云, mg=咪咕
export type LxPlatform = 'kw' | 'kg' | 'tx' | 'wy' | 'mg' | 'local';

// 应用内部平台类型（兼容 LX 平台代号）
export type Platform = LxPlatform;

// ==================== 音质 ====================
export type MusicQuality = '128k' | '192k' | '320k' | 'flac' | 'flac24bit';

// ==================== 歌曲数据结构 ====================
export interface Artist {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface Album {
  id: string;
  name: string;
  cover?: string | null;
  artist?: string;
}

export interface Track {
  id: string;
  sourceId?: string;
  platform: Platform;
  name: string;
  artists: Artist[];
  album: Album | null;
  cover?: string | null;
  duration: number;
  url?: string | null;
  audioUrl?: string | null;
  lyrics?: string | null;
  neteaseId?: number;

  // 兼容旧代码的字段（用于UI渲染）
  title?: string;
  artist?: string;
  coverColors?: CoverColors;
  coverUrl?: string;
  tags?: string[];
  playCount?: number;
  likeCount?: number;
  releaseYear?: number;
}

// 搜索结果
export interface SearchResult {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
}

// ==================== 歌单 ====================
export interface Playlist {
  id: string;
  name: string;
  cover?: string;
  description?: string;
  playCount?: number;
  trackCount?: number;
  tracks?: Track[];
  // 兼容旧代码
  coverColors?: CoverColors;
  platform?: Platform | 'mixed';
  trackIds?: string[];
}

// 榜单
export interface Chart {
  name: string;
  tracks: Track[];
}

// ==================== 音源相关 ====================

// 音源类型
export type SourceType = 'netease' | 'qq' | 'kugou' | 'kuwo' | 'mg' | 'custom';

// 音源加载方式
export type SourceMode = 'api' | 'script';

// 音源配置
export interface MusicSource {
  id: string;
  name: string;
  type: SourceType;
  mode: SourceMode;
  url: string;
  enabled: boolean;
  sortOrder: number;
  createdAt: number;
  lastTestOk?: boolean;
  scriptMeta?: SourceScriptMeta;
}

// 脚本音源元信息
export interface SourceScriptMeta {
  scriptName: string;
  scriptDescription?: string;
  scriptVersion?: string;
  scriptAuthor?: string;
  scriptHomepage?: string;
  sources: LxPlatform[];
  sourceDetails: Record<LxPlatform, {
    name: string;
    type: string;
    actions: string[];
    qualitys: MusicQuality[];
  }>;
}

// LX Music 歌曲信息（传递给脚本）
export interface LxMusicInfo {
  songmid: string;
  songId?: string;
  songName: string;
  singerId?: string;
  singerName: string;
  albumId?: string;
  albumName?: string;
  interval?: number;
  img?: string;
  payPlay?: string;
  [key: string]: any;
}

// ==================== Capacitor 类型 ====================
interface CapacitorApp {
  exitApp(): void;
}

interface CapacitorPlugins {
  App?: CapacitorApp;
}

interface Capacitor {
  Plugins?: CapacitorPlugins;
}

declare global {
  interface Window {
    Capacitor?: Capacitor;
  }
}
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  vipLevel: 0 | 1 | 2;
  totalListenMinutes: number;
  totalTracks: number;
  joinDate: string;
  // 兼容旧代码
  boundPlatforms?: Platform[];
  favoriteGenres?: GenreScore[];
  playlists?: Playlist[];
  recentPlayed?: Track[];
  achievements?: Achievement[];
}

// ==================== 播放相关 ====================
// 推荐流筛选
export type FeedFilter = 'all' | Platform;

// 播放模式
export type PlayMode = 'order' | 'repeat-one' | 'shuffle';

// 歌词行
export interface LyricLine {
  time: number;
  text: string;
}

// 封面配色（用于程序化生成封面效果）
export interface CoverColors {
  from: string;
  to: string;
  accent: string;
}

// 用户偏好曲风
export interface GenreScore {
  genre: string;
  score: number;
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

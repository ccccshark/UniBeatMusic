// 平台类型
export type Platform = 'qq' | 'netease' | 'qishui';

// 平台元信息
export interface PlatformMeta {
  code: Platform;
  name: string;
  shortName: string;
  color: string;
  logo: string; // 单字标识
  gradient: string;
}

// 歌词行
export interface LyricLine {
  time: number; // 秒
  text: string;
}

// 封面配色（用于程序化生成封面）
export interface CoverColors {
  from: string;
  to: string;
  accent: string;
}

// 歌曲数据结构
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverColors: CoverColors;
  coverUrl?: string; // 真实封面图片 URL（网易云）
  duration: number; // 秒
  platform: Platform;
  audioUrl: string;
  neteaseId?: number; // 网易云歌曲 ID（用于获取歌词等）
  lyrics: LyricLine[];
  tags: string[];
  playCount: number;
  likeCount: number;
  releaseYear: number;
}

// 歌单
export interface Playlist {
  id: string;
  name: string;
  coverColors: CoverColors;
  trackCount: number;
  platform: Platform | 'mixed';
  description: string;
  playCount: number;
  trackIds: string[];
}

// 用户偏好曲风
export interface GenreScore {
  genre: string;
  score: number; // 0-100
}

// 用户数据
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  vipLevel: 0 | 1 | 2;
  boundPlatforms: Platform[];
  totalListenMinutes: number;
  totalTracks: number;
  favoriteGenres: GenreScore[];
  playlists: Playlist[];
  recentPlayed: Track[];
  joinDate: string;
  achievements: Achievement[];
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0-100
}

// 榜单
export interface Chart {
  name: string;
  tracks: Track[];
}

// 推荐流筛选
export type FeedFilter = 'all' | Platform;

// 播放模式
export type PlayMode = 'order' | 'repeat-one' | 'shuffle';

// ==================== 音源相关 ====================

// 音源类型
export type SourceType = 'netease' | 'qq' | 'kugou' | 'kuwo' | 'mg' | 'custom';

// 音源加载方式
// - api: REST API 模式（兼容 NeteaseCloudMusicApi 接口）
// - script: LX Music 脚本模式（在线导入 JS 脚本，通过 globalThis.lx 通信）
export type SourceMode = 'api' | 'script';

// 音源配置
export interface MusicSource {
  id: string;
  name: string;
  type: SourceType;
  mode: SourceMode;
  // API 模式：API 基地址；脚本模式：脚本 URL 或脚本内容
  url: string;
  enabled: boolean;
  sortOrder: number;
  // 添加时间
  createdAt: number;
  // 最后测试状态
  lastTestOk?: boolean;
  // 脚本模式缓存：脚本加载后的元信息
  scriptMeta?: SourceScriptMeta;
}

// 脚本音源元信息（来自 LX Music 脚本的 send(EVENT_NAMES.inited)）
export interface SourceScriptMeta {
  // 脚本支持的平台列表：['kw', 'kg', 'tx', 'wy', 'mg']
  sources: string[];
  // 各平台支持的音质
  qualitys?: Record<string, string[]>;
  // 脚本名/描述（来自注释）
  scriptName?: string;
  scriptVersion?: string;
  scriptDescription?: string;
}

// 音源 API 通用响应
export interface SourceResponse<T = any> {
  code: number;
  data?: T;
  result?: T;
  message?: string;
}

// LX Music 平台代号 → 应用 Platform 的映射
// kw=酷我, kg=酷狗, tx=QQ, wy=网易云, mg=咪咕
export type LxPlatform = 'kw' | 'kg' | 'tx' | 'wy' | 'mg';

// LX Music 歌曲信息（传递给脚本 musicUrl action 的 musicInfo）
export interface LxMusicInfo {
  songmid: string;
  hash?: string;
  songId?: string;
  albumId?: string;
  name: string;
  singer: string;
  source: LxPlatform;
  img?: string;
  albumName?: string;
  interval?: string;
}

// 音质等级
export type MusicQuality = '128k' | '192k' | '320k' | 'flac' | 'flac24bit';

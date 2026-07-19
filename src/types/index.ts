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
export type SourceType = 'netease' | 'qq' | 'kugou' | 'kuwo' | 'custom';

// 音源配置
export interface MusicSource {
  id: string;
  name: string;
  type: SourceType;
  baseUrl: string; // 音源 API 基地址
  enabled: boolean;
  sortOrder: number;
  // 可选：音源需要的额外配置（如 token、cookie 等）
  extra?: Record<string, string>;
}

// 音源 API 通用响应
export interface SourceResponse<T = any> {
  code: number;
  data?: T;
  result?: T;
  message?: string;
}

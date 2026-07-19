import type {
  Platform,
  Track,
  Playlist,
  UserProfile,
  Chart,
  FeedFilter,
} from '@/types';
import { TRACKS, getTrackById } from '@/data/tracks';
import { PLAYLISTS } from '@/data/playlists';
import { DEMO_USER } from '@/data/users';

// 模拟网络延迟
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// 打乱数组
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const mockApi = {
  // 第三方平台登录（模拟 OAuth 流程）
  async loginWithPlatform(platform: Platform): Promise<UserProfile> {
    await delay(1400); // 模拟授权跳转
    const user: UserProfile = {
      ...DEMO_USER,
      boundPlatforms: Array.from(new Set([...DEMO_USER.boundPlatforms, platform])),
      nickname: `${DEMO_USER.nickname}`,
    };
    return user;
  },

  // 邮箱登录
  async loginWithEmail(email: string, _password: string): Promise<UserProfile> {
    await delay(800);
    return {
      ...DEMO_USER,
      nickname: email.split('@')[0] || DEMO_USER.nickname,
      boundPlatforms: [],
    };
  },

  // 游客快速体验
  async loginAsGuest(): Promise<UserProfile> {
    await delay(300);
    return { ...DEMO_USER, vipLevel: 0, boundPlatforms: [] };
  },

  // 推荐流（按平台过滤）
  async getRecommendFeed(filter: FeedFilter = 'all'): Promise<Track[]> {
    await delay(400);
    const list = filter === 'all' ? TRACKS : TRACKS.filter((t) => t.platform === filter);
    return shuffle(list);
  },

  // 根据 ID 获取歌曲
  async getTrackById(id: string): Promise<Track> {
    await delay(200);
    const t = getTrackById(id);
    if (!t) throw new Error(`Track ${id} not found`);
    return t;
  },

  // 发现页歌单
  async getDiscoverPlaylists(): Promise<Playlist[]> {
    await delay(500);
    return PLAYLISTS;
  },

  // 榜单
  async getCharts(): Promise<Chart[]> {
    await delay(500);
    const sorted = [...TRACKS].sort((a, b) => b.playCount - a.playCount);
    return [
      { name: '飙升榜', tracks: sorted.slice(0, 6) },
      { name: '新歌速递', tracks: [...TRACKS].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 6) },
      { name: '热歌榜', tracks: [...TRACKS].sort((a, b) => b.likeCount - a.likeCount).slice(0, 6) },
    ];
  },

  // 切换收藏
  async toggleLike(_trackId: string): Promise<boolean> {
    await delay(150);
    return true;
  },

  // 获取用户信息
  async getUserProfile(): Promise<UserProfile> {
    await delay(300);
    return DEMO_USER;
  },

  // 绑定第三方平台
  async bindPlatform(platform: Platform): Promise<{ platform: Platform; success: boolean }> {
    await delay(1200);
    return { platform, success: true };
  },

  // 解绑第三方平台
  async unbindPlatform(platform: Platform): Promise<{ platform: Platform; success: boolean }> {
    await delay(800);
    return { platform, success: true };
  },

  // 个性化推荐（基于用户偏好排序）
  async getPersonalizedRecommend(userGenres: { genre: string; score: number }[]): Promise<Track[]> {
    await delay(600);
    const genreScores = new Map(userGenres.map((g) => [g.genre, g.score]));
    const scored = TRACKS.map((t) => {
      const score = t.tags.reduce((sum, tag) => sum + (genreScores.get(tag) || 0), 0);
      return { track: t, score };
    });
    return scored.sort((a, b) => b.score - a.score).map((s) => s.track).slice(0, 8);
  },
};

// 模拟随机延迟工具
export function simulateLoading<T>(data: T, min = 200, max = 500): Promise<T> {
  return delay(rand(min, max)).then(() => data);
}

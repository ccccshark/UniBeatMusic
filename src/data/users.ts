import type { UserProfile, Achievement } from '@/types';
import { TRACKS } from './tracks';
import { PLAYLISTS } from './playlists';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-001',
    title: '初入星际',
    description: '完成首次登录',
    icon: 'rocket',
    unlocked: true,
    progress: 100,
  },
  {
    id: 'ach-002',
    title: '三栖玩家',
    description: '绑定全部三个音乐平台账号',
    icon: 'link',
    unlocked: true,
    progress: 100,
  },
  {
    id: 'ach-003',
    title: '夜猫子',
    description: '累计夜间听歌 1000 分钟',
    icon: 'moon',
    unlocked: true,
    progress: 100,
  },
  {
    id: 'ach-004',
    title: '收藏家',
    description: '收藏 50 首歌曲',
    icon: 'heart',
    unlocked: false,
    progress: 68,
  },
  {
    id: 'ach-005',
    title: '探索者',
    description: '听遍所有曲风分类',
    icon: 'compass',
    unlocked: false,
    progress: 45,
  },
  {
    id: 'ach-006',
    title: '社交达人',
    description: '在社区获得 100 个赞',
    icon: 'users',
    unlocked: false,
    progress: 23,
  },
];

export const DEMO_USER: UserProfile = {
  id: 'user-001',
  nickname: '霓虹旅人',
  avatar: '',
  vipLevel: 2,
  boundPlatforms: ['qq', 'netease', 'qishui'],
  totalListenMinutes: 18234,
  totalTracks: 1247,
  favoriteGenres: [
    { genre: '电子', score: 92 },
    { genre: '流行', score: 85 },
    { genre: '国风', score: 68 },
    { genre: '嘻哈', score: 54 },
    { genre: '民谣', score: 76 },
    { genre: '摇滚', score: 62 },
  ],
  playlists: [PLAYLISTS[0], PLAYLISTS[3], PLAYLISTS[6], PLAYLISTS[1]],
  recentPlayed: [TRACKS[0], TRACKS[12], TRACKS[6], TRACKS[1], TRACKS[14]],
  joinDate: '2024-03-15',
  achievements: ACHIEVEMENTS,
};

export const EMPTY_USER: UserProfile = {
  id: '',
  nickname: '游客',
  avatar: '',
  vipLevel: 0,
  boundPlatforms: [],
  totalListenMinutes: 0,
  totalTracks: 0,
  favoriteGenres: [],
  playlists: [],
  recentPlayed: [],
  joinDate: '',
  achievements: [],
};

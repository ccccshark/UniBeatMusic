import type { PlatformMeta } from '@/types';

export const PLATFORMS: Record<string, PlatformMeta> = {
  qq: {
    code: 'qq',
    name: 'QQ音乐',
    shortName: 'QQ',
    color: '#31C27C',
    logo: 'Q',
    gradient: 'linear-gradient(135deg, #31C27C 0%, #1DB954 100%)',
  },
  netease: {
    code: 'netease',
    name: '网易云音乐',
    shortName: '网易云',
    color: '#C20C0C',
    logo: '网',
    gradient: 'linear-gradient(135deg, #C20C0C 0%, #FF4D4D 100%)',
  },
  qishui: {
    code: 'qishui',
    name: '汽水音乐',
    shortName: '汽水',
    color: '#FF6B35',
    logo: '汽',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFB084 100%)',
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export function getPlatform(code: string): PlatformMeta {
  return PLATFORMS[code] ?? PLATFORMS.qq;
}

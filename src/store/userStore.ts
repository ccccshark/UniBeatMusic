import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Platform, UserProfile } from '@/types';
import { mockApi } from '@/services/mockApi';
import { EMPTY_USER } from '@/data/users';
import { qrLoginApi } from '@/services/musicApi';

interface UserState {
  user: UserProfile;
  isLoggedIn: boolean;
  likedTrackIds: string[];
  logging: boolean;
  // 扫码登录相关
  qrKey: string | null;
  qrStatus: 'idle' | 'waiting' | 'scanned' | 'confirmed' | 'expired';
  qrNickname?: string;
  qrAvatar?: string;
  // 登录方式
  loginType: 'mock' | 'netease' | null;
  // 原有方法
  loginWithPlatform: (platform: Platform) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  bindPlatform: (platform: Platform) => Promise<void>;
  unbindPlatform: (platform: Platform) => Promise<void>;
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  // 扫码登录方法
  initQrLogin: () => Promise<void>;
  pollQrStatus: () => Promise<void>;
  resetQrState: () => void;
  completeNeteaseLogin: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: EMPTY_USER,
      isLoggedIn: false,
      likedTrackIds: [],
      logging: false,
      qrKey: null,
      qrStatus: 'idle',
      loginType: null,

      loginWithPlatform: async (platform) => {
        set({ logging: true });
        try {
          const user = await mockApi.loginWithPlatform(platform);
          set({
            user,
            isLoggedIn: true,
            logging: false,
            loginType: 'mock',
          });
        } catch (e) {
          set({ logging: false });
          throw e;
        }
      },

      loginWithEmail: async (email, password) => {
        set({ logging: true });
        try {
          const user = await mockApi.loginWithEmail(email, password);
          set({
            user,
            isLoggedIn: true,
            logging: false,
            loginType: 'mock',
          });
        } catch (e) {
          set({ logging: false });
          throw e;
        }
      },

      loginAsGuest: async () => {
        set({ logging: true });
        try {
          const user = await mockApi.loginAsGuest();
          set({
            user,
            isLoggedIn: true,
            logging: false,
            loginType: 'mock',
          });
        } catch (e) {
          set({ logging: false });
          throw e;
        }
      },

      logout: () => {
        set({
          user: EMPTY_USER,
          isLoggedIn: false,
          likedTrackIds: [],
          qrKey: null,
          qrStatus: 'idle',
          loginType: null,
        });
      },

      bindPlatform: async (platform) => {
        await mockApi.bindPlatform(platform);
        const user = get().user;
        if (!user.boundPlatforms.includes(platform)) {
          set({ user: { ...user, boundPlatforms: [...user.boundPlatforms, platform] } });
        }
      },

      unbindPlatform: async (platform) => {
        await mockApi.unbindPlatform(platform);
        const user = get().user;
        set({
          user: {
            ...user,
            boundPlatforms: user.boundPlatforms.filter((p) => p !== platform),
          },
        });
      },

      toggleLike: (trackId) => {
        const current = get().likedTrackIds;
        if (current.includes(trackId)) {
          set({ likedTrackIds: current.filter((id) => id !== trackId) });
        } else {
          set({ likedTrackIds: [...current, trackId] });
        }
      },

      isLiked: (trackId) => get().likedTrackIds.includes(trackId),

      // ========== 网易云扫码登录 ==========

      // 初始化扫码登录：获取 unikey
      initQrLogin: async () => {
        try {
          set({ qrStatus: 'waiting', qrKey: null });
          const key = await qrLoginApi.getUnikey();
          set({ qrKey: key, qrStatus: 'waiting' });
        } catch (e) {
          console.error('初始化扫码登录失败', e);
          set({ qrStatus: 'idle' });
        }
      },

      // 轮询扫码状态
      pollQrStatus: async () => {
        const { qrKey, qrStatus } = get();
        if (!qrKey || qrStatus === 'confirmed' || qrStatus === 'expired') return;

        try {
          const res = await qrLoginApi.checkStatus(qrKey);
          if (res.status === 'scanned') {
            set({
              qrStatus: 'scanned',
              qrNickname: res.nickname,
              qrAvatar: res.avatar,
            });
          } else if (res.status === 'confirmed') {
            set({
              qrStatus: 'confirmed',
              qrNickname: res.nickname,
              qrAvatar: res.avatar,
            });
            // 自动完成登录
            get().completeNeteaseLogin();
          } else if (res.status === 'expired') {
            set({ qrStatus: 'expired' });
          }
        } catch (e) {
          console.warn('轮询扫码状态失败', e);
        }
      },

      // 重置扫码状态
      resetQrState: () => {
        set({
          qrKey: null,
          qrStatus: 'idle',
          qrNickname: undefined,
          qrAvatar: undefined,
        });
      },

      // 完成网易云登录
      completeNeteaseLogin: () => {
        const { qrNickname, qrAvatar, user } = get();
        set({
          user: {
            ...user,
            nickname: qrNickname || '网易云用户',
            avatar: qrAvatar || '',
            boundPlatforms: Array.from(
              new Set([...user.boundPlatforms, 'netease' as Platform])
            ),
          },
          isLoggedIn: true,
          loginType: 'netease',
        });
      },
    }),
    {
      name: 'unibeat-user',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        likedTrackIds: state.likedTrackIds,
        loginType: state.loginType,
      }),
    }
  )
);

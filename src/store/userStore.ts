import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Platform, UserProfile } from '@/types';
import { mockApi } from '@/services/mockApi';
import { EMPTY_USER } from '@/data/users';

interface UserState {
  user: UserProfile;
  isLoggedIn: boolean;
  likedTrackIds: string[];
  logging: boolean;
  loginWithPlatform: (platform: Platform) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  bindPlatform: (platform: Platform) => Promise<void>;
  unbindPlatform: (platform: Platform) => Promise<void>;
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: EMPTY_USER,
      isLoggedIn: false,
      likedTrackIds: [],
      logging: false,

      loginWithPlatform: async (platform) => {
        set({ logging: true });
        try {
          const user = await mockApi.loginWithPlatform(platform);
          set({ user, isLoggedIn: true, logging: false });
        } catch (e) {
          set({ logging: false });
          throw e;
        }
      },

      loginWithEmail: async (email, password) => {
        set({ logging: true });
        try {
          const user = await mockApi.loginWithEmail(email, password);
          set({ user, isLoggedIn: true, logging: false });
        } catch (e) {
          set({ logging: false });
          throw e;
        }
      },

      loginAsGuest: async () => {
        set({ logging: true });
        try {
          const user = await mockApi.loginAsGuest();
          set({ user, isLoggedIn: true, logging: false });
        } catch (e) {
          set({ logging: false });
          throw e;
        }
      },

      logout: () => {
        set({ user: EMPTY_USER, isLoggedIn: false, likedTrackIds: [] });
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
    }),
    {
      name: 'unibeat-user',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        likedTrackIds: state.likedTrackIds,
      }),
    }
  )
);

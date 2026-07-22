import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

const EMPTY_USER: UserProfile = {
  id: 'guest',
  nickname: '音乐爱好者',
  avatar: '',
  vipLevel: 0,
  totalListenMinutes: 0,
  totalTracks: 0,
  joinDate: new Date().toISOString(),
};

interface UserState {
  user: UserProfile;
  isLoggedIn: boolean;
  likedTrackIds: string[];
  searchHistory: string[];
  logging: boolean;
  loginType: 'mock' | 'netease' | null;
  logout: () => void;
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  addSearchHistory: (query: string) => void;
  getSearchHistory: () => string[];
  clearSearchHistory: () => void;
  initGuest: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: { ...EMPTY_USER },
      isLoggedIn: true,
      likedTrackIds: [],
      searchHistory: [],
      logging: false,
      loginType: 'mock',

      initGuest: () => {
        if (!get().isLoggedIn) {
          set({
            user: { ...EMPTY_USER },
            isLoggedIn: true,
            loginType: 'mock',
          });
        }
      },

      logout: () => {
        set({
          user: { ...EMPTY_USER },
          isLoggedIn: true,
          likedTrackIds: [],
          searchHistory: [],
          loginType: 'mock',
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

      addSearchHistory: (query) => {
        const history = get().searchHistory.filter(q => q !== query);
        history.unshift(query);
        if (history.length > 10) {
          history.pop();
        }
        set({ searchHistory: history });
      },

      getSearchHistory: () => get().searchHistory,

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },
    }),
    {
      name: 'unibeat-user',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        likedTrackIds: state.likedTrackIds,
        searchHistory: state.searchHistory,
        loginType: state.loginType,
      }),
    }
  )
);

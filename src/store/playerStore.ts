import { create } from 'zustand';
import type { Track, PlayMode } from '@/types';

interface PlayerState {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  showFullPlayer: boolean;
  audioElement: HTMLAudioElement | null;
  setAudioElement: (el: HTMLAudioElement | null) => void;
  playTrack: (track: Track, list?: Track[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  prev: () => void;
  setPlayMode: (mode: PlayMode) => void;
  setShowFullPlayer: (show: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  playMode: 'order',
  showFullPlayer: false,
  audioElement: null,

  setAudioElement: (el) => set({ audioElement: el }),

  playTrack: (track, list) => {
    const playlist = list && list.length > 0 ? list : [track];
    set({
      currentTrack: track,
      playlist,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration,
    });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),

  next: () => {
    const { currentTrack, playlist, playMode } = get();
    if (!currentTrack || playlist.length === 0) return;
    if (playMode === 'shuffle') {
      const idx = Math.floor(Math.random() * playlist.length);
      set({
        currentTrack: playlist[idx],
        currentTime: 0,
        isPlaying: true,
      });
      return;
    }
    const idx = playlist.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % playlist.length;
    set({
      currentTrack: playlist[nextIdx],
      currentTime: 0,
      isPlaying: true,
    });
  },

  prev: () => {
    const { currentTrack, playlist } = get();
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + playlist.length) % playlist.length;
    set({
      currentTrack: playlist[prevIdx],
      currentTime: 0,
      isPlaying: true,
    });
  },

  setPlayMode: (mode) => set({ playMode: mode }),
  setShowFullPlayer: (show) => set({ showFullPlayer: show }),
}));

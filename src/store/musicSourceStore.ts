import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MusicSource, SourceType } from '@/types';

const STORAGE_KEY = 'unibeat-music-sources';

const defaultSources: MusicSource[] = [];

interface MusicSourceState {
  sources: MusicSource[];
  activeSourceId: string | null;

  addSource: (source: Omit<MusicSource, 'id' | 'sortOrder'>) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<MusicSource>) => void;
  setActiveSource: (id: string | null) => void;
  toggleSource: (id: string) => void;
  reorderSources: (ids: string[]) => void;
  getActiveSource: () => MusicSource | null;
  getEnabledSources: () => MusicSource[];
  testSource: (baseUrl: string) => Promise<boolean>;
}

export const useMusicSourceStore = create<MusicSourceState>()(
  persist(
    (set, get) => ({
      sources: defaultSources,
      activeSourceId: null,

      addSource: (source) => {
        const newSource: MusicSource = {
          ...source,
          id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          sortOrder: get().sources.length,
        };
        set((state) => ({
          sources: [...state.sources, newSource],
          activeSourceId: state.activeSourceId || newSource.id,
        }));
      },

      removeSource: (id) => {
        set((state) => {
          const newSources = state.sources.filter((s) => s.id !== id);
          let newActiveId = state.activeSourceId;
          if (state.activeSourceId === id) {
            newActiveId = newSources.length > 0 ? newSources[0].id : null;
          }
          return { sources: newSources, activeSourceId: newActiveId };
        });
      },

      updateSource: (id, updates) => {
        set((state) => ({
          sources: state.sources.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      setActiveSource: (id) => {
        set({ activeSourceId: id });
      },

      toggleSource: (id) => {
        set((state) => ({
          sources: state.sources.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
        }));
      },

      reorderSources: (ids) => {
        set((state) => {
          const reordered = ids
            .map((id) => state.sources.find((s) => s.id === id))
            .filter(Boolean) as MusicSource[];
          return {
            sources: reordered.map((s, i) => ({ ...s, sortOrder: i })),
          };
        });
      },

      getActiveSource: () => {
        const { sources, activeSourceId } = get();
        return sources.find((s) => s.id === activeSourceId) || null;
      },

      getEnabledSources: () => {
        return get()
          .sources.filter((s) => s.enabled)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      testSource: async (baseUrl): Promise<boolean> => {
        try {
          const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          const res = await fetch(`${url}/search?keywords=test&limit=1`, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
            },
          });
          return res.ok;
        } catch {
          return false;
        }
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

// ==================== 预设音源模板 ====================

export const SOURCE_TEMPLATES: Array<{
  type: SourceType;
  name: string;
  description: string;
  placeholderUrl: string;
}> = [
  {
    type: 'netease',
    name: '网易云音乐',
    description: '网易云音乐 API 音源，支持搜索/歌词/歌单',
    placeholderUrl: 'https://example.com',
  },
  {
    type: 'qq',
    name: 'QQ音乐',
    description: 'QQ音乐 API 音源',
    placeholderUrl: 'https://example.com',
  },
  {
    type: 'kugou',
    name: '酷狗音乐',
    description: '酷狗音乐 API 音源',
    placeholderUrl: 'https://example.com',
  },
  {
    type: 'kuwo',
    name: '酷我音乐',
    description: '酷我音乐 API 音源',
    placeholderUrl: 'https://example.com',
  },
  {
    type: 'custom',
    name: '自定义音源',
    description: '自定义 API 音源地址',
    placeholderUrl: 'https://your-api.example.com',
  },
];

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MusicSource, SourceType, SourceMode, SourceScriptMeta } from '@/types';
import { LxScriptRuntime, clearScriptRuntime } from '@/services/lxScriptRuntime';

const STORAGE_KEY = 'unibeat-music-sources';

interface MusicSourceState {
  sources: MusicSource[];
  activeSourceId: string | null;

  addSource: (source: Omit<MusicSource, 'id' | 'sortOrder'>) => string;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<MusicSource>) => void;
  setActiveSource: (id: string | null) => void;
  toggleSource: (id: string) => void;
  reorderSources: (ids: string[]) => void;
  getActiveSource: () => MusicSource | null;
  getEnabledSources: () => MusicSource[];
  /** 测试 API 模式音源连通性 */
  testApiSource: (url: string) => Promise<boolean>;
  /** 加载并测试脚本模式音源，返回元信息 */
  testScriptSource: (url: string) => Promise<{ ok: boolean; meta?: SourceScriptMeta; error?: string }>;
}

export const useMusicSourceStore = create<MusicSourceState>()(
  persist(
    (set, get) => ({
      sources: [],
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
        return newSource.id;
      },

      removeSource: (id) => {
        clearScriptRuntime(id);
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
        // 如果 url 变化，清除脚本缓存
        if (updates.url !== undefined || updates.mode !== undefined) {
          const old = get().sources.find((s) => s.id === id);
          if (old && old.mode === 'script') {
            clearScriptRuntime(id);
          }
        }
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

      testApiSource: async (url): Promise<boolean> => {
        try {
          const base = url.endsWith('/') ? url.slice(0, -1) : url;
          // 尝试通过 CORS 代理请求
          const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`${base}/search?keywords=test&limit=1`)}`;
          const res = await fetch(proxyUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          return res.ok;
        } catch {
          // 直连兜底
          try {
            const base = url.endsWith('/') ? url.slice(0, -1) : url;
            const res = await fetch(`${base}/search?keywords=test&limit=1`);
            return res.ok;
          } catch {
            return false;
          }
        }
      },

      testScriptSource: async (url) => {
        try {
          const runtime = new LxScriptRuntime();
          const meta = await runtime.load(url);
          return { ok: true, meta };
        } catch (err) {
          return { ok: false, error: (err as Error).message };
        }
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

// ==================== 预设音源模板 ====================

export interface SourceTemplate {
  type: SourceType;
  mode: SourceMode;
  name: string;
  description: string;
  placeholderUrl: string;
}

export const SOURCE_TEMPLATES: SourceTemplate[] = [
  {
    type: 'custom',
    mode: 'script',
    name: 'LX Music 脚本音源',
    description: '在线导入 LX Music 自定义源脚本（.js），支持 kw/kg/tx/wy/mg',
    placeholderUrl: 'https://raw.githubusercontent.com/.../latest.js',
  },
  {
    type: 'netease',
    mode: 'api',
    name: '网易云音乐 API',
    description: '兼容 NeteaseCloudMusicApi 接口规范的 REST API 服务',
    placeholderUrl: 'https://your-netease-api.example.com',
  },
  {
    type: 'custom',
    mode: 'api',
    name: '自定义 REST API',
    description: '自定义音乐 API 服务地址（兼容 NeteaseCloudMusicApi）',
    placeholderUrl: 'https://your-api.example.com',
  },
];

// ==================== 内置示例脚本 ====================

/** 内置 LX Music 脚本示例（仅作展示，不可用） */
export const EXAMPLE_SCRIPT_URL = 'https://raw.githubusercontent.com/pdone/lx-music-source/main/lx/latest.js';

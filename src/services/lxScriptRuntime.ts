import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import type { LxPlatform, LxMusicInfo, MusicQuality, SourceScriptMeta } from '@/types';

// ==================== LX Music 事件名常量 ====================
const EVENT_NAMES = {
  request: 'request',
  inited: 'inited',
  error: 'error',
} as const;

type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];

interface LxRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface LxResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  url?: string;
}

type RequestCallback = (err: Error | null, resp: LxResponse) => void;

// ==================== CORS 代理请求 ====================
const CORS_PROXIES = [
  (url: string) => url,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
];

async function fetchWithProxy(
  url: string,
  options: LxRequestOptions = {}
): Promise<Response> {
  let lastError: Error | null = null;
  const timeout = options.timeout || 8000;

  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxiedUrl = proxyFn(url);
      const fetchOpts: RequestInit = {
        method: options.method || 'GET',
        headers: options.headers || {},
        signal: AbortSignal.timeout(timeout),
      };

      if (options.body !== undefined) {
        if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
          (fetchOpts.headers as Record<string, string>)['Content-Type'] = 'application/json';
          fetchOpts.body = JSON.stringify(options.body);
        } else {
          fetchOpts.body = options.body as any;
        }
      }

      const resp = await fetch(proxiedUrl, fetchOpts);
      if (resp.ok || resp.status < 500) {
        return resp;
      }
      lastError = new Error(`HTTP ${resp.status}`);
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError || new Error('All proxy requests failed');
}

// ==================== Buffer & Crypto 工具 ====================
function toBuffer(data: string | Uint8Array | number[], encoding?: string): Buffer {
  if (typeof data === 'string') {
    return Buffer.from(data, encoding as BufferEncoding || 'utf8');
  }
  return Buffer.from(data);
}

// ==================== LX 全局环境安装 ====================
function installLxGlobal(scriptInfo: Partial<SourceScriptMeta> = {}) {
  const eventHandlers: Map<EventName, Function[]> = new Map();
  let inited = false;
  let initResolve: (value: SourceScriptMeta) => void;
  let initReject: (reason: any) => void;

  const initPromise = new Promise<SourceScriptMeta>((resolve, reject) => {
    initResolve = resolve;
    initReject = reject;
  });

  // 事件监听
  const on = (event: EventName, handler: Function) => {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, []);
    }
    eventHandlers.get(event)!.push(handler);
  };

  // 事件发送
  const send = (event: EventName, data?: any) => {
    if (event === EVENT_NAMES.inited) {
      inited = true;
      const meta: SourceScriptMeta = {
        scriptName: scriptInfo.scriptName || 'Unknown',
        scriptDescription: scriptInfo.scriptDescription,
        scriptVersion: scriptInfo.scriptVersion,
        scriptAuthor: scriptInfo.scriptAuthor,
        scriptHomepage: scriptInfo.scriptHomepage,
        sources: [],
        sourceDetails: {} as SourceScriptMeta['sourceDetails'],
      };

      if (data && data.sources) {
        meta.sources = Object.keys(data.sources) as LxPlatform[];
        meta.sourceDetails = data.sources;
      }

      initResolve(meta);
      return;
    }

    const handlers = eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try { h(data); } catch (e) { console.warn(`[lx] handler error for ${event}:`, e); }
      });
    }
  };

  // 触发内部事件（给脚本用）
  const triggerInternal = async (event: EventName, data: any): Promise<any> => {
    const handlers = eventHandlers.get(event);
    if (!handlers || handlers.length === 0) {
      throw new Error(`No handler for event: ${event}`);
    }
    // LX 规范：request 事件 handler 返回 Promise
    return handlers[0](data);
  };

  // HTTP 请求（回调式，符合 LX 规范）
  const request = (url: string, options: LxRequestOptions | RequestCallback, callback?: RequestCallback) => {
    const opts: LxRequestOptions = typeof options === 'function' ? {} : options;
    const cb: RequestCallback = (typeof options === 'function' ? options : callback) as RequestCallback;

    if (!cb) return;

    fetchWithProxy(url, opts)
      .then(async (resp) => {
        const headers: Record<string, string> = {};
        resp.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });

        let body: any;
        const contentType = headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          body = await resp.json();
        } else {
          body = await resp.text();
        }

        cb(null, {
          statusCode: resp.status,
          headers,
          body,
          url: resp.url,
        });
      })
      .catch((err) => {
        cb(err, { statusCode: 0, headers: {}, body: null });
      });
  };

  // utils 工具
  const utils = {
    buffer: {
      from: toBuffer,
      Buffer,
    },
    crypto: {
      md5: (text: string) => CryptoJS.MD5(text).toString(),
      sha256: (text: string) => CryptoJS.SHA256(text).toString(),
      aesEncrypt: (text: string, key: string, iv?: string) => {
        const opts: any = { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
        if (iv) opts.iv = CryptoJS.enc.Utf8.parse(iv);
        return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), opts).toString();
      },
      aesDecrypt: (ciphertext: string, key: string, iv?: string) => {
        const opts: any = { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
        if (iv) opts.iv = CryptoJS.enc.Utf8.parse(iv);
        const bytes = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), opts);
        return bytes.toString(CryptoJS.enc.Utf8);
      },
      base64Encode: (text: string) => {
        try {
          return btoa(unescape(encodeURIComponent(text)));
        } catch {
          return Buffer.from(text, 'utf8').toString('base64');
        }
      },
      base64Decode: (encoded: string) => {
        try {
          return decodeURIComponent(escape(atob(encoded)));
        } catch {
          return Buffer.from(encoded, 'base64').toString('utf8');
        }
      },
    },
  };

  // 组装 lx 对象
  const lx = {
    version: '1.0.0',
    env: 'mobile' as const,
    currentScriptInfo: scriptInfo,
    EVENT_NAMES,
    request,
    on,
    send,
    utils,
  };

  // 注入 globalThis
  (globalThis as any).lx = lx;

  // 确保 Buffer 全局可用（很多脚本依赖）
  (globalThis as any).Buffer = Buffer;

  return {
    initPromise,
    triggerInternal,
    cleanup: () => {
      delete (globalThis as any).lx;
    },
  };
}

// 解析脚本头部元信息
function parseScriptHeader(scriptContent: string): Partial<SourceScriptMeta> {
  const meta: Partial<SourceScriptMeta> = {};

  const nameMatch = scriptContent.match(/@name\s+(.+)/);
  if (nameMatch) meta.scriptName = nameMatch[1].trim();

  const descMatch = scriptContent.match(/@description\s+(.+)/);
  if (descMatch) meta.scriptDescription = descMatch[1].trim();

  const verMatch = scriptContent.match(/@version\s+(.+)/);
  if (verMatch) meta.scriptVersion = verMatch[1].trim();

  const authorMatch = scriptContent.match(/@author\s+(.+)/);
  if (authorMatch) meta.scriptAuthor = authorMatch[1].trim();

  const homeMatch = scriptContent.match(/@homepage\s+(.+)/);
  if (homeMatch) meta.scriptHomepage = homeMatch[1].trim();

  return meta;
}

// ==================== 脚本运行时类 ====================
export class LxScriptRuntime {
  private meta: SourceScriptMeta | null = null;
  private triggerInternal: ((event: EventName, data: any) => Promise<any>) | null = null;
  private cleanupFn: (() => void) | null = null;
  private loaded = false;

  async load(scriptUrlOrContent: string): Promise<SourceScriptMeta> {
    let scriptContent: string;
    let isUrl = false;

    // 判断是 URL 还是 脚本内容
    if (scriptUrlOrContent.startsWith('http://') || scriptUrlOrContent.startsWith('https://')) {
      isUrl = true;
      const resp = await fetchWithProxy(scriptUrlOrContent);
      scriptContent = await resp.text();
    } else {
      scriptContent = scriptUrlOrContent;
    }

    // 解析头部元信息
    const scriptInfo = parseScriptHeader(scriptContent);

    // 安装 lx 全局环境
    const { initPromise, triggerInternal, cleanup } = installLxGlobal(scriptInfo);
    this.triggerInternal = triggerInternal;
    this.cleanupFn = cleanup;

    // 设置超时（8秒内必须初始化完成）
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Script init timeout')), 8000);
    });

    // 执行脚本
    try {
      // 使用 Function 构造器执行，比 eval 更安全可控
      const scriptFn = new Function(`
        "use strict";
        ${scriptContent}
      `);
      scriptFn.call(globalThis);
    } catch (e) {
      this.cleanup();
      throw new Error(`Script execution failed: ${(e as Error).message}`);
    }

    try {
      const meta = await Promise.race([initPromise, timeoutPromise]);
      this.meta = meta;
      this.loaded = true;
      return meta;
    } catch (e) {
      this.cleanup();
      throw new Error(`Script init failed: ${(e as Error).message}`);
    }
  }

  // 获取音乐播放 URL
  async getMusicUrl(
    source: LxPlatform,
    musicInfo: LxMusicInfo,
    quality: MusicQuality = '320k'
  ): Promise<string> {
    if (!this.loaded || !this.triggerInternal) {
      throw new Error('Script not loaded');
    }

    const result = await this.triggerInternal(EVENT_NAMES.request, {
      source,
      action: 'musicUrl',
      info: {
        type: quality,
        musicInfo,
      },
    });

    // LX 规范：musicUrl action 返回 url 字符串
    if (typeof result === 'string') return result;
    if (result && typeof result.url === 'string') return result.url;

    throw new Error(`Invalid musicUrl response: ${JSON.stringify(result).slice(0, 200)}`);
  }

  // 获取歌词
  async getMusicLyric(
    source: LxPlatform,
    musicInfo: LxMusicInfo
  ): Promise<string | null> {
    if (!this.loaded || !this.triggerInternal) {
      throw new Error('Script not loaded');
    }

    try {
      const result = await this.triggerInternal(EVENT_NAMES.request, {
        source,
        action: 'lyric',
        info: { musicInfo },
      });

      if (typeof result === 'string') return result;
      if (result && typeof result.lyric === 'string') return result.lyric;
      return null;
    } catch {
      return null;
    }
  }

  // 获取封面
  async getMusicPic(
    source: LxPlatform,
    musicInfo: LxMusicInfo
  ): Promise<string | null> {
    if (!this.loaded || !this.triggerInternal) {
      throw new Error('Script not loaded');
    }

    try {
      const result = await this.triggerInternal(EVENT_NAMES.request, {
        source,
        action: 'pic',
        info: { musicInfo },
      });

      if (typeof result === 'string') return result;
      if (result && typeof result.url === 'string') return result.url;
      return null;
    } catch {
      return null;
    }
  }

  get isReady(): boolean {
    return this.loaded;
  }

  getMeta(): SourceScriptMeta | null {
    return this.meta;
  }

  cleanup(): void {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
    this.meta = null;
    this.triggerInternal = null;
    this.loaded = false;
  }
}

// ==================== 运行时缓存 ====================
const runtimeCache = new Map<string, LxScriptRuntime>();

export function getScriptRuntime(sourceId: string): LxScriptRuntime | null {
  return runtimeCache.get(sourceId) || null;
}

export function setScriptRuntime(sourceId: string, runtime: LxScriptRuntime): void {
  runtimeCache.set(sourceId, runtime);
}

export function clearScriptRuntime(sourceId: string): void {
  const runtime = runtimeCache.get(sourceId);
  if (runtime) {
    runtime.cleanup();
    runtimeCache.delete(sourceId);
  }
}

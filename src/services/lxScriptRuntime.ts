/**
 * LX Music 脚本运行时
 *
 * 实现说明：
 * - 模拟 LX Music 桌面/移动端的 globalThis.lx 全局对象
 * - 用户导入的 JS 脚本通过该对象与宿主通信
 * - 脚本通过 on(EVENT_NAMES.request) 注册请求处理器
 * - 脚本通过 send(EVENT_NAMES.inited) 通知宿主初始化完成
 * - 宿主通过 callRequest() 触发脚本处理 musicUrl/musicPic/musicLyric 等动作
 *
 * 参考 LX Music 脚本规范：
 * - https://github.com/lyswhut/lx-music-mobile/wiki/自定义源
 */

import CryptoJS from 'crypto-js';
import type { SourceScriptMeta, LxMusicInfo, MusicQuality, LxPlatform } from '@/types';

// LX Music 事件名常量（与官方保持一致）
export const EVENT_NAMES = {
  request: 'request',
  inited: 'inited',
  updateAlert: 'updateAlert',
} as const;

// 脚本可处理的 action 类型
export type LxAction = 'musicUrl' | 'musicPic' | 'musicLyric' | 'pic' | 'lyric';

// 请求事件载荷
export interface LxRequestPayload {
  source: LxPlatform | string;
  action: LxAction;
  info: {
    musicInfo: LxMusicInfo;
    type?: MusicQuality | string;
  };
}

// 请求处理器签名（脚本通过 on(EVENT_NAMES.request, handler) 注册）
type RequestHandler = (payload: LxRequestPayload) => Promise<string | null>;

// send(EVENT_NAMES.inited) 的载荷
export interface LxInitedPayload {
  status: boolean;
  openDevTools?: boolean;
  sources?: Record<string, string[]>;
  message?: string;
}

// lx.request 返回类型
export interface LxResponse {
  body: string;
  statusCode: number;
  headers: Record<string, string>;
  raw?: unknown;
}

// lx.request 选项
export interface LxRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  formData?: Record<string, string>;
  timeout?: number;
  json?: unknown;
}

/**
 * 简易 CORS 代理列表，用于绕过浏览器/Capacitor Webview 的 CORS 限制
 * 顺序尝试，第一个成功即用
 */
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => url, // 直连最后兜底
];

async function fetchWithProxy(url: string, options: LxRequestOptions = {}): Promise<LxResponse> {
  const method = options.method || 'GET';
  const headers = options.headers || {};

  // 构造请求体
  let body: BodyInit | undefined;
  if (options.body) {
    body = options.body;
  } else if (options.formData) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(options.formData)) fd.append(k, v);
    body = fd;
  } else if (options.json !== undefined) {
    body = JSON.stringify(options.json);
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  // 顺序尝试代理
  let lastError: Error | null = null;
  for (const proxy of CORS_PROXIES) {
    const targetUrl = proxy(url);
    try {
      const controller = new AbortController();
      const timeout = options.timeout || 15000;
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(targetUrl, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      const text = await res.text();
      return {
        body: text,
        statusCode: res.status,
        headers: Object.fromEntries(res.headers.entries()),
      };
    } catch (err) {
      lastError = err as Error;
      continue;
    }
  }
  throw lastError || new Error('请求失败');
}

/**
 * LX Music 脚本运行时实例
 *
 * 每个脚本音源对应一个独立的 runtime 实例，
 * 避免多个脚本的 globalThis.lx 互相污染。
 */
export class LxScriptRuntime {
  private requestHandler: RequestHandler | null = null;
  private initedData: LxInitedPayload | null = null;
  private initedResolve: ((data: LxInitedPayload) => void) | null = null;
  private initedReject: ((err: Error) => void) | null = null;
  private initedPromise: Promise<LxInitedPayload> | null = null;
  private scriptContent: string = '';
  private scriptUrl: string = '';
  private loadError: string | null = null;

  /** 加载并执行脚本 */
  async load(scriptUrlOrContent: string): Promise<SourceScriptMeta> {
    this.scriptUrl = scriptUrlOrContent;
    this.reset();

    // 拉取脚本内容（如果是 URL）
    if (scriptUrlOrContent.trim().startsWith('http')) {
      try {
        const res = await fetchWithProxy(scriptUrlOrContent.trim(), { timeout: 20000 });
        this.scriptContent = res.body;
      } catch (err) {
        this.loadError = `脚本下载失败：${(err as Error).message}`;
        throw new Error(this.loadError);
      }
    } else {
      this.scriptContent = scriptUrlOrContent.trim();
    }

    if (!this.scriptContent || this.scriptContent.length < 50) {
      this.loadError = '脚本内容为空或过短';
      throw new Error(this.loadError);
    }

    // 准备 inited Promise
    this.initedPromise = new Promise<LxInitedPayload>((resolve, reject) => {
      this.initedResolve = resolve;
      this.initedReject = reject;
    });

    // 注入 globalThis.lx
    this.installLxGlobal();

    // 执行脚本
    try {
      // 使用 Function 构造器执行，避免严格模式直接 eval 的作用域问题
      const fn = new Function('globalThis', this.scriptContent);
      fn.call(undefined, globalThis);
    } catch (err) {
      this.loadError = `脚本执行失败：${(err as Error).message}`;
      throw new Error(this.loadError);
    }

    // 等待 send(EVENT_NAMES.inited) 调用
    const initedTimeout = new Promise<LxInitedPayload>((_, reject) => {
      setTimeout(() => reject(new Error('脚本初始化超时（未调用 send(inited)）')), 8000);
    });

    try {
      const inited = await Promise.race([this.initedPromise, initedTimeout]);
      if (!inited.status) {
        throw new Error(inited.message || '脚本初始化失败');
      }
      return this.buildMeta(inited);
    } catch (err) {
      this.loadError = (err as Error).message;
      throw err;
    }
  }

  /** 调用脚本处理 musicUrl 请求 */
  async getMusicUrl(
    source: LxPlatform | string,
    musicInfo: LxMusicInfo,
    quality: MusicQuality = '320k'
  ): Promise<string> {
    if (!this.requestHandler) {
      throw new Error('脚本未注册 request 处理器');
    }
    const result = await this.requestHandler({
      source,
      action: 'musicUrl',
      info: { musicInfo, type: quality },
    });
    if (!result) throw new Error('脚本未返回音乐 URL');
    return result;
  }

  /** 调用脚本处理 musicPic 请求 */
  async getMusicPic(
    source: LxPlatform | string,
    musicInfo: LxMusicInfo
  ): Promise<string | null> {
    if (!this.requestHandler) return null;
    try {
      return await this.requestHandler({
        source,
        action: 'musicPic',
        info: { musicInfo },
      });
    } catch {
      return null;
    }
  }

  /** 调用脚本处理 musicLyric 请求 */
  async getMusicLyric(
    source: LxPlatform | string,
    musicInfo: LxMusicInfo
  ): Promise<string | null> {
    if (!this.requestHandler) return null;
    try {
      return await this.requestHandler({
        source,
        action: 'musicLyric',
        info: { musicInfo },
      });
    } catch {
      return null;
    }
  }

  /** 是否已加载且初始化成功 */
  get isReady(): boolean {
    return !!this.initedData && !!this.requestHandler;
  }

  /** 获取加载错误信息 */
  getError(): string | null {
    return this.loadError;
  }

  /** 获取脚本元信息 */
  getMeta(): SourceScriptMeta | null {
    if (!this.initedData) return null;
    return this.buildMeta(this.initedData);
  }

  // ===== 内部实现 =====

  private reset(): void {
    this.requestHandler = null;
    this.initedData = null;
    this.initedResolve = null;
    this.initedReject = null;
    this.initedPromise = null;
    this.loadError = null;
  }

  private installLxGlobal(): void {
    const self = this;
    const lx = {
      EVENT_NAMES,
      // 脚本内可调用的 HTTP 请求函数
      request: async (url: string, options: LxRequestOptions = {}): Promise<LxResponse> => {
        return fetchWithProxy(url, options);
      },
      // 脚本注册事件处理器
      on: (event: string, handler: RequestHandler): void => {
        if (event === EVENT_NAMES.request) {
          self.requestHandler = handler;
        }
      },
      // 脚本通知宿主事件
      send: (event: string, data: LxInitedPayload): void => {
        if (event === EVENT_NAMES.inited) {
          self.initedData = data;
          if (self.initedResolve) self.initedResolve(data);
        }
      },
      // 工具方法
      utils: {
        buffer: {
          from: (str: string | number[] | ArrayBuffer, encoding?: string) => {
            if (Array.isArray(str)) {
              return Buffer.from(str);
            }
            if (str instanceof ArrayBuffer) {
              return Buffer.from(str);
            }
            return Buffer.from(str, (encoding as BufferEncoding) || 'utf-8');
          },
          bufToString: (buf: { toString: (e?: string) => string }, encoding?: string) => {
            return buf.toString((encoding as BufferEncoding) || 'utf-8');
          },
          alloc: (size: number) => Buffer.alloc(size),
        },
        crypto: {
          // 真实 MD5（使用 crypto-js）
          md5: (data: string) => simpleMd5(data),
          sha256: (data: string) => CryptoJS.SHA256(data).toString(),
          sha1: (data: string) => CryptoJS.SHA1(data).toString(),
          aesEncrypt: (text: string, key: string) => aesEncrypt(text, key),
          aesDecrypt: (ciphertext: string, key: string) => aesDecrypt(ciphertext, key),
          base64Encode: (data: string) => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data)),
          base64Decode: (data: string) => CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8),
          randomBytes: (n: number) => {
            const arr = new Uint8Array(n);
            crypto.getRandomValues(arr);
            return Buffer.from(arr);
          },
        },
      },
      env: 'mobile' as const,
      version: '2.0.0',
      currentScriptInfo: {
        name: 'UniBeat',
        description: 'LX Music compatible script runtime',
        version: '2.0.0',
      },
    };
    (globalThis as Record<string, unknown>).lx = lx;
  }

  private buildMeta(inited: LxInitedPayload): SourceScriptMeta {
    const sources = inited.sources ? Object.keys(inited.sources) : [];
    const qualitys = inited.sources || {};
    // 尝试从脚本内容头部注释提取 name/version/description
    const { name, version, description } = parseScriptHeader(this.scriptContent);
    return {
      sources,
      qualitys,
      scriptName: name,
      scriptVersion: version,
      scriptDescription: description,
    };
  }
}

// ===== 工具函数 =====

/** 解析脚本头部注释（@name @version @description） */
function parseScriptHeader(content: string): {
  name?: string;
  version?: string;
  description?: string;
} {
  const result: { name?: string; version?: string; description?: string } = {};
  // 匹配 // @name xxx 或 /* @name xxx */
  const headerMatch = content.slice(0, 800).match(/\/\*[\s\S]*?\*\/|^(\/\/.*\n?)+/);
  if (!headerMatch) return result;
  const header = headerMatch[0];
  const nameMatch = header.match(/@name\s+(.+)/i);
  const versionMatch = header.match(/@version\s+(.+)/i);
  const descMatch = header.match(/@desc(?:ription)?\s+(.+)/i);
  if (nameMatch) result.name = nameMatch[1].trim();
  if (versionMatch) result.version = versionMatch[1].trim();
  if (descMatch) result.description = descMatch[1].trim();
  return result;
}

/** 真实 MD5 实现（使用 crypto-js，LX 脚本签名需要正确 MD5） */
function simpleMd5(input: string): string {
  return CryptoJS.MD5(input).toString();
}

/** AES 加密（部分 LX 脚本需要） */
function aesEncrypt(text: string, key: string): string {
  return CryptoJS.AES.encrypt(text, key).toString();
}

/** AES 解密 */
function aesDecrypt(ciphertext: string, key: string): string {
  return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}

/**
 * 脚本运行时缓存：sourceId → runtime
 * 避免每次播放都重新加载脚本
 */
const runtimeCache = new Map<string, LxScriptRuntime>();

/** 获取或创建指定音源的脚本运行时 */
export async function getScriptRuntime(
  sourceId: string,
  scriptUrl: string
): Promise<LxScriptRuntime> {
  let runtime = runtimeCache.get(sourceId);
  if (runtime && runtime.isReady) {
    return runtime;
  }
  runtime = new LxScriptRuntime();
  await runtime.load(scriptUrl);
  runtimeCache.set(sourceId, runtime);
  return runtime;
}

/** 清除指定音源的运行时缓存 */
export function clearScriptRuntime(sourceId: string): void {
  runtimeCache.delete(sourceId);
}

/** 清除所有脚本运行时缓存 */
export function clearAllScriptRuntimes(): void {
  runtimeCache.clear();
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Music,
  Globe,
  Zap,
  AlertCircle,
  Code2,
  Link2,
  Server,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  useMusicSourceStore,
  SOURCE_TEMPLATES,
  EXAMPLE_SCRIPT_URL,
} from '@/store/musicSourceStore';
import type { SourceMode } from '@/types';
import { cn } from '@/lib/utils';

type PageMode = 'list' | 'add';

export default function MusicSourceManager() {
  const navigate = useNavigate();
  const {
    sources,
    activeSourceId,
    addSource,
    removeSource,
    setActiveSource,
    toggleSource,
    testApiSource,
    testScriptSource,
  } = useMusicSourceStore();

  const [mode, setMode] = useState<PageMode>('list');
  const [addMode, setAddMode] = useState<SourceMode>('script');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<
    | { ok: boolean; meta?: any; error?: string }
    | null
  >(null);

  const template = SOURCE_TEMPLATES.find((t) => t.mode === addMode);

  const handleTest = async () => {
    if (!url.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      if (addMode === 'script') {
        const result = await testScriptSource(url.trim());
        setTestResult(result);
        if (result.ok && result.meta?.scriptName && !name) {
          setName(result.meta.scriptName);
        }
      } else {
        const ok = await testApiSource(url.trim());
        setTestResult({ ok });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleAdd = () => {
    if (!url.trim() || !name.trim()) return;
    addSource({
      name: name.trim(),
      type: 'custom',
      mode: addMode,
      url: url.trim(),
      enabled: true,
      createdAt: Date.now(),
      lastTestOk: testResult?.ok,
      scriptMeta: testResult?.meta,
    });
    setName('');
    setUrl('');
    setTestResult(null);
    setMode('list');
  };

  const handleUseExample = () => {
    setUrl(EXAMPLE_SCRIPT_URL);
    setAddMode('script');
    setTestResult(null);
  };

  const goBack = () => {
    if (mode === 'add') {
      setMode('list');
      setName('');
      setUrl('');
      setTestResult(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="relative z-10">
      {/* 顶部栏 */}
      <header className="flex items-center px-4 py-4 border-b border-white/[0.04]">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">
          {mode === 'list' ? '音源管理' : '添加音源'}
        </h1>
        <div className="w-10" />
      </header>

      <AnimatePresence mode="wait">
        {mode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 px-4 py-6 max-w-2xl mx-auto"
          >
            {/* 说明卡片 - 椒盐风格 */}
            <div className="glass-strong rounded-3xl p-4 mb-6 border border-white/[0.06]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-flow flex items-center justify-center shrink-0 shadow-md">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">关于音源</h3>
                  <p className="text-xs text-white/55 mt-1 leading-relaxed">
                    本应用不内置任何音乐资源。支持两种音源：
                    <span className="text-salt-primary"> LX Music 脚本</span>（推荐，导入 .js 脚本）
                    和 <span className="text-salt-primary">REST API</span>（兼容 NeteaseCloudMusicApi）。
                  </p>
                </div>
              </div>
            </div>

            {/* 音源列表 */}
            <div className="space-y-3 mb-6">
              {sources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-3xl glass flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-white/55 text-sm">暂无音源，点击下方按钮添加</p>
                </div>
              ) : (
                sources.map((source) => (
                  <motion.div
                    key={source.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      'glass-strong rounded-3xl p-4 border transition-all',
                      source.id === activeSourceId
                        ? 'border-salt-primary/40 shadow-[0_0_24px_rgba(61,122,255,0.15)]'
                        : 'border-white/[0.06]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center',
                          source.enabled
                            ? source.mode === 'script'
                              ? 'bg-gradient-accent'
                              : 'bg-gradient-flow'
                            : 'bg-white/8'
                        )}
                      >
                        {source.mode === 'script' ? (
                          <Code2 className="w-5 h-5 text-white" />
                        ) : (
                          <Server className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{source.name}</h3>
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-full',
                              source.mode === 'script'
                                ? 'bg-salt-accent/15 text-salt-accent'
                                : 'bg-salt-primary/15 text-salt-primary'
                            )}
                          >
                            {source.mode === 'script' ? '脚本' : 'API'}
                          </span>
                          {source.id === activeSourceId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-salt-primary/20 text-salt-primary">
                              当前
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/45 truncate mt-0.5" title={source.url}>
                          {source.url}
                        </p>
                        {source.scriptMeta && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {source.scriptMeta.sources?.map((p) => (
                              <span
                                key={p}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/60 font-mono"
                              >
                                {p}
                              </span>
                            ))}
                            {source.scriptMeta.scriptVersion && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                                v{source.scriptMeta.scriptVersion}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                      <button
                        onClick={() => setActiveSource(source.id)}
                        disabled={!source.enabled}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                          source.id === activeSourceId
                            ? 'bg-gradient-flow text-white shadow-md'
                            : source.enabled
                            ? 'glass text-white/70 hover:text-white'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                        )}
                      >
                        {source.id === activeSourceId ? '使用中' : '设为当前'}
                      </button>
                      <button
                        onClick={() => toggleSource(source.id)}
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                          source.enabled
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-white/5 text-white/30'
                        )}
                        title={source.enabled ? '禁用' : '启用'}
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeSource(source.id)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* 添加按钮 */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('add')}
              className="w-full py-4 rounded-2xl bg-gradient-flow text-white font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              添加音源
            </motion.button>

            {/* 使用说明 */}
            <div className="mt-8 p-4 rounded-2xl border border-white/[0.04]">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-salt-primary" />
                使用说明
              </h4>
              <ul className="text-xs text-white/55 space-y-2 leading-relaxed">
                <li>• <span className="text-white/80">脚本模式（推荐）</span>：粘贴 LX Music 脚本 URL（.js 文件）</li>
                <li>• 脚本支持平台：<span className="font-mono text-white/80">kw / kg / tx / wy / mg</span></li>
                <li>• <span className="text-white/80">API 模式</span>：兼容 NeteaseCloudMusicApi 接口规范</li>
                <li>• 添加后需设为「当前音源」才能使用</li>
                <li>• 本软件仅为播放器，不提供音乐内容</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 px-4 py-6 max-w-2xl mx-auto"
          >
            {/* 模式切换 */}
            <p className="text-sm text-white/55 mb-3">音源类型</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => {
                  setAddMode('script');
                  setTestResult(null);
                }}
                className={cn(
                  'p-3 rounded-2xl text-left transition-all flex items-start gap-2',
                  addMode === 'script'
                    ? 'bg-gradient-to-br from-salt-accent/25 to-salt-accent/10 border border-salt-accent/40 text-white'
                    : 'glass text-white/70 hover:text-white border border-white/[0.06]'
                )}
              >
                <Code2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">LX Music 脚本</p>
                  <p className="text-[10px] mt-0.5 text-white/55">导入 .js 脚本文件（推荐）</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setAddMode('api');
                  setTestResult(null);
                }}
                className={cn(
                  'p-3 rounded-2xl text-left transition-all flex items-start gap-2',
                  addMode === 'api'
                    ? 'bg-gradient-to-br from-salt-primary/25 to-salt-primary/10 border border-salt-primary/40 text-white'
                    : 'glass text-white/70 hover:text-white border border-white/[0.06]'
                )}
              >
                <Server className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">REST API</p>
                  <p className="text-[10px] mt-0.5 text-white/55">兼容 NeteaseCloudMusicApi</p>
                </div>
              </button>
            </div>

            {/* 名称输入 */}
            <div className="mb-4">
              <label className="text-sm text-white/55 mb-2 block">音源名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="自定义音源名称"
                className="w-full px-4 py-3 rounded-xl glass border border-white/[0.06] bg-transparent text-white placeholder-white/30 outline-none focus:border-salt-primary/50 transition-colors"
              />
            </div>

            {/* 地址输入 */}
            <div className="mb-4">
              <label className="text-sm text-white/55 mb-2 block flex items-center gap-1.5">
                {addMode === 'script' ? (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    脚本 URL
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    API 地址
                  </>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={template?.placeholderUrl || 'https://...'}
                  className="flex-1 px-4 py-3 rounded-xl glass border border-white/[0.06] bg-transparent text-white placeholder-white/30 outline-none focus:border-salt-primary/50 transition-colors font-mono text-sm"
                />
                <button
                  onClick={handleTest}
                  disabled={!url.trim() || testing}
                  className="px-4 py-3 rounded-xl glass border border-white/[0.06] text-white/70 hover:text-white hover:border-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={addMode === 'script' ? '加载并验证' : '测试连接'}
                >
                  {testing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* 示例脚本快捷按钮 */}
              {addMode === 'script' && (
                <button
                  onClick={handleUseExample}
                  className="mt-2 text-[11px] text-salt-primary/75 hover:text-salt-primary transition-colors flex items-center gap-1"
                >
                  <Link2 className="w-3 h-3" />
                  使用示例：pdone/lx-music-source
                </button>
              )}

              {/* 测试结果 */}
              {testResult !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'mt-3 p-3 rounded-xl text-xs',
                    testResult.ok
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  )}
                >
                  {testResult.ok ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">
                          {addMode === 'script' ? '脚本加载成功' : '连接成功'}
                        </span>
                      </div>
                      {testResult.meta?.sources && testResult.meta.sources.length > 0 && (
                        <div>
                          <p className="text-white/60 text-[10px] mb-1">支持平台：</p>
                          <div className="flex flex-wrap gap-1">
                            {testResult.meta.sources.map((p: string) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded bg-white/10 text-white/85 font-mono text-[10px]"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {testResult.meta?.scriptName && (
                        <p className="text-[10px] text-white/55">
                          脚本名称：{testResult.meta.scriptName}
                          {testResult.meta.scriptVersion && ` · v${testResult.meta.scriptVersion}`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {addMode === 'script' ? '脚本加载失败' : '连接失败'}
                        </p>
                        {testResult.error && (
                          <p className="text-[10px] mt-1 text-red-300/80 break-all">
                            {testResult.error}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* 接口规范说明 */}
            <div className="p-4 rounded-2xl border border-white/[0.04] mb-6">
              <p className="text-xs text-white/55 leading-relaxed">
                {addMode === 'script' ? (
                  <>
                    <span className="text-white/80 font-medium">脚本规范：</span>
                    支持 LX Music 自定义源脚本，通过 globalThis.lx 通信，
                    使用 on(EVENT_NAMES.request) 处理 musicUrl 请求，
                    使用 send(EVENT_NAMES.inited) 通知初始化完成。
                  </>
                ) : (
                  <>
                    <span className="text-white/80 font-medium">接口规范：</span>
                    音源需兼容 NeteaseCloudMusicApi 接口风格，
                    支持 /search、/song/url、/lyric、/playlist/detail 等接口。
                  </>
                )}
              </p>
            </div>

            {/* 保存按钮 */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              disabled={!name.trim() || !url.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-flow text-white font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              确认添加
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

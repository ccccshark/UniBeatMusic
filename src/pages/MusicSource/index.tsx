import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Settings,
  ChevronLeft,
  Check,
  X,
  Loader2,
  RefreshCw,
  Music,
  Globe,
  Zap,
  AlertCircle,
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import {
  useMusicSourceStore,
  SOURCE_TEMPLATES,
} from '@/store/musicSourceStore';
import type { SourceType } from '@/types';
import { cn } from '@/lib/utils';

type PageMode = 'list' | 'add';

export default function MusicSourceManager() {
  const navigate = useNavigate();
  const {
    sources,
    activeSourceId,
    addSource,
    removeSource,
    updateSource,
    setActiveSource,
    toggleSource,
    testSource,
  } = useMusicSourceStore();

  const [mode, setMode] = useState<PageMode>('list');
  const [selectedType, setSelectedType] = useState<SourceType>('netease');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const template = SOURCE_TEMPLATES.find((t) => t.type === selectedType);

  const handleTest = async () => {
    if (!baseUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    const ok = await testSource(baseUrl.trim());
    setTestResult(ok);
    setTesting(false);
  };

  const handleAdd = () => {
    if (!baseUrl.trim() || !name.trim()) return;
    addSource({
      name: name.trim(),
      type: selectedType,
      baseUrl: baseUrl.trim(),
      enabled: true,
    });
    setName('');
    setBaseUrl('');
    setTestResult(null);
    setMode('list');
  };

  const goBack = () => {
    if (mode === 'add') {
      setMode('list');
      setName('');
      setBaseUrl('');
      setTestResult(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-space-900 text-white relative overflow-hidden">
      <ParticleBackground density={30} />

      {/* 顶部栏 */}
      <header className="relative z-10 flex items-center px-4 py-4 border-b border-white/5">
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
            {/* 说明卡片 */}
            <div className="glass rounded-2xl p-4 mb-6 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">关于音源</h3>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    本应用不内置任何音乐资源，所有音乐数据来自您自行配置的音源服务。
                    音源为用户自行部署的音乐 API 服务，兼容 NeteaseCloudMusicApi 接口规范。
                  </p>
                </div>
              </div>
            </div>

            {/* 音源列表 */}
            <div className="space-y-3 mb-6">
              {sources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-white/60 text-sm">暂无音源，点击下方按钮添加</p>
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
                      'glass rounded-2xl p-4 border transition-all',
                      source.id === activeSourceId
                        ? 'border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                        : 'border-white/10'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          source.enabled
                            ? 'bg-gradient-neon'
                            : 'bg-white/10'
                        )}
                      >
                        <Music className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{source.name}</h3>
                          {source.id === activeSourceId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan">
                              当前
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 truncate mt-0.5">
                          {source.baseUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={() => setActiveSource(source.id)}
                        disabled={!source.enabled}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                          source.id === activeSourceId
                            ? 'bg-gradient-neon text-white'
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
                            ? 'bg-green-500/20 text-green-400'
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
              className="w-full py-4 rounded-2xl bg-gradient-neon text-white font-semibold flex items-center justify-center gap-2 shadow-neon-purple"
            >
              <Plus className="w-5 h-5" />
              添加音源
            </motion.button>

            {/* 使用说明 */}
            <div className="mt-8 p-4 rounded-2xl border border-white/5">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-neon-cyan" />
                使用说明
              </h4>
              <ul className="text-xs text-white/50 space-y-2 leading-relaxed">
                <li>• 音源为用户自行部署的音乐 API 服务</li>
                <li>• 兼容 NeteaseCloudMusicApi 接口规范</li>
                <li>• 支持搜索、播放、歌词、歌单等功能</li>
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
            {/* 类型选择 */}
            <p className="text-sm text-white/60 mb-3">选择音源类型</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {SOURCE_TEMPLATES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => {
                    setSelectedType(t.type);
                    if (!name) setName(t.name);
                  }}
                  className={cn(
                    'p-3 rounded-xl text-left transition-all',
                    selectedType === t.type
                      ? 'bg-gradient-neon text-white'
                      : 'glass text-white/70 hover:text-white'
                  )}
                >
                  <p className="font-medium text-sm">{t.name}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-0.5 truncate',
                      selectedType === t.type ? 'text-white/80' : 'text-white/40'
                    )}
                  >
                    {t.description}
                  </p>
                </button>
              ))}
            </div>

            {/* 名称输入 */}
            <div className="mb-4">
              <label className="text-sm text-white/60 mb-2 block">音源名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="自定义音源名称"
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-white placeholder-white/30 outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>

            {/* 地址输入 */}
            <div className="mb-4">
              <label className="text-sm text-white/60 mb-2 block">API 地址</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => {
                    setBaseUrl(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={template?.placeholderUrl || 'https://...'}
                  className="flex-1 px-4 py-3 rounded-xl glass border border-white/10 bg-transparent text-white placeholder-white/30 outline-none focus:border-neon-cyan/50 transition-colors font-mono text-sm"
                />
                <button
                  onClick={handleTest}
                  disabled={!baseUrl.trim() || testing}
                  className="px-4 py-3 rounded-xl glass border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="测试连接"
                >
                  {testing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* 测试结果 */}
              {testResult !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'mt-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2',
                    testResult
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  )}
                >
                  {testResult ? (
                    <>
                      <Check className="w-4 h-4" />
                      连接成功，音源可用
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      连接失败，请检查地址是否正确
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* 接口规范说明 */}
            <div className="p-4 rounded-xl border border-white/5 mb-6">
              <p className="text-xs text-white/50 leading-relaxed">
                <span className="text-white/70 font-medium">接口规范：</span>
                音源需兼容 NeteaseCloudMusicApi 接口风格，
                支持 /search、/song/url、/lyric、/playlist/detail 等接口。
              </p>
            </div>

            {/* 保存按钮 */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              disabled={!name.trim() || !baseUrl.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-neon text-white font-semibold flex items-center justify-center gap-2 shadow-neon-purple disabled:opacity-50 disabled:cursor-not-allowed"
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

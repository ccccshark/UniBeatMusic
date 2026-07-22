import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Github, Heart, Info } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const sections = [
    {
      title: '开源声明',
      content: `UniBeat 音乐播放器是一款基于 React + TypeScript 开发的开源音乐聚合播放器。

项目地址：https://github.com/ccccshark/UniBeatMusic

本项目遵循 MIT 开源协议，欢迎任何形式的贡献和反馈。`,
    },
    {
      title: '免责声明',
      content: `本软件不存储任何音乐文件，所有音乐数据均来自第三方音源。

1. 本软件不对第三方音源的合法性负责。
2. 使用本软件产生的任何法律责任由用户自行承担。
3. 本软件可能会随时停止服务，恕不另行通知。
4. 开发者不对使用本软件造成的任何损失负责。

请遵守相关法律法规，尊重音乐版权。`,
    },
    {
      title: '致敬声明',
      content: `本软件致敬以下开源项目：

- LX Music (洛雪音乐) - 参考了其音源脚本机制和整体架构设计
- React - 前端框架
- Tailwind CSS - 样式框架
- Framer Motion - 动画库
- Zustand - 状态管理

感谢这些优秀的开源项目，让开发者能够站在巨人的肩膀上创造更好的产品。`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-salt-bg text-white"
    >
      <header className="sticky top-0 z-30 glass-strong border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/85 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold tracking-wide text-white">关于</h1>
        </div>
      </header>

      <div className="px-5 py-6">
        <div className="glass-strong rounded-3xl p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-flow mx-auto mb-4 flex items-center justify-center">
            <Info className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">UniBeat</h2>
          <p className="text-sm text-white/50">音乐聚合播放器</p>
          <p className="text-xs text-white/30 mt-2">版本 1.1.0</p>
        </div>

        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-strong rounded-2xl p-5"
            >
              <h3 className="text-base font-semibold text-white mb-3">{section.title}</h3>
              <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="https://github.com/ccccshark/UniBeatMusic"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/50 hover:text-salt-primary transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Made with <Heart className="inline w-3 h-3 text-salt-accent" fill="currentColor" /> by ccccshark
        </p>
      </div>
    </motion.div>
  );
}

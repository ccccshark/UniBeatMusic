import { motion } from 'framer-motion';
import type { CoverColors } from '@/types';

// 椒盐风格播放器背景：基于封面色的柔流光，无扫描线/粒子等霓虹元素
export default function PlayerBackground({ colors }: { colors: CoverColors }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-salt-bg">
      {/* 顶部主色流光 */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[120px] opacity-50"
        style={{ background: colors.from }}
      />
      {/* 底部辅助色 */}
      <div
        className="absolute -bottom-32 right-0 w-[500px] h-[400px] rounded-full blur-[120px] opacity-40"
        style={{ background: colors.to }}
      />
      {/* 左侧点缀色 */}
      <div
        className="absolute top-1/2 -left-20 w-[300px] h-[300px] rounded-full blur-[100px] opacity-30"
        style={{ background: colors.accent }}
      />

      {/* 缓慢旋转的彩色光晕（椒盐特征：根据封面色彩流动） */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[80px] opacity-25"
        style={{
          background: `conic-gradient(from 0deg, ${colors.from}, ${colors.accent}, ${colors.to}, ${colors.from})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />

      {/* 细微网格 */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* 顶部底部渐变遮罩 - 让 UI 更清晰 */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-salt-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-salt-bg via-salt-bg/85 to-transparent" />
    </div>
  );
}

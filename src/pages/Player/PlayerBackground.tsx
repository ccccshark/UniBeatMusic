import { motion } from 'framer-motion';
import type { CoverColors } from '@/types';

// 科技感播放器动态背景
export default function PlayerBackground({ colors }: { colors: CoverColors }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 基础渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, ${colors.from}44 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, ${colors.to}44 0%, transparent 50%),
            linear-gradient(180deg, #0A0E1A 0%, #161C30 50%, #0A0E1A 100%)
          `,
        }}
      />

      {/* 旋转光晕 */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-[80px] opacity-40"
        style={{
          background: `conic-gradient(from 0deg, ${colors.from}, ${colors.accent}, ${colors.to}, ${colors.from})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${colors.accent}22 1px, transparent 1px),
            linear-gradient(90deg, ${colors.accent}22 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />

      {/* 扫描线 */}
      <motion.div
        className="absolute inset-x-0 h-32"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${colors.from}33 50%, transparent 100%)`,
        }}
        animate={{ y: ['-20vh', '100vh'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* 漂浮粒子 */}
      {Array.from({ length: 20 }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i * 0.7) % 5;
        const duration = 6 + (i % 5);
        const size = 1 + (i % 3);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: i % 2 === 0 ? colors.from : colors.accent,
              boxShadow: `0 0 ${size * 3}px ${i % 2 === 0 ? colors.from : colors.accent}`,
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.8, 0] }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
      })}

      {/* 顶部渐变遮罩 */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-space-900 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-space-900 to-transparent" />
    </div>
  );
}

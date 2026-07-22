import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-salt-bg via-salt-surface to-salt-bg flex flex-col items-center justify-center z-[100]"
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-salt-primary/5"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-full bg-gradient-flow p-0.5"
          >
            <div className="w-full h-full rounded-full bg-salt-bg flex items-center justify-center">
              <Music2 className="w-10 h-10 text-salt-primary" />
            </div>
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full bg-salt-primary/30 blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">UniBeat</h1>
        <p className="text-sm text-white/50 tracking-wide">音乐聚合播放器</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-20 left-8 right-8 z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-flow rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-xs text-white/40 w-10 text-right">
            {Math.round(Math.min(progress, 100))}%
          </span>
        </div>
        <p className="text-center text-[10px] text-white/30">
          正在初始化音源引擎...
        </p>
      </motion.div>
    </motion.div>
  );
}

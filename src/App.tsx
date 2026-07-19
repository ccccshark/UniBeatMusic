import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Recommend from '@/pages/Recommend';
import Player from '@/pages/Player';
import Discover from '@/pages/Discover';
import Profile from '@/pages/Profile';
import MusicSource from '@/pages/MusicSource';
import GlobalAudio from '@/components/Player/GlobalAudio';
import { useUserStore } from '@/store/userStore';

// 页面切换过渡
function AnimatedRoutes() {
  const location = useLocation();
  const initGuest = useUserStore((s) => s.initGuest);

  // 初始化用户状态（确保始终是登录状态）
  useEffect(() => {
    initGuest();
  }, [initGuest]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/music-source" element={<MusicSource />} />
          <Route path="/" element={<Recommend />} />
          <Route path="/player/:trackId" element={<Player />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
      <GlobalAudio />
    </Router>
  );
}

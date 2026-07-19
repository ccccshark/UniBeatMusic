import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Login from '@/pages/Login';
import Recommend from '@/pages/Recommend';
import Player from '@/pages/Player';
import Discover from '@/pages/Discover';
import Profile from '@/pages/Profile';
import MusicSource from '@/pages/MusicSource';
import GlobalAudio from '@/components/Player/GlobalAudio';
import { useUserStore } from '@/store/userStore';

// 路由守卫：未登录跳转到登录页（通过 useEffect 触发，避免渲染期重定向导致的重渲染循环）
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isLoggedIn, location.pathname, navigate]);
  if (!isLoggedIn) return null;
  return <>{children}</>;
}

// 页面切换过渡
function AnimatedRoutes() {
  const location = useLocation();

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
          <Route path="/login" element={<Login />} />
          <Route path="/music-source" element={<MusicSource />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Recommend />
              </RequireAuth>
            }
          />
          <Route
            path="/player/:trackId"
            element={
              <RequireAuth>
                <Player />
              </RequireAuth>
            }
          />
          <Route
            path="/discover"
            element={
              <RequireAuth>
                <Discover />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
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

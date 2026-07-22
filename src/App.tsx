import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppLayout from '@/components/Layout/AppLayout';
import SplashScreen from '@/components/SplashScreen';
import TermsModal from '@/components/TermsModal';
import Recommend from '@/pages/Recommend';
import Player from '@/pages/Player';
import Discover from '@/pages/Discover';
import Profile from '@/pages/Profile';
import About from '@/pages/About';
import MusicSource from '@/pages/MusicSource';
import GlobalAudio from '@/components/Player/GlobalAudio';
import MiniPlayer from '@/components/Player/MiniPlayer';
import { useUserStore } from '@/store/userStore';

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const initGuest = useUserStore((s) => s.initGuest);

  useEffect(() => {
    initGuest();
  }, [initGuest]);

  useEffect(() => {
    const handleBackButton = () => {
      if (location.pathname === '/') {
        return;
      }
      navigate(-1);
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [location.pathname, navigate]);

  const isPlayerPage = location.pathname.startsWith('/player');
  const isAboutPage = location.pathname === '/about';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {isPlayerPage || isAboutPage ? (
          <Routes location={location}>
            <Route path="/player/:trackId" element={<Player />} />
            <Route path="/about" element={<About />} />
          </Routes>
        ) : (
          <AppLayout>
            <Routes location={location}>
              <Route path="/music-source" element={<MusicSource />} />
              <Route path="/" element={<Recommend />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        )}
        {!isPlayerPage && !isAboutPage && <MiniPlayer />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('unibeat_terms_accepted');
    if (saved === 'true') {
      setAcceptedTerms(true);
      setTimeout(() => setShowSplash(false), 1500);
    } else {
      setTimeout(() => {
        setShowSplash(false);
        setShowTerms(true);
      }, 2000);
    }
  }, []);

  const handleAcceptTerms = useCallback(() => {
    setAcceptedTerms(true);
    setShowTerms(false);
    localStorage.setItem('unibeat_terms_accepted', 'true');
  }, []);

  const handleRejectTerms = useCallback(() => {
    if (window.confirm('您必须同意用户协议才能使用本软件。确定要退出吗？')) {
      const win = window as any;
      if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.App) {
        win.Capacitor.Plugins.App.exitApp();
      }
    }
  }, []);

  useEffect(() => {
    const win = window as any;
    if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.App) {
      win.Capacitor.Plugins.App.addListener('backButton', () => {
        if (!showTerms && acceptedTerms) {
          win.Capacitor.Plugins.App.exitApp();
        }
      });
    }
  }, [showTerms, acceptedTerms]);

  return (
    <Router>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => {}} />
        )}
      </AnimatePresence>

      {acceptedTerms && <AnimatedRoutes />}

      {showTerms && (
        <TermsModal onAccept={handleAcceptTerms} onReject={handleRejectTerms} />
      )}

      <GlobalAudio />
    </Router>
  );
}

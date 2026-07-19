import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  CheckCircle2,
  Loader2,
  Smartphone,
  AlertCircle,
  Music,
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface QrLoginProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function QrLogin({ onSuccess, onBack }: QrLoginProps) {
  const {
    qrKey,
    qrStatus,
    qrNickname,
    initQrLogin,
    pollQrStatus,
    resetQrState,
    isLoggedIn,
  } = useUserStore();

  const [polling, setPolling] = useState(false);

  // 初始化扫码
  useEffect(() => {
    initQrLogin();
    return () => resetQrState();
  }, []);

  // 轮询扫码状态
  useEffect(() => {
    if (qrStatus === 'confirmed' || qrStatus === 'expired' || !qrKey) return;

    setPolling(true);
    const timer = setInterval(async () => {
      await pollQrStatus();
    }, 2000);

    return () => {
      clearInterval(timer);
      setPolling(false);
    };
  }, [qrKey, qrStatus, pollQrStatus]);

  // 登录成功回调
  useEffect(() => {
    if (qrStatus === 'confirmed' && isLoggedIn) {
      const timer = setTimeout(() => {
        onSuccess?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [qrStatus, isLoggedIn, onSuccess]);

  const handleRefresh = () => {
    resetQrState();
    initQrLogin();
  };

  // 二维码图片 URL（使用公开二维码生成 API）
  const qrImageUrl = qrKey
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `https://music.163.com/login?codekey=${qrKey}`
      )}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* 标题 */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-red-500/30 mb-2">
          <Music className="w-3 h-3 text-red-400" />
          <span className="text-[10px] text-red-400 font-medium">网易云音乐</span>
        </div>
        <p className="text-sm font-semibold text-white">扫码登录</p>
        <p className="text-[10px] text-white/50 mt-1">
          使用网易云音乐 APP 扫描下方二维码
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* 等待扫码 */}
        {(qrStatus === 'waiting' || qrStatus === 'idle') && qrKey && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center"
          >
            <div className="relative p-3 bg-white rounded-2xl shadow-2xl">
              {/* 二维码图片 */}
              <div className="w-48 h-48 relative overflow-hidden rounded-lg bg-white">
                <img
                  src={qrImageUrl}
                  alt="网易云登录二维码"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* 扫描线动画 */}
              <motion.div
                className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent pointer-events-none"
                animate={{ top: ['12px', '204px', '12px'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-white/60">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[11px]">等待扫码...</span>
            </div>

            {/* 提示 */}
            <div className="mt-3 px-4 py-2 rounded-lg glass border border-white/10 max-w-[240px]">
              <p className="text-[10px] text-white/50 text-center leading-relaxed">
                打开网易云音乐 APP → 设置 → 扫一扫
              </p>
            </div>
          </motion.div>
        )}

        {/* 已扫码，等待确认 */}
        {qrStatus === 'scanned' && (
          <motion.div
            key="scanned"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center py-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(0,240,255,0.3)',
                  '0 0 40px rgba(0,240,255,0.6)',
                  '0 0 20px rgba(0,240,255,0.3)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-neon flex items-center justify-center mb-4"
            >
              <Smartphone className="w-10 h-10 text-white" />
            </motion.div>
            <p className="text-sm font-semibold text-white">扫描成功</p>
            <p className="text-[11px] text-white/60 mt-1">
              {qrNickname ? `欢迎，${qrNickname}` : '请在手机上确认登录'}
            </p>
            <div className="mt-3 flex items-center gap-2 text-neon-cyan">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px]">等待确认...</span>
            </div>
          </motion.div>
        )}

        {/* 登录成功 */}
        {qrStatus === 'confirmed' && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center py-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-green-500/50"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <p className="text-sm font-semibold text-white">登录成功</p>
            <p className="text-[11px] text-white/60 mt-1">
              {qrNickname ? `欢迎回来，${qrNickname}` : '正在进入...'}
            </p>
          </motion.div>
        )}

        {/* 二维码过期 */}
        {qrStatus === 'expired' && (
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center py-8"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-white/40" />
            </div>
            <p className="text-sm font-semibold text-white/70">二维码已过期</p>
            <button
              onClick={handleRefresh}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-neon text-white text-xs font-medium shadow-neon-purple"
            >
              <RefreshCw className="w-3 h-3" />
              刷新二维码
            </button>
          </motion.div>
        )}

        {/* 加载中 */}
        {!qrKey && qrStatus !== 'expired' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-12"
          >
            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mb-3" />
            <p className="text-[11px] text-white/50">正在生成二维码...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部按钮 */}
      {onBack && qrStatus !== 'confirmed' && (
        <button
          onClick={onBack}
          className="w-full py-2 rounded-lg text-white/60 hover:text-white text-[11px] transition-colors"
        >
          ← 返回其他登录方式
        </button>
      )}
    </motion.div>
  );
}

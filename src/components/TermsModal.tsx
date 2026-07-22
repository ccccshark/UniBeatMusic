import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TermsModalProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function TermsModal({ onAccept, onReject }: TermsModalProps) {
  const [checked, setChecked] = useState(false);
  const [showFull, setShowFull] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[90]"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-lg bg-salt-bg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden"
        >
          <div className="sticky top-0 glass-strong p-5 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">用户协议与免责声明</h2>
              <button
                onClick={onReject}
                className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4 text-sm text-white/70">
              <div className={showFull ? '' : 'line-clamp-12'}>
                <h3 className="text-white font-semibold mb-2">一、用户协议</h3>
                <p className="mb-2">
                  欢迎使用 UniBeat 音乐播放器。使用本软件即表示您同意以下条款：
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>本软件仅供个人非商业使用。</li>
                  <li>您不得利用本软件从事任何违法活动。</li>
                  <li>您应遵守相关法律法规，尊重音乐版权。</li>
                </ol>

                <h3 className="text-white font-semibold mb-2 mt-4">二、免责声明</h3>
                <p className="mb-2">
                  本软件不存储任何音乐文件，所有音乐数据均来自第三方音源。
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>本软件不对第三方音源的合法性负责。</li>
                  <li>使用本软件产生的任何法律责任由用户自行承担。</li>
                  <li>本软件可能会随时停止服务，恕不另行通知。</li>
                  <li>开发者不对使用本软件造成的任何损失负责。</li>
                </ol>

                <h3 className="text-white font-semibold mb-2 mt-4">三、开源声明</h3>
                <p className="mb-2">
                  本软件基于开源项目开发，相关代码已在 GitHub 上开源。
                </p>
                <p>
                  本软件致敬 LX Music（洛雪音乐）项目，参考了其音源脚本机制。
                </p>
              </div>

              {!showFull && (
                <button
                  onClick={() => setShowFull(true)}
                  className="text-salt-primary text-xs underline"
                >
                  查看全部...
                </button>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 glass-strong p-5 border-t border-white/5">
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <motion.div
                animate={checked ? { scale: 1 } : { scale: 1 }}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  checked
                    ? 'border-salt-primary bg-salt-primary'
                    : 'border-white/30'
                )}
                onClick={() => setChecked(!checked)}
              >
                {checked && <Check className="w-3 h-3 text-white" />}
              </motion.div>
              <span className="text-xs text-white/60">
                我已阅读并同意上述协议
              </span>
            </label>

            <button
              onClick={onAccept}
              disabled={!checked}
              className={cn(
                'w-full py-3 rounded-xl font-medium transition-all',
                checked
                  ? 'bg-gradient-flow text-white shadow-lg'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              )}
            >
              同意并继续
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

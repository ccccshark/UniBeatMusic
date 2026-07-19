import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, User, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TABS = [
  { path: '/', label: '推荐', icon: Home },
  { path: '/discover', label: '发现', icon: Compass },
  { path: '/profile', label: '我的', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-space-900 text-white relative">
      {/* 顶部网格背景 */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-space-900/40 via-transparent to-space-900/80 pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>

      {/* 底部 Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10">
        <div className="max-w-2xl mx-auto grid grid-cols-3 px-4 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2 transition-colors',
                  active ? 'text-neon-cyan' : 'text-white/50 hover:text-white/80'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="tab-active"
                    className="absolute inset-x-3 inset-y-0 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30"
                    style={{ boxShadow: '0 0 16px rgba(0,240,255,0.2)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="relative z-10 text-xs font-medium">{tab.label}</span>
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 w-1 h-1 rounded-full bg-neon-cyan shadow-neon-cyan"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// 顶部栏
export function TopBar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-neon flex items-center justify-center shadow-neon-purple">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-wider gradient-text">{title}</h1>
            {subtitle && <p className="text-[10px] text-white/50 -mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </header>
  );
}

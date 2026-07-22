import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, User, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TABS = [
  { path: '/discover', label: '发现', icon: Compass },
  { path: '/profile', label: '我的', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-salt-bg text-white flex flex-col overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      {/* 内容滚动区 - 留出底部导航栏高度 */}
      <div
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden"
        style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom))' }}
      >
        {children}
      </div>

      {/* 底部导航栏 */}
      <nav className="relative z-30 glass-strong border-t border-white/[0.06] shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto grid grid-cols-2 px-4 py-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2 transition-colors',
                  active ? 'text-salt-primary' : 'text-white/45 hover:text-white/75'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="tab-active"
                    className="absolute inset-x-4 inset-y-0 rounded-2xl bg-salt-primary/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="relative z-10 text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

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
    <header
      className="sticky top-0 z-20 glass-strong border-b border-white/[0.04]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-flow flex items-center justify-center shadow-md shrink-0">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-wide text-white truncate">{title}</h1>
            {subtitle && <p className="text-[10px] text-white/45 -mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}

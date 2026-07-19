import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Music,
  Settings,
  Clock,
  Headphones,
} from 'lucide-react';
import AppLayout, { TopBar } from '@/components/Layout/AppLayout';
import { useUserStore } from '@/store/userStore';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useUserStore();

  return (
    <AppLayout>
      <TopBar
        title="个人中心"
        subtitle={user.nickname}
        right={
          <button
            onClick={() => navigate('/music-source')}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/70 hover:text-salt-accent transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-4 py-5 pb-32 max-w-2xl mx-auto">
        {/* 用户头部卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-5 mb-4 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-salt-primary/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-salt-accent/15 blur-3xl" />

          <div className="relative flex items-center gap-4">
            {/* 头像 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-flow p-0.5 shadow-md">
                <div className="w-full h-full rounded-3xl bg-salt-surface flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">
                    {user.nickname.charAt(0)}
                  </span>
                </div>
              </div>
              {user.vipLevel > 0 && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                {user.nickname}
              </h2>
              <p className="text-xs text-white/55 mt-1">
                {user.vipLevel > 0 ? 'VIP会员' : '普通用户'}
              </p>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="relative grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/85">
                <Headphones className="w-4 h-4 text-salt-primary" />
                <span className="text-lg font-bold">{user.totalListenMinutes}</span>
              </div>
              <p className="text-[10px] text-white/45 mt-1">分钟</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/85">
                <Music className="w-4 h-4 text-salt-accent" />
                <span className="text-lg font-bold">{user.totalTracks}</span>
              </div>
              <p className="text-[10px] text-white/45 mt-1">首歌曲</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/85">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold">
                  {user.joinDate}
                </span>
              </div>
              <p className="text-[10px] text-white/45 mt-1">加入时间</p>
            </div>
          </div>
        </motion.div>

        {/* 功能入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <button
            onClick={() => navigate('/music-source')}
            className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-salt-primary/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-salt-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white">音源管理</h3>
              <p className="text-xs text-white/50 mt-0.5">添加和管理音乐源</p>
            </div>
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
}

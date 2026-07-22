import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Music,
  Clock,
  Headphones,
  Settings,
  Info,
  Heart,
  FolderOpen,
  Download,
  Share2,
} from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { usePlayerStore } from '@/store/playerStore';
import { TopBar } from '@/components/Layout/AppLayout';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { playlist } = usePlayerStore();

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  };

  const menuItems = [
    { icon: Heart, label: '我喜欢的', desc: '收藏的音乐', color: 'text-red-400', bg: 'bg-red-400/20' },
    { icon: FolderOpen, label: '我的歌单', desc: '创建的歌单', color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { icon: Download, label: '下载管理', desc: '已下载的音乐', color: 'text-green-400', bg: 'bg-green-400/20' },
    { icon: Share2, label: '分享', desc: '分享音乐给好友', color: 'text-purple-400', bg: 'bg-purple-400/20' },
  ];

  const settingsItems = [
    { icon: Settings, label: '音源管理', desc: '添加和管理音乐源', path: '/music-source' },
    { icon: Info, label: '关于', desc: '开源声明、免责声明、致敬声明', path: '/about' },
  ];

  return (
    <div>
      <TopBar
        title="个人中心"
        subtitle={user.nickname}
        right={
          <button
            onClick={() => navigate('/music-source')}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/70 hover:text-salt-accent"
          >
            <Settings className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-5 py-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-salt-primary/20 blur-3xl" />

          <div className="relative flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-flow p-0.5">
                <div className="w-full h-full rounded-3xl bg-salt-surface flex items-center justify-center">
                  <span className="text-2xl font-bold gradient-text">
                    {user.nickname.charAt(0)}
                  </span>
                </div>
              </div>
              {user.vipLevel > 0 && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">{user.nickname}</h2>
              <p className="text-xs text-white/50 mt-1">
                {user.vipLevel > 0 ? 'VIP会员' : '普通用户'}
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 rounded-2xl bg-white/5"
            >
              <div className="flex items-center justify-center gap-1 text-white/85 mb-1">
                <Headphones className="w-4 h-4 text-salt-primary" />
                <span className="text-xl font-bold">{user.totalListenMinutes}</span>
              </div>
              <p className="text-[10px] text-white/45">{formatDuration(user.totalListenMinutes)}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="text-center p-4 rounded-2xl bg-white/5"
            >
              <div className="flex items-center justify-center gap-1 text-white/85 mb-1">
                <Music className="w-4 h-4 text-salt-accent" />
                <span className="text-xl font-bold">{playlist.length}</span>
              </div>
              <p className="text-[10px] text-white/45">当前歌单</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 rounded-2xl bg-white/5"
            >
              <div className="flex items-center justify-center gap-1 text-white/85 mb-1">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-lg font-bold">{user.totalTracks}</span>
              </div>
              <p className="text-[10px] text-white/45">已播放</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bg)}>
                  <Icon className={cn('w-5 h-5', item.color)} />
                </div>
                <span className="text-xs text-white/70">{item.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-salt-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-salt-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">{item.label}</h3>
                  <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

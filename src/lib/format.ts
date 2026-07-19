// 格式化播放次数（1234 -> 1.2万 / 1234.5万）
export function formatPlayCount(count: number): string {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`;
  }
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  return `${count}`;
}

// 格式化时长（秒 -> mm:ss）
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 格式化分钟数为小时
export function formatListenMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }
  return `${minutes}m`;
}

// 生成渐变背景字符串
export function coverGradient(from: string, to: string, angle = 135): string {
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

// 生成径向渐变
export function coverRadial(color: string): string {
  return `radial-gradient(circle at 30% 30%, ${color} 0%, transparent 70%)`;
}

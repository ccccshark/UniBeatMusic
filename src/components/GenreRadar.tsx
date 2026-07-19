import type { GenreScore } from '@/types';

interface GenreRadarProps {
  data: GenreScore[];
  size?: number;
  color?: string;
}

// 曲风偏好雷达图
export default function GenreRadar({ data, size = 240, color = '#00F0FF' }: GenreRadarProps) {
  const center = size / 2;
  const radius = center - 32;
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.score / 100) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    };
  });

  // 同心多边形网格
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPaths = gridLevels.map((level) => {
    const pts = data.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      return `${center + Math.cos(angle) * radius * level},${center + Math.sin(angle) * radius * level}`;
    });
    return pts.join(' ');
  });

  return (
    <svg width={size} height={size} className="overflow-visible">
      <defs>
        <radialGradient id="radar-fill">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7B2FF7" stopOpacity="0.15" />
        </radialGradient>
        <filter id="radar-glow">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* 网格 */}
      {gridPaths.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* 轴线 */}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        );
      })}

      {/* 数据多边形 */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="url(#radar-fill)"
        stroke={color}
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.6))' }}
      />

      {/* 数据点 */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={color}
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,240,255,0.8))' }}
        />
      ))}

      {/* 标签 */}
      {data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const lx = center + Math.cos(angle) * (radius + 18);
        const ly = center + Math.sin(angle) * (radius + 18);
        const anchor = Math.abs(Math.cos(angle)) < 0.3 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
        return (
          <g key={i}>
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize="11"
              fontWeight="500"
            >
              {d.genre}
            </text>
            <text
              x={lx}
              y={ly + 12}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill={color}
              fontSize="9"
            >
              {d.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

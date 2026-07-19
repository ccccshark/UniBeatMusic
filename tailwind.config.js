/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 椒盐音乐风格：深色基底 + 流光色彩
        salt: {
          // 主背景层（深色基底）
          bg: '#0F1115',         // 主背景
          surface: '#1A1D24',    // 卡片表面
          surfaceHi: '#23272F',  // 高亮表面
          overlay: '#2C313A',    // 浮层
          // 文字层级
          textPri: '#FFFFFF',
          textSec: 'rgba(255,255,255,0.72)',
          textTer: 'rgba(255,255,255,0.50)',
          textQua: 'rgba(255,255,255,0.32)',
          // 边框/分割线
          border: 'rgba(255,255,255,0.08)',
          borderHi: 'rgba(255,255,255,0.14)',
          // 主色调（流光，可被封面色覆盖）
          primary: '#3D7AFF',
          primarySoft: '#5B8DEF',
          accent: '#FF6B35',
        },
        // 旧 neon 色保留作为辅助
        space: {
          900: "#0F1115",
          800: "#161922",
          700: "#1F232C",
          600: "#2A2F38",
        },
        neon: {
          cyan: "#00F0FF",
          blue: "#3B82F6",
          purple: "#7B2FF7",
          pink: "#FF2E9F",
          orange: "#FF6B35",
        },
        platform: {
          qq: "#31C27C",
          netease: "#C20C0C",
          qishui: "#FF6B35",
        },
      },
      fontFamily: {
        display: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans SC"', '"HarmonyOS Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Material Design 风格阴影
        'sm': '0 1px 2px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.20)',
        'md': '0 4px 12px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.20)',
        'lg': '0 10px 30px rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.25)',
        'xl': '0 20px 50px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.30)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.30)',
        // 旧 neon 阴影保留
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 20px rgba(255, 46, 159, 0.5), 0 0 40px rgba(255, 46, 159, 0.2)',
        'neon-purple': '0 0 20px rgba(123, 47, 247, 0.5), 0 0 40px rgba(123, 47, 247, 0.2)',
      },
      backgroundImage: {
        // 流光渐变（用于主按钮/进度条）
        'gradient-flow': 'linear-gradient(135deg, #3D7AFF 0%, #7B2FF7 50%, #FF6B35 100%)',
        'gradient-primary': 'linear-gradient(135deg, #3D7AFF 0%, #5B8DEF 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FF6B35 0%, #FF2E9F 100%)',
        // 旧 gradient-neon 保留作为兼容
        'gradient-neon': 'linear-gradient(135deg, #3D7AFF 0%, #7B2FF7 50%, #FF6B35 100%)',
        'gradient-cyber': 'linear-gradient(180deg, #0F1115 0%, #1F232C 100%)',
        'glass-blur': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-slower': 'spin 24s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

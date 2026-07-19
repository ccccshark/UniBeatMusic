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
        // 太空黑主背景
        space: {
          900: "#0A0E1A",
          800: "#0F1424",
          700: "#161C30",
          600: "#1E2440",
        },
        // 霓虹电光蓝
        neon: {
          cyan: "#00F0FF",
          blue: "#3B82F6",
          purple: "#7B2FF7",
          pink: "#FF2E9F",
          orange: "#FF6B35",
        },
        // 平台标识色
        platform: {
          qq: "#31C27C",
          netease: "#C20C0C",
          qishui: "#FF6B35",
        },
      },
      fontFamily: {
        display: ['Orbitron', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"HarmonyOS Sans SC"', '"Noto Sans SC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 20px rgba(255, 46, 159, 0.5), 0 0 40px rgba(255, 46, 159, 0.2)',
        'neon-purple': '0 0 20px rgba(123, 47, 247, 0.5), 0 0 40px rgba(123, 47, 247, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #FF2E9F 0%, #7B2FF7 50%, #00F0FF 100%)',
        'gradient-cyber': 'linear-gradient(180deg, #0A0E1A 0%, #161C30 100%)',
        'glass-blur': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-slower': 'spin 24s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
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
      },
    },
  },
  plugins: [],
};

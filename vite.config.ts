import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 代理网易云 API，解决开发环境 CORS 问题
    proxy: {
      '/netease': {
        target: 'https://music.163.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/netease/, ''),
        headers: {
          Referer: 'https://music.163.com',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        },
      },
    },
  },
})

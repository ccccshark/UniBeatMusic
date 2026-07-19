import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
// Buffer polyfill：LX Music 自定义音源脚本依赖 Node.js Buffer
import { Buffer } from 'buffer'
import App from './App'
import './index.css'
import { initializeCapacitor } from './capacitor'

// 注入到全局，供 LX Music 脚本使用
;(globalThis as any).Buffer = Buffer
;(globalThis as any).global = globalThis

function AppWithCapacitor() {
  useEffect(() => {
    if ((window as any).Capacitor) {
      initializeCapacitor()
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithCapacitor />
  </StrictMode>,
)

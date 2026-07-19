import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeCapacitor } from './capacitor'

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

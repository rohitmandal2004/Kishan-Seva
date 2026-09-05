/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SupabaseProvider } from './context/SupabaseContext'

// Import virtual:pwa-register to auto-register the service worker for PWA
if ('serviceWorker' in navigator) {
  // @ts-ignore - Virtual module provided by vite-plugin-pwa
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  }).catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <App />
    </SupabaseProvider>
  </StrictMode>,
)

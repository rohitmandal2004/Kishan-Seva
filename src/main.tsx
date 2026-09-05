/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SupabaseProvider } from './context/SupabaseContext'

import { ClerkProvider } from '@clerk/clerk-react'

// Import virtual:pwa-register to auto-register the service worker for PWA
if ('serviceWorker' in navigator) {
  // @ts-ignore - Virtual module provided by vite-plugin-pwa
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  }).catch(() => {})
}

// Ensure the Clerk key is provided
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey || 'pk_test_placeholder'} appearance={{ variables: { colorPrimary: '#047857' } }}>
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </ClerkProvider>
  </StrictMode>,
)

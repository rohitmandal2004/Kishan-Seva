/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SupabaseProvider } from './context/SupabaseContext'
import { ClerkProvider } from '@clerk/clerk-react'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

// Import virtual:pwa-register to auto-register the service worker for PWA
if ('serviceWorker' in navigator) {
  // @ts-ignore - Virtual module provided by vite-plugin-pwa
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  }).catch(() => {})
}

// Clerk publishable key — REQUIRED for authentication to work
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  // Show a clear error in development instead of silently failing
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:2rem;">
        <div style="max-width:500px;text-align:center;">
          <h1 style="color:#dc2626;font-size:1.5rem;margin-bottom:1rem;">⚠️ Clerk Configuration Missing</h1>
          <p style="color:#64748b;margin-bottom:1rem;">
            <code>VITE_CLERK_PUBLISHABLE_KEY</code> is not set in your <code>.env</code> file.
          </p>
          <p style="color:#64748b;font-size:0.875rem;">
            Get your publishable key from <a href="https://dashboard.clerk.com" style="color:#047857;">dashboard.clerk.com</a>
            and add it to your <code>.env</code> file.
          </p>
        </div>
      </div>
    `;
  }
  throw new Error('[Kishan Seva] VITE_CLERK_PUBLISHABLE_KEY is not configured. Authentication cannot work without it.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPubKey} appearance={{ variables: { colorPrimary: '#047857' } }}>
        <SupabaseProvider>
          <App />
        </SupabaseProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
)

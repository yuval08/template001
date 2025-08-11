import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize i18n
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode intentionally double-renders components in development
  // to detect side effects. Our app handles this properly:
  // - SignalR connection uses singleton pattern with connection promises
  // - React Query uses staleTime and caching to prevent duplicate fetches
  // - Hooks properly handle cleanup and mounting states
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
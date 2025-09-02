import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear all data on page refresh/reload
if (typeof window !== 'undefined') {
  // Check if this is a page refresh (not initial load)
  const navigation = (window.performance as any).navigation || 
                     (window.performance as any).getEntriesByType('navigation')[0];
  
  if (navigation && (navigation.type === 1 || navigation.type === 'reload')) {
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear all sessionStorage data
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear IndexedDB if exists
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }).catch(() => {
        // Fallback for browsers that don't support databases()
        const dbNames = ['supabase', 'auth', 'app-data'];
        dbNames.forEach(name => {
          try {
            indexedDB.deleteDatabase(name);
          } catch (e) {
            console.log('Could not delete database:', name);
          }
        });
      });
    }
    
    console.log('Page refreshed - all data cleared');
  }
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Check for updates every time the app starts
      registration.update();
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // New service worker activated, refresh may be needed
              console.log('New service worker activated');
              
              // Clear any stale data from localStorage
              const keysToCheck = Object.keys(localStorage);
              keysToCheck.forEach(key => {
                if (key.includes('supabase') && key.includes('auth')) {
                  try {
                    const data = localStorage.getItem(key);
                    if (data) {
                      const parsed = JSON.parse(data);
                      // Check if session is older than 24 hours
                      if (parsed.expires_at) {
                        const expiresAt = new Date(parsed.expires_at * 1000);
                        if (expiresAt < new Date()) {
                          localStorage.removeItem(key);
                          console.log('Removed expired session from localStorage');
                        }
                      }
                    }
                  } catch (e) {
                    // Invalid data, remove it
                    localStorage.removeItem(key);
                  }
                }
              });
            }
          });
        }
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
        
        if (event.data.type === 'SERVICE_WORKER_UPDATED') {
          // Service worker was updated, may need to refresh
          console.log('Service worker updated to version:', event.data.version);
        }
        
        if (event.data.type === 'SYNC_DATA' || event.data.type === 'PERIODIC_SYNC') {
          // Trigger data refresh
          window.dispatchEvent(new CustomEvent('sw-sync-data'));
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
  
  // Handle app visibility changes to refresh data
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // App became visible, trigger data refresh
      window.dispatchEvent(new CustomEvent('app-visibility-changed', { detail: { visible: true } }));
    }
  });
  
  // Handle online/offline events
  window.addEventListener('online', () => {
    console.log('App is online');
    window.dispatchEvent(new CustomEvent('app-online-status-changed', { detail: { online: true } }));
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
    window.dispatchEvent(new CustomEvent('app-online-status-changed', { detail: { online: false } }));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

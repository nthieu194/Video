import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mitigate Safari / Chrome sandboxed iframe IndexedDB connection loss & LocalStorage blocks
if (typeof window !== "undefined") {
  // Test if localStorage is accessible
  let storageAvailable = false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    storageAvailable = true;
  } catch (e) {
    storageAvailable = false;
  }

  // Inject secure in-memory storage fallback if blocked
  if (!storageAvailable) {
    console.warn("[Storage Shield] localStorage / sessionStorage is blocked or unavailable in this sandbox. Injecting secure in-memory storage fallback to prevent crashes.");
    
    const createMemoryStorage = () => {
      const store: Record<string, string> = {};
      return {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
          store[key] = String(value);
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          for (const key in store) {
            delete store[key];
          }
        },
        key: (index: number) => Object.keys(store)[index] || null,
        get length() {
          return Object.keys(store).length;
        }
      };
    };

    const mockLocalStorage = createMemoryStorage();
    const mockSessionStorage = createMemoryStorage();

    try {
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true
      });
      Object.defineProperty(window, "sessionStorage", {
        value: mockSessionStorage,
        writable: true,
        configurable: true
      });
    } catch (err) {
      console.warn("[Storage Shield] Failed to overwrite window properties directly. Using fallbacks.", err);
    }
  }

  // Protect Storage prototype methods to prevent security / quota exceptions from bubbling up
  try {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string) {
      try {
        return originalGetItem.call(this, key);
      } catch (e) {
        console.warn("[Storage Shield Prototype] Suppressed getItem error for key:", key, e);
        return null;
      }
    };

    const originalRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key: string) {
      try {
        originalRemoveItem.call(this, key);
      } catch (e) {
        console.warn("[Storage Shield Prototype] Suppressed removeItem error for key:", key, e);
      }
    };

    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      try {
        originalSetItem.call(this, key, value);
      } catch (e: any) {
        const isQuotaError = 
          e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
          e.code === 22 ||
          e.code === 1014 ||
          String(e).toLowerCase().includes('quota') ||
          String(e).toLowerCase().includes('exceeded');

        if (isQuotaError) {
          console.warn("[Storage Shield Prototype] Quota exceeded on setItem. Attempting to free up space for:", key);
          
          const keysToRemove: string[] = [];
          for (let i = 0; i < this.length; i++) {
            const k = this.key(i);
            if (k) {
              // Priority 1: Clear huge base64 voice sample caches and generated audios
              if (
                k.startsWith('clipflow_voice_sample_cache_') || 
                k.startsWith('clipflow_custom_segment_audios') ||
                k.startsWith('clipflow_local_uploads')
              ) {
                keysToRemove.push(k);
              }
            }
          }

          if (keysToRemove.length > 0) {
            console.warn(`[Storage Shield Prototype] Evicting ${keysToRemove.length} cached assets to resolve space constraints...`);
            keysToRemove.forEach(k => {
              try {
                this.removeItem(k);
              } catch (_) {}
            });

            // Retry
            try {
              originalSetItem.call(this, key, value);
              console.info("[Storage Shield Prototype] Quota resolved successfully after clearing cache!");
              return;
            } catch (retryErr) {
              console.error("[Storage Shield Prototype] Retry failed even after cache clearing.", retryErr);
            }
          }

          // Priority 2: Clear general non-vital keys
          const fallbackKeys: string[] = [];
          for (let i = 0; i < this.length; i++) {
            const k = this.key(i);
            if (k && k !== "last_indexeddb_reload" && !k.includes("auth")) {
              fallbackKeys.push(k);
            }
          }
          
          if (fallbackKeys.length > 0) {
            console.warn(`[Storage Shield Prototype] Freeing up 50% of general local storage items...`);
            fallbackKeys.slice(0, Math.ceil(fallbackKeys.length / 2)).forEach(k => {
              try {
                this.removeItem(k);
              } catch (_) {}
            });

            try {
              originalSetItem.call(this, key, value);
              console.info("[Storage Shield Prototype] Space resolved via partial reset!");
              return;
            } catch (retryErr) {
              console.error("[Storage Shield Prototype] Quota exceeded could not be bypassed.", retryErr);
            }
          }
          
          console.warn("[Storage Shield Prototype] Safe bypass: Key could not be cached in localStorage due to quota limits:", key);
          return; // Suppress quota error to prevent app crash
        }
        
        console.warn("[Storage Shield Prototype] Suppressed Storage error:", e);
        return; // Suppress any security or other storage errors
      }
    };
  } catch (err) {
    console.warn("[Storage Shield] Prototype overrides could not be fully attached:", err);
  }

  const handleIndexedDbError = (errorMsg: string, errObj: any) => {
    const serializedError = errorMsg + " " + String(errObj || "") + " " + (errObj?.message || "");
    const isIndexedDbError = 
      serializedError.toLowerCase().includes('indexed database') || 
      serializedError.toLowerCase().includes('indexeddb') ||
      serializedError.toLowerCase().includes('database connection lost') ||
      serializedError.toLowerCase().includes('connection to indexed database');

    if (isIndexedDbError) {
      console.warn("[Mitigation] Intercepted IndexedDB server connection lost in sandbox iframe:", errorMsg, errObj);
      
      // Attempt safe single reload with 12s throttle to prevent infinite reload loop
      const lastReload = sessionStorage.getItem('last_indexeddb_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 12000) {
        sessionStorage.setItem('last_indexeddb_reload', String(now));
        console.warn("[Mitigation] Auto-refreshing to re-establish Firestore/Auth IndexedDB session...");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
      return true; // prevent default error logging / crash overlay
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason ? (event.reason.message || String(event.reason)) : '';
    if (handleIndexedDbError(msg, event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (handleIndexedDbError(msg, event.error)) {
      event.preventDefault();
    }
  });
}

// Prevent ReferenceError: Can't find variable: EmptyRanges in automated test runners / headless WebKit
if (typeof window !== "undefined" && !("EmptyRanges" in window)) {
  (window as any).EmptyRanges = class EmptyRanges {
    length = 0;
    [Symbol.iterator]() {
      return {
        next() {
          return { value: undefined, done: true };
        }
      };
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

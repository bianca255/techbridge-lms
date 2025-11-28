// Service Worker for TechBridge LMS - Offline Support
// Per SRS requirement: offline-first design with cached lessons

const CACHE_NAME = 'techbridge-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/logo192.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for offline access
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline indicator for API requests
            return new Response(
              JSON.stringify({ 
                status: 'error', 
                message: 'You are offline. Some data may be outdated.',
                offline: true 
              }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // Lessons and course content - cache first, then network
  if (
    url.pathname.includes('/lessons/') ||
    url.pathname.includes('/courses/') ||
    url.pathname.includes('/quizzes/')
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version and update in background
            fetch(request).then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response);
                });
              }
            }).catch(() => {
              // Network failed, but we have cache
              console.log('[Service Worker] Using cached content while offline');
            });
            return cachedResponse;
          }

          // No cache, try network
          return fetch(request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Show offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});

// Background sync for pending actions (quiz submissions, progress updates)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  } else if (event.tag === 'sync-quiz-submission') {
    event.waitUntil(syncQuizSubmissions());
  }
});

// Sync progress updates when back online
async function syncProgress() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingProgress = await cache.match('/offline/pending-progress');
    
    if (!pendingProgress) {
      console.log('[Service Worker] No pending progress to sync');
      return;
    }

    const progressData = await pendingProgress.json();
    
    // Send to server
    const response = await fetch('/api/progress/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${progressData.token}`
      },
      body: JSON.stringify(progressData.data)
    });

    if (response.ok) {
      // Clear pending data
      await cache.delete('/offline/pending-progress');
      console.log('[Service Worker] Progress synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync progress:', error);
  }
}

// Sync quiz submissions when back online
async function syncQuizSubmissions() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingQuizzes = await cache.match('/offline/pending-quizzes');
    
    if (!pendingQuizzes) {
      console.log('[Service Worker] No pending quiz submissions to sync');
      return;
    }

    const quizData = await pendingQuizzes.json();
    
    // Send to server
    const response = await fetch('/api/quizzes/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${quizData.token}`
      },
      body: JSON.stringify(quizData.data)
    });

    if (response.ok) {
      // Clear pending data
      await cache.delete('/offline/pending-quizzes');
      console.log('[Service Worker] Quiz submissions synced successfully');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync quiz submissions:', error);
  }
}

// Message handler for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_LESSON') {
    const { lessonId, lessonData } = event.data;
    
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(
        `/api/lessons/${lessonId}`,
        new Response(JSON.stringify(lessonData), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  } else if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

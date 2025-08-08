const CACHE_NAME = 'snake-stock-cache-v1';
// 我們需要快取的核心檔案列表
const urlsToCache = [
  '/SnakeStock/',
  '/SnakeStock/index.html',
  '/SnakeStock/about.html',
  '/SnakeStock/dashboard.html',
  '/SnakeStock/glossary.html',
  '/SnakeStock/disclaimer.html',
  '/SnakeStock/review-2025-07.html',
  '/SnakeStock/articles/article-tariffs-semiconductors.html',
  '/SnakeStock/special-report-4763.html'
  // 注意：報告頁與個股頁數量眾多，我們會讓 Service Worker 自動學習快取
];

// 安裝 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網路請求，並優先從快取中回應
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取中有，就直接回傳
        if (response) {
          return response;
        }

        // 如果快取中沒有，就發出網路請求
        return fetch(event.request).then(
          response => {
            // 如果請求失敗，或不是我們要快取的類型，就直接回傳
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 複製一份請求的回應
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // 將新的回應存入快取
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

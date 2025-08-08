// 版本號已更新為 v2，這會強制所有舊的快取失效
const CACHE_NAME = 'snake-stock-cache-v2'; 
const urlsToCache = [
  '/SnakeStock/',
  '/SnakeStock/index.html',
  '/SnakeStock/about.html',
  '/SnakeStock/dashboard.html',
  '/SnakeStock/glossary.html',
  '/SnakeStock/disclaimer.html'
];

// 安裝 Service Worker，並快取核心檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // 強制新的 Service Worker 立即啟用
});

// 啟用新的 Service Worker 時，刪除所有舊的快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


// 核心修正：採用「網路優先」策略來攔截請求
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. 永遠先嘗試從網路獲取
    fetch(event.request)
      .then(response => {
        // 如果成功從網路拿到回應
        // 就複製一份存入快取，然後將原始的回應傳給頁面
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(err => {
        // 2. 如果網路請求失敗（例如離線），才嘗試從快取中尋找
        console.log('Network request failed, trying cache:', err);
        return caches.match(event.request);
      })
  );
});

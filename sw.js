const CACHE_NAME = "saoyad-studio-v9";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./logo.avif",
  "./wallpaper.jpg"
];

const cacheResponse = async (request, response) => {
  if (response && response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
};

const networkFirst = async (request, fallbackKey = request) => {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cacheResponse(request, response);
      if (request.mode === "navigate") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put("./index.html", response.clone());
      }
    }
    return response;
  } catch {
    const cached = await caches.match(request) || await caches.match(fallbackKey);
    return cached || Response.error();
  }
};

const staleWhileRevalidate = async request => {
  const cached = await caches.match(request);
  const refresh = fetch(request)
    .then(response => cacheResponse(request, response))
    .catch(() => null);

  if (cached) {
    refresh.catch(() => {});
    return cached;
  }
  return (await refresh) || Response.error();
};

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith("saoyad-studio-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.endsWith("/sw.js")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  // CSS and JavaScript should update on the next request, with offline fallback.
  if (request.destination === "script" || request.destination === "style" ||
      url.pathname.endsWith("/manifest.json")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Images and other static media can render from cache while refreshing quietly.
  event.respondWith(staleWhileRevalidate(request));
});

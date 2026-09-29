const CACHE_NAME = "cineverse-v2";
const ASSETS = [
  "/dashboard.html",
  "/login.html",
  "/register.html",
  "/movie-details.html",
  "/favorites.html",
  "/profile.html",
  "/recommendation.html",
  "/preferences.html",
  "/manifest.json",
  "/js/config.js",
  "/js/dashboard.js",
  "/js/movie-details.js",
  "/js/face-verify.js",
  "/icons/icon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.warn("Cache asset error:", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Network first, fallback to cache
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
/* ==================================================
   UNOFit — Service Worker
   Cache básico seguro (PWA)
================================================== */

const CACHE_NAME = "unofit-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* =========================
   INSTALACIÓN
========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* =========================
   ACTIVACIÓN
========================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* =========================
   FETCH (ESTRATEGIA SEGURA)
========================= */
self.addEventListener("fetch", event => {
  const req = event.request;

  // Solo manejamos GET
  if (req.method !== "GET") return;

  // No cachear llamadas externas sensibles
  if (
    req.url.includes("wa.me") ||
    req.url.includes("mercadopago") ||
    req.url.includes("stripe")
  ) {
    return;
  }

  // Estrategia: Cache First + Network Fallback
  event.respondWith(
    caches.match(req).then(cacheRes => {
      if (cacheRes) return cacheRes;

      return fetch(req)
        .then(networkRes => {
          // Cachear solo recursos del mismo origen
          if (req.url.startsWith(self.location.origin)) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(req, clone);
            });
          }
          return networkRes;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

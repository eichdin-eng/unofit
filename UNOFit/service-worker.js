/*
UNOFit — Service Worker (PWA)
Dirección General: Hugo González Nápoles
© 2026 UNOFit. Todos los derechos reservados.
Cache seguro, controlado y vendible.
*/

const CACHE_NAME = "unofit-cache-v3";

/* =========================
   ARCHIVOS A CACHEAR
========================= */
const ASSETS = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.json",
  "./unofit-logo.png",
  "./icon-192.png",
  "./icon-512.png"
];

/* =========================
   INSTALL
========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* =========================
   ACTIVATE
========================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", event => {
  const req = event.request;

  // Solo GET
  if (req.method !== "GET") return;

  // No cachear servicios externos sensibles
  if (
    req.url.includes("wa.me") ||
    req.url.includes("stripe") ||
    req.url.includes("mercadopago")
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      // 1️⃣ Si está en cache, servirlo
      if (cached) return cached;

      // 2️⃣ Si no, ir a red
      return fetch(req)
        .then(res => {
          // Cachear solo recursos del mismo origen
          if (
            res &&
            res.status === 200 &&
            req.url.startsWith(self.location.origin)
          ) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(req, clone);
            });
          }
          return res;
        })
        .catch(() => {
          // 3️⃣ Fallback seguro
          return caches.match("./index.html");
        });
    })
  );
});

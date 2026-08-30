/* GetAxe POS — minimal offline shell cache */
const CACHE = "getaxe-shell-v1";
const SHELL = ["/", "/sales/pos", "/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Never cache API/server actions
  if (req.headers.get("Next-Action") || req.url.includes("/_next/data")) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        if (res.ok && req.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match("/sales/pos")),
      ),
  );
});

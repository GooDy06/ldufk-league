const CACHE_NAME = "ldufk-demo-cache-v1";

function isDemoRequest(request) {
  try {
    const url = new URL(request.url);
    return url.pathname.endsWith(".dem") || (url.hostname.endsWith(".r2.dev") && url.pathname.includes("/demos/"));
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !isDemoRequest(event.request)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request, { ignoreVary: true });
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok || response.type === "cors") {
        cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    }),
  );
});

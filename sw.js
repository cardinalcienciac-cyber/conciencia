// ConCiencia: trabajador de servicio (permite instalar la app y abrir las páginas sin conexión)
const VERSION = "conciencia-v1";
const BASICOS = ["./", "index.html", "como-funciona.html", "proyectos.html", "ciencia-ciudadana.html", "ods.html",
  "datos.html", "nosotros.html", "contacto.html", "licencia.html", "offline.html", "encuestas/",
  "assets/estilo.css", "assets/comun.js", "img/logo.png", "img/favicon.png", "img/portada-960.webp", "img/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  // Solo peticiones GET del propio sitio: las encuestas (KoboToolbox) y los resultados (Supabase) siempre van a la red
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    // Páginas: primero la red (siempre la versión más reciente); sin conexión, la copia guardada
    e.respondWith(fetch(req).then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); return r; })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("offline.html"))));
    return;
  }
  // Estilos, scripts e imágenes: primero la copia guardada, y se actualiza en segundo plano
  e.respondWith(caches.match(req).then(guardada => {
    const red = fetch(req).then(r => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); } return r; })
      .catch(() => guardada);
    return guardada || red;
  }));
});

/* Service worker: deja la aplicación disponible sin conexión.
   Al cambiar archivos, aumentá VERSION para que los celulares se actualicen. */
const VERSION = 'circuitos-v7';
const ARCHIVOS = [
  './', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './archivos/autor.js', './archivos/redes-datos.js', './archivos/mando-datos.js', './archivos/casas-datos.js', './archivos/circuito-redes.html', './archivos/energia.html', './archivos/casa.html', './archivos/datos.html', './archivos/datos-datos.js', './archivos/datos-escenas.js', './archivos/datos-escenas2.js', './archivos/datos-graficos.js', './archivos/componente.html', './archivos/comp-contactor.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia));
      }
      return r;
    }).catch(() => caches.match('./index.html')))
  );
});
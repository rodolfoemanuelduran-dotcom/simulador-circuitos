/* Service worker: deja la aplicación disponible sin conexión.
   Al cambiar archivos, aumentá VERSION para que los celulares se actualicen. */
const VERSION = 'circuitos-v27';
const ARCHIVOS = [
  './', './index.html', './celular.html', './MENU-CIRCUITOS.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './archivos/comun.js',
  './archivos/autor.js', './archivos/redes-datos.js', './archivos/mando-datos.js', './archivos/casas-datos.js', './archivos/circuito-redes.html', './archivos/energia.html', './archivos/casa.html', './archivos/datos.html', './archivos/datos-datos.js', './archivos/datos-escenas.js', './archivos/datos-escenas2.js', './archivos/datos-graficos.js', './archivos/componente.html', './archivos/comp-contactor.js', './archivos/comp-termico.js', './archivos/comp-comun.js', './archivos/comp-guardamotor.js', './archivos/comp-pulsadores.js', './archivos/comp-temporizador.js', './archivos/comp-calculo.js', './archivos/comp-proteccion.js', './archivos/comp-conexion.js', './archivos/comp-termomagnetica.js', './archivos/comp-diferencial.js', './archivos/mando.html', './archivos/mando-circuitos.js', './archivos/tablero.html', './archivos/tablero-datos.js', './archivos/tablero-datos2.js', './archivos/tablero-datos3.js', './archivos/componentes-cristal.js', './archivos/glosario.html', './archivos/tablero-dibujo.js', './archivos/progreso.js', './archivos/taller-desafios.js','./archivos/examen.html', './archivos/examen-gen.js'
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
    }).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
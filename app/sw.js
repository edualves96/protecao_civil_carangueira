// Service worker: guarda a app para funcionar sem internet.
// Estratégia: rede primeiro (para ter sempre a versão mais recente) e, sem rede, a cópia guardada.
// Ao publicar uma nova versão, atualize VERSAO para renovar a cópia guardada.

const VERSAO = '0.2.0';
const CACHE = `pcc-${VERSAO}`;

const FICHEIROS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/app.js',
  'js/screens.js',
  'js/install.js',
  'js/icons.js',
  'js/store.js',
  'js/guias.js',
  'js/figuras.js',
  'js/contactos.js',
  'js/kit.js',
  'fonts/atkinson-hyperlegible-latin-400-normal.woff2',
  'fonts/atkinson-hyperlegible-latin-700-normal.woff2',
  'fonts/barlow-semi-condensed-latin-500-normal.woff2',
  'fonts/barlow-semi-condensed-latin-600-normal.woff2',
  'fonts/barlow-semi-condensed-latin-700-normal.woff2',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'img/logo-protecao-civil.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FICHEIROS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(
        chaves.filter((k) => k.startsWith('pcc-') && k !== CACHE).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const pedido = e.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const resposta = await fetch(pedido);
      if (resposta.ok) cache.put(pedido, resposta.clone());
      return resposta;
    } catch {
      const guardada = await cache.match(pedido, { ignoreSearch: true });
      if (guardada) return guardada;
      if (pedido.mode === 'navigate') {
        const inicio = await cache.match('index.html');
        if (inicio) return inicio;
      }
      return Response.error();
    }
  })());
});

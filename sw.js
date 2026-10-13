// İnternetsiz çalışma: ilk açılıştan sonra oyun (kod, gömülü sesler, simgeler) cihazda saklanır.
// Dosya eklenirse SRC listesine ekle; önemli değişiklikte CACHE sürümünü artır.
const CACHE = 'feza-isik-ormani-v35';
const SRC = ['ortak', 'bolum', 'dunya', 'feza', 'piril', 'pofuduk', 'sahne', 'arayuz', 'sarki', 'bolum2', 'dunya2', 'yildiz', 'takim', 'dunya3', 'bulut', 'kuzu', 'sekil', 'ucus', 'bolum3', 'muzik', 'ses', 'oyun'];
const CORE = ['./', './index.html', './sesler.js', './manifest.webmanifest', ...SRC.map(n => './src/' + n + '.js')];
const ICONS = ['./icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];   // eksik simge kurulumu durdurmasın
const FRESH = /(\/|index\.html)$/;   // sayfa önce ağ, diğer dosyalar önce önbellek

self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  await c.addAll(CORE);
  for (const u of ICONS) { try { await c.add(u); } catch (err) {} }
  self.skipWaiting();
})()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  // Aynı sitedeki (goktugkarpat.github.io) diğer oyunların önbelleklerine dokunma: yalnız bu oyunun öneki silinir.
  for (const k of await caches.keys()) if (k.startsWith('feza-isik-ormani-') && k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const fresh = req.mode === 'navigate' || FRESH.test(url.pathname);
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? './index.html' : req;
    if (fresh) {
      try { const r = await fetch(req, { cache: 'no-cache' }); if (r.ok) c.put(key, r.clone()); return r; }
      catch (err) { return (await c.match(key, { ignoreSearch: true })) || (await c.match('./index.html')) || Response.error(); }
    }
    const hit = await c.match(req, { ignoreSearch: true }); if (hit) return hit;
    const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
  })());
});

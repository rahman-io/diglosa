/* Diglosa: service worker untuk main tanpa internet.
   Hanya didaftarkan bila pemain memilih "Pasang di HP". Berkas ini sengaja statis (tidak berisi nomor versi),
   jadi tidak perlu diperbarui. Isi simpanan diisi oleh halaman (daftar dari precache.json).
   Strategi: halaman utama dan manifest dicoba dari internet lebih dulu (maks. 4 detik), lalu simpanan; huruf dari simpanan (diperbarui halaman saat ada versi baru).
   Simpanan ikut diperbarui setiap kali ada internet, jadi versi baru otomatis sampai ke pemain. Tanpa internet, simpanan dipakai. Hanya permintaan GET ke alamat yang sama yang dilayani. */
const CACHE = 'diglosa-offline';
const WAIT_MS = 4000;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                                  /* GoatCounter dan lainnya: biarkan */
  if (/\/(sw\.js|precache\.json)$/.test(url.pathname)) return;                    /* selalu dari internet */
  const nav = req.mode === 'navigate' || /\/$/.test(url.pathname) || /\/index\.html$/.test(url.pathname);
  const first = nav || /\/manifest\.webmanifest$/.test(url.pathname);                /* selalu coba yang terbaru dulu */
  const key = nav ? new URL('index.html', self.registration.scope).href : req.url;
  e.respondWith((async () => {
    if (!(await caches.has(CACHE))) return fetch(req);                              /* belum dipasang, atau unduhan sudah dihapus: jangan membuat simpanan baru */
    const cache = await caches.open(CACHE);
    const fresh = fetch(first ? new Request(key, { cache: 'no-cache' }) : req).then(r => { if (r && r.ok && r.type === 'basic') { cache.put(key, r.clone()); } return r; }).catch(() => null);
    e.waitUntil(fresh);
    const cached = await cache.match(key);
    if (!cached) return (await fresh) || Response.error();
    if (!first) return cached;                                                      /* huruf: simpanan dulu */
    const win = await Promise.race([fresh, new Promise(r => setTimeout(() => r(null), WAIT_MS))]);
    return win && win.ok ? win : cached;                                           /* internet mati, lambat, atau galat: pakai simpanan */
  })());
});

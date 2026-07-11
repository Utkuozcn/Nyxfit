// NyxFit service worker — offline cache
const CACHE = "nyxfit-v4.1";

// Çekirdek dosyalar (mutlaka var olmalı — addAll atomiktir)
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./images/icon-180.png",
  "./images/icon-192.png",
  "./images/icon-512.png",
  "./images/icon-512-maskable.png",
  "./images/logo.png"
];

// Uygulama görselleri (best-effort — biri eksik olsa bile kurulum bozulmaz)
const IMAGES = [
  "./images/male.png", "./images/female.png",
  "./images/b3.png", "./images/b4.png", "./images/b5.png", "./images/b6.png", "./images/b7.png", "./images/b8.png",
  "./images/f11.png", "./images/f12.png", "./images/f13.png", "./images/f14.png", "./images/f15.png", "./images/f16.png", "./images/f17.png",
  "./images/m9.png", "./images/m10.png",
  "./images/goal_slim.png", "./images/goal_health.png", "./images/goal_muscle.png",
  "./images/goal_strength.png", "./images/goal_fit.png", "./images/goal_cardio.png",
  // manifest ekran görüntüleri (yalnızca yükleme önizlemesi için; zorunlu değil)
  "./images/mainpage.png", "./images/body.png", "./images/purpose.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // çekirdek: hepsi başarılı olmalı
      c.addAll(CORE).then(() =>
        // görseller: tek tek, hata olursa yut
        Promise.allSettled(IMAGES.map((u) => c.add(u)))
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        // aynı origin GET yanıtlarını dinamik olarak önbelleğe al
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => {
        // çevrimdışı: sadece sayfa gezinmelerinde index.html'e düş
        if (req.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      })
    )
  );
});

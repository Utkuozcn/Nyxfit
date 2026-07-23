/* NyxFit tanıtım sitesi — service worker kaldırıcı ("kill switch")
   Bu dosyanın amacı: daha önce siteyi ziyaret etmiş tarayıcılarda kayıtlı olan
   eski uygulama service worker'ını devre dışı bırakmak, önbelleğini silmek ve
   açık sekmeleri güncel sayfaya yenilemek.
   Tarayıcı kayıtlı worker'ı periyodik olarak kontrol eder; bu dosyayı gördüğünde
   kendini siler ve bir daha araya girmez. */

self.addEventListener("install", function () {
  // Beklemeden devreye gir
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      try {
        // 1) Tüm önbellekleri sil
        const adlar = await caches.keys();
        await Promise.all(adlar.map(function (ad) { return caches.delete(ad); }));
      } catch (e) {}

      try {
        // 2) Bu service worker kaydını kaldır
        await self.registration.unregister();
      } catch (e) {}

      try {
        // 3) Açık sekmeleri yenile ki güncel sayfa gelsin
        const pencereler = await self.clients.matchAll({ type: "window" });
        pencereler.forEach(function (pencere) {
          pencere.navigate(pencere.url);
        });
      } catch (e) {}
    })()
  );
});

/* Kaldırma tamamlanana kadar gelen istekleri önbellekten değil,
   doğrudan ağdan karşıla. */
self.addEventListener("fetch", function (event) {
  event.respondWith(fetch(event.request));
});

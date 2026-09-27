# Glbify - AI Ajan Kuralları

Bu dosya, bu depoda çalışan AI araçları (Gemini CLI, Claude Code, Kilo vb.) için kuralları içerir.

## 📁 Proje Yapısı

```
Glbify/
├── index.html                # Uygulama kabuğu (yalnızca HTML iskeleti)
├── vite.config.js            # Vite + Tailwind + PWA yapılandırması
├── package.json              # Bağımlılıklar ve komutlar
├── scripts/
│   ├── sync-decoders.mjs     # DRACO encoder dosyalarını public/draco/ altına kopyalar
│   └── generate-icons.mjs    # PWA ikonlarını sharp ile üretir
├── public/
│   ├── draco/                # Üretilen encoder dosyaları (gitignored, build'de yenilenir)
│   ├── icons/                # PWA ikonları (192/512/maskable/apple-touch)
│   └── favicon.png
├── src/
│   ├── main.js               # Uygulama denetleyicisi (GlbifyApp, async start())
│   ├── config.js             # Limitler, DRACO seviyeleri, asset URL'leri (tembel çözülür)
│   ├── core/
│   │   ├── viewer.js         # Sahne, kamera, ışık, grid, render döngüsü, XR
│   │   ├── renderer.js       # WebGL2 / WebGPU seçimi, yetenek tespiti
│   │   ├── decoders.js       # DRACO / KTX2 / meshopt kayıtları
│   │   ├── sceneSettings.js  # Environment, ışık, pozlama, arka plan
│   │   ├── history.js        # Undo/redo yığını
│   │   ├── transformController.js # TransformControls + proxy + birim ölçeği
│   │   └── animator.js       # Klip yönetimi ve transport kontrolleri
│   ├── io/
│   │   ├── importers.js      # FBX, GLTF, OBJ(+MTL), STL, PLY, 3MF, USD
│   │   ├── exporters.js      # GLB, USDZ, STL, OBJ
│   │   ├── gltfPostprocess.js# weld/dedup/prune, simplify, DRACO|Meshopt, KTX2, doku
│   │   ├── workerParser.js   # Worker istemcisi + main thread geri düşüşü
│   │   ├── parseWorker.js    # Worker gövdesi
│   │   ├── estimate.js       # Çıktı boyutu tahmini
│   │   ├── materialEditor.js # Materyal listeleme/yama/durum
│   │   ├── textureOps.js     # Canvas doku kodlama/işleme
│   │   ├── usdz.js           # USDZ paket doğrulaması
│   │   ├── materials.js      # Phong → Standard, renk uzayı denetimi, MTL uygulama
│   │   ├── modelStats.js     # Mesh / vertex / üçgen istatistikleri
│   │   ├── fileReader.js     # Limit/boş dosya kontrollü, iptal edilebilir okuma
│   │   └── download.js       # Blob indirme
│   ├── ui/                   # dropzone, exportPanel, sidePanel, hud, toast
│   ├── utils/                # format, store, share, dom, dispose, memory
│   ├── pwa/                  # serviceWorker.js, install.js
│   ├── shims/node-builtins.js# node:* taklidi (glTF-Transform)
│   └── styles/main.css       # Tailwind v4 katmanları + bileşen CSS'i
├── packages/cli/             # @glbify/cli: inspect / optimize / convert
├── tests/
│   ├── unit/                 # Vitest birim testleri
│   ├── e2e/app.spec.mjs      # Puppeteer uçtan uca test
│   └── fixtures/             # Test modelleri
├── vitest.config.js
├── docs/KNOWLEDGE.md         # Format kuralları, post-process, worker ve build notları
├── ARCHITECTURE.md           # Katman sınırları, boru hattı, doğrulama
└── .github/workflows/        # test → cli → e2e → build → Pages
```

## 🔧 Teknoloji Stack

- **Three.js r186** - npm'den import (`three`, `three/addons/*`)
- **Vite 8** - geliştirme sunucusu + üretim derlemesi
- **Tailwind CSS 4** - `@tailwindcss/vite` eklentisi, CSS içinde `@source` ile tarama
- **glTF-Transform 4 + draco3dgltf** - DRACO sıkıştırma
- **vite-plugin-pwa (Workbox)** - manifest + service worker
- **Vanilla ES modülleri** - framework yok, tip yok

> ⚠️ CDN kullanımı yasaktır. Tüm bağımlılıklar build ile paketlenir, aksi halde çevrimdışı
> çalışma bozulur.

## 📐 Katman Kuralları

1. `src/ui/**` **three.js import etmez**; yalnızca callback üretir.
2. `src/core/**` ve `src/io/**` DOM'a yalnızca dosya girdisi ve indirme için dokunur.
3. Yeni format desteği `src/io/importers.js` içindeki registry'ye eklenir (tek dosya).
4. Yeni çıktı formatı `src/io/exporters.js` içindeki registry'ye eklenir.
5. Ayar değerleri `src/utils/store.js` üzerinden `localStorage`'a yazılır.
6. GPU kaynakları model değişiminde `src/utils/dispose.js` ile serbest bırakılır.

## 🧩 Yeni Özellik Ekleme

### Yeni Loader

1. three.js loader'ını `src/io/importers.js` içine import et
2. `importer` nesnesi ekle: `{ id, label, extensions, async parse(buffer, ctx) }`
3. `parse` sonucu `{ object, animations }` döndürmeli
4. Hata durumlarında anlamlı bir `Error` mesajı yükselt

### Yeni Exporter

1. three.js exporter'ını `src/io/exporters.js` içine import et
2. `withScale(task)` sarmalayıcısını kullan (ölçek uygula → çalıştır → ölçeği geri al)
3. `onProgress({ ratio, label })` ile ilerleme bildir
4. `result(blob, fileName)` ile `{ blob, fileName, size }` döndür
5. `index.html` içine buton + `src/main.js` içindeki `elements.buttons` haritasına anahtar ekle

### UI Bileşeni

1. Markup'ı `index.html` içine ekle (Tailwind utility + `src/styles/main.css` içindeki bileşen sınıfları)
2. Davranışı ilgili `src/ui/*.js` modülüne yaz
3. Tailwind `hidden` sınıfı kullanacaksan, o bileşenin CSS'i `@layer components` içinde olmalı
   (aksi halde `display` kuralları `hidden`'ı ezebilir)

## ⚠️ Kritik Notlar

1. **Materyal dönüşümü**: `src/io/materials.js` FBX Phong materyallerini Standard'a çevirir.
   Doku referansları (`map`, `normalMap`, ...) kopyalanırken **renk uzayı** da düzeltilir.
2. **Ölçekleme**: Dönüşüm artık model üzerinde kalıcıdır; gizmo proxy'si kullanıcı ölçeğini,
   `unitScale` ise hedef yazılım çevrimini tutar (`model.scale = proxy.scale * unitScale`).
   Dışa aktarma ölçeği değiştirmez, sadece dosya adına etiket yazar.
3. **glTF-Transform `prune()`**: bare çağrı materyal dokularını siler. Sadece
   `PRUNE_PROPERTY_TYPES` (ACCESSOR/MESH/NODE) ile çağır.
4. **İşlem sırası**: doku dönüşümü/normal üretimi **önce**, KTX2 sıkıştırma **sonra** yapılır.
   `EXT_meshopt_compression` ve DRACO alternatiftir, aynı anda kullanılmaz.
5. **Worker**: buffer kopyalanarak aktarılır (transfer orijinali detach eder). İndekslenmemiş
   geometrilerde transfer listesi boş olabilir. OBJ + MTL worker'da çalışmaz (worker'da `Image` yok).
6. **OBJ + MTL**: MTL kitaplığı `loader.setMaterials(...)` ile verilir; doku dosyaları data URL olarak
   MTL metnine yazılır.
7. **Dosya limiti**: `src/io/fileReader.js` limiti ve boş dosyayı kontrol eder;
   `src/utils/memory.js` cihaz belleğine göre erken reddetme yapar.
8. **Offline**: Yeni bir WASM/decoder dosyası eklersen `vite.config.js` içindeki
   `globPatterns` ve `maximumFileSizeToCacheInBytes` değerlerini kontrol et.
9. **Layout**: Paneller akış içinde (`margin-top: auto`), mutlak konumlandırma yok; aksi halde
   yüksek başlık paneli altındaki düğmelerin tıklamalarını yutar.
10. **Node uyumluluğu**: `src/config.js` ve `src/utils/**` birim testlerinde (Node, DOM yok)
    çalışmalı; `document`/`window` erişimini modül yüklenirken yapma.
11. **Renderer**: `Viewer` renderer'ı dışarıdan alır (`core/renderer.js`). WebGPU build'i
    (`three/webgpu`) ayrı chunk'ta ve precache dışında; adaptör yoksa WebGL2'ye düşer.
12. **Undo/redo**: geçmiş yığını **anlık görüntü** tutar; `undo()` bir kare geri yükler.
    Materyal doku geri yüklemesinde `textureLookup` **uuid → texture** eşlemesi olmalı (sarmalayıcı
    değil, aksi halde shader hatası verir).
13. **three.js r186**: `USDLoader` (`USDZLoader` deprecated), `OBJLoader.setMaterials()`,
    `TransformControls.getHelper()` ve paketlenmiş decoder URL'leri kullanılır.

## 🧪 Test Etme

```bash
npm test          # Vitest birim testleri
npm run test:cli  # CLI testleri (node:test)
npm run build     # üretim derlemesi (dist/)
npm run preview   # üretim çıktısını sun
npm run test:e2e  # Puppeteer uçtan uca test (GLBY_BASE_URL ile adres değiştirilebilir)
```

Manuel kontrol listesi:

1. `npm run build` uyarısız tamamlanıyor, `dist/` içinde `sw.js` ve `manifest.webmanifest` var
2. FBX, GLB, OBJ, STL, PLY, 3MF yükleniyor; istatistik paneli doğru değerleri gösteriyor
3. STL/PLY/OBJ için "arka plan işçisinde yapıldı" bildirimi çıkıyor
4. OBJ + MTL + doku birlikte bırakılınca materyal rengi ve haritası uygulanıyor
5. GLB/GLTF içe aktarımında DRACO'lu, KTX2'li ve meshopt'lu dosyalar açılıyor
6. GLB + DRACO çıktısı `KHR_draco_mesh_compression` içeriyor ve yeniden yüklenebiliyor
7. Meshopt seçeneği `EXT_meshopt_compression`, KTX2 seçeneği `KHR_texture_basisu` yazıyor
8. JPEG/WebP doku seçimi çıktıda `image/jpeg` / `image/webp` olarak görünüyor
9. Weld açıkken de base color dokusu kaybolmuyor
10. "Diffuse'dan normal üret" seçeneği `normalTexture` üretiyor
11. Boyut tahmini seçenek değişince güncelleniyor
12. Gizmo modları çalışıyor; "Sıfırla" ve "Çerçevele" beklenen sonucu veriyor
13. Animasyonlu modelde klip/timeline/hız/döngü kontrolleri ve kare atlama çalışıyor
14. **Araçlar paneli**: materyal listesi, renk/roughness/metalness değişimi, doku atama
15. **Undo/redo** düğmeleri durumu doğru yansıtıyor ve geri/yinele çalışıyor
16. **Sahne ayarları**: ışık, pozlama, arka plan ve ızgara değişiklikleri sahnede görünüyor
17. **Sistem paneli**: backend, WebGPU, WebXR ve bellek bilgisi dolu
18. USDZ geçerli ZIP; doku ve animasyon karesi bildirimi geliyor
19. Büyük dosya bellek korumasıyla reddediliyor, İptal butonu çalışıyor
20. Ayar linki kopyalanıyor; `?view=1` salt görüntüleme modunu açıyor
21. Service worker kurulduktan sonra sayfa çevrimdışı yeniden yükleniyor
22. Konsolda hata yok

## 📝 Commit Mesaj Formatı

```
[type]: kısa açıklama

feat: yeni özellik
fix: hata düzeltme
refactor: kod yeniden düzenleme (davranış değişmez)
perf: performans
docs: dokümantasyon
build: yapılandırma / bağımlılık
chore: diğer
```

## 🧠 Bilgi Tabanı

Format kuralları, DRACO notları ve build incelikleri için `docs/KNOWLEDGE.md` dosyasına bak.

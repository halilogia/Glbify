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
│   ├── main.js               # Uygulama denetleyicisi (GlbifyApp)
│   ├── config.js             # Limitler, DRACO seviyeleri, doku MIME, asset URL'leri
│   ├── core/
│   │   ├── viewer.js         # Sahne, kamera, ışık, grid, render döngüsü
│   │   ├── decoders.js       # DRACO / KTX2 / meshopt kayıtları
│   │   ├── transformController.js # TransformControls + proxy + birim ölçeği
│   │   └── animator.js       # Klip yönetimi ve transport kontrolleri
│   ├── io/
│   │   ├── importers.js      # FBX, GLTF, OBJ(+MTL), STL, PLY, 3MF, USD
│   │   ├── exporters.js      # GLB, USDZ, STL, OBJ
│   │   ├── gltfPostprocess.js# DRACO + doku post-process
│   │   ├── textureOps.js     # Canvas doku kodlama/işleme
│   │   ├── usdz.js           # USDZ paket doğrulaması
│   │   ├── materials.js      # Phong → Standard, renk uzayı denetimi, MTL uygulama
│   │   ├── modelStats.js     # Mesh / vertex / üçgen istatistikleri
│   │   ├── fileReader.js     # Limit ve boş dosya kontrollü okuma
│   │   └── download.js       # Blob indirme
│   ├── ui/                   # dropzone, exportPanel, hud, toast
│   ├── utils/                # format, store, dom, dispose
│   ├── pwa/serviceWorker.js  # SW kaydı + çevrimdışı takibi
│   ├── shims/node-builtins.js# node:* taklidi (glTF-Transform)
│   └── styles/main.css       # Tailwind v4 katmanları + bileşen CSS'i
├── docs/KNOWLEDGE.md         # Format kuralları, post-process ve build notları
├── ARCHITECTURE.md           # Katman sınırları, boru hattı, doğrulama
└── .github/workflows/        # Pages dağıtımı
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
3. **DRACO ve doku işlemleri**: `gltfPostprocess.js` içinde tek geçişte yapılır; `getAlphaTexture()`
   gltf-Transform v4'te yoktur (alpha, base color dokusunun içindedir).
4. **OBJ + MTL**: MTL kitaplığı `loader.setMaterials(...)` ile verilir; doku dosyaları data URL olarak
   MTL metnine yazılır.
5. **Dosya limiti**: `src/io/fileReader.js` limiti okuma öncesi ve taşma anında, boş dosyayı da kontrol eder.
6. **Offline**: Yeni bir WASM/decoder dosyası eklersen `vite.config.js` içindeki
   `globPatterns` ve `maximumFileSizeToCacheInBytes` değerlerini kontrol et.
7. **Layout**: Paneller akış içinde (`margin-top: auto`), mutlak konumlandırma yok; aksi halde
   yüksek başlık paneli altındaki düğmelerin tıklamalarını yutar.
8. **three.js r186**: `USDLoader` (`USDZLoader` deprecated), `OBJLoader.setMaterials()`,
   `TransformControls.getHelper()` ve paketlenmiş decoder URL'leri kullanılır.

## 🧪 Test Etme

```bash
npm run dev       # geliştirme sunucusu
npm run build     # üretim derlemesi (dist/)
npm run preview   # üretim çıktısını sun
```

Manuel kontrol listesi:

1. `npm run build` uyarısız tamamlanıyor, `dist/` içinde `sw.js` ve `manifest.webmanifest` var
2. FBX, GLB, OBJ, STL, PLY, 3MF yükleniyor; istatistik paneli doğru değerleri gösteriyor
3. OBJ + MTL + doku birlikte bırakılınca materyal rengi ve haritası uygulanıyor
4. GLB/GLTF içe aktarımında DRACO'lu, KTX2'li ve meshopt'lu dosyalar açılıyor
5. GLB + DRACO çıktısı `KHR_draco_mesh_compression` içeriyor ve yeniden yüklenebiliyor
6. JPEG/WebP doku seçimi çıktıda `image/jpeg` / `image/webp` olarak görünüyor
7. "Diffuse'dan normal üret" seçeneği `normalTexture` üretiyor
8. Gizmo modları çalışıyor; "Sıfırla" ve "Çerçevele" beklenen sonucu veriyor
9. Animasyonlu modelde klip/timeline/hız/döngü kontrolleri çalışıyor
10. USDZ geçerli ZIP; doku ve animasyon karesi bildirimi geliyor
11. Limit seçilen değerin üzerindeki dosya reddediliyor
12. Service worker kurulduktan sonra sayfa çevrimdışı yeniden yükleniyor
13. Konsolda hata yok

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

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
│   ├── config.js             # Limitler, DRACO seviyeleri, asset URL'leri
│   ├── core/                 # three.js çalışma zamanı
│   ├── io/                   # Format giriş/çıkış katmanı
│   ├── ui/                   # DOM bağlantıları (three.js import etmez)
│   ├── utils/                # Biçimlendirme, ayar deposu, GPU temizliği
│   ├── pwa/                  # Service worker kaydı
│   ├── shims/                # node:* taklit modülü
│   └── styles/main.css       # Tailwind v4 katmanları + bileşen CSS'i
├── docs/KNOWLEDGE.md         # Format kuralları ve build notları
├── ARCHITECTURE.md           # Katman sınırları ve boru hattı
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
2. **Ölçekleme**: Export sırasında ölçek uygulanır ve `finally` bloğunda `1`'e döner.
3. **DRACO**: Encoder yalnızca GLB çıktısında ve ilk kullanımda tembel yüklenir
   (`src/io/dracoEncoder.js`). `KHR_draco_mesh_compression` gerektirir.
4. **Dosya limiti**: `src/io/fileReader.js` limiti okuma öncesi ve taşma anında kontrol eder.
5. **Offline**: Yeni bir WASM/decoder dosyası eklersen `vite.config.js` içindeki
   `globPatterns` ve `maximumFileSizeToCacheInBytes` değerlerini kontrol et.
6. **three.js sürüm notu**: r186'da `USDZLoader` yerine `USDLoader`, `setDecoderConfig` yerine
   paketlenmiş decoder URL'leri kullanılır. `setDecoderPath`/`setTranscoderPath` çağrıları gereksizdir.

## 🧪 Test Etme

```bash
npm run dev       # geliştirme sunucusu
npm run build     # üretim derlemesi (dist/)
npm run preview   # üretim çıktısını sun
```

Manuel kontrol listesi:

1. `npm run build` uyarısız tamamlanıyor, `dist/` içinde `sw.js` ve `manifest.webmanifest` var
2. FBX, GLB, OBJ, STL yükleniyor; istatistik paneli doğru değerleri gösteriyor
3. GLB/GLTF içe aktarımında DRACO'lu, KTX2'li ve meshopt'lu dosyalar açılıyor
4. GLB + DRACO çıktısı `KHR_draco_mesh_compression` içeriyor ve yeniden yüklenebiliyor
5. USDZ çıktısı geçerli ZIP, STL çıktısı binary STL
6. Limit seçilen değerin üzerindeki dosya reddediliyor
7. Service worker kurulduktan sonra sayfa çevrimdışı yeniden yükleniyor
8. Konsolda hata yok

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

# Glbify 📦

Tarayıcı tabanlı 3D model dönüştürücü ve görüntüleyici. FBX, GLB/GLTF, OBJ, STL ve USDZ dosyalarınızı dönüştürün, önizleyin ve DRACO sıkıştırma ile küçültün.

![Three.js](https://img.shields.io/badge/Three.js-r186-black?logo=three.js)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow?logo=javascript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline%20ready-22c55e?logo=mdn&logoColor=white)

## 🌟 Özellikler

### 🔄 3D Format Dönüştürme

| Giriş | Çıkış | Notlar |
| --- | --- | --- |
| FBX | GLB, USDZ, STL, OBJ | Doku ve materyaller gömülü |
| GLB / GLTF | GLB, USDZ, STL, OBJ | DRACO, KTX2/Basis ve meshopt desteklenir |
| OBJ | GLB, USDZ, STL, OBJ | `.mtl` + doku dosyaları birlikte bırakılabilir |
| STL | GLB, USDZ, STL, OBJ | Binary + ASCII |
| PLY | GLB, USDZ, STL, OBJ | ASCII + binary little endian |
| 3MF | GLB, USDZ, STL, OBJ | Baskı kütüphaneleri |
| USD / USDZ | GLB, USDZ, STL, OBJ | - |

### 🗜️ Sıkıştırma ve Optimizasyon

- **DRACO** (`KHR_draco_mesh_compression`) veya **Meshopt** (`EXT_meshopt_compression`) geometri sıkıştırma
- **Mesh sadeleştirme**: kaydırıcıyla hedef vertex oranı (meshopt simplifier)
- **Vertex birleştirme** (weld) + duplicate temizliği
- **KTX2 / Basis Universal** doku sıkıştırma: ETC1S (küçük) veya UASTC (kaliteli)
- Export öncesi **tahmini çıktı boyutu** (vertex/üçgen/doku sayılarından)
- Dışa aktarımda gerçek kazanılan yüzde arayüzde gösterilir

### ⚡ Performans

- STL / PLY / OBJ ayrıştırması **Web Worker**'da çalışır, arayüz donmaz
- Yükleme ekranında **İptal** butonu
- Cihaz belleği bütçesine göre otomatik dosya limiti (limit aşımı okuma başlamadan reddedilir)

### 🎨 Doku ve Materyal İşleme

- Doku formatı dönüşümü: PNG / JPEG / WebP + kalite ayarı
- Doku çözünürlüğü: 2K / 4K / dokusuz
- Normal map yönünü ters çevirme (OpenGL ↔ DirectX)
- Diffuse dokusundan normal haritası üretme (Sobel)
- Doku renk uzayı denetimi: renk haritaları sRGB, veri haritaları lineer olmalı
- FBX emissive / AO / roughness / metalness / alpha / displacement haritaları taşınır

### ✏️ Model Düzenleme

- Görsel gizmo: hareket, döndürme, ölçek
- Dönüşüm sıfırlama ve çerçeveleme kısayolları (canvas çift tıklama)
- Birim dönüşümü canlı önizleme (1x, 100x, 0.01x, 0.0254x)
- GLB çıktısında dönüşümler TRS olarak yazılır

### 🎬 Animasyon Kontrolü

- Klip seçici, oynat / duraklat / durdur
- Timeline slider, hız (0.25x - 2x) ve döngü ayarı
- USDZ "Quick Look uyumlu" modu (animasyon kare kare yazılır)

### 🍎 USDZ Desteği

- Apple AR Quick Look ve Quick Look görüntüleyicileri için USDZ paketleme
- Çıktı doğrulaması: ZIP imzası, `.usda` kök dosyası, doku ve animasyon karesi sayımı

### 🧱 3B Baskı

- Binary STL dışa aktarım (varsayılan)
- OBJ dışa aktarım (geometri)

### ⚙️ Ölçekleme Seçenekleri

- Blender / Unity / Godot (Metre - 1x)
- 3ds Max / Unreal Engine (Santimetre - 100x)
- Özel ölçekleme (0.01x) ve İnç -> Metre (0.0254x)

### 🛡️ Büyük Dosya Koruması

- Ayarlanabilir dosya limiti (128 MB - 2 GB, tarayıcıda saklanır)
- Limit aşımında okuma başlamadan reddetme, taşma (overflow) kontrolü
- Chunk tabanlı okuma ile gerçek ilerleme çubuğu
- Büyük dosya, indekslenmemiş geometri ve yüksek üçgen sayısı uyarıları

### 📴 PWA / Çevrimdışı

- Service worker ile uygulama kabuğu ve WASM decoder'lar önbelleklenir
- Kurulabilir PWA (manifest + maskable ikonlar) ve kurulum istemi butonu
- Çevrimdışı/çevrimiçi rozeti, sürüm geçmişi ve güncelleme bildirimi
- Önbellek kullanımı gösterilir ve tek tıkla temizlenir
- Ayar linki paylaşımı: `?scale=100&draco=max&meshopt=1` parametreleri okunur
- Üçüncü parti CDN yok: tüm bağımlılıklar paketlenir

### 🎨 Arayüz

- Modern glassmorphism tasarım
- **Araçlar paneli**: materyal editörü (renk, roughness/metalness, doku atama), sahne ayarları
  (environment, ışık, pozlama, arka plan, ızgara), sistem bilgileri (backend, WebGPU, WebXR, bellek)
- **Undo/redo** geçmişi (dönüşüm + materyal), kare atlama ve çerçeveleme kısayolları
- **WebGL2 / WebGPU** backend seçimi (WebGPU yoksa otomatik WebGL2'ye düşer)
- **WebXR / AR** önizleme (destekleyen cihazlarda)
- **Salt görüntüleme modu**: `?view=1` ile paylaşılabilir, düzenleme araçları kapalı
- Sürükle-bırak (tüm pencere), klavye ve dosya seçici desteği
- Gerçek zamanlı 3D önizleme, OrbitControls, animasyon oynatma
- Toast bildirimleri ve yükleme/ilerleme göstergeleri
- Mesh / vertex / üçgen istatistikleri

## 🚀 Kurulum

```bash
git clone https://github.com/halilogia/Glbify.git
cd Glbify
npm install
```

`npm install`, `scripts/sync-decoders.mjs` betiğini otomatik çalıştırır ve
`public/draco/` altına DRACO encoder dosyalarını kopyalar. Bu dosyalar
`npm run build` ve `npm run dev` tarafından da yeniden üretilir.

### Komutlar

```bash
npm run dev       # Geliştirme sunucusu (http://localhost:5173)
npm run build     # dist/ klasörüne üretim derlemesi
npm run preview   # Üretim derlemesini yerel sunucuda dene
npm run icons     # PWA ikonlarını yeniden üret (sharp)
npm test          # Vitest birim testleri
npm run test:cli  # CLI testleri (node:test)
npm run test:e2e  # Puppeteer uçtan uca test (önce build + preview gerekir)
npm run glbify -- inspect model.glb
```

Üretim çıktısı `dist/` klasörüne yazılır. GitHub Pages dağıtımı
`.github/workflows/deploy.yml` ile `main` dalından otomatik yapılır: birim testi → CLI testi →
uçtan uca test → build → dağıtım.

E2E testleri `npm run build && npm run preview` ile servis edilen yapıyı kullanır; farklı bir adres
için `GLBY_BASE_URL` verilebilir. İlk çalıştırmada Chrome indirilmesi gerekebilir:
`npx puppeteer browsers install chrome`.

## 🖥️ Komut Satırı Aracı (`@glbify/cli`)

`packages/cli` paketi tarayıcısız çalışır; three.js + glTF-Transform tabanlıdır.

```bash
npm run glbify -- inspect model.glb
npm run glbify -- optimize model.glb model_opt.glb --simplify 0.5 --draco balanced
npm run glbify -- optimize model.glb model_ktx2.glb --ktx2 --uastc
npm run glbify -- convert model.stl model.glb
npm run glbify -- convert model.glb model.obj
```

Seçenekler: `--simplify <0-1>`, `--draco <max|balanced|high>`, `--meshopt`, `--ktx2`, `--uastc`,
`--no-weld`. `convert` dokuları OBJ/STL'ye gömmez ve bunu uyarı olarak bildirir.

## 📦 Proje Yapısı

```text
Glbify/
├── index.html                # Uygulama kabuğu (yalnızca HTML iskeleti)
├── vite.config.js            # Vite + Tailwind + PWA yapılandırması
├── scripts/
│   ├── sync-decoders.mjs     # DRACO encoder dosyalarını public/ altına kopyalar
│   └── generate-icons.mjs    # PWA ikonlarını üretir
├── tests/
│   ├── unit/                 # Vitest birim testleri
│   ├── e2e/                  # Puppeteer uçtan uca test
│   └── fixtures/             # Test modelleri (küp STL/OBJ, PLY, 3MF, OBJ+MTL+PNG, animasyonlu GLB)
├── public/
│   ├── draco/                # Üretilen decoder/encoder dosyaları (gitignored)
│   ├── icons/                # PWA ikonları
│   └── favicon.png
├── src/
│   ├── main.js               # Uygulama denetleyicisi (GlbifyApp)
│   ├── config.js             # Sınırlar, DRACO seviyeleri, doku MIME, asset yolları
│   ├── core/
│   │   ├── viewer.js         # Sahne, kamera, ışık, render döngüsü, çerçeveleme
│   │   ├── renderer.js       # WebGL2 / WebGPU seçimi ve yetenek tespiti
│   │   ├── decoders.js       # DRACO / KTX2 / meshopt kayıtları
│   │   ├── sceneSettings.js  # Environment, ışık, pozlama, arka plan uygulaması
│   │   ├── history.js        # Undo/redo yığını
│   │   ├── transformController.js # Gizmo + birim ölçeği birleştirme
│   │   └── animator.js       # Klip yönetimi, play/pause, hız, döngü
│   ├── io/
│   │   ├── importers.js      # FBX, GLTF, OBJ(+MTL), STL, PLY, 3MF, USD okuyucuları
│   │   ├── exporters.js      # GLB, USDZ, STL, OBJ yazıcıları
│   │   ├── gltfPostprocess.js# DRACO/Meshopt + sadeleştirme + KTX2 + doku işlemleri
│   │   ├── workerParser.js   # Web Worker tabanlı STL/PLY/OBJ ayrıştırma
│   │   ├── parseWorker.js    # Worker gövdesi
│   │   ├── estimate.js       # Çıktı boyutu tahmini
│   │   ├── textureOps.js     # Canvas tabanlı doku kodlama/işleme
│   │   ├── usdz.js           # USDZ paket doğrulaması
│   │   ├── materials.js      # Phong -> Standard dönüşümü, renk uzayı denetimi, MTL uygulama
│   │   ├── modelStats.js     # Mesh / vertex / üçgen istatistikleri
│   │   ├── fileReader.js     # Limit kontrollü, iptal edilebilir dosya okuma
│   │   └── download.js       # Blob indirme yardımcısı
│   ├── ui/
│   │   ├── dropzone.js       # Çoklu dosya sürükle-bırak ve dosya seçici
│   │   ├── exportPanel.js    # Ölçek, doku, DRACO ayarları
│   │   ├── sidePanel.js      # Materyal / sahne / sistem panelleri
│   │   ├── hud.js            # Başlık paneli, rozetler, ilerleme, animasyon paneli
│   │   └── toast.js          # Bildirimler
│   ├── pwa/serviceWorker.js  # SW kaydı ve çevrimdışı takibi
│   ├── pwa/install.js        # Kurulum istemi, sürüm geçmişi, önbellek yönetimi
│   ├── utils/                # Biçimlendirme, DOM, ayarlar, paylaşım, bellek, GPU temizliği
│   ├── shims/node-builtins.js# glTF-Transform için node:* taklidi
│   └── styles/main.css       # Tailwind katmanları + bileşen stilleri
├── packages/cli/             # @glbify/cli (inspect / optimize / convert)
├── brain/                    # Proje dokümantasyonu
└── docs/                     # Ek dokümantasyon
```

## 🛠️ Teknolojiler

- **Three.js r186** - 3D grafik kütüphanesi
- **Vite 8** - Geliştirme sunucusu ve üretim derlemesi
- **Tailwind CSS 4** - Utility-first CSS
- **vite-plugin-pwa / Workbox** - Service worker ve manifest
- **glTF-Transform 4 + draco3dgltf** - Sıkıştırma, sadeleştirme ve doku post-process
- **meshoptimizer** - `EXT_meshopt_compression` ve mesh simplifier
- **ktx2-encoder (Basis)** - KTX2 / `KHR_texture_basisu` doku sıkıştırma
- **FBXLoader, GLTFLoader, OBJLoader, MTLLoader, STLLoader, PLYLoader, ThreeMFLoader, USDLoader** - Okuyucular
- **GLTFExporter, USDZExporter, OBJExporter, STLExporter** - Yazıcılar
- **TransformControls, OrbitControls** - Model düzenleme ve kamera
- **Vitest, Puppeteer** - Birim ve uçtan uca testler

## 💡 Kullanım

1. **Model Yükle**: Dosyayı sürükle-bırak veya "Dosya Seç" butonunu kullan
   (OBJ için `.obj` + `.mtl` + dokuları birlikte bırakabilirsin)
2. **Önizle**: Model otomatik olarak sahneye yüklenir, istatistikler gösterilir
3. **Düzenle**: Gizmo ile ölçek/rotasyon/öteleme, gelişmiş ayarlardan birim, doku ve DRACO
4. **Oynat**: Animasyonlu modellerde klip seçici, timeline ve hız kontrolleri
5. **Dışa Aktar**: GLB, USDZ, STL veya OBJ indir

> Not: `.gltf` dosyalarının dış kaynakları (`.bin`, dokular) tarayıcıdan okunamaz.
> Tek dosyalı `.glb` önerilir.

## 📄 Lisans

GNU General Public License v3.0 (GPLv3)

---

_Made with ❤️ for 3D Artists_

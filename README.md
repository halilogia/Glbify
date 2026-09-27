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
| OBJ | GLB, USDZ, STL, OBJ | - |
| STL | GLB, USDZ, STL, OBJ | Binary + ASCII |
| USD / USDZ | GLB, USDZ, STL, OBJ | - |

### 🗜️ DRACO Sıkıştırma

- `KHR_draco_mesh_compression` uzantısı ile GLB çıktısı
- Üç kalite seviyesi (yüksek / dengeli / maksimum sıkıştırma)
- Encoder yalnızca ihtiyaç duyulduğunda yüklenir (tembel yükleme)
- Dışa aktarımda kazanılan yüzde arayüzde gösterilir

### 🍎 USDZ Desteği

- Apple AR Quick Look ve Quick Look görüntüleyicileri için USDZ paketleme
- Materyal ve doku gömülü, kamera açısına göre otomatik çerçeveleme

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
- Kurulabilir PWA (manifest + maskable ikonlar)
- Çevrimdışı/çevrimiçi rozeti ve güncelleme bildirimi
- Üçüncü parti CDN yok: tüm bağımlılıklar paketlenir

### 🎨 Arayüz

- Modern glassmorphism tasarım
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
```

Üretim çıktısı `dist/` klasörüne yazılır. GitHub Pages dağıtımı
`.github/workflows/deploy.yml` ile `main` dalından otomatik yapılır.

## 📦 Proje Yapısı

```text
Glbify/
├── index.html                # Uygulama kabuğu (yalnızca HTML iskeleti)
├── vite.config.js            # Vite + Tailwind + PWA yapılandırması
├── scripts/
│   ├── sync-decoders.mjs     # DRACO encoder dosyalarını public/ altına kopyalar
│   └── generate-icons.mjs    # PWA ikonlarını üretir
├── public/
│   ├── draco/                # Üretilen decoder/encoder dosyaları (gitignored)
│   ├── icons/                # PWA ikonları
│   └── favicon.png
├── src/
│   ├── main.js               # Uygulama denetleyicisi (GlbifyApp)
│   ├── config.js             # Sınırlar, DRACO seviyeleri, asset yolları
│   ├── core/
│   │   ├── viewer.js         # Sahne, kamera, ışık, render döngüsü
│   │   └── decoders.js       # DRACO / KTX2 / meshopt kayıtları
│   ├── io/
│   │   ├── importers.js      # FBX, GLTF, OBJ, STL, USD okuyucuları
│   │   ├── exporters.js      # GLB, USDZ, STL, OBJ yazıcıları
│   │   ├── dracoEncoder.js   # Tembel yüklenen Draco encoder + glTF-Transform
│   │   ├── materials.js      # Phong -> Standard materyal dönüşümü
│   │   ├── modelStats.js     # Mesh / vertex / üçgen istatistikleri
│   │   ├── fileReader.js     # Limit kontrollü, ilerlemeli dosya okuma
│   │   └── download.js       # Blob indirme yardımcısı
│   ├── ui/
│   │   ├── dropzone.js       # Sürükle-bırak ve dosya seçici
│   │   ├── exportPanel.js    # Ölçek, doku ve DRACO ayarları
│   │   ├── hud.js            # Başlık paneli, rozetler, ilerleme
│   │   └── toast.js          # Bildirimler
│   ├── pwa/serviceWorker.js  # SW kaydı ve çevrimdışı takibi
│   ├── utils/                # Biçimlendirme, DOM, ayarlar, GPU temizliği
│   ├── shims/node-builtins.js# glTF-Transform için node:* taklidi
│   └── styles/main.css       # Tailwind katmanları + bileşen stilleri
├── brain/                    # Proje dokümantasyonu
└── docs/                     # Ek dokümantasyon
```

## 🛠️ Teknolojiler

- **Three.js r186** - 3D grafik kütüphanesi
- **Vite 8** - Geliştirme sunucusu ve üretim derlemesi
- **Tailwind CSS 4** - Utility-first CSS
- **vite-plugin-pwa / Workbox** - Service worker ve manifest
- **glTF-Transform 4 + draco3dgltf** - DRACO sıkıştırma
- **FBXLoader, GLTFLoader, OBJLoader, STLLoader, USDLoader** - Okuyucular
- **GLTFExporter, USDZExporter, OBJExporter, STLExporter** - Yazıcılar

## 💡 Kullanım

1. **Model Yükle**: Dosyayı sürükle-bırak veya "Dosya Seç" butonunu kullan
2. **Önizle**: Model otomatik olarak sahneye yüklenir, istatistikler gösterilir
3. **Ayarla**: Hedef yazılıma göre ölçek, doku çözünürlüğü ve DRACO seviyesi
4. **Dışa Aktar**: GLB, USDZ, STL veya OBJ indir

> Not: `.gltf` dosyalarının dış kaynakları (`.bin`, dokular) tarayıcıdan okunamaz.
> Tek dosyalı `.glb` önerilir.

## 📄 Lisans

GNU General Public License v3.0 (GPLv3)

---

_Made with ❤️ for 3D Artists_

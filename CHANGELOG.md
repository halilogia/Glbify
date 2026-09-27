# Changelog

Tüm önemli değişiklikler bu dosyada belgelenir.

## [2.0.0] - 2026-09-27

### ✨ Eklenenler

- **DRACO sıkıştırma**: GLB çıktısında `KHR_draco_mesh_compression` uzantısı, üç kalite seviyesi
  ve encoder için tembel yükleme (glTF-Transform + draco3dgltf)
- **STL desteği**: okuma (binary + ASCII) ve binary STL dışa aktarım
- **USDZ desteği**: okuma (USD/USDZ) ve Apple AR Quick Look için USDZ dışa aktarım
- **OBJ okuma**: içe aktarma desteği
- **Doku çözünürlüğü seçeneği**: 2K / 4K / dokusuz
- **Büyük dosya limiti**: 128 MB - 2 GB arası ayarlanabilir limit, limit kontrolü, gerçek ilerleme çubuğu
  ve büyük dosya uyarıları
- **PWA**: manifest, maskable ikonlar, service worker ile çevrimdışı kullanım, güncelleme bildirimi,
  çevrimdışı rozeti
- **Model istatistikleri**: mesh, vertex ve üçgen sayıları; boyut/kemik/morph bilgisi
- **Toast bildirimleri** ve yükleme/ihraç ilerleme göstergeleri
- **GitHub Actions** ile GitHub Pages dağıtımı
- PWA ikon üretim betiği (`npm run icons`)

### 🔧 Düzeltmeler

- CDN bağımlılıkları kaldırıldı: three.js, Tailwind ve fontlar artık build ile paketleniyor
  (çevrimdışı kullanımda da çalışır)
- Header ve drop zone `pointer-events` kaybı nedeniyle tıklanamıyordu
- Gizli rozetler (`hidden` sınıfı) bileşen CSS'i tarafından eziliyordu
- Büyük dosya uyarısı bayt/MB birim hatası nedeniyle her dosyada tetikleniyordu
- Materyal dönüşümünde roughness/metalness, AO, alpha, displacement ve vertexColors korunuyor
- GPU kaynakları model değişiminde serbest bırakılıyor (dispose)
- Kamera çerçevelemesi küresel yarıçapa göre hesaplanıyor, near/far dinamik
- WebGL bağlam kaybı yakalanıp kullanıcıya bildiriliyor

### 📦 Değişiklikler

- Tek dosyalık monolit yerine modüler yapı: `src/core`, `src/io`, `src/ui`, `src/utils`, `src/pwa`
- Three.js r160 → r186 yükseltmesi
- Vite 8 + Tailwind CSS 4 build sistemi
- `npm install` sonrası `scripts/sync-decoders.mjs` ile decoder/encoder dosyaları hazırlanıyor
- Ayar seçenekleri (limit, ölçek, doku, DRACO) `localStorage` ile saklanıyor
- ROADMAP sıfırlandı: tamamlanan maddeler bu dosyaya taşındı, kalan plan v2.1/v2.2/v3.0 olarak
  yeniden yazıldı
- `GEMINI.md` yeni mimariye göre güncellendi

### ✅ Doğrulama

- Üretim derlemesi (`npm run build`) uyarısız tamamlanıyor: 3.39 MB önbellek, 30 precache girdisi
- Headless Chrome ile uçtan uca kontrol (26/26 geçti):
  - STL/OBJ yükleme ve istatistikler, GLB → DRACO çıktısı (`KHR_draco_mesh_compression` doğrulandı,
    test modelinde %38 küçülme), sıkıştırılmış GLB'nin yeniden yüklenmesi
  - USDZ (geçerli ZIP), binary STL, OBJ çıktılarının imza ve içerik kontrolü
  - Dosya limiti reddi, sıfırlama, çevrimdışı rozet, service worker ile çevrimdışı sayfa yükleme
  - Geliştirme ve üretim modunda konsol hatası yok

## [1.0.0] - 2025-12-19

### İlk Sürüm

- FBX, GLB, GLTF dosya yükleme desteği
- GLB export (texture gömülü)
- OBJ export (sadece geometri)
- Animasyon oynatma desteği
- Ölçekleme seçenekleri (1x, 100x, 0.01x)
- Modern glassmorphism UI tasarımı
- Sürükle-bırak dosya yükleme
- OrbitControls ile 3D gezinme
- FBX materyallerini Standard Material'a dönüştürme

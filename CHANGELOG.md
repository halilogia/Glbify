# Changelog

Tüm önemli değişiklikler bu dosyada belgelenir.

## [2.2.0] - 2026-09-27

### ✨ Eklenenler

**Optimizasyon**

- Mesh sadeleştirme (decimation) — meshopt simplifier, kaydırıcıyla hedef vertex oranı
- Vertex birleştirme (weld) + duplicate temizliği (dedup) + kullanılmayan accessor temizliği (prune)
- `EXT_meshopt_compression` çıktısı (meshoptimizer encoder, medium/high seviye)
- KTX2 / Basis Universal doku sıkıştırma (`KHR_texture_basisu`): ETC1S (küçük) ve UASTC (kaliteli)
- Export öncesi **boyut tahmini**: vertex/üçgen/doku sayılarından yaklaşık çıktı boyutu
- Geometri sıkıştırma seçenekleri DRACO ile birlikte alternatiftir (ikisi aynı anda çalışmaz)

**Büyük dosya performansı**

- STL / PLY / OBJ ayrıştırması **Web Worker**'a taşındı (192 MB üzeri ve MTL'li OBJ hariç)
- Yükleme ekranında **İptal** butonu (`AbortController` ile okuma ve işçi iptali)
- **Bellek koruması**: `performance.memory` / `navigator.deviceMemory` üzerinden yararlanılabilir
  yığın bütçesi hesaplanıyor; limiti aşan dosya okunmadan reddediliyor, %50 üzeri uyarı veriyor
- Parse sonrası istatistik ve sahne hazırlığı ilerleme çubuğuna bağlandı

**Test ve CI**

- Vitest birim testleri (39 test): format, istatistik, animatör, materyal, importer kaydı, tahmin,
  paylaşılabilir ayarlar
- Puppeteer uçtan uca test paketi depoya taşındı: `tests/e2e/app.spec.mjs` (26 kontrol)
- Test fixture'ları `tests/fixtures/` altında sürümlendi (küp STL/OBJ, PLY, 3MF, dokulu OBJ+MTL+PNG,
  animasyonlu GLB)
- GitHub Actions: birim testi → uçtan uca test → build → Pages dağıtımı ayrı iş adımları halinde
- `npm test`, `npm run test:watch`, `npm run test:e2e` betikleri

**PWA**

- Kurulum istemi (install prompt) butonu ve "kuruldu" bildirimi
- Sürüm geçmişi tutuluyor; güncelleme bildirimi `eski → yeni` sürümü gösteriyor
- Önbellek kullanımı `navigator.storage.estimate()` ile gösteriliyor, tek tıkla temizlenebiliyor
- Ayar linki paylaşımı: `?scale=100&draco=max&meshopt=1...` parametreleri okunur ve üretilir

### 🔧 Düzeltmeler

- **glTF-Transform `prune()` materyal dokularını siliyordu**: yalnızca materyal slotlarından
  referans veren dokular kaldırılıyordu. Temizlik artık ACCESSOR/MESH/NODE ile sınırlandırıldı
- Dokular KTX2'ye sıkıştırılmadan **önce** yeniden kodlanıyor (ters sırada "doku çözülemedi" hatası)
- Worker'a gönderilen arabellek kopyalanarak aktarılıyor; aksi halde hata durumunda ana iş parçacığı
  geri düşüşü bozuk (detached) tamponla çalışıyordu
- Worker'da indekslenmemiş geometri (STL) çökerdi: transfer listesi indeks dizisi olmadığında hata veriyordu
- `Animator.setSpeed(0)` değeri 1'e düşüyordu (`|| 1` kullanımı)
- `sanitizeBaseName('...')` geçersiz dosya adı üretiyordu
- `computeStats` iskelet'siz `SkinnedMesh` içeren modellerde çöküyordu
- `src/config.js` modül yüklenirken `document` erişimi yapıyordu; Node testlerini engelliyordu
  (asset yolları artık tembel çözülüyor)

### 📦 Değişiklikler

- Yeni bağımlılıklar: `meshoptimizer`, `ktx2-encoder` (Basis WASM), `vitest`, `puppeteer`
- Üretim önbelleği 4.1 MB; 3.2 MB'lık Basis encoder önbellekten çıkarılıp ilk kullanımda
  runtime cache'e alınıyor
- Optimizasyon seçenekleri gelişmiş ayarlar bölümüne taşındı (birim, doku, DRACO, meshopt, sadeleştirme, KTX2)

### ⏸️ Ertelenenler

- **Doku atlaslama** — three.js ve glTF-Transform'da UV paketleyici yok; ayrı araştırma gerekiyor.
  v3.0 "Değerlendirme" başlığında.
- **Web Worker kapsamı** — FBX/GLTF/USD dokuları worker'da yüklenemiyor (worker'da `Image` yok);
  bu formatlar ana iş parçacığında kalıyor.

### 🧪 Doğrulama

- Vitest: 39/39 birim testi geçti
- Puppeteer e2e: üretim modunda 26/26, geliştirme modunda 25/25 (SW kaydı dev modunda bekleniyor)
- Kapsanan akışlar: STL/PLY/3MF/OBJ+MTL yükleme, worker ayrıştırma, GLB+DRACO, USDZ, STL/OBJ çıktı,
  JPEG dönüşümü, normal haritası üretimi, EXT_meshopt_compression, KHR_texture_basisu, animasyon
  oynatma, gizmo + birim ölçeği, ayar linki, bellek koruması, çevrimdışı yükleme, konsol temizliği

## [2.1.0] - 2026-09-27

### ✨ Eklenenler

**Yeni format desteği**

- PLY okuma (ASCII + binary little endian)
- 3MF okuma (baskı kütüphaneleri)
- OBJ + MTL okuma: `.obj`, `.mtl` ve doku dosyaları birlikte bırakılabiliyor; doku referansları
  data URL ile eşleştiriliyor, renkler ve dokular materyale uygulanıyor
- Ayrı `.mtl` dosyası yüklenen OBJ modeline sonradan uygulanabiliyor
- Çoklu dosya sürükle-bırak (model + yardımcı dosyalar)

**Model düzenleme**

- `TransformControls` gizmo: hareket / döndür / ölçek modları, OrbitControls ile otomatik
  kilitleme
- Dönüşüm "Sıfırla" ve "Çerçevele" kısayolları (canvas çift tıklama da çerçeveler)
- Birim dönüşümü canlı önizleme: hedef yazılım seçilince sahne anında ölçekleniyor
- GLB çıktısında node dönüşümleri TRS olarak yazılıyor (`trs: true`)
- Gizmo dönüşümü birim ölçeği ile birleştiriliyor (kullanıcı ölçeği kaybolmuyor)

**Materyal ve doku işleme**

- Doku formatı dönüşümü: PNG / JPEG / WebP + kalite kaydırıcısı (glTF-Transform post-process)
- Normal map yönünü ters çevirme (OpenGL ↔ DirectX)
- Diffuse dokusundan Sobel tabanlı normal haritası üretme
- Normal/veri haritaları kayıpsız kalacak şekilde PNG olarak korunuyor
- Doku renk uzayı denetimi: renk haritaları sRGB, veri haritaları lineer olmalı; uyarılar
  başlık panelindeki "Doku denetimi" rozetiyle gösteriliyor
- FBX emissive / AO / roughness / metalness / alpha / displacement haritaları tam taşınıyor

**Animasyon kontrolü**

- Klip seçici, oynat / duraklat / durdur kontrolleri
- Timeline slider (kare bazlı ileri-geri), hız (0.25x - 2x) ve döngü ayarları
- Döngü kapalıyken klip sonunda otomatik durma
- USDZ "Quick Look uyumlu" modu (animasyon kare kare yazılır)
- USDZ çıktı doğrulaması: ZIP imzası, `.usda` kök dosyası, doku ve animasyon karesi sayımı

**Dokümantasyon**

- `ROADMAP.md` v2.1 bölümü tamamlandı; kalan iki kalem gerekçesiyle ertelendi
- README, ARCHITECTURE, KNOWLEDGE ve GEMINI yeni mimariye göre güncellendi

### 🔧 Düzeltmeler

- `OBJLoader` materyal kitaplığı artık `setMaterials()` ile veriliyor (`parse(text, materials)`
  imzası three r186'da kaldırılmış); MTL renk ve dokuları gerçekten uygulanıyor
- Uzun süredir tıklanamayan animasyon/panel düğmeleri: `#controls` artık akış içinde
  (`margin-top: auto`) değil mutlak konumlandırılıyordu ve yüksek başlık panelini örtüyordu
- İlerleme çubuğu STL/OBJ/USDZ çıktılarında %100'e ulaşmıyordu
- Boş (0 bayt) dosyalar "network error" yerine anlaşılır bir hata mesajı gösteriyor
- Dosya limiti/boş dosya hataları konsola hata olarak yazılmıyor (gürültü azaltıldı)
- Bildirimler panelin üzerine binmemesi için üst orta konuma taşındı
- Panel yüksekliği `max-height` + kaydırma ile sınırlandı; gelişmiş ayarlar katlanır duruma getirildi
- `.mtl` ve doku dosyaları "model" sanılıp çoklu dosya uyarısı tetiklemiyor

### 📦 Değişiklikler

- `src/io/drfacoEncoder.js` yerine `src/io/gltfPostprocess.js`: DRACO ve doku işlemleri tek
  bir geçişte toplandı, `ALL_EXTENSIONS` kaydı ile genişletme güvenliği artırıldı
- Yeni modüller: `core/transformController.js`, `core/animator.js`, `io/textureOps.js`,
  `io/gltfPostprocess.js`, `io/usdz.js`
- Ayar deposuna yeni anahtarlar: doku formatı, kalite, normal ters çevirme, normal üretimi,
  USDZ Quick Look
- Üretim önbelleği 3.65 MB (29 girdi); glTF-Transform yalnızca post-process gerektiğinde yükleniyor

### ⏸️ Ertelenenler

- **FBX yazma** — tarayıcıda çalışan bir FBX yazıcı yok; OBJ/STL/USDZ çıktıları tercih ediliyor.
  v3.0 "Format yazma" başlığına taşındı.
- **Doku atlaslama** — three.js ve glTF-Transform'da UV paketleyici bulunmuyor; ayrı bir
  araştırma gerektiriyor. v2.2 "Optimizasyon" başlığına taşındı.
- **USDZ Quick Look cihaz testi** — paket yapısı, kök dosya ve animasyon karesi sayımı otomatik
  doğrulanıyor; iOS/macOS cihazında açılış kontrolü elle yapılacak.

### 🗂️ ROADMAP Durumu

v2.1 bölümündeki tüm maddeler tamamlandı ve bu sürüm notuna taşındı. ROADMAP.md yalnızca
v2.2, v3.0 ve değerlendirme aşamasındaki açık işleri içerir.

### ✅ Doğrulama

- Headless Chrome ile uçtan uca kontrol: **41/41 geçti**
  - STL / OBJ / PLY / 3MF içe aktarma, OBJ+MTL+PNG çoklu dosya materyal eşlemesi
  - Animasyonlu GLB: klip paneli, oynat/durdur, süre okuma
  - Dönüştürme gizmo modu, sıfırlama, canlı birim ölçeği (100x)
  - GLB + DRACO, JPEG doku dönüşümü (`image/jpeg` doğrulandı), üretilen normal haritası
  - USDZ ZIP/animasyon doğrulaması, dosya limiti reddi, çevrimdışı sayfa yükleme
  - Geliştirme ve üretim modunda konsol hatası yok

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

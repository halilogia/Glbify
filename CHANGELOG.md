# Changelog

Tüm önemli değişiklikler bu dosyada belgelenir.

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

- **FBX yazma**: tarayıcıda çalışan bir FBX yazıcı yok; OBJ/STL/USDZ çıktıları tercih ediliyor
- **Doku atlaslama**: three.js ve glTF-Transform'da UV paketleyici bulunmuyor; ayrı bir
  araştırma gerektiriyor

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

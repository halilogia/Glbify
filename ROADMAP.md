# Roadmap 🗺️

Glbify için bundan sonra izlenecek yol. Tamamlanan işler [CHANGELOG.md](CHANGELOG.md) içinde kayıtlıdır;
bu dosya yalnızca **yapılacakları** içerir.

> Sürüm: v2.0.0 sonrası plan · Güncelleme: 2026-09-27

---

## 🎯 v2.1 — Dönüştürme Derinliği

### Format desteği

- [ ] PLY okuma (`PLYLoader`, binary + ASCII)
- [ ] OBJ + MTL okuma (materyal ve doku eşlemesiyle)
- [ ] 3MF okuma (baskı endüstrisi için)
- [ ] USDZ çıktısında Quick Look uyumluluk testi (iOS/macOS cihazlarda doğrulama)
- [ ] FBX yazma (üçüncü parti kütüphane gerektiriyor, araştırma aşamasında)

### Model düzenleme

- [ ] Görsel gizmo ile ölçek / rotasyon / öteleme
- [ ] Model dönüşüm matrisini GLB node TRS olarak yazma (`GLTFExporter` `trs` seçeneği)
- [ ] Modeli orijine resetleme ve çerçeveleme (frame) kısayolu
- [ ] Birim dönüşüm önizlemesi (ölçek seçilince sahnede canlı güncelleme)

### Materyal ve doku işleme

- [ ] Doku formatı dönüşümü (PNG ↔ JPEG ↔ WebP)
- [ ] Normal map doğrulama/ters çevirme (OpenGL ↔ DirectX)
- [ ] sRGB / lineer renk uzayı denetimi ve uyarısı
- [ ] Emissive / AO / roughness haritalarının FBX'ten tam taşınması
- [ ] Doku atlaslama (çoklu UV kümeli meshler için)

### Animasyon

- [ ] Play / Pause / Stop kontrolleri
- [ ] Timeline slider (kare bazlı ileri-geri)
- [ ] Çoklu animasyon varsa klip seçici
- [ ] Animasyon hızı ve döngü ayarları
- [ ] USDZ çıktısında animasyon kare bakımından doğrulama

---

## ⚡ v2.2 — Performans ve Kalite

### Optimizasyon

- [ ] Mesh optimizasyonu (decimation / simplify) — `@gltf-transform/functions`
- [ ] Vertex birleştirme (weld) ve duplicate temizliği (dedup)
- [ ] KTX2 / Basis Universal doku sıkıştırma (`KHR_texture_basisu`)
- [ ] `EXT_meshopt_compression` çıktı seçeneği
- [ ] Quantization preset'leri ve çıktı boyutu tahmini (export öncesi)

### Büyük dosya performansı

- [ ] Ayrıştırmayı Web Worker'a taşıma (FBX/OBJ/STL; doku taşıma gerekiyor)
- [ ] Streaming tabanlı yükleme ve iptal (cancel) desteği
- [ ] Bellek bütçesi takibi ve düşük bellek cihazlarda otomatik limit düşürme
- [ ] İlerleme raporunun parse aşamasına taşınması (üçgen sayısı bazlı)

### Test ve CI

- [ ] Vitest ile birim testleri (importers, exporters, material dönüşümü, istatistikler)
- [ ] Playwright ile uçtan uca testler (yükleme → dışa aktarma → DRACO doğrulama)
- [ ] GitHub Actions'da test + build + Pages dağıtımı tek akışta
- [ ] Sürüm bazlı smoke test: örnek modeller (küçük/orta/büyük) fixture klasörü

### PWA

- [ ] Kurulum istemi (install prompt) arayüzü
- [ ] "Yeni sürüm hazır" akışının iyileştirilmesi ve sürüm geçmişi
- [ ] Önbellek boyut yönetimi ve eski cache temizliği
- [ ] Paylaşılabilir ayar profilleri (URL parametresi ile ölçek/doku/DRACO)

---

## 🔮 v3.0 — Profesyonel Araç

### Yeni motor

- [ ] WebGPU renderer geçişi (`WebGPURenderer`, KTX2 `detectSupportAsync`)
- [ ] WebGL geri düşüşü ve otomatik seçim
- [ ] WebXR / AR önizleme (USDZ + GLB)

### Düzenleme ve düzen

- [ ] Materyal editörü (PBR parametreleri, doku atama)
- [ ] Işık ve environment ayarları, HDR environment yükleme
- [ ] Model düzenleme geçmişi (undo/redo)

### Toplu işleme

- [ ] Çoklu dosya yükleme ve sıralı dönüştürme
- [ ] ZIP içinden model yükleme
- [ ] Preset kaydetme / yükleme (ölçek, doku, DRACO, format)
- [ ] Komut satırı arayüzü: `@glbify/cli` (Node + headless three.js)

### Entegrasyon

- [ ] Sketchfab / Google Drive / Dropbox bağlantısı
- [ ] Paylaşılabilir link ile model önizleme (salt görüntüleme modu)
- [ ] Çevrimiçi çok dilli arayüz (TR/EN), i18n altyapısı

---

## 💡 Değerlendirme Aşamasında

- [ ] GPU tabanlı decimation (compute shader)
- [ ] Model düzenleme için geri al / yinele altyapısı
- [ ] Otomatik ölçek tahmini (birim algılama: mm/cm/m)
- [ ] Kompresyon profili paylaşımı (uygulama içi link)
- [ ] Vite dışı dağıtım seçenekleri (Electron / Tauri masaüstü paketi)

---

## 📌 Öncelik Notları

1. **FBX yazma** ve **bulut entegrasyonu** yüksek geliştirme maliyeti taşır; çekirdek dönüştürme
   deneyimi tamamlanana kadar erteleniyor.
2. **Web Worker** yaklaşımı doku taşıma maliyeti nedeniyle ayrı bir araştırma gerektiriyor;
   önce ölçüm yapılacak.
3. Her sürüm `CHANGELOG.md` ve `README.md` güncellenerek taglenir.

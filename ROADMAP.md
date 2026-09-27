# Roadmap 🗺️

Glbify için bundan sonra izlenecek yol. Bu dosya **yalnızca yapılacakları** içerir; tamamlanan
işler [CHANGELOG.md](CHANGELOG.md) dosyasında kayıtlıdır.

> Sürüm: v2.1.0 sonrası plan · Güncelleme: 2026-09-27

---

## 🎯 v2.2 — Performans ve Kalite

### Optimizasyon

- [ ] Mesh optimizasyonu (decimation / simplify) — `@gltf-transform/functions`
- [ ] Vertex birleştirme (weld) ve duplicate temizliği (dedup)
- [ ] KTX2 / Basis Universal doku sıkıştırma (`KHR_texture_basisu`)
- [ ] `EXT_meshopt_compression` çıktı seçeneği
- [ ] Quantization preset'leri ve export öncesi çıktı boyutu tahmini
- [ ] Doku atlaslama — UV packer yok, kütüphane araştırması gerekiyor

### Büyük dosya performansı

- [ ] Ayrıştırmayı Web Worker'a taşıma (FBX/OBJ/STL; doku taşıma maliyeti ölçülmeli)
- [ ] Streaming tabanlı yükleme ve iptal (cancel) desteği
- [ ] Bellek bütçesi takibi ve düşük bellek cihazlarda otomatik limit düşürme
- [ ] İlerleme raporunun parse aşamasına taşınması (üçgen sayısı bazlı)

### Test ve CI

- [ ] Vitest ile birim testleri (importers, exporters, material dönüşümü, istatistikler)
- [ ] Playwright ile uçtan uca testler
- [ ] Headless Chrome kontrol betiğini depoya taşırma (`tests/`) — şu an geçici olarak elle çalıştırılıyor
- [ ] GitHub Actions'da test + build + Pages dağıtımı tek akışta
- [ ] Fixture klasörü: küçük/orta/büyük örnek modeller (FBX, animasyonlu GLB, dokulu OBJ)

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
- [ ] Kamera ve animasyon kısayolları (kare atlama, döngü bölgesi)

### Toplu işleme

- [ ] Sıralı çoklu model dönüştürme (klasör sürükle-bırak)
- [ ] ZIP içinden model yükleme
- [ ] Preset kaydetme / yükleme (ölçek, doku, DRACO, format)
- [ ] Komut satırı arayüzü: `@glbify/cli` (Node + headless three.js)

### Format yazma

- [ ] FBX yazma — tarayıcıda FBX yazıcı yok, üçüncü parti WASM kütüphane araştırması
- [ ] USD (USDA/USDC) yazma

### Entegrasyon

- [ ] Sketchfab / Google Drive / Dropbox bağlantısı
- [ ] Paylaşılabilir link ile model önizleme (salt görüntüleme modu)
- [ ] Çevrimiçi çok dilli arayüz (TR/EN), i18n altyapısı

---

## 💡 Değerlendirme Aşamasında

- [ ] GPU tabanlı decimation (compute shader)
- [ ] Otomatik ölçek tahmini (birim algılama: mm/cm/m)
- [ ] Kompresyon profili paylaşımı (uygulama içi link)
- [ ] Vite dışı dağıtım seçenekleri (Electron / Tauri masaüstü paketi)

---

## 📌 Öncelik Notları

1. **Test altyapısı** (Vitest + Playwright) v2.2'nin ilk işi: doğrulama şu an depoda olmayan,
   elle kurulan headless Chrome betiğiyle yapılıyor.
2. **Web Worker** yaklaşımı doku taşıma maliyeti nedeniyle ayrı bir araştırma gerektiriyor;
   önce ölçüm yapılacak.
3. **USDZ Quick Look** cihaz üzerindeki (iOS/macOS) son kontrol adımı elle yapılmalı; paketin
   yapısal doğrulaması otomatik.
4. Her sürüm `CHANGELOG.md` ve `README.md` güncellenerek taglenir.

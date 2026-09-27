# Roadmap 🗺️

Glbify için bundan sonra izlenecek yol. Bu dosya **yalnızca yapılacakları** içerir; tamamlanan
işler [CHANGELOG.md](CHANGELOG.md) dosyasında kayıtlıdır.

> Sürüm: v3.0.0 sonrası plan · Güncelleme: 2026-09-27

## ✅ Tamamlanan: v3.0 — Profesyonel Araç

WebGL2/WebGPU renderer seçimi (otomatik fallback), WebXR/AR önizleme, materyal editörü, sahne
ayarları, undo/redo geçmişi, kare atlama kısayolları, salt görüntüleme modu ve `@glbify/cli`
paketi tamamlandı (bkz. CHANGELOG 3.0.0).

Ertelenenler: FBX/USD yazma (üçüncü parti WASM gerekli), bulut entegrasyonları (OAuth + sunucu),
GPU decimation, Electron/Tauri, worker'da doku çözme, TR/EN i18n arayüzü.

---

## 🎯 v3.1 — Dönüştürme Derinliği (v2.3'ten taşınan işler)

### Toplu işleme

- [ ] Sıralı çoklu model dönüştürme (klasör sürükle-bırak, kuyruk göstergesi)
- [ ] ZIP içinden model yükleme
- [ ] Preset kaydetme / yükleme (ölçek, doku, DRACO, format, sadeleştirme)
- [ ] Çoklu modeli tek GLB'de birleştirme (scene merge)

### Doku ve materyal

- [ ] Doku atlaslama (UV packer araştırması)
- [ ] Doku atlası çözünürlük ve padding ayarları
- [ ] Normal map yönü otomatik tespiti (dosya adı + normalizasyon analizi)
- [ ] KTX2 kalite seviyesi seçimi (ETC1S/UASTC, etiket kalitesi)
- [ ] Materyal editörü: doku dosyası içe aktarma (drop → slot'a ata)

### Analiz

- [ ] Model istatistik panelinin genişletilmesi (malzeme sayısı, doku sayısı, LOD sayısı)
- [ ] Geometri sağlık kontrolü (degenerate triangle, eksik UV, fazla draw call)
- [ ] Otomatik ölçek tahmini (birim algılama: mm/cm/m)
- [ ] WebGPU performans karşılaştırması (ölçüm panosu)

---

## 🔮 v3.2 — Platform

- [ ] TR/EN i18n arayüzü (statik metin geçişi + `data-i18n`)
- [ ] Web Worker'da doku çözme (OffscreenCanvas + worker `ImageLoader`)
- [ ] GPU tabanlı decimation (compute shader)
- [ ] Kompresyon profili paylaşımı (uygulama içi link)
- [ ] Vite dışı dağıtım seçenekleri (Electron / Tauri masaüstü paketi)
- [ ] Sunucu tarafı gerektiren seçenekler (Sketchfab / Drive / Dropbox, OAuth) — kapsam
  kararı gerekiyor

---

## 📌 Öncelik Notları

1. **Web Worker** kapsamı şu an STL/PLY/OBJ ile sınırlı; FBX/GLTF/USD için worker'da doku çözme gerekiyor.
2. **USDZ Quick Look** cihaz üzerindeki (iOS/macOS) son kontrol adımı elle yapılmalı; paketin yapısal doğrulaması otomatik.
3. **WebGPU** bu ortamda adaptör olmadığı için yalnızca fallback doğrulandı; gerçek cihazda ölçüm yapılmalı.
4. Her sürüm `CHANGELOG.md` ve `README.md` güncellenerek taglenir.

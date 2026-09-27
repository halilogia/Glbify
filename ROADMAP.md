# Roadmap 🗺️

Glbify için bundan sonra izlenecek yol. Bu dosya **yalnızca yapılacakları** içerir; tamamlanan
işler [CHANGELOG.md](CHANGELOG.md) dosyasında kayıtlıdır.

> Sürüm: v2.2.0 sonrası plan · Güncelleme: 2026-09-27

## ✅ Tamamlanan: v2.2 — Performans ve Kalite

Bölümün tamamı tamamlandı (bkz. CHANGELOG 2.2.0): mesh sadeleştirme, weld/dedup/prune,
`EXT_meshopt_compression`, KTX2/Basis, boyut tahmini, Web Worker ayrıştırma, iptal butonu, bellek
koruması, Vitest + Puppeteer testleri ve CI, kurulum istemi, sürüm geçmişi, önbellek yönetimi ve
paylaşılabilir ayar linkleri.

Ertelenenler: doku atlaslama (UV packer yok), worker kapsamının FBX/GLTF/USD'e genişletilmesi
(worker'da `Image` erişimi yok).

---

## 🎯 v2.3 — Genişletilmiş Dönüştürme

### Toplu işleme

- [ ] Sıralı çoklu model dönüştürme (klasör sürükle-bırak, kuyruk göstergesi)
- [ ] ZIP içinden model yükleme
- [ ] Preset kaydetme / yükleme (ölçek, doku, DRACO, format, sadeleştirme)
- [ ] Çoklu modeli tek GLB'de birleştirme (scene merge)

### Doku ve materyal

- [ ] Doku atlaslama (UV packer araştırması) — v2.2'den ertelendi
- [ ] Doku atlası çözünürlük ve padding ayarları
- [ ] Normal map yönü otomatik tespiti (dosya adı + normalizasyon analizi)
- [ ] KTX2 kalite seviyesi seçimi (ETC1S/UASTC, etiket kalitesi)

### Analiz

- [ ] Model istatistik panelinin genişletilmesi (malzeme sayısı, doku sayısı, LOD sayısı)
- [ ] Geometri sağlık kontrolü (degenerate triangle, eksik UV, fazla draw call)
- [ ] Otomatik ölçek tahmini (birim algılama: mm/cm/m)

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
- [ ] Kompresyon profili paylaşımı (uygulama içi link)
- [ ] Vite dışı dağıtım seçenekleri (Electron / Tauri masaüstü paketi)
- [ ] Web Worker'da doku çözme (OffscreenCanvas + worker `ImageLoader`)

---

## 📌 Öncelik Notları

1. **Web Worker** kapsamı şu an STL/PLY/OBJ ile sınırlı; FBX/GLTF/USD için worker'da doku çözme
   gerekiyor (OffscreenCanvas).
2. **USDZ Quick Look** cihaz üzerindeki (iOS/macOS) son kontrol adımı elle yapılmalı; paketin
   yapısal doğrulaması otomatik.
3. Her sürüm `CHANGELOG.md` ve `README.md` güncellenerek taglenir.

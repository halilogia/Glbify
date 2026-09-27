# Roadmap 🗺️

Glbify için bundan sonra izlenecek yol. Bu dosya **yalnızca yapılacakları** içerir; tamamlanan
işler [CHANGELOG.md](CHANGELOG.md) dosyasında kayıtlıdır.

> Sürüm: v3.2.0 sonrası plan · Güncelleme: 2026-09-27

## ✅ Tamamlanan: v3.2 — Platform

TR/EN i18n arayüzü, worker'da doku çözme (OBJ+MTL, ImageBitmap transferi), sıkıştırma profili
paylaşımı ve Electron masaüstü paketi tamamlandı (bkz. CHANGELOG 3.2.0).

Kapsam dışı bırakılanlar: GPU tabanlı decimation (meshoptimizer QEM'in WGSL karşılığı yok, tam bir
GPU kenar çökme hattı ve kalite doğrulaması gerektiriyor) ve bulut entegrasyonları (OAuth + sunucu
tarafı gerektiriyor; çevrimdışı ve istemci tarafı vaadiyle bağdaşmıyor).

---

## 🎯 v3.3 — Dönüştürme Derinliği (v3.1'den taşınan işler)

### Toplu işleme

- [ ] Sıralı çoklu model dönüştürme (klasör sürükle-bırak, kuyruk göstergesi)
- [ ] ZIP içinden model yükleme
- [ ] Preset kaydetme / yükleme (dosya tabanlı; profil kodu paylaşımı tamamlandı)
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
- [ ] GPU decimation araştırması: WGSL edge-collapse prototipi (v3.4 kararı için)

---

## 🔮 v3.4 — Platform

- [ ] Web Worker'da FBX/GLTF/USD doku çözme (OffscreenCanvas + worker GLTFLoader)
- [ ] WebXR oturumunda model düzenleme (gizmo + AR)
- [ ] Kompresyon profili paylaşımında sunucu yok: kod + görsel/QR aktarımı
- [ ] Vite dışı dağıtım: Tauri alternatifi ve imzalı paketler (CI)
- [ ] Erişilebilirlik: klavye odağı sırası, ARIA etiketleri, kontrast denetimi

---

## 📌 Öncelik Notları

1. **Web Worker** kapsamı STL/PLY/OBJ ile sınırlı; FBX/GLTF/USD için worker'da doku çözme gerekiyor.
2. **USDZ Quick Look** cihaz üzerindeki (iOS/macOS) son kontrol adımı elle yapılmalı; paketin yapısal doğrulaması otomatik.
3. **WebGPU** bu ortamda adaptör olmadığı için yalnızca fallback doğrulandı; gerçek cihazda ölçüm yapılmalı.
4. Her sürüm `CHANGELOG.md` ve `README.md` güncellenerek taglenir.

# Roadmap 🗺️

Glbify için bundan sonra izlenecek yol. Tamamlanan işler [CHANGELOG.md](CHANGELOG.md) içinde kayıtlıdır;
bu dosya yalnızca **yapılacakları** içerir.

> Sürüm: v2.1.0 sonrası plan · Güncelleme: 2026-09-27

## ✅ Tamamlanan: v2.1 — Dönüştürme Derinliği

Bölümün tamamı tamamlandı (bkz. CHANGELOG 2.1.0). İki kalem gerekçesiyle ertelendi:

- **FBX yazma** — tarayıcıda çalışan FBX yazıcı yok; OBJ/STL/USDZ çıktıları tercih ediliyor
- **Doku atlaslama** — three.js ve glTF-Transform'da UV paketleyici yok, ayrı araştırma gerekli

USDZ Quick Look doğrulamasının cihaz üzerindeki (iOS/macOS) son adımı elle yapılacak;
otomatik kısmı ZIP/`.usda`/doku/kare denetimiyle tamamlandı.

---

## 🎯 v2.2 — Performans ve Kalite

### Optimizasyon

- [ ] Mesh optimizasyonu (decimation / simplify) — `@gltf-transform/functions`
- [ ] Vertex birleştirme (weld) ve duplicate temizliği (dedup)
- [ ] KTX2 / Basis Universal doku sıkıştırma (`KHR_texture_basisu`)
- [ ] `EXT_meshopt_compression` çıktı seçeneği
- [ ] Quantization preset'leri ve çıktı boyutu tahmini (export öncesi)
- [ ] Doku atlaslama (UV packer araştırması)

### Büyük dosya performansı

- [ ] Ayrıştırmayı Web Worker'a taşıma (FBX/OBJ/STL; doku taşıma gerekiyor)
- [ ] Streaming tabanlı yükleme ve iptal (cancel) desteği
- [ ] Bellek bütçesi takibi ve düşük bellek cihazlarda otomatik limit düşürme
- [ ] İlerleme raporunun parse aşamasına taşınması (üçgen sayısı bazlı)

### Test ve CI

- [ ] Vitest ile birim testleri (importers, exporters, material dönüşümü, istatistikler)
- [ ] Playwright ile uçtan uca testler
- [ ] Mevcut headless Chrome kontrol betiğini depoya taşı (`tests/` klasörü) ve CI'a bağla
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
- [ ] Gezinme/animasyon için kamera kısayolları (kare atla, döngü bölgesi)

### Toplu işleme

- [ ] Sıralı çoklu model dönüştürme (klasör sürükle-bırak)
- [ ] ZIP içinden model yükleme
- [ ] Preset kaydetme / yükleme (ölçek, doku, DRACO, format)
- [ ] Komut satırı arayüzü: `@glbify/cli` (Node + headless three.js)

### Entegrasyon

- [ ] Sketchfab / Google Drive / Dropbox bağlantısı
- [ ] Paylaşılabilir link ile model önizleme (salt görüntüleme modu)
- [ ] Çevrimiçi çok dilli arayüz (TR/EN), i18n altyapısı
- [ ] FBX yazma (üçüncü parti WASM kütüphane araştırması)

---

## 💡 Değerlendirme Aşamasında

- [ ] GPU tabanlı decimation (compute shader)
- [ ] Otomatik ölçek tahmini (birim algılama: mm/cm/m)
- [ ] Kompresyon profili paylaşımı (uygulama içi link)
- [ ] Vite dışı dağıtım seçenekleri (Electron / Tauri masaüstü paketi)

---

## 📌 Öncelik Notları

1. **Web Worker** yaklaşımı doku taşıma maliyeti nedeniyle ayrı bir araştırma gerektiriyor;
   önce ölçüm yapılacak.
2. **Test altyapısı** (Vitest + Playwright) v2.2'nin ilk işi: şu an doğrulama elle kurulan
   headless Chrome betiğiyle yapılıyor ve depoda tutulmuyor.
3. Her sürüm `CHANGELOG.md` ve `README.md` güncellenerek taglenir.

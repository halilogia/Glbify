# Glbify - Gemini CLI Kuralları

## 📁 Proje Yapısı

```
Glbify/
├── index.html          ← Tüm uygulama (single-file app)
├── brain/              ← AI yardımcı dosyaları
│   ├── task.md         ← Görev takibi
│   ├── implementation_plan.md
│   ├── walkthrough.md
│   └── chat-history/   ← Konuşma özetleri
├── docs/               ← Ek dokümantasyon
└── README.md, ROADMAP.md, CHANGELOG.md
```

## 🔧 Proje Kuralları

### Teknoloji Stack

- **Three.js** (v0.160.0) - CDN'den yüklenir
- **TailwindCSS** - CDN'den yüklenir
- **Vanilla JavaScript** - ES6 modülleri
- **Single HTML File** - Tüm kod `index.html` içinde

### Kod Stili

1. **ES6+ Syntax**: Arrow functions, template literals, destructuring kullan
2. **Modüler Import**: Three.js addons için import map kullan
3. **Responsive Design**: TailwindCSS responsive prefix'leri kullan
4. **Turkish Comments**: Yorumlar Türkçe olabilir

### Önemli Notlar

1. `index.html` tek dosyalık bir uygulamadır - CSS, HTML ve JS birlikte
2. CDN bağımlılıkları internet gerektirir
3. Materyal dönüştürme kritiktir - FBX texture'ları için `ensureStandardMaterial()` şart
4. Export işlemlerinde ölçekleme geri alınmalı (`applyScale(1)`)

## 🆕 Yeni Özellik Ekleme

### UI Bileşeni Eklemek

1. HTML'i `<div id="ui-layer">` içine ekle
2. CSS'i `<style>` bloğuna ekle
3. JavaScript'i `<script type="module">` içine ekle

### Yeni Loader Eklemek

1. Import map'e ekle (gerekirse)
2. Import statement ekle
3. `loadFile()` fonksiyonuna case ekle

### Yeni Exporter Eklemek

1. Three.js exporter'ı import et
2. Export butonunu HTML'e ekle
3. Click handler ekle (scale uygula → export → scale geri al)

## 📝 Commit Mesaj Formatı

```
[type]: kısa açıklama

Tip:
- feat: yeni özellik
- fix: bug düzeltme
- docs: dokümantasyon
- style: UI/CSS değişikliği
- refactor: kod yeniden düzenleme
```

## 🧪 Test Etme

1. Farklı FBX dosyaları ile test et
2. GLB/GLTF dosyaları ile test et
3. Animasyonlu modeller ile test et
4. Export edilen dosyaları hedef yazılımda aç

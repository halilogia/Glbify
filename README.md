# Glbify 📦

Tarayıcı tabanlı 3D model dönüştürücü ve görüntüleyici. FBX, GLB ve GLTF dosyalarınızı kolayca dönüştürün ve önizleyin.

![Three.js](https://img.shields.io/badge/Three.js-0.160.0-black?logo=three.js)
![HTML5](https://img.shields.io/badge/HTML5-orange?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)

## 🌟 Özellikler

### 🔄 3D Format Dönüştürme

- FBX → GLB dönüştürme (texture gömülü)
- FBX → OBJ dönüştürme (geometri)
- GLB/GLTF dosya görüntüleme

### 🎬 Animasyon Desteği

- FBX animasyonlarını otomatik oynatma
- GLB/GLTF animasyon desteği

### ⚙️ Ölçekleme Seçenekleri

- Blender / Unity / Godot (Metre - 1x)
- 3ds Max / Unreal Engine (Santimetre - 100x)
- Özel ölçekleme (0.01x)

### 🎨 Profesyonel UI

- Modern glassmorphism tasarım
- Sürükle-bırak dosya yükleme
- Gerçek zamanlı 3D önizleme
- OrbitControls ile etkileşimli kamera

## 🚀 Kurulum

Bu proje statik bir HTML dosyasıdır. Herhangi bir sunucuda veya doğrudan tarayıcıda çalıştırabilirsiniz.

### Yerel Kullanım

```bash
# Projeyi klonla
git clone https://github.com/halilogia/Glbify.git
cd Glbify

# Basit bir HTTP sunucu başlat (Python)
python -m http.server 8000

# veya Node.js ile
npx serve .
```

### Doğrudan Kullanım

`index.html` dosyasını tarayıcınızda açın.

## 📦 Proje Yapısı

```
Glbify/
├── index.html          ← Ana uygulama (tüm kod burada)
├── brain/              ← Proje dokümantasyonu
│   ├── task.md
│   ├── implementation_plan.md
│   └── walkthrough.md
├── docs/               ← Ek dökümantasyon
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
└── GEMINI.md
```

## 🛠️ Teknolojiler

- **Three.js** - 3D grafik kütüphanesi
- **TailwindCSS** - Utility-first CSS framework
- **FBXLoader** - FBX dosya okuyucu
- **GLTFLoader** - GLB/GLTF dosya okuyucu
- **GLTFExporter** - GLB dosya oluşturucu
- **OBJExporter** - OBJ dosya oluşturucu

## 💡 Kullanım

1. **Model Yükle**: Dosyayı sürükle-bırak veya "Dosya Seç" butonunu kullan
2. **Önizle**: Model otomatik olarak 3D sahneye yüklenir
3. **Ölçek Seç**: Hedef yazılıma göre ölçek faktörü seç
4. **Dışa Aktar**: GLB veya OBJ formatında indir

## 📄 Lisans

MIT License

---

_Made with ❤️ for 3D Artists_

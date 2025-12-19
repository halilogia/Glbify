# Uygulama Planı

## Mevcut Durum

Glbify, tarayıcı tabanlı çalışan bir 3D model dönüştürücü ve görüntüleyicidir. Temel özellikler tamamlanmış durumda.

## Hedefler

1. Daha fazla 3D format desteği (STL, PLY, USDZ)
2. Gelişmiş texture işleme
3. Animasyon kontrolleri
4. Batch işleme kapasitesi

## Teknik Kararlar

| Karar           | Seçim       | Gerekçe                           |
| --------------- | ----------- | --------------------------------- |
| 3D Engine       | Three.js    | Yaygın kullanım, geniş community  |
| UI Framework    | TailwindCSS | Hızlı prototipleme, utility-first |
| File Processing | Client-side | Sunucu gerektirmez, gizlilik      |
| Export Format   | GLB         | Binary, texture gömülü, kompakt   |

## Mimari

```
┌─────────────────────────────────────────────────┐
│                  UI Layer                       │
│  (Drop Zone, Controls, File Info, Export BTN)   │
├─────────────────────────────────────────────────┤
│               Three.js Scene                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Camera  │  │ Lights  │  │ Model   │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│  ┌─────────────────────────────────────┐       │
│  │         OrbitControls               │       │
│  └─────────────────────────────────────┘       │
├─────────────────────────────────────────────────┤
│              File Processing                    │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐       │
│  │FBXLoader│  │GLTFLoader│  │ Exporter │       │
│  └─────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────┘
```

## Sonraki Adımlar

1. Progress bar ekleme
2. Model istatistikleri paneli
3. Texture sıkıştırma seçenekleri
4. Animasyon timeline kontrolleri

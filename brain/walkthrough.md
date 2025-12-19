# Walkthrough

## Proje Kurulumu

1. Repository'yi klonlayın
2. `index.html` dosyasını bir HTTP sunucusu ile açın
3. Tarayıcıda `localhost:8000` adresine gidin

## Önemli Dosyalar

- `index.html` - Tüm uygulama kodu (HTML, CSS, JavaScript)
  - **Satır 1-168**: HTML yapısı ve CSS stilleri
  - **Satır 170-320**: UI bileşenleri (header, drop zone, controls)
  - **Satır 322-586**: JavaScript modülü (Three.js, loaders, exporters)

## Temel Akış

```
1. Kullanıcı dosya yükler (drag-drop veya buton)
        ↓
2. FileReader ile ArrayBuffer'a okunur
        ↓
3. Uzantıya göre uygun loader seçilir (FBX/GLTF)
        ↓
4. Model parse edilir ve sahneye eklenir
        ↓
5. Materyaller StandardMaterial'a dönüştürülür
        ↓
6. Kamera modele odaklanır (auto-framing)
        ↓
7. Animasyonlar varsa oynatılır
        ↓
8. Kullanıcı export butonlarına tıklayabilir
```

## Kritik Fonksiyonlar

### `loadFile(file)`

Dosya yükleme işlemini başlatır, uzantıyı kontrol eder.

### `ensureStandardMaterial(object)`

FBX materyallerini (Phong) GLB uyumlu (Standard) hale getirir.

### `onSuccess(object)`

Model yüklendikten sonra sahneye ekleme, framing ve animasyon kurulumu.

### `getScaleFactor()` / `applyScale(scale)`

Export öncesi ölçekleme işlemleri.

## Notlar

- Three.js CDN'den yüklenir (v0.160.0)
- DRACO ve KTX2 loader'lar opsiyonel sıkıştırma için hazır
- Tüm texture'lar binary GLB içine gömülür
- OBJ export'unda texture bilgisi kaybedilir

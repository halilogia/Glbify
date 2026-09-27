# Glbify Desktop (Electron)

Tarayıcı sürümünün masaüstü paketi. Uygulama kodu aynıdır: Electron, üretim derlemesini
(`dist/`) `file://` üzerinden yükleyen ince bir kabuktur.

## Gereksinimler

- Node.js 20+
- Uygulamanın derlenmiş olması: kökte `npm run build`

## Çalıştırma

```bash
npm install                 # kökte (workspaces)
npm run glbify:desktop      # electron .
```

`dist/index.html` bulunamazsa pencere derleme yapılmadığını söyleyen bir hata gösterir.

## Paketleme

Yayınlama için `electron-builder` önerilir:

```bash
npm i -D electron electron-builder
npx electron-builder --dir          # klasör olarak çıktı
npx electron-builder                # dmg / nsis / AppImage
```

Bu depoda `electron` bir bağımlılık olarak tutulmuyor: paket boyutu ~150 MB ve kurulum gerektirir.
Kendi makinenizde `--dir` ile doğrulayıp CI'da imzalama yapabilirsiniz.

## Notlar

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` — uygulama tarayıcı
  güvenlik modeliyle aynı ayarları kullanır.
- Pencere dışı bağlantılar varsayılan tarayıcıda açılır.
- Service worker `file://` üzerinde çalışmaz; çevrimdışı önbellek masaüstünde devre dışıdır
  (PWA davranışı yalnızca web sürümündedir).
- `preload.cjs` yalnızca sürüm bilgisini paylaşır (`window.glbifyDesktop`).

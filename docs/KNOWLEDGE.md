# 🧠 Knowledge Base - Glbify

## 🌐 3D Formats & Conversion Rules

- **FBX (Filmbox)**: Binary/ASCII proprietary Autodesk format. Textures must be read from embedded materials or relative textures folder.
- **GLB (glTF 2.0 Binary)**: Self-contained 3D asset container with JSON chunk and binary buffer chunk.
- **GLTF (JSON)**: External `.bin` and texture references cannot be resolved from a single local file in the
  browser. Recommend converting to GLB.
- **OBJ + MTL**: `MTLLoader.parse(text, '')` returns a `MaterialCreator`; texture URLs are resolved by
  concatenating `baseUrl + filename`, so dropped texture files are injected as **data URLs** by rewriting the
  MTL text. `MaterialCreator` must be handed to the OBJ parser with **`loader.setMaterials(library)`** — in
  r186 `OBJLoader.parse(text, materials)` no longer accepts a second argument.
- **STL**: ASCII (`solid ... endsolid`) or binary (80 byte header + uint32 face count + 50 bytes per face).
  No materials or textures. `STLLoader` treats data as binary unless the file starts with `solid`.
- **PLY**: ASCII or binary little endian, via `PLYLoader`.
- **3MF**: ZIP container, via `ThreeMFLoader` (import path contains a leading digit:
  `three/addons/loaders/3MFLoader.js`).
- **USDZ**: Uncompressed ZIP container of USDA + texture files, for Apple AR Quick Look.
  Read with `USDLoader` (`USDZLoader` is deprecated since r179).

### Coordinate Systems

- Three.js / glTF: Right-handed, Y-up.
- Unity: Left-handed, Y-up.
- Unreal Engine: Left-handed, Z-up (100x cm scale).
- Blender: Right-handed, Z-up (1x m scale).

## ⚙️ Three.js Export Options

```javascript
exporter.parseAsync(model, {
    binary: true,
    trs: true,
    embedImages: true,
    maxTextureSize: 4096,
    animations: model.animations,
    onlyVisible: true,
});
```

## 🗜️ DRACO Compression

- **Decode**: `DRACOLoader` from three.js. Since r186 the decoder files are resolved from the bundle itself
  (`new URL('../libs/draco/...', import.meta.url)`), so no `setDecoderPath` call is required and the WASM files
  are emitted as hashed assets by Vite.
- **Encode**: three.js `DRACOExporter` only encodes a single mesh and expects a global `DracoEncoderModule`.
  Glbify instead post-processes the exported GLB with glTF-Transform:
  `NodeIO → readBinary → transform(draco({...quantize bits})) → writeBinary`.
- The encoder (`draco3dgltf`, glTF build) is loaded as a classic script from `public/draco/draco_encoder.js`
  and its WASM binary is located with `locateFile`. Both are precached for offline use.
- `draco()` performs `weld()` internally and always triangulates, so non-indexed input is safe but larger.
- Quantization presets (POSITION, NORMAL, TEX_COORD): high 16/12/14, balanced 14/10/12, max 11/8/10.

## 🎨 Post-Processing Pipeline

`src/io/gltfPostprocess.js` runs only when a geometry or texture operation is requested, so the
gltf-Transform chunk stays lazy:

1. `NodeIO` with `ALL_EXTENSIONS` registered (reading third-party GLB extensions safely).
2. Geometry cleanup: `weld()` → `dedup()` → `prune({ propertyTypes: [ACCESSOR, MESH, NODE] })`.
   **Do not call bare `prune()`**: it removes textures that are only referenced from material
   slots, silently dropping base colour maps.
3. Decimation: `simplify({ simplifier: MeshoptSimplifier, ratio, error })` — the simplifier ships
   with three.js (`three/addons/libs/meshopt_simplifier.module.js`), the encoder does not, so
   `meshoptimizer` is a direct dependency.
4. Geometry compression: `draco()` **or** `meshopt({ encoder })` — they are alternatives.
5. Texture work (before KTX2, otherwise the KTX2 payload is not decodable):
   - `normal` + invert → green channel flipped, re-encoded as PNG.
   - colour roles (`baseColor`, `emissive`) + format option → re-encoded to PNG/JPEG/WebP.
   - data maps are never written as lossy formats; already-`image/ktx2` textures are skipped.
   - `generateNormals` → Sobel filter on the base colour image creates a new `Texture` and assigns
     it with `material.setNormalTexture()`.
6. `ktx2({ isUASTC, generateMipmap })` for Basis compression.
7. `io.writeBinary(document)`.

Alpha is part of the base colour texture in glTF 2.0; `Material` has no `getAlphaTexture()` in
gltf-Transform v4. The Basis encoder WASM (3.2 MB) is intentionally excluded from the Workbox
precache and cached on first use instead.

## ⚙️ Worker Parsing

- `src/io/parseWorker.js` imports three itself (module worker) and serialises geometry as
  transferable typed arrays.
- The buffer is **copied** (`buffer.slice(0)`) before `postMessage` so the main thread keeps an
  intact copy for the fallback path; transferring the original would detach it.
- Transfer lists are built from the attributes that actually exist — STL geometries have no index.
- Fallback to the main thread happens on any worker error, on `Worker`-less environments, for files
  above 192 MB, and for OBJ dropped together with an MTL (textures need `Image`, which workers lack).

## 🧱 Build Notes

- `vite-plugin-pwa` `includeAssets` and `globPatterns` must cover the decoder WASM files; the default 2 MB
  precache limit is raised to 12 MB.
- `base: './'` keeps the output portable for GitHub Pages project subpaths.
- `@gltf-transform/core` imports `node:fs` / `node:path` for its file-system helpers. Those code paths are not
  used in the browser, so `vite.config.js` aliases both to `src/shims/node-builtins.js` to keep the build clean.
- `src/config.js` must stay Node-importable (unit tests): asset URLs are resolved lazily through
  `assetUrl()` instead of touching `document.baseURI` at module scope.

## 🏎 Renderer Sıralaması

- `core/renderer.js` WebGL2'yi varsayılan yapar; WebGPU `three/webgpu`'dan **dinamik** import
  edilir (ayrı chunk, precache dışında).
- three'ın iki build'i (WebGL ve WebGPU) aynı uygulamada birlikte çalışabiliyor: renderer sahne
  grafiğini özellik bazlı (duck typed) tüketiyor. Yine de `PMREMGenerator` her zaman renderer ile
  **aynı build'den** alınmalı.
- `WebGPURenderer.init()` adaptör bulunamazsa hata vermez; `backend.isWebGPUBackend` kontrolüyle
  WebGL2'ye düşüp düşmediğimiz anlaşılır.
- `setAnimationLoop`, `setSize`, `outputColorSpace`, `toneMapping`, `xr` her iki build'de de var.

## 🧪 Testing

- `npm test` — Vitest, `tests/unit/**`, node environment (no DOM).
- `npm run test:cli` — `node:test`, `packages/cli/test/**`.
- `npm run test:e2e` — Puppeteer against `npm run preview`; `GLBY_BASE_URL` overrides the address.
  Dev-mode runs skip the service worker and offline assertions.
- Fixtures live in `tests/fixtures/` and are committed; the `.gitignore` model extensions are
  negated for that directory.
- `packages/cli` needs DOM shims (`FileReader`, `createImageBitmap`) because three's exporters assume
  a browser; see `packages/cli/src/domShim.js`. `GLTFLoader`/`STLLoader` need a real `ArrayBuffer`
  (not a `Uint8Array` view).

## ✏️ Model Transform Model

- `TransformControls` manipulates a **proxy** `Object3D`, never the loaded model directly.
- The user transform and the unit conversion are composed on write:
  `model.scale = proxy.scale * unitScale`, so switching target software never destroys gizmo edits.
- `#controls` is laid out in flow (`margin-top: auto`) instead of `position: absolute`; an absolutely
  positioned panel overlapped the header once the animation panel made the header taller and swallowed
  clicks. Keep flow layout for anything that must not cover other UI.

## 🎬 Animator

- `Animator` owns the `AnimationMixer` actions: clip selection, play/pause/stop, effective time scale,
  loop mode (`LoopRepeat` + `clampWhenFinished` for one-shots) and a settable time for scrubbing.
- The viewer render loop calls `animator.update(delta)`; the app only reflects state through `onChange`.
- `USDZExporter` receives `quickLookCompatible: true` to bake animations per frame; `io/usdz.js` counts
  `def TimeSample` entries in the root `.usda` to report the frame count.

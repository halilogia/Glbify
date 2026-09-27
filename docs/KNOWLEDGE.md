# 🧠 Knowledge Base - Glbify

## 🌐 3D Formats & Conversion Rules

- **FBX (Filmbox)**: Binary/ASCII proprietary Autodesk format. Textures must be read from embedded materials or relative textures folder.
- **GLB (glTF 2.0 Binary)**: Self-contained 3D asset container with JSON chunk and binary buffer chunk.
- **GLTF (JSON)**: External `.bin` and texture references cannot be resolved from a single local file in the
  browser. Recommend converting to GLB.
- **OBJ**: Text based, geometry + optional `mtllib`. No single-file texture embedding.
- **STL**: ASCII (`solid ... endsolid`) or binary (80 byte header + uint32 face count + 50 bytes per face).
  No materials or textures. `STLLoader` treats data as binary unless the file starts with `solid`.
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

## 🧱 Build Notes

- `vite-plugin-pwa` `includeAssets` and `globPatterns` must cover the decoder WASM files; the default 2 MB
  precache limit is raised to 12 MB.
- `base: './'` keeps the output portable for GitHub Pages project subpaths.
- `@gltf-transform/core` imports `node:fs` / `node:path` for its file-system helpers. Those code paths are not
  used in the browser, so `vite.config.js` aliases both to `src/shims/node-builtins.js` to keep the build clean.

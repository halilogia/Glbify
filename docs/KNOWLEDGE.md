# 🧠 Knowledge Base - Glbify

## 🌐 3D Formats & Conversion Rules
- **FBX (Filmbox)**: Binary/ASCII proprietary Autodesk format. Textures must be read from embedded materials or relative textures folder.
- **GLB (glTF 2.0 Binary)**: Self-contained 3D asset container with JSON chunk and binary buffer chunk containing geometry, materials, and textures.
- **Coordinate Systems**:
  - Three.js / glTF: Right-handed, Y-up.
  - Unity: Left-handed, Y-up.
  - Unreal Engine: Left-handed, Z-up (100x cm scale).
  - Blender: Right-handed, Z-up (1x m scale).

## ⚙️ Three.js Export Options
```javascript
exporter.parse(
    scene,
    (gltf) => { /* handle arrayBuffer */ },
    (error) => { /* handle error */ },
    { binary: true, embedImages: true, animations: animations }
);
```

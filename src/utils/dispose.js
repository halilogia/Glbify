const textureSlots = [
    'map',
    'normalMap',
    'roughnessMap',
    'metalnessMap',
    'emissiveMap',
    'aoMap',
    'alphaMap',
    'bumpMap',
    'displacementMap',
    'lightMap',
    'specularMap',
    'envMap',
];

function disposeMaterial(material, keepTextures) {
    if (!material) return;
    for (const slot of textureSlots) {
        const texture = material[slot];
        if (texture && !keepTextures.has(texture)) {
            keepTextures.add(texture);
            texture.dispose();
        }
    }
    material.dispose();
}

export function disposeObject3D(root, keepTextures = new Set()) {
    if (!root) return;
    root.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        const { material } = child;
        if (Array.isArray(material)) material.forEach((entry) => disposeMaterial(entry, keepTextures));
        else disposeMaterial(material, keepTextures);
    });
    root.parent?.remove(root);
    root.clear?.();
}

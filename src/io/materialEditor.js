import * as THREE from 'three';

const TEXTURE_SLOTS = [
    { key: 'map', label: 'Diffuse' },
    { key: 'normalMap', label: 'Normal' },
    { key: 'roughnessMap', label: 'Roughness' },
    { key: 'metalnessMap', label: 'Metalness' },
    { key: 'emissiveMap', label: 'Emissive' },
    { key: 'aoMap', label: 'AO' },
];

const COLOR_SLOTS = new Set(['map', 'emissiveMap']);

export function listMaterials(root) {
    if (!root) return [];
    const found = new Map();

    root.traverse((child) => {
        if (!child.isMesh) return;
        const list = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of list) {
            if (material && !found.has(material)) found.set(material, { material, meshes: [] });
            if (material) found.get(material).meshes.push(child.name || child.uuid.slice(0, 6));
        }
    });

    return [...found.values()];
}

export function describeMaterial(entry) {
    const { material } = entry;
    return {
        name: material.name || 'Materyal',
        type: material.type,
        color: `#${material.color?.getHexString?.() ?? 'ffffff'}`,
        roughness: round(material.roughness ?? 0.5),
        metalness: round(material.metalness ?? 0),
        emissiveIntensity: round(material.emissiveIntensity ?? 1),
        opacity: round(material.opacity ?? 1),
        transparent: Boolean(material.transparent),
        side: material.side,
        textures: TEXTURE_SLOTS.filter(({ key }) => Boolean(material[key])).map(({ key, label }) => ({
            key,
            label,
            source: material[key]?.name || material[key]?.image?.currentSrc?.split('/').pop() || 'doku',
            colorSpace: material[key]?.colorSpace ?? null,
        })),
        meshCount: entry.meshes.length,
    };
}

export function applyMaterialPatch(material, patch) {
    if (!material) return;

    if (patch.color) {
        material.color?.set(patch.color);
        material.needsUpdate = true;
    }

    for (const [key, value] of Object.entries(patch.values ?? {})) {
        if (key === 'color') {
            material.color?.set(value);
            continue;
        }
        if (key in material) {
            material[key] = value;
            material.needsUpdate = true;
        }
    }

    for (const [key, value] of Object.entries(patch.textures ?? {})) {
        if (value === null) {
            material[key] = null;
            material.needsUpdate = true;
        }
    }

    if (patch.side !== undefined) {
        material.side = patch.side;
        material.needsUpdate = true;
    }

    if (patch.textureSlot) {
        const { key, texture } = patch.textureSlot;
        material[key] = texture;
        if (texture && COLOR_SLOTS.has(key)) texture.colorSpace = THREE.SRGBColorSpace;
        material.needsUpdate = true;
    }
}

export function captureMaterialState(material) {
    return {
        color: material.color?.getHex() ?? null,
        roughness: material.roughness,
        metalness: material.metalness,
        emissiveIntensity: material.emissiveIntensity,
        opacity: material.opacity,
        transparent: material.transparent,
        side: material.side,
        textures: Object.fromEntries(TEXTURE_SLOTS.map(({ key }) => [key, material[key]?.uuid ?? null])),
    };
}

export function restoreMaterialState(material, state, textureLookup) {
    if (!material || !state) return;
    if (state.color !== null) material.color?.setHex(state.color);
    material.roughness = state.roughness;
    material.metalness = state.metalness;
    material.emissiveIntensity = state.emissiveIntensity;
    material.opacity = state.opacity;
    material.transparent = state.transparent;
    material.side = state.side;
    for (const [key, uuid] of Object.entries(state.textures ?? {})) {
        material[key] = uuid ? (textureLookup.get(uuid) ?? null) : null;
    }
    material.needsUpdate = true;
}

export function collectTextures(root) {
    const textures = new Map();
    root?.traverse((child) => {
        if (!child.isMesh) return;
        const list = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of list) {
            for (const { key } of TEXTURE_SLOTS) {
                const texture = material?.[key];
                if (texture && !textures.has(texture.uuid)) textures.set(texture.uuid, texture);
            }
        }
    });
    return textures;
}

export function describeTexture(texture) {
    return {
        uuid: texture.uuid,
        texture,
        label: texture.name || `doku ${texture.uuid.slice(0, 4)}`,
    };
}

export { TEXTURE_SLOTS };

function round(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

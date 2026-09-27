import * as THREE from 'three';

const colorMaps = ['map', 'emissiveMap', 'specularMap'];
const dataMaps = ['normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'alphaMap', 'bumpMap', 'displacementMap'];

function fixTextureSpaces(material) {
    for (const slot of colorMaps) {
        const texture = material[slot];
        if (texture && texture.colorSpace !== THREE.SRGBColorSpace) {
            texture.colorSpace = THREE.SRGBColorSpace;
        }
    }
}

export function auditColorSpaces(root) {
    const report = { textures: 0, issues: [] };

    root.traverse((child) => {
        const { material } = child;
        if (!child.isMesh || !material) return;
        const list = Array.isArray(material) ? material : [material];

        for (const entry of list) {
            for (const slot of colorMaps) {
                const texture = entry[slot];
                if (!texture) continue;
                report.textures += 1;
                if (texture.colorSpace !== THREE.SRGBColorSpace) {
                    report.issues.push(`${describe(slot)}: sRGB değil (lineer)`);
                }
            }
            for (const slot of dataMaps) {
                const texture = entry[slot];
                if (!texture) continue;
                report.textures += 1;
                if (texture.colorSpace === THREE.SRGBColorSpace) {
                    report.issues.push(`${describe(slot)}: sRGB işaretli (harita verisi bozulur)`);
                }
            }
            if (!entry.normalMap && entry.bumpMap) {
                report.issues.push('bumpMap normalMap yerine kullanılıyor, ışıklandırma farklı olur');
            }
        }
    });

    return report;
}

function describe(slot) {
    const labels = {
        map: 'diffuse',
        emissiveMap: 'emissive',
        specularMap: 'specular',
        normalMap: 'normal',
        roughnessMap: 'roughness',
        metalnessMap: 'metalness',
        aoMap: 'AO',
        alphaMap: 'alpha',
        bumpMap: 'bump',
        displacementMap: 'displacement',
    };
    return labels[slot] ?? slot;
}

function convertToStandard(oldMat) {
    const mat = new THREE.MeshStandardMaterial();

    mat.name = oldMat.name;
    mat.color?.copy?.(oldMat.color);
    mat.map = oldMat.map ?? null;
    mat.normalMap = oldMat.normalMap ?? null;
    mat.bumpMap = oldMat.bumpMap ?? null;
    mat.roughnessMap = oldMat.roughnessMap ?? null;
    mat.metalnessMap = oldMat.metalnessMap ?? null;
    mat.aoMap = oldMat.aoMap ?? null;
    mat.alphaMap = oldMat.alphaMap ?? null;
    mat.displacementMap = oldMat.displacementMap ?? null;
    mat.emissiveMap = oldMat.emissiveMap ?? null;
    mat.lightMap = oldMat.lightMap ?? null;
    mat.emissive?.copy?.(oldMat.emissive);

    mat.transparent = oldMat.transparent ?? false;
    mat.opacity = oldMat.opacity ?? 1;
    mat.alphaTest = oldMat.alphaTest ?? 0;
    mat.side = THREE.DoubleSide;
    mat.vertexColors = oldMat.vertexColors ?? false;
    mat.flatShading = oldMat.flatShading ?? false;
    mat.skinning = oldMat.skinning ?? false;

    const shininess = typeof oldMat.shininess === 'number' ? oldMat.shininess : 30;
    const specular = oldMat.specular;
    const metalness = specular
        ? Math.min(Math.max((specular.r + specular.g + specular.b) / 3, 0), 1) * 0.8
        : 0.1;
    mat.metalness = Number.isFinite(metalness) ? metalness : 0.1;
    mat.roughness = Math.min(Math.max(1 - shininess / 128, 0.05), 1);

    if (oldMat.emissiveMap && oldMat.emissive && oldMat.emissive.getHex() === 0) {
        mat.emissive.setHex(0xffffff);
    }

    return mat;
}

function prepareMesh(mesh) {
    const source = mesh.material;
    if (!source) return;

    if (Array.isArray(source)) {
        mesh.material = source.map((entry) => {
            if (entry.isMeshStandardMaterial) {
                fixTextureSpaces(entry);
                return entry;
            }
            const converted = convertToStandard(entry);
            fixTextureSpaces(converted);
            return converted;
        });
    } else if (!source.isMeshStandardMaterial) {
        const converted = convertToStandard(source);
        fixTextureSpaces(converted);
        mesh.material = converted;
    } else {
        fixTextureSpaces(source);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (mesh.geometry) {
        mesh.geometry.computeVertexNormals?.();
        mesh.geometry.computeBoundingBox?.();
    }
}

export function prepareModel(root) {
    if (!root) return;
    root.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) prepareMesh(child);
    });
    root.updateMatrixWorld(true);
}

export function applyMtlLibrary(root, library) {
    if (!root || !library) return 0;
    let applied = 0;

    const replace = (material) => {
        if (!material?.name) return material;
        const found = library.getMaterial(material.name);
        return found ?? material;
    };

    root.traverse((child) => {
        if (!child.isMesh) return;
        const list = Array.isArray(child.material) ? child.material : [child.material];
        const next = list.map(replace);
        if (next.some((value, index) => value !== list[index])) applied += 1;
        child.material = Array.isArray(child.material) ? next : next[0];
    });

    return applied;
}

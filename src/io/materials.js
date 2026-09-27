import * as THREE from 'three';

const colorMaps = ['map', 'emissiveMap', 'specularMap'];

function fixTextureSpaces(material) {
    for (const slot of colorMaps) {
        const texture = material[slot];
        if (texture && texture.colorSpace !== THREE.SRGBColorSpace) {
            texture.colorSpace = THREE.SRGBColorSpace;
        }
    }
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

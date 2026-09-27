import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { USDLoader } from 'three/addons/loaders/USDLoader.js';
import { decodeText } from './fileReader.js';

function normalizeError(error) {
    if (error instanceof Error) return error;
    const message = typeof error === 'string' ? error : (error?.message ?? 'Bilinmeyen ayrıştırma hatası.');
    return new Error(message);
}

function groupFromGeometry(geometry, name) {
    const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    return mesh;
}

const fbx = {
    id: 'fbx',
    label: 'FBX',
    extensions: ['fbx'],
    async parse(buffer) {
        return new Promise((resolve, reject) => {
            new FBXLoader().parse(buffer, '', resolve, (error) => reject(normalizeError(error)));
        });
    },
};

const gltf = {
    id: 'gltf',
    label: 'GLB / GLTF',
    extensions: ['glb', 'gltf'],
    async parse(buffer, { extension, decoders }) {
        const loader = new GLTFLoader()
            .setDRACOLoader(decoders.draco)
            .setKTX2Loader(decoders.ktx2)
            .setMeshoptDecoder(decoders.meshopt);

        const source = extension === 'gltf' ? decodeText(buffer) : buffer;
        const document = await loader.parseAsync(source, '');
        return { object: document.scene, animations: document.animations ?? [] };
    },
};

const obj = {
    id: 'obj',
    label: 'OBJ',
    extensions: ['obj'],
    async parse(buffer) {
        return { object: new OBJLoader().parse(decodeText(buffer)), animations: [] };
    },
};

const stl = {
    id: 'stl',
    label: 'STL',
    extensions: ['stl'],
    async parse(buffer) {
        try {
            return { object: groupFromGeometry(new STLLoader().parse(buffer), 'stl'), animations: [] };
        } catch (cause) {
            throw new Error('STL dosyası okunamadı. Dosya ASCII veya binary STL olmalı ve bozuk olmamalı.', { cause });
        }
    },
};

const usd = {
    id: 'usd',
    label: 'USD / USDZ',
    extensions: ['usdz', 'usd', 'usda', 'usdc'],
    async parse(buffer) {
        const group = await new Promise((resolve, reject) => {
            new USDLoader().parse(buffer, '', resolve, (error) => reject(normalizeError(error)));
        });
        return { object: group, animations: [] };
    },
};

export const importers = [fbx, gltf, obj, stl, usd];

export const ACCEPTED_EXTENSIONS = importers.flatMap((entry) => entry.extensions);

export function getImporter(extension) {
    return importers.find((entry) => entry.extensions.includes(extension)) ?? null;
}

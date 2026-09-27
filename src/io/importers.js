import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';
import { USDLoader } from 'three/addons/loaders/USDLoader.js';
import { decodeText } from './fileReader.js';
import { blobToDataUrl } from './textureOps.js';
import { parseInWorker } from './workerParser.js';

const TEXTURE_DIRECTIVES =
    /^\s*(map_Kd|map_Ka|map_Ks|map_Ke|map_Kn|map_ns|map_d|bump|disp|norm|refl|decal)\s+(\S+)/gim;

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

async function tryWorker(extension, buffer, context = {}) {
    if (!context.useWorker) return null;
    try {
        return await parseInWorker(WORKER_IMPORT[extension], buffer, {
            signal: context.signal,
            mtl: context.mtl,
            textures: context.textures,
        });
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        console.warn(`[glbify] worker ayrıştırması başarısız, ana iş parçacığı kullanılıyor: ${error.message}`);
        return null;
    }
}

async function buildTextureUrls(mtlFile, files) {
    if (!mtlFile) return [];
    const source = await mtlFile.text();
    const references = new Set();
    for (const match of source.matchAll(TEXTURE_DIRECTIVES)) {
        references.add(match[2].replace(/^["']|["']$/g, '').split(/[\\/]/).pop().toLowerCase());
    }

    const entries = [];
    for (const file of files) {
        if (file === mtlFile) continue;
        if (!references.has(file.name.toLowerCase())) continue;
        entries.push({ name: file.name, dataUrl: await blobToDataUrl(file) });
    }
    return entries;
}

async function buildMtlLibrary(source, siblingFiles) {
    const replacements = new Map();

    for (const match of source.matchAll(TEXTURE_DIRECTIVES)) {
        const reference = match[2].replace(/^["']|["']$/g, '');
        const base = reference.split(/[\\/]/).pop().toLowerCase();
        const file = siblingFiles.find((candidate) => candidate.name.toLowerCase() === base);
        if (!file || replacements.has(reference)) continue;
        replacements.set(reference, await blobToDataUrl(file));
    }

    const patched = replacements.size
        ? source.replace(TEXTURE_DIRECTIVES, (line, directive, reference) => {
            const replacement = replacements.get(reference);
            return replacement ? `${directive} ${replacement}` : line;
        })
        : source;

    return { library: new MTLLoader().parse(patched, ''), mapped: replacements.size };
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
    async parse(buffer, context = {}) {
        const files = context.files ?? [];
        const mtlFile = files.find((file) => /\.mtl$/i.test(file.name));
        const worker = await tryWorker('obj', buffer, {
            ...context,
            useWorker: context.useWorker,
            mtl: mtlFile ? await mtlFile.text() : '',
            textures: await buildTextureUrls(mtlFile, files),
        });
        if (worker) return worker;

        let materials = null;
        const notes = [];

        if (mtlFile) {
            try {
                const { library, mapped } = await buildMtlLibrary(
                    await mtlFile.text(),
                    files.filter((file) => file !== mtlFile),
                );
                materials = library;
                notes.push(mapped ? `MTL: ${mapped} doku eşlendi` : 'MTL: yalnızca renkler okundu (doku dosyası yok)');
            } catch (error) {
                notes.push(`MTL okunamadı: ${error.message}`);
            }
        }

        const loader = new OBJLoader();
        if (materials) loader.setMaterials(materials);
        return { object: loader.parse(decodeText(buffer)), animations: [], notes };
    },
};

const mtl = {
    id: 'mtl',
    label: 'MTL',
    extensions: ['mtl'],
    standalone: true,
    async parse(buffer, { files = [] }) {
        const file = files.find((candidate) => /\.mtl$/i.test(candidate.name));
        const source = file ? await file.text() : decodeText(buffer);
        const { library, mapped } = await buildMtlLibrary(source, files.filter((candidate) => candidate !== file));
        return { object: null, animations: [], materials: library, notes: [`${mapped} doku eşlendi`] };
    },
};

const WORKER_IMPORT = { stl: 'stl', ply: 'ply', obj: 'obj' };

const stl = {
    id: 'stl',
    label: 'STL',
    extensions: ['stl'],
    async parse(buffer, context) {
        const worker = await tryWorker('stl', buffer, context);
        if (worker) return worker;
        try {
            return { object: groupFromGeometry(new STLLoader().parse(buffer), 'stl'), animations: [] };
        } catch (cause) {
            throw new Error('STL dosyası okunamadı. Dosya ASCII veya binary STL olmalı ve bozuk olmamalı.', { cause });
        }
    },
};

const ply = {
    id: 'ply',
    label: 'PLY',
    extensions: ['ply'],
    async parse(buffer, context) {
        const worker = await tryWorker('ply', buffer, context);
        if (worker) return worker;
        try {
            return { object: groupFromGeometry(new PLYLoader().parse(buffer), 'ply'), animations: [] };
        } catch (cause) {
            throw new Error('PLY dosyası okunamadı. ASCII veya binary_little_endian formatında olmalı.', { cause });
        }
    },
};

const threemf = {
    id: '3mf',
    label: '3MF',
    extensions: ['3mf'],
    async parse(buffer) {
        try {
            return { object: new ThreeMFLoader().parse(buffer), animations: [] };
        } catch (cause) {
            throw new Error('3MF paketi okunamadı. Dosya geçerli bir 3MF kütüphanesi olmalı.', { cause });
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

export const importers = [fbx, gltf, obj, mtl, stl, ply, threemf, usd];

export const ACCEPTED_EXTENSIONS = importers.flatMap((entry) => entry.extensions);

export function getImporter(extension) {
    return importers.find((entry) => entry.extensions.includes(extension)) ?? null;
}

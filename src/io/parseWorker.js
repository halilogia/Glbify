import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { installWorkerImageShim } from './workerImageShim.js';

void THREE;

installWorkerImageShim();

const TEXTURE_DIRECTIVES =
    /^\s*(map_Kd|map_Ka|map_Ks|map_Ke|map_Kn|map_ns|map_d|bump|disp|norm|refl|decal)\s+(\S+)/gim;

function serialize(geometry) {
    const attributes = {};

    for (const [name, attribute] of Object.entries(geometry.attributes)) {
        attributes[name] = {
            array: attribute.array,
            itemSize: attribute.itemSize,
            normalized: attribute.normalized,
        };
    }

    const index = geometry.index ? { array: geometry.index.array } : null;

    return { attributes, index, groups: geometry.groups.map((group) => ({ ...group })) };
}

function collectBuffers(payload) {
    const buffers = Object.values(payload.attributes).map((entry) => entry.array.buffer);
    if (payload.index) buffers.push(payload.index.array.buffer);
    return buffers;
}

const TEXTURE_SLOTS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap'];

async function waitForTextures(creator, timeout = 15000) {
    const started = Date.now();
    const materials = creator.getAsArray();

    for (;;) {
        const pending = materials.some((material) =>
            TEXTURE_SLOTS.some((slot) => {
                const texture = material[slot];
                return Boolean(texture) && !texture.image?.image;
            }),
        );

        if (!pending || Date.now() - started > timeout) return creator;
        await new Promise((resolve) => setTimeout(resolve, 40));
    }
}

async function parseMtl(source, textures) {
    let patched = source;
    if (textures?.length) {
        const lookup = new Map(textures.map((entry) => [entry.name, entry.dataUrl]));
        patched = source.replace(TEXTURE_DIRECTIVES, (line, directive, reference) => {
            const dataUrl = lookup.get(reference);
            return dataUrl ? `${directive} ${dataUrl}` : line;
        });
    }

    const creator = new MTLLoader().parse(patched, '');
    creator.preload();
    return waitForTextures(creator);
}

function serializeMaterial(material) {
    if (!material) return null;

    const descriptor = {
        name: material.name ?? null,
        color: material.color ? `#${material.color.getHexString()}` : '#ffffff',
        side: material.side,
        transparent: material.transparent,
        opacity: material.opacity,
        shininess: material.shininess,
        specular: material.specular ? `#${material.specular.getHexString()}` : null,
        maps: {},
    };

    for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap']) {
        const texture = material[key];
        const bitmap = texture?.image?.image;
        if (bitmap && typeof ImageBitmap !== 'undefined' && bitmap instanceof ImageBitmap) {
            descriptor.maps[key] = { bitmap, colorSpace: texture.colorSpace };
        }
    }

    return descriptor;
}

function collectBitmaps(material, transfers) {
    for (const entry of Object.values(material?.maps ?? {})) transfers.push(entry.bitmap);
}

self.onmessage = async (event) => {
    const { id, format, buffer, mtl, textures } = event.data;

    try {
        if (format === 'stl') {
            const payload = serialize(new STLLoader().parse(buffer));
            self.postMessage({ id, format, payload }, collectBuffers(payload));
            return;
        }

        if (format === 'ply') {
            const payload = serialize(new PLYLoader().parse(buffer));
            self.postMessage({ id, format, payload }, collectBuffers(payload));
            return;
        }

        if (format === 'obj') {
            const text = new TextDecoder().decode(buffer);
            let library = null;
            if (mtl) library = await parseMtl(mtl, textures);

            const loader = new OBJLoader();
            if (library) loader.setMaterials(library);
            const group = loader.parse(text.replace(/^mtllib.*$/gim, ''));

            const objects = group.children.map((child) => ({
                name: child.name,
                material: serializeMaterial(child.material),
                payload: serialize(child.geometry),
            }));
            const transfers = objects.flatMap((entry) => collectBuffers(entry.payload));
            for (const entry of objects) collectBitmaps(entry.material, transfers);
            self.postMessage({ id, format, objects }, transfers);
            return;
        }

        self.postMessage({ id, error: `Worker "${format}" desteklemiyor.` });
    } catch (error) {
        self.postMessage({ id, error: error?.stack ?? error?.message ?? 'Worker ayrıştırma hatası.' });
    }
};

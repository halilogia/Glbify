import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

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

self.onmessage = (event) => {
    const { id, format, buffer } = event.data;

    try {
        if (format === 'stl') {
            const geometry = new STLLoader().parse(buffer);
            const payload = serialize(geometry);
            self.postMessage({ id, format, payload }, collectBuffers(payload));
            return;
        }

        if (format === 'ply') {
            const geometry = new PLYLoader().parse(buffer);
            const payload = serialize(geometry);
            self.postMessage({ id, format, payload }, collectBuffers(payload));
            return;
        }

        if (format === 'obj') {
            const text = new TextDecoder().decode(buffer);
            const group = new OBJLoader().parse(text.replace(/^mtllib.*$/gim, ''));
            const objects = group.children.map((child) => ({
                name: child.name,
                payload: serialize(child.geometry),
            }));
            const transfers = objects.flatMap((entry) => collectBuffers(entry.payload));
            self.postMessage({ id, format, objects }, transfers);
            return;
        }

        self.postMessage({ id, error: `Worker "${format}" desteklemiyor.` });
    } catch (error) {
        self.postMessage({ id, error: error?.message ?? 'Worker ayrıştırma hatası.' });
    }
};

export { serialize };

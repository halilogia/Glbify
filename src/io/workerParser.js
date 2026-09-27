import * as THREE from 'three';

const WORKER_FORMATS = new Set(['stl', 'ply', 'obj']);
const MAX_WORKER_BYTES = 192 * 1024 * 1024;
const pending = new Map();
let sequence = 0;
let worker = null;
let workerFailed = false;

function getWorker() {
    if (workerFailed || typeof Worker === 'undefined') return null;
    worker ??= new Worker(new URL('./parseWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
        const entry = pending.get(event.data.id);
        if (!entry) return;
        pending.delete(event.data.id);
        if (event.data.error) entry.reject(new Error(event.data.error));
        else entry.resolve(event.data);
    };
    worker.onerror = () => {
        workerFailed = true;
        worker?.terminate();
        worker = null;
        pending.forEach(({ reject }) => reject(new Error('Ayrıştırma işçisi başlatılamadı.')));
        pending.clear();
    };
    return worker;
}

function hydrate(payload) {
    const geometry = new THREE.BufferGeometry();

    for (const [name, entry] of Object.entries(payload.attributes)) {
        geometry.setAttribute(
            name,
            new THREE.BufferAttribute(new Float32Array(entry.array), entry.itemSize, entry.normalized),
        );
    }

    if (payload.index) {
        const array = entry2Uint32(payload.index.array);
        geometry.setIndex(new THREE.BufferAttribute(array, 1));
    }

    for (const group of payload.groups ?? []) geometry.addGroup(group.start, group.count, group.materialIndex);

    geometry.computeBoundingBox();
    return geometry;
}

function entry2Uint32(array) {
    return array instanceof Uint32Array ? array : new Uint32Array(array);
}

function buildScene({ format, payload, objects }) {
    if (format === 'obj') {
        const group = new THREE.Group();
        group.name = 'obj';
        for (const entry of objects) {
            const mesh = new THREE.Mesh(hydrate(entry.payload), buildMaterial(entry.material));
            mesh.name = entry.name;
            group.add(mesh);
        }
        return group;
    }

    const mesh = new THREE.Mesh(hydrate(payload), defaultMaterial());
    mesh.name = format;
    return mesh;
}

function defaultMaterial() {
    return new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, metalness: 0.05 });
}

function buildMaterial(descriptor) {
    if (!descriptor) return defaultMaterial();

    const material = new THREE.MeshStandardMaterial({
        name: descriptor.name ?? '',
        color: descriptor.color ?? '#ffffff',
        side: descriptor.side ?? THREE.DoubleSide,
        transparent: Boolean(descriptor.transparent),
        opacity: descriptor.opacity ?? 1,
    });

    if (descriptor.specular) {
        const specular = new THREE.Color(descriptor.specular);
        const average = (specular.r + specular.g + specular.b) / 3;
        material.metalness = Math.min(Math.max(average, 0), 1) * 0.8;
    }

    const shininess = typeof descriptor.shininess === 'number' ? descriptor.shininess : 30;
    material.roughness = Math.min(Math.max(1 - shininess / 128, 0.05), 1);

    for (const [slot, entry] of Object.entries(descriptor.maps ?? {})) {
        const texture = new THREE.Texture(entry.bitmap);
        texture.colorSpace = entry.colorSpace ?? THREE.NoColorSpace;
        texture.needsUpdate = true;
        material[slot] = texture;
    }

    return material;
}

export function isWorkerParseSupported(extension, { size = 0 } = {}) {
    if (!WORKER_FORMATS.has(extension)) return false;
    if (size > MAX_WORKER_BYTES) return false;
    return true;
}

export async function parseInWorker(extension, buffer, { signal, mtl, textures } = {}) {
    const instance = getWorker();
    if (!instance) throw new Error('Worker desteklenmiyor.');

    const id = (sequence += 1);
    const copy = buffer.slice(0);

    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });

        const abort = () => {
            if (!pending.has(id)) return;
            pending.delete(id);
            reject(new DOMException('İptal edildi', 'AbortError'));
        };

        signal?.addEventListener('abort', abort, { once: true });
        instance.postMessage({ id, format: extension, buffer: copy, mtl, textures }, [copy]);
    }).then((result) => ({
        object: buildScene({ format: extension, payload: result.payload, objects: result.objects }),
        animations: [],
        notes: [`${extension.toUpperCase()} ayrıştırması arka plan işçisinde yapıldı.`],
        parsedInWorker: true,
    }));
}

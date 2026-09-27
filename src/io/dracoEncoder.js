import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { draco } from '@gltf-transform/functions';
import { ASSETS, DRACO_LEVELS } from '../config.js';

const scriptPromises = new Map();
let encoderPromise = null;

function loadScript(src) {
    if (scriptPromises.has(src)) return scriptPromises.get(src);

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.glbifyDecoder = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Draco encoder betiği yüklenemedi.'));
        document.head.appendChild(script);
    });

    scriptPromises.set(src, promise);
    return promise;
}

async function getEncoder() {
    encoderPromise ??= (async () => {
        await loadScript(ASSETS.dracoEncoderScript);
        const factory = globalThis.DracoEncoderModule;
        if (typeof factory !== 'function') throw new Error('Draco encoder bulunamadı.');
        return factory({ locateFile: () => ASSETS.dracoEncoderWasm });
    })();

    try {
        return await encoderPromise;
    } catch (error) {
        encoderPromise = null;
        throw error;
    }
}

export function isDracoAvailable() {
    return typeof globalThis.DracoEncoderModule === 'function';
}

export async function compressGlb(buffer, level = 'balanced') {
    const encoder = await getEncoder();
    const io = new NodeIO()
        .registerExtensions([KHRDracoMeshCompression])
        .registerDependencies({ 'draco3d.encoder': encoder });

    const document = await io.readBinary(new Uint8Array(buffer));
    await document.transform(draco({ method: 'edgebreaker', ...DRACO_LEVELS[level] }));

    return io.writeBinary(document);
}

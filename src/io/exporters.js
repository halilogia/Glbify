import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

const withScale = (task) => async (context) => {
    const { model, scale, onProgress } = context;
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    try {
        return await task(context);
    } finally {
        model.scale.setScalar(1);
        model.updateMatrixWorld(true);
        onProgress?.({ ratio: 1, label: 'Hazır' });
    }
};

function tag(scale) {
    return `_glbify_x${String(scale).replace('.', 'p')}`;
}

function result(blob, fileName, extra = {}) {
    return { blob, fileName, size: blob.size, ...extra };
}

const glb = {
    id: 'glb',
    label: 'GLB',
    run: withScale(async ({ model, baseName, scale, options, onProgress }) => {
        const { compressGlb } = await import('./dracoEncoder.js');
        onProgress?.({ ratio: 0.1, label: 'GLB hazırlanıyor...' });

        const buffer = await new GLTFExporter().parseAsync(model, {
            binary: true,
            embedImages: options.textureSize > 0,
            maxTextureSize: options.textureSize > 0 ? options.textureSize : undefined,
            animations: model.animations ?? [],
            onlyVisible: true,
        });

        const uncompressedSize = buffer.byteLength;
        onProgress?.({ ratio: 0.6, label: options.draco ? 'DRACO sıkıştırılıyor...' : 'GLB tamamlanıyor...' });

        const payload = options.draco ? await compressGlb(buffer, options.dracoLevel) : buffer;
        const blob = new Blob([payload], { type: 'model/gltf-binary' });

        return result(blob, `${baseName}${tag(scale)}.glb`, { uncompressedSize });
    }),
};

const usdz = {
    id: 'usdz',
    label: 'USDZ',
    run: withScale(async ({ model, baseName, options, onProgress }) => {
        onProgress?.({ ratio: 0.3, label: 'USDZ paketleniyor...' });
        const buffer = await new USDZExporter().parseAsync(model, {
            maxTextureSize: options.textureSize || 1024,
            animations: model.animations ?? [],
        });
        return result(new Blob([buffer], { type: 'model/vnd.usdz+zip' }), `${baseName}_glbify.usdz`);
    }),
};

const stl = {
    id: 'stl',
    label: 'STL',
    run: withScale(async ({ model, baseName, scale, onProgress }) => {
        onProgress?.({ ratio: 0.3, label: 'STL yazılıyor...' });
        const payload = new STLExporter().parse(model, { binary: true });
        return result(new Blob([payload], { type: 'model/stl' }), `${baseName}${tag(scale)}.stl`);
    }),
};

const obj = {
    id: 'obj',
    label: 'OBJ',
    run: withScale(async ({ model, baseName, scale, onProgress }) => {
        onProgress?.({ ratio: 0.3, label: 'OBJ yazılıyor...' });
        const text = new OBJExporter().parse(model);
        return result(new Blob([text], { type: 'model/obj' }), `${baseName}${tag(scale)}.obj`);
    }),
};

export const exporters = { glb, usdz, stl, obj };

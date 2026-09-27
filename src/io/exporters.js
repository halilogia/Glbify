import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { postProcessGlb } from './gltfPostprocess.js';
import { validateUsdz } from './usdz.js';

function tag(scale) {
    return `_glbify_x${String(scale).replace('.', 'p')}`;
}

function result(blob, fileName, extra = {}) {
    return { blob, fileName, size: blob.size, ...extra };
}

function hasTextures(model) {
    let found = false;
    model.traverse((child) => {
        if (found || !child.isMesh) return;
        const list = Array.isArray(child.material) ? child.material : [child.material];
        if (list.some((entry) => entry?.map)) found = true;
    });
    return found;
}

const glb = {
    id: 'glb',
    label: 'GLB',
    async run({ model, baseName, scale, options, onProgress }) {
        onProgress?.({ ratio: 0.1, label: 'GLB hazırlanıyor...' });

        const buffer = await new GLTFExporter().parseAsync(model, {
            binary: true,
            trs: true,
            embedImages: options.textureSize > 0,
            maxTextureSize: options.textureSize > 0 ? options.textureSize : undefined,
            animations: model.animations ?? [],
            onlyVisible: true,
        });

        const uncompressedSize = buffer.byteLength;
        onProgress?.({ ratio: 0.5, label: 'Çıktı işleniyor...' });

        const { buffer: payload, report } = await postProcessGlb(buffer, options, onProgress);
        const blob = new Blob([payload], { type: 'model/gltf-binary' });

        onProgress?.({ ratio: 1, label: 'Hazır' });
        return result(blob, `${baseName}${tag(scale)}.glb`, { uncompressedSize, report });
    },
};

const usdz = {
    id: 'usdz',
    label: 'USDZ',
    async run({ model, baseName, options, onProgress }) {
        onProgress?.({ ratio: 0.3, label: 'USDZ paketleniyor...' });

        const buffer = await new USDZExporter().parseAsync(model, {
            maxTextureSize: options.textureSize || 1024,
            animations: model.animations ?? [],
            quickLookCompatible: Boolean(options.usdzQuickLook),
        });

        const validation = validateUsdz(buffer, { expectTextures: hasTextures(model) });
        onProgress?.({ ratio: 1, label: 'Hazır' });

        return result(new Blob([buffer], { type: 'model/vnd.usdz+zip' }), `${baseName}_glbify.usdz`, {
            report: validation.notes,
            warnings: validation.warnings,
        });
    },
};

const stl = {
    id: 'stl',
    label: 'STL',
    async run({ model, baseName, scale, onProgress }) {
        onProgress?.({ ratio: 0.3, label: 'STL yazılıyor...' });
        const payload = new STLExporter().parse(model, { binary: true });
        onProgress?.({ ratio: 1, label: 'Hazır' });
        return result(new Blob([payload], { type: 'model/stl' }), `${baseName}${tag(scale)}.stl`);
    },
};

const obj = {
    id: 'obj',
    label: 'OBJ',
    async run({ model, baseName, scale, onProgress }) {
        onProgress?.({ ratio: 0.3, label: 'OBJ yazılıyor...' });
        const text = new OBJExporter().parse(model);
        onProgress?.({ ratio: 1, label: 'Hazır' });
        return result(new Blob([text], { type: 'model/obj' }), `${baseName}${tag(scale)}.obj`);
    },
};

export const exporters = { glb, usdz, stl, obj };

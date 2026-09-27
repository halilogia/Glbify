export const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev';

export const MB = 1024 * 1024;

export const LIMITS = {
    warnMB: 200,
};

export const DRACO_LEVELS = {
    high: { quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 14, quantizeColor: 8 },
    balanced: { quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeColor: 8 },
    max: { quantizePosition: 11, quantizeNormal: 8, quantizeTexcoord: 10, quantizeColor: 8 },
};

export const SIMPLIFY_PRESETS = {
    off: 0,
    light: 0.75,
    balanced: 0.5,
    aggressive: 0.25,
};

export const OPTIMIZE_PRESETS = {
    balanced: { simplify: 0.5, error: 0.001, weld: true, ktx2: false, uastc: false },
    quality: { simplify: 0, error: 0.0001, weld: true, ktx2: true, uastc: true },
    size: { simplify: 0.25, error: 0.003, weld: true, ktx2: true, uastc: false },
};

export const MESHOPT_LEVELS = ['medium', 'high'];

// glTF-Transform prune() drops textures that are only referenced from material slots,
// so cleanup is limited to accessors, meshes and nodes.
export const PRUNE_PROPERTY_TYPES = ['ACCESSOR', 'MESH', 'NODE'];

const assetBase = () =>
    globalThis.document?.baseURI ?? globalThis.location?.href ?? new URL('.', import.meta.url).href;

export function assetUrl(path) {
    return new URL(path, assetBase()).href;
}

export const ASSETS = {
    get dracoEncoderScript() {
        return assetUrl('draco/draco_encoder.js');
    },
    get dracoEncoderWasm() {
        return assetUrl('draco/draco_encoder.wasm');
    },
};

export const TEXTURE_MIME = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
};

export const TOAST_TIMEOUT = 6000;

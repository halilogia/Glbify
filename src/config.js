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

export const ASSETS = {
    dracoEncoderScript: new URL('draco/draco_encoder.js', document.baseURI).href,
    dracoEncoderWasm: new URL('draco/draco_encoder.wasm', document.baseURI).href,
};

export const TEXTURE_MIME = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
};

export const TOAST_TIMEOUT = 6000;

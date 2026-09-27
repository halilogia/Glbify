export const RENDERER_MODES = ['webgl', 'webgpu'];

export async function detectCapabilities() {
    const capabilities = {
        webgpu: false,
        webgpuReason: '',
        webgl2: false,
        xr: false,
        deviceMemoryGB: Number.isFinite(navigator.deviceMemory) ? navigator.deviceMemory : null,
    };

    try {
        const canvas = document.createElement('canvas');
        capabilities.webgl2 = Boolean(canvas.getContext('webgl2'));
    } catch {
        capabilities.webgl2 = false;
    }

    if (!navigator.gpu) {
        capabilities.webgpuReason = 'Tarayıcı WebGPU desteklemiyor';
    } else {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            capabilities.webgpu = Boolean(adapter);
            if (!adapter) capabilities.webgpuReason = 'Uygun WebGPU adaptörü yok';
        } catch (error) {
            capabilities.webgpuReason = error?.message ?? 'WebGPU adaptörü alınamadı';
        }
    }

    try {
        capabilities.xr = Boolean(await navigator.xr?.isSessionSupported('immersive-ar'));
    } catch {
        capabilities.xr = false;
    }

    return capabilities;
}

export async function createRenderer({ mode = 'webgl', powerPreference = 'high-performance' } = {}) {
    const options = { antialias: true, alpha: true, powerPreference };

    if (mode === 'webgpu') {
        try {
            const module = await import('three/webgpu');
            const renderer = new module.WebGPURenderer(options);
            await renderer.init();
            return {
                renderer,
                backend: renderer.backend?.isWebGPUBackend ? 'webgpu' : 'webgl2-fallback',
                requested: mode,
                PMREMGenerator: module.PMREMGenerator,
                fallbackReason: renderer.backend?.isWebGPUBackend ? '' : 'WebGPU adaptörü yok, WebGL2 çalışıyor',
            };
        } catch (error) {
            console.warn('[glbify] WebGPU başlatılamadı, WebGL2 kullanılıyor:', error?.message);
            return createRenderer({ mode: 'webgl', powerPreference });
        }
    }

    const module = await import('three');
    const renderer = new module.WebGLRenderer(options);
    return {
        renderer,
        backend: 'webgl2',
        requested: mode,
        PMREMGenerator: module.PMREMGenerator,
        fallbackReason: '',
    };
}

const ALLOWED = {
    scale: 'scale',
    doku: 'textureSize',
    fmt: 'textureFormat',
    kalite: 'textureQuality',
    draco: 'dracoLevel',
    draco_acik: 'draco',
    meshopt: 'meshopt',
    sadelestir: 'simplifyRatio',
    weld: 'weld',
    ktx2: 'ktx2',
    limit: 'maxFileMB',
    renderer: 'rendererMode',
    view: 'view',
    panel: 'sidePanelOpen',
};

const BOOLEANS = new Set(['draco_acik', 'meshopt', 'weld', 'ktx2', 'view', 'panel']);

export function readSettingsFromUrl(search = window.location.search) {
    const params = new URLSearchParams(search);
    const patch = {};

    for (const [key, raw] of params.entries()) {
        const field = ALLOWED[key];
        if (!field) continue;
        if (BOOLEANS.has(key)) {
            patch[field] = raw !== '0' && raw !== 'false';
            continue;
        }
        const numeric = Number(raw);
        patch[field] = raw !== '' && Number.isFinite(numeric) ? numeric : raw;
    }

    return patch;
}

export function buildShareUrl(settings, base = window.location.href) {
    const url = new URL(base);
    url.search = '';

    const entries = {
        scale: settings.scale,
        doku: settings.textureSize,
        fmt: settings.textureFormat,
        kalite: settings.textureQuality,
        draco: settings.dracoLevel,
        draco_acik: settings.draco ? '1' : '0',
        meshopt: settings.meshopt ? '1' : '0',
        sadelestir: settings.simplifyRatio,
        weld: settings.weld ? '1' : '0',
        ktx2: settings.ktx2 ? '1' : '0',
        limit: settings.maxFileMB,
    };

    for (const [key, value] of Object.entries(entries)) {
        if (value === undefined || value === null || value === '') continue;
        url.searchParams.set(key, String(value));
    }

    return url.toString();
}

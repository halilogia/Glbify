const FIELD = {
    s: 'scale',
    t: 'textureSize',
    f: 'textureFormat',
    q: 'textureQuality',
    d: 'dracoLevel',
    D: 'draco',
    m: 'meshopt',
    s2: 'simplifyRatio',
    w: 'weld',
    k: 'ktx2',
    l: 'maxFileMB',
};

const toBase64Url = (text) =>
    btoa(unescape(encodeURIComponent(text))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');

const fromBase64Url = (value) => {
    const padded = value.replaceAll('-', '+').replaceAll('_', '/');
    return decodeURIComponent(escape(atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='))));
};

export function encodeProfile(options) {
    const payload = Object.entries(FIELD)
        .filter(([key]) => key !== 's2')
        .map(([key, field]) => [key, options[field]])
        .filter(([, value]) => value !== undefined && value !== null && value !== '');

    if (options.simplifyRatio) payload.push(['s2', options.simplifyRatio]);
    return toBase64Url(JSON.stringify(Object.fromEntries(payload)));
}

export function decodeProfile(code) {
    if (typeof code !== 'string' || code.length < 4) throw new Error('Profil kodu çok kısa.');
    const text = fromBase64Url(code.trim());
    const raw = JSON.parse(text);
    if (typeof raw !== 'object' || raw === null) throw new Error('Profil kodu okunamadı.');

    const options = {};
    for (const [key, value] of Object.entries(raw)) {
        const field = FIELD[key];
        if (!field) continue;
        options[field] = typeof value === 'boolean' ? value : Number.isFinite(Number(value)) ? Number(value) : value;
    }

    if (!Object.keys(options).length) throw new Error('Profil kodu boş.');
    return options;
}

export function summarizeProfile(options) {
    const parts = [];
    if (options.scale !== undefined) parts.push(`${options.scale}x`);
    if (options.textureFormat && options.textureFormat !== 'original') parts.push(options.textureFormat);
    if (options.draco) parts.push(`DRACO:${options.dracoLevel ?? 'balanced'}`);
    if (options.meshopt) parts.push('meshopt');
    if (options.ktx2) parts.push('KTX2');
    if (options.simplifyRatio) parts.push(`simplify:${options.simplifyRatio}`);
    if (options.weld === false) parts.push('no-weld');
    return parts.join(' · ') || 'varsayılan';
}

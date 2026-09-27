const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

export function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '-';
    if (bytes < KB) return `${bytes} B`;
    if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
    if (bytes < GB) return `${(bytes / MB).toFixed(1)} MB`;
    return `${(bytes / GB).toFixed(2)} GB`;
}

export function formatCount(value) {
    if (!Number.isFinite(value)) return '-';
    if (value < 1000) return String(value);
    if (value < 1e6) return `${(value / 1e3).toFixed(value < 1e4 ? 1 : 0)}K`;
    if (value < 1e9) return `${(value / 1e6).toFixed(value < 1e7 ? 1 : 0)}M`;
    return `${(value / 1e9).toFixed(2)}B`;
}

export function formatDimensions(size) {
    return `${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)} birim`;
}

export function sanitizeBaseName(name) {
    const base = name.replace(/\.[^.]+$/, '').trim();
    const safe = base.replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_');
    return safe.length ? safe.slice(0, 80) : 'model';
}

export function extensionOf(fileName) {
    const match = /\.([^.]+)$/.exec(fileName || '');
    return match ? match[1].toLowerCase() : '';
}

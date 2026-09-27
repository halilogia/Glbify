const VERSION_KEY = 'glbify:versions';
const MAX_VERSIONS = 8;

export function recordVersion(version) {
    try {
        const history = readVersions();
        if (history[0] === version) return history;
        const next = [version, ...history.filter((entry) => entry !== version)].slice(0, MAX_VERSIONS);
        localStorage.setItem(VERSION_KEY, JSON.stringify(next));
        return next;
    } catch {
        return [version];
    }
}

export function readVersions() {
    try {
        const raw = localStorage.getItem(VERSION_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function formatVersionRange(previous, current) {
    if (!previous) return `Sürüm ${current}`;
    return `${previous} → ${current}`;
}

export async function getStorageUsage() {
    if (!navigator.storage?.estimate) return null;
    try {
        const { usage = 0, quota = 0 } = await navigator.storage.estimate();
        return { usage, quota };
    } catch {
        return null;
    }
}

export async function clearCaches() {
    if (!('caches' in window)) return 0;
    const names = await caches.keys();
    const appCaches = names.filter((name) => name.startsWith('glbify') || name.startsWith('workbox'));
    await Promise.all(appCaches.map((name) => caches.delete(name)));
    return appCaches.length;
}

export function watchInstallPrompt(onAvailable, onInstalled) {
    if (typeof window === 'undefined') return () => {};

    const handler = (event) => {
        event.preventDefault();
        onAvailable?.(event);
    };

    const installed = () => {
        onInstalled?.();
        window.removeEventListener('beforeinstallprompt', handler);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);

    return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', installed);
    };
}

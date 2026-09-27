const HEAP_KEY = 'glbify:heapBudget';

export function getDeviceMemoryGB() {
    const value = navigator.deviceMemory;
    return Number.isFinite(value) && value > 0 ? value : 4;
}

export function getHeapUsage() {
    const memory = performance.memory;
    if (!memory) return null;
    return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
    };
}

export function getHeapBudget() {
    const cached = Number(localStorage.getItem(HEAP_KEY));
    if (Number.isFinite(cached) && cached > 0) return cached;

    const heap = getHeapUsage();
    const budget = heap ? Math.min(heap.limit * 0.6, getDeviceMemoryGB() * 1024 ** 3) : getDeviceMemoryGB() * 1024 ** 3;

    try {
        localStorage.setItem(HEAP_KEY, String(Math.round(budget)));
    } catch {
        return budget;
    }

    return budget;
}

export function assessFileSize(file, limitBytes) {
    const effectiveLimit = Math.min(limitBytes ?? Number.POSITIVE_INFINITY, getHeapBudget());
    const ratio = file.size / effectiveLimit;

    if (ratio > 1) {
        return {
            level: 'blocked',
            message:
                `Bu dosya cihaz belleğine sığmayabilir: ${formatBytes(file.size)} dosya, ` +
                `kullanılabilir sınır ~${formatBytes(effectiveLimit)}. Modeli düşük polygonlu sürümle veya ` +
                'mobilde masaüstü tarayıcıda dene.',
        };
    }

    if (ratio > 0.5) {
        return {
            level: 'warning',
            message: `Büyük dosya: ${formatBytes(file.size)} yüklenecek. Cihaz belleği sınırına yaklaşabilirsin.`,
        };
    }

    return { level: 'ok', message: null };
}

export function formatBytes(bytes) {
    if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

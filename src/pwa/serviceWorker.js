export async function registerServiceWorker({ onUpdate, onOfflineReady, onError } = {}) {
    if (!('serviceWorker' in navigator)) return null;
    if (!import.meta.env.PROD) return null;

    try {
        const { registerSW } = await import('virtual:pwa-register');

        return registerSW({
            immediate: true,
            onNeedRefresh() {
                onUpdate?.(true);
            },
            onOfflineReady() {
                onOfflineReady?.();
            },
            onRegisterError(error) {
                onError?.(error);
            },
        });
    } catch (error) {
        onError?.(error);
        return null;
    }
}

export function watchConnection({ onChange }) {
    const update = () => onChange?.(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
    return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
    };
}

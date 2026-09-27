class WorkerImage {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this.width = 1;
        this.height = 1;
        this.image = null;
        this._src = null;
        this._listeners = { load: [], error: [] };
    }

    get src() {
        return this._src;
    }

    set src(value) {
        this._src = value;
        loadImageBitmap(value)
            .then((bitmap) => {
                this.image = bitmap;
                this.width = bitmap.width;
                this.height = bitmap.height;
                this._emit('load', { type: 'load', target: this });
            })
            .catch((error) => this._emit('error', error));
    }

    addEventListener(type, handler) {
        this._listeners[type]?.push(handler);
    }

    removeEventListener(type, handler) {
        const list = this._listeners[type] ?? [];
        const index = list.indexOf(handler);
        if (index >= 0) list.splice(index, 1);
    }

    _emit(type, payload) {
        for (const handler of this._listeners[type] ?? []) handler.call(this, payload);
        const property = type === 'load' ? 'onload' : 'onerror';
        this[property]?.(payload);
    }
}

async function loadImageBitmap(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Doku yüklenemedi (${response.status}): ${url}`);
    return createImageBitmap(await response.blob());
}

export function installWorkerImageShim() {
    if (globalThis.document?.createElementNS) return;

    globalThis.Image = WorkerImage;
    globalThis.document = {
        createElement: (tag) => (tag === 'canvas' ? createCanvas() : new WorkerImage()),
        createElementNS: (namespace, tag) => (tag === 'canvas' ? createCanvas() : new WorkerImage()),
        baseURI: globalThis.location?.href ?? '',
    };
}

function createCanvas() {
    if (typeof OffscreenCanvas === 'undefined') return { width: 1, height: 1, getContext: () => null };
    return new OffscreenCanvas(1, 1);
}

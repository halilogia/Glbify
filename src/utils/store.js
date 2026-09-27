const STORAGE_KEY = 'glbify:settings:v2';

const defaults = {
    maxFileMB: 512,
    scale: '1',
    textureSize: '4096',
    draco: true,
    dracoLevel: 'balanced',
};

let state = read();

function read() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...defaults };
        return { ...defaults, ...JSON.parse(raw) };
    } catch {
        return { ...defaults };
    }
}

function write() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        return;
    }
}

export function getSettings() {
    return { ...state };
}

export function getSetting(key) {
    return state[key];
}

export function setSettings(patch) {
    state = { ...state, ...patch };
    write();
    return { ...state };
}
